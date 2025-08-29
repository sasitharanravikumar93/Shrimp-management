# Lint Analysis Script

This script analyzes ESLint output to help prioritize code quality improvements.

## Usage

```bash
./analyze-lint-output.sh <lint_output_file>
```

Example:
```bash
./analyze-lint-output.sh client/lint
```

## How It Works

The script parses ESLint output and categorizes warnings by:
1. File name
2. Warning type
3. Frequency

It then provides a prioritization matrix based on:
- Frequency of occurrence
- Estimated effort to fix

## Output

The script provides:

1. **Prioritization Matrix** - Groups warnings by priority based on frequency and effort
2. **Top Files** - Lists files with the most warnings
3. **Warning Distribution** - Shows the percentage of each warning type
4. **Diverse Warning Files** - Shows files with many different types of warnings
5. **Action Plan** - Provides recommendations on where to start

## Warning Priorities

- **Priority 1**: High frequency, easy to fix (no-magic-numbers, no-unused-vars, react/prop-types)
- **Priority 2**: High frequency, medium effort (no-console, max-lines-per-function)
- **Priority 3**: Medium frequency, higher effort (max-lines, complexity)
- **Priority 4**: Lower frequency, highest effort (import issues, hooks issues)

## Recommended Approach

1. Start with Priority 1 warnings as they provide the biggest immediate impact
2. Focus on files with the highest warning counts
3. Use automated tools where possible:
   - `eslint --fix` for automatic fixes
   - Replace magic numbers with named constants
   - Remove unused variables or prefix with `_`
   - Add proper prop type definitions