#!/usr/bin/env node

/**
 * Console Log Replacement Script
 * 
 * This script automatically replaces console.log statements with proper
 * logging calls using the logger utility.
 * 
 * Usage:
 *   node scripts/replace-console-logs.js
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Configuration
const SRC_DIR = path.join(__dirname, '../src');
const FILE_PATTERNS = ['**/*.js', '**/*.jsx', '**/*.ts', '**/*.tsx'];
const BACKUP_DIR = path.join(__dirname, '../backup-console-logs');

// Replacement patterns
const REPLACEMENTS = [
    // console.log -> logger.debug
    {
        pattern: /console\.log\(/g,
        replacement: 'logger.debug(',
        importNeeded: true
    },

    // console.debug -> logger.debug
    {
        pattern: /console\.debug\(/g,
        replacement: 'logger.debug(',
        importNeeded: true
    },

    // console.info -> logger.info
    {
        pattern: /console\.info\(/g,
        replacement: 'logger.info(',
        importNeeded: true
    },

    // console.warn -> logger.warn
    {
        pattern: /console\.warn\(/g,
        replacement: 'logger.warn(',
        importNeeded: true
    },

    // console.error -> logger.error
    {
        pattern: /console\.error\(/g,
        replacement: 'logger.error(',
        importNeeded: true
    }
];

// Import statement to add
const LOGGER_IMPORT = "import logger from '../utils/logger';\n";

class ConsoleLogReplacer {
    constructor() {
        this.processedFiles = 0;
        this.totalReplacements = 0;
        this.errors = [];
    }

    /**
     * Main execution method
     */
    async run() {
        console.log('🔍 Console Log Replacement Tool Starting...');
        console.log(`📁 Scanning directory: ${SRC_DIR}`);

        try {
            // Create backup directory
            this.createBackupDir();

            // Get all files to process
            const files = this.getFilesToProcess();
            console.log(`📄 Found ${files.length} files to process`);

            // Process each file
            for (const file of files) {
                await this.processFile(file);
            }

            // Print summary
            this.printSummary();

        } catch (error) {
            console.error('❌ Error during processing:', error);
            process.exit(1);
        }
    }

    /**
     * Create backup directory
     */
    createBackupDir() {
        if (!fs.existsSync(BACKUP_DIR)) {
            fs.mkdirSync(BACKUP_DIR, { recursive: true });
            console.log(`📦 Created backup directory: ${BACKUP_DIR}`);
        }
    }

    /**
     * Get all files to process
     */
    getFilesToProcess() {
        const files = [];

        for (const pattern of FILE_PATTERNS) {
            const matchedFiles = glob.sync(pattern, {
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
                    '**/logger.js', // Don't process the logger file itself
                    '**/setupTests.js'
                ]
            });

            files.push(...matchedFiles);
        }

        // Remove duplicates
        return [...new Set(files)];
    }

    /**
     * Process a single file
     */
    async processFile(filePath) {
        try {
            const content = fs.readFileSync(filePath, 'utf8');
            const originalContent = content;

            // Check if file has console statements
            const hasConsoleStatements = REPLACEMENTS.some(r => r.pattern.test(content));

            if (!hasConsoleStatements) {
                return; // Skip files without console statements
            }

            console.log(`🔧 Processing: ${path.relative(SRC_DIR, filePath)}`);

            // Create backup
            this.createBackup(filePath, originalContent);

            // Apply replacements
            let modifiedContent = content;
            let fileReplacements = 0;

            for (const replacement of REPLACEMENTS) {
                const matches = modifiedContent.match(replacement.pattern);
                if (matches) {
                    modifiedContent = modifiedContent.replace(replacement.pattern, replacement.replacement);
                    fileReplacements += matches.length;
                }
            }

            // Add import statement if needed
            if (fileReplacements > 0) {
                modifiedContent = this.addLoggerImport(modifiedContent, filePath);
            }

            // Write modified content
            if (modifiedContent !== originalContent) {
                fs.writeFileSync(filePath, modifiedContent, 'utf8');
                this.processedFiles++;
                this.totalReplacements += fileReplacements;

                console.log(`  ✅ Replaced ${fileReplacements} console statements`);
            }

        } catch (error) {
            const errorMsg = `Error processing ${filePath}: ${error.message}`;
            this.errors.push(errorMsg);
            console.error(`  ❌ ${errorMsg}`);
        }
    }

    /**
     * Create backup of original file
     */
    createBackup(filePath, content) {
        const relativePath = path.relative(SRC_DIR, filePath);
        const backupPath = path.join(BACKUP_DIR, relativePath);
        const backupDir = path.dirname(backupPath);

        // Create backup directory structure
        if (!fs.existsSync(backupDir)) {
            fs.mkdirSync(backupDir, { recursive: true });
        }

        // Write backup file
        fs.writeFileSync(backupPath, content, 'utf8');
    }

    /**
     * Add logger import to file
     */
    addLoggerImport(content, filePath) {
        // Check if logger is already imported
        if (content.includes("from '../utils/logger'") ||
            content.includes("from './utils/logger'") ||
            content.includes("import logger")) {
            return content;
        }

        // Calculate relative path to logger
        const relativePath = path.relative(path.dirname(filePath), path.join(SRC_DIR, 'utils/logger'));
        const importPath = relativePath.startsWith('.') ? relativePath : `./${relativePath}`;
        const loggerImport = `import logger from '${importPath.replace(/\\/g, '/')}';\n`;

        // Find the best place to insert the import
        const lines = content.split('\n');
        let insertIndex = 0;

        // Look for existing imports
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();

            if (line.startsWith('import ') || line.startsWith("import('")) {
                insertIndex = i + 1;
            } else if (line && !line.startsWith('//') && !line.startsWith('/*')) {
                // Stop at first non-import, non-comment line
                break;
            }
        }

        lines.splice(insertIndex, 0, loggerImport);
        return lines.join('\n');
    }

    /**
     * Print processing summary
     */
    printSummary() {
        console.log('\n📊 Processing Summary:');
        console.log(`  📄 Files processed: ${this.processedFiles}`);
        console.log(`  🔄 Total replacements: ${this.totalReplacements}`);
        console.log(`  ❌ Errors: ${this.errors.length}`);

        if (this.errors.length > 0) {
            console.log('\n❌ Errors encountered:');
            this.errors.forEach(error => console.log(`  - ${error}`));
        }

        if (this.processedFiles > 0) {
            console.log(`\n📦 Backup files created in: ${BACKUP_DIR}`);
            console.log('✅ Console log replacement completed successfully!');
            console.log('\n🔍 Next steps:');
            console.log('  1. Review the changes in your files');
            console.log('  2. Test your application to ensure everything works');
            console.log('  3. Run ESLint to check for any remaining issues');
            console.log('  4. Commit your changes');
        } else {
            console.log('\n✨ No console statements found to replace.');
        }
    }
}

// Run the script
if (require.main === module) {
    const replacer = new ConsoleLogReplacer();
    replacer.run().catch(error => {
        console.error('💥 Fatal error:', error);
        process.exit(1);
    });
}

module.exports = ConsoleLogReplacer;