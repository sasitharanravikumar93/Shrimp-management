# Development Tools Configuration

This document outlines the development tools configuration for the project, including ESLint, Prettier, Git hooks, and associated workflows.

## Overview

The project uses a comprehensive set of development tools to ensure code quality, consistency, and maintainability:

- **ESLint**: JavaScript/TypeScript linting with React-specific rules
- **Prettier**: Code formatting for consistent style
- **Husky**: Git hooks for pre-commit validation
- **lint-staged**: Run linters on staged files only
- **TypeScript**: Type checking and improved developer experience

## ESLint Configuration

### Rules Overview

The ESLint configuration (`.eslintrc.json`) includes:

#### React Rules
- ✅ `react/react-in-jsx-scope`: Off (React 17+ JSX transform)
- ⚠️ `react/prop-types`: Warn about missing PropTypes
- ⚠️ `react/display-name`: Warn about missing display names
- ⚠️ `react/no-array-index-key`: Warn against using array indices as keys
- ❌ `react/no-danger`: Error on dangerous DOM properties
- ❌ `react/no-deprecated`: Error on deprecated React features

#### Code Quality Rules
- ⚠️ `complexity`: Maximum cyclomatic complexity of 15
- ⚠️ `max-depth`: Maximum nesting depth of 4
- ⚠️ `max-lines`: Maximum 500 lines per file
- ⚠️ `max-lines-per-function`: Maximum 100 lines per function
- ⚠️ `max-params`: Maximum 5 parameters per function

#### Import Rules
- ⚠️ `import/order`: Enforce import order with alphabetical sorting
- ❌ `import/no-duplicates`: Prevent duplicate imports
- ⚠️ `import/newlines-between`: Require newlines between import groups

#### Performance & Security
- ⚠️ `no-await-in-loop`: Warn about await in loops
- ❌ `no-eval`: Prevent eval() usage
- ❌ `no-implied-eval`: Prevent implied eval()
- ❌ `require-atomic-updates`: Prevent race conditions

### ESLint Commands

```bash
# Lint all source files
npm run lint

# Fix automatically fixable issues
npm run lint:fix

# Show only errors (quiet mode)
npm run lint:quiet
```

## Prettier Configuration

### Formatting Rules

The Prettier configuration (`.prettierrc.json`) enforces:

- **Print Width**: 100 characters
- **Tab Width**: 2 spaces
- **Quotes**: Single quotes for JS/TS, JSX
- **Semicolons**: Required
- **Trailing Commas**: None
- **Bracket Spacing**: Enabled
- **Arrow Parens**: Avoid when possible

### File-Specific Overrides

- **JSON files**: 80 character width, 2-space tabs
- **Markdown files**: 80 character width, prose wrap
- **CSS/SCSS files**: Double quotes for strings

### Prettier Commands

```bash
# Format all source files
npm run format

# Check if files are formatted correctly
npm run format:check
```

## Git Hooks (Husky)

### Pre-commit Hook

Runs automatically before each commit:

1. **lint-staged**: Processes only staged files
2. **ESLint**: Lints and auto-fixes JavaScript/TypeScript files
3. **Prettier**: Formats all staged files
4. **Type Check**: Validates TypeScript types

### Commit Message Hook

Validates commit message format:

```
type(scope): description

Types: feat, fix, docs, style, refactor, perf, test, chore, build, ci
```

**Examples:**
- `feat(auth): add user login functionality`
- `fix(ui): resolve button alignment issue`
- `docs(readme): update installation instructions`
- `refactor(hooks): extract common logic to custom hook`

## TypeScript Integration

### Type Checking

```bash
# Run TypeScript compiler in check mode
npm run type-check
```

### Configuration

TypeScript is configured via `tsconfig.json` with:
- Strict mode enabled
- React JSX support
- Modern ES modules
- Source maps for debugging

## Workflow Integration

### Quality Check Command

Run all quality checks together:

```bash
npm run quality
```

This command runs:
1. ESLint (with no warnings allowed)
2. Prettier format check
3. TypeScript type checking

### Pre-commit Workflow

1. **Stage files**: `git add .`
2. **Commit**: `git commit -m "feat: add new feature"`
3. **Automated checks run**:
   - ESLint fixes issues automatically
   - Prettier formats code
   - Type checking validates TypeScript
   - Commit message format validation
