#!/usr/bin/env node

/**
 * Dead Code Cleanup Script
 * 
 * This script identifies and removes:
 * - Unused imports
 * - Unused variables
 * - Dead code blocks
 * - Commented out code
 * - Empty functions
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

const SRC_DIR = path.join(__dirname, '../src');

class DeadCodeCleaner {
    constructor() {
        this.processedFiles = 0;
        this.removedItems = 0;
        this.issues = [];
    }

    async run() {
        console.log('🧹 Dead Code Cleanup Starting...');

        // Get all JavaScript/TypeScript files
        const files = glob.sync('**/*.{js,jsx,ts,tsx}', {
            cwd: SRC_DIR,
            absolute: true,
            ignore: [
                '**/node_modules/**',
                '**/build/**',
                '**/dist/**',
                '**/*.test.js',
                '**/*.test.jsx',
                '**/*.test.ts',
                '**/*.test.tsx',
                '**/setupTests.js'
            ]
        });

        console.log(`📄 Found ${files.length} files to analyze`);

        for (const file of files) {
            await this.analyzeFile(file);
        }

        this.printSummary();
    }

    async analyzeFile(filePath) {
        try {
            const content = fs.readFileSync(filePath, 'utf8');
            const lines = content.split('\n');
            const relativePath = path.relative(SRC_DIR, filePath);

            // Check for various dead code patterns
            const issues = [
                ...this.findUnusedImports(content, relativePath),
                ...this.findCommentedCode(lines, relativePath),
                ...this.findEmptyFunctions(content, relativePath),
                ...this.findDeadVariables(content, relativePath),
                ...this.findDuplicateImports(content, relativePath)
            ];

            if (issues.length > 0) {
                console.log(`🔍 Found ${issues.length} issues in ${relativePath}`);
                this.issues.push(...issues);
                this.processedFiles++;
            }

        } catch (error) {
            console.error(`❌ Error analyzing ${filePath}:`, error.message);
        }
    }

    findUnusedImports(content, filePath) {
        const issues = [];
        const importRegex = /^import\s+(?:{[^}]+}|[^{]+|\*\s+as\s+\w+)\s+from\s+['"][^'"]+['"];?\s*$/gm;

        let match;
        while ((match = importRegex.exec(content)) !== null) {
            const importStatement = match[0];

            // Extract imported names
            const namedImports = this.extractImportedNames(importStatement);

            for (const importedName of namedImports) {
                // Skip React imports (often used in JSX)
                if (importedName === 'React') continue;

                // Check if the imported name is used in the file
                const usageRegex = new RegExp(`\\b${importedName}\\b`, 'g');
                const usages = content.match(usageRegex) || [];

                // If only used in import statement, it's likely unused
                if (usages.length <= 1) {
                    issues.push({
                        type: 'unused-import',
                        file: filePath,
                        line: this.getLineNumber(content, match.index),
                        message: `Unused import: ${importedName}`,
                        suggestion: `Remove unused import: ${importedName}`,
                        code: importStatement.trim()
                    });
                }
            }
        }

        return issues;
    }

    findCommentedCode(lines, filePath) {
        const issues = [];

        lines.forEach((line, index) => {
            const trimmed = line.trim();

            // Look for commented out code (not documentation)
            if (trimmed.startsWith('//') && !trimmed.startsWith('///')) {
                const commentContent = trimmed.substring(2).trim();

                // Check if it looks like code
                if (this.looksLikeCode(commentContent)) {
                    issues.push({
                        type: 'commented-code',
                        file: filePath,
                        line: index + 1,
                        message: `Commented out code: ${commentContent.substring(0, 50)}...`,
                        suggestion: 'Remove commented out code',
                        code: line.trim()
                    });
                }
            }
        });

        return issues;
    }

    findEmptyFunctions(content, filePath) {
        const issues = [];

        // Match empty functions
        const emptyFunctionRegex = /(?:function\s+\w+\s*\([^)]*\)\s*{\s*}|const\s+\w+\s*=\s*\([^)]*\)\s*=>\s*{\s*}|\w+\s*\([^)]*\)\s*{\s*})/g;

        let match;
        while ((match = emptyFunctionRegex.exec(content)) !== null) {
            issues.push({
                type: 'empty-function',
                file: filePath,
                line: this.getLineNumber(content, match.index),
                message: `Empty function found`,
                suggestion: 'Remove empty function or add implementation',
                code: match[0]
            });
        }

        return issues;
    }

    findDeadVariables(content, filePath) {
        const issues = [];

        // This is a simplified check - real implementation would need AST parsing
        const variableDeclarations = content.match(/(?:const|let|var)\s+(\w+)\s*=/g);

        if (variableDeclarations) {
            variableDeclarations.forEach(declaration => {
                const variableName = declaration.match(/(?:const|let|var)\s+(\w+)/)[1];

                // Count usages (excluding declaration)
                const usageRegex = new RegExp(`\\b${variableName}\\b`, 'g');
                const usages = content.match(usageRegex) || [];

                if (usages.length <= 1) {
                    issues.push({
                        type: 'unused-variable',
                        file: filePath,
                        line: 'unknown',
                        message: `Potentially unused variable: ${variableName}`,
                        suggestion: `Review usage of variable: ${variableName}`,
                        code: declaration
                    });
                }
            });
        }

        return issues;
    }

    findDuplicateImports(content, filePath) {
        const issues = [];
        const importSources = new Map();

        const importRegex = /^import\s+.*from\s+['"]([^'"]+)['"];?\s*$/gm;

        let match;
        while ((match = importRegex.exec(content)) !== null) {
            const source = match[1];

            if (importSources.has(source)) {
                issues.push({
                    type: 'duplicate-import',
                    file: filePath,
                    line: this.getLineNumber(content, match.index),
                    message: `Duplicate import from: ${source}`,
                    suggestion: `Combine imports from: ${source}`,
                    code: match[0].trim()
                });
            } else {
                importSources.set(source, match[0]);
            }
        }

        return issues;
    }

    extractImportedNames(importStatement) {
        const names = [];

        // Default import
        const defaultImport = importStatement.match(/import\s+(\w+)/);
        if (defaultImport) {
            names.push(defaultImport[1]);
        }

        // Named imports
        const namedImports = importStatement.match(/{\s*([^}]+)\s*}/);
        if (namedImports) {
            const imports = namedImports[1].split(',').map(name => {
                // Handle "import as" syntax
                const asMatch = name.match(/(\w+)\s+as\s+(\w+)/);
                if (asMatch) {
                    return asMatch[2].trim();
                }
                return name.trim();
            });
            names.push(...imports);
        }

        // Namespace import
        const namespaceImport = importStatement.match(/import\s+\*\s+as\s+(\w+)/);
        if (namespaceImport) {
            names.push(namespaceImport[1]);
        }

        return names;
    }

    looksLikeCode(comment) {
        // Simple heuristics to identify commented code
        const codePatterns = [
            /\w+\s*\(/,           // function calls
            /\w+\s*[=:]/,         // assignments
            /if\s*\(/,            // if statements
            /for\s*\(/,           // for loops
            /return\s+/,          // return statements
            /console\./,          // console statements
            /\w+\.\w+/,           // property access
            /import\s+/,          // import statements
            /export\s+/,          // export statements
            /{.*}/,               // object literals
            /\[.*\]/              // array literals
        ];

        return codePatterns.some(pattern => pattern.test(comment));
    }

    getLineNumber(content, index) {
        return content.substring(0, index).split('\n').length;
    }

    printSummary() {
        console.log('\n📊 Dead Code Analysis Summary:');
        console.log(`  📄 Files analyzed: ${this.processedFiles}`);
        console.log(`  🔍 Issues found: ${this.issues.length}`);

        // Group issues by type
        const issuesByType = this.issues.reduce((acc, issue) => {
            acc[issue.type] = (acc[issue.type] || 0) + 1;
            return acc;
        }, {});

        console.log('\n📋 Issues by type:');
        Object.entries(issuesByType).forEach(([type, count]) => {
            console.log(`  ${type}: ${count}`);
        });

        if (this.issues.length > 0) {
            console.log('\n🔍 Top issues to review:');

            // Show first 10 issues
            this.issues.slice(0, 10).forEach((issue, index) => {
                console.log(`\n${index + 1}. ${issue.type} in ${issue.file}:${issue.line}`);
                console.log(`   ${issue.message}`);
                console.log(`   💡 ${issue.suggestion}`);
            });

            if (this.issues.length > 10) {
                console.log(`\n... and ${this.issues.length - 10} more issues`);
            }

            console.log('\n🔧 Next steps:');
            console.log('  1. Review the identified issues');
            console.log('  2. Remove unused imports and variables');
            console.log('  3. Clean up commented code');
            console.log('  4. Implement or remove empty functions');
            console.log('  5. Run ESLint to catch remaining issues');
        } else {
            console.log('\n✨ No significant dead code found!');
        }
    }
}

// Run the script
if (require.main === module) {
    const cleaner = new DeadCodeCleaner();
    cleaner.run().catch(error => {
        console.error('💥 Fatal error:', error);
        process.exit(1);
    });
}

module.exports = DeadCodeCleaner;