4. **Commit succeeds** if all checks pass

### IDE Integration

#### VS Code Settings

Create `.vscode/settings.json`:

```json
{
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "eslint.workingDirectories": ["client"],
  "typescript.preferences.importModuleSpecifier": "relative"
}
```

#### VS Code Extensions

Recommended extensions:
- ESLint (`dbaeumer.vscode-eslint`)
- Prettier (`esbenp.prettier-vscode`)
- TypeScript Importer (`pmneo.tsimporter`)

## Configuration Files

### Project Structure

```
client/
├── .eslintrc.json          # ESLint configuration
├── .prettierrc.json        # Prettier configuration
├── .prettierignore         # Prettier ignore patterns
├── .husky/                 # Git hooks directory
│   ├── pre-commit         # Pre-commit hook script
│   └── commit-msg         # Commit message validation
├── package.json           # Scripts and lint-staged config
└── tsconfig.json          # TypeScript configuration
```

### Environment-Specific Rules

#### Test Files

Special rules for test files (`*.test.js`, `*.test.jsx`, `*.test.ts`, `*.test.tsx`):
- `no-magic-numbers`: Disabled (test data often uses literals)
- `max-lines-per-function`: Disabled (complex test scenarios)

#### JavaScript Files

For pure JavaScript files (not TypeScript):
- TypeScript-specific rules are disabled
- More lenient type checking

## Troubleshooting

### Common Issues

#### ESLint Errors

**Problem**: `'React' must be in scope when using JSX`
**Solution**: Ensure `react/react-in-jsx-scope` is set to `"off"`

**Problem**: Import order warnings
**Solution**: Use `npm run lint:fix` to auto-fix import order

#### Prettier Conflicts

**Problem**: ESLint and Prettier conflicting rules
**Solution**: Ensure `eslint-config-prettier` is in extends array

**Problem**: Format on save not working
**Solution**: Check VS Code settings and install Prettier extension

#### Git Hook Issues

**Problem**: Pre-commit hook not running
**Solution**: 
1. Check if `.husky/pre-commit` is executable: `chmod +x .husky/pre-commit`
2. Ensure Husky is installed: `npm install husky`

**Problem**: Commit message validation failing
**Solution**: Follow the commit message format: `type(scope): description`

### Performance Optimization

#### Large Codebases

For better performance on large codebases:

1. **ESLint Cache**: Add `--cache` flag to lint scripts
2. **Parallel Processing**: Use `eslint --max-warnings 0 --cache --ext .js,.jsx,.ts,.tsx src`
3. **Ignore Patterns**: Expand `.eslintignore` for build artifacts

#### CI/CD Integration

For continuous integration:

```yaml
# GitHub Actions example
- name: Lint and Format Check
  run: |
    npm ci
    npm run quality
```

## Metrics and Monitoring

### Code Quality Metrics

Track these metrics over time:
- **ESLint Warnings**: Should trend towards zero
- **ESLint Errors**: Should be zero in production
- **TypeScript Errors**: Should be zero
- **Test Coverage**: Track alongside code quality

### Automated Reports

Generate quality reports:

```bash
# Generate ESLint report
npx eslint src --format html --output-file reports/eslint-report.html

# Generate complexity report
npx complexity-report src --format json --output reports/complexity.json
```

## Migration Guide

### From No Linting

1. Install dependencies: `npm install --save-dev eslint prettier`
2. Copy configuration files
3. Run `npm run lint:fix` to auto-fix issues
4. Address remaining warnings manually
5. Set up git hooks: `npm run prepare`

### From Basic ESLint

1. Update `.eslintrc.json` with new rules
2. Install additional plugins
3. Run `npm run lint:fix`
4. Add Prettier integration
5. Update git hooks

### Best Practices

1. **Gradual Adoption**: Enable rules progressively
2. **Team Training**: Ensure team understands new rules
3. **Documentation**: Keep this document updated
4. **Monitoring**: Track quality metrics
5. **Automation**: Leverage git hooks and CI/CD

## Conclusion

This development tools setup provides:
- ✅ Consistent code formatting
- ✅ Early error detection
- ✅ Automated quality checks
- ✅ Improved developer experience
- ✅ Better maintainability
- ✅ Team collaboration standards

The configuration balances strictness with practicality, ensuring high code quality while maintaining developer productivity.