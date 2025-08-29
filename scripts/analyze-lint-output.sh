#!/bin/bash

# Script to analyze lint output and categorize warnings for prioritization
# Usage: ./analyze-lint-output.sh <lint_output_file>

if [ $# -eq 0 ]; then
    echo "Usage: $0 <lint_output_file>"
    echo "Example: $0 client/lint"
    exit 1
fi

LINT_FILE="$1"

if [ ! -f "$LINT_FILE" ]; then
    echo "Error: File '$LINT_FILE' not found!"
    exit 1
fi

echo "Analyzing lint output from: $LINT_FILE"
echo "=========================================="
echo ""

# Create temporary files
TEMP_FILE=$(mktemp)
ERROR_TYPES=$(mktemp)

# Extract file names and error types
awk '
BEGIN { 
    current_file = ""
}
{
    # Check if line starts with a path (indicating a new file section)
    if ($0 ~ /^\/.*\.[a-zA-Z]+$/ && $0 !~ /node_modules/) {
        current_file = $0
        gsub(/^[ \t]+|[ \t]+$/, "", current_file)  # Trim whitespace
    } 
    # Check if line contains line number, column, warning type
    else if (current_file != "" && $0 ~ /[0-9]+:[0-9]+[ \t]+warning/) {
        # Extract warning type (last field)
        warning_type = $NF
        gsub(/^[ \t]+|[ \t]+$/, "", warning_type)  # Trim whitespace
        print current_file ":" warning_type
    }
}' "$LINT_FILE" > "$TEMP_FILE"

# Extract all unique warning types
awk -F: '{print $2}' "$TEMP_FILE" | sort | uniq > "$ERROR_TYPES"

echo "PRIORITIZATION MATRIX"
echo "===================="
echo "Based on frequency and ease of fixing:"
echo ""
echo "PRIORITY 1 (High Frequency, Easy to Fix):"
echo "  - no-magic-numbers ($(grep -c "no-magic-numbers" "$TEMP_FILE") occurrences)"
echo "  - no-unused-vars ($(grep -c "no-unused-vars" "$TEMP_FILE") occurrences)"
echo "  - react/prop-types ($(grep -c "react/prop-types" "$TEMP_FILE") occurrences)"
echo ""
echo "PRIORITY 2 (High Frequency, Medium Effort):"
echo "  - no-console ($(grep -c "no-console" "$TEMP_FILE") occurrences)"
echo "  - max-lines-per-function ($(grep -c "max-lines-per-function" "$TEMP_FILE") occurrences)"
echo "  - react/no-array-index-key ($(grep -c "react/no-array-index-key" "$TEMP_FILE") occurrences)"
echo ""
echo "PRIORITY 3 (Medium Frequency, Higher Effort):"
echo "  - max-lines ($(grep -c "max-lines" "$TEMP_FILE") occurrences)"
echo "  - react/display-name ($(grep -c "react/display-name" "$TEMP_FILE") occurrences)"
echo "  - complexity ($(grep -c "complexity" "$TEMP_FILE") occurrences)"
echo "  - react-hooks/exhaustive-deps ($(grep -c "react-hooks/exhaustive-deps" "$TEMP_FILE") occurrences)"
echo ""
echo "PRIORITY 4 (Lower Frequency, Highest Effort):"
echo "  - import/no-anonymous-default-export ($(grep -c "import/no-anonymous-default-export" "$TEMP_FILE") occurrences)"
echo "  - no-nested-ternary ($(grep -c "no-nested-ternary" "$TEMP_FILE") occurrences)"
echo "  - no-await-in-loop ($(grep -c "no-await-in-loop" "$TEMP_FILE") occurrences)"
echo ""

echo "TOP FILES BY WARNING COUNT (Focus Areas):"
echo "========================================="
awk -F: '{
    file = $1
    files[file]++
}
END {
    for (f in files) {
        print files[f] " warnings - " f
    }
}' "$TEMP_FILE" | sort -rn | head -15

echo ""
echo "WARNING TYPE DISTRIBUTION:"
echo "========================="
echo "Total warnings: $(wc -l < "$TEMP_FILE")"
echo ""
awk -F: '{
    warning = $2
    warnings[warning]++
}
END {
    for (w in warnings) {
        percentage = (warnings[w] / NR) * 100
        printf "%-30s: %4d (%5.1f%%)\n", w, warnings[w], percentage
    }
}' "$TEMP_FILE" | sort -rn -k3

echo ""
echo "FILES WITH MOST DIVERSE WARNING TYPES:"
echo "====================================="
# We'll use a simpler approach for this part
awk -F: '{
    file = $1
    warning = $2
    file_warnings[file ":" warning] = 1
}
END {
    # Count unique warnings per file
    for (fw in file_warnings) {
        split(fw, parts, ":")
        f = parts[1]
        warning_count[f]++
    }
    
    # Print results
    for (f in warning_count) {
        print warning_count[f] " different warning types in " f
    }
}' "$TEMP_FILE" | sort -rn | head -10

echo ""
echo "RECOMMENDED ACTION PLAN:"
echo "========================"
echo "1. Start with PRIORITY 1 warnings (no-magic-numbers, no-unused-vars, react/prop-types)"
echo "   These are the easiest to fix and will give the biggest immediate impact."
echo ""
echo "2. Address files with highest warning counts:"
MFILES=$(awk -F: '{file = $1; files[file]++} END {for (f in files) print files[f] " " f}' "$TEMP_FILE" | sort -rn | head -5 | cut -d' ' -f2-)
for file in $MFILES; do
    COUNT=$(grep -c "^$file:" "$TEMP_FILE")
    echo "   - $file ($COUNT warnings)"
done
echo ""
echo "3. Use automated tools where possible:"
echo "   - ESLint --fix for automatic fixes"
echo "   - For no-magic-numbers: Define constants"
echo "   - For no-unused-vars: Remove or prefix with _"
echo "   - For react/prop-types: Add proper prop type definitions"
echo ""

# Clean up
rm "$TEMP_FILE"
rm "$ERROR_TYPES"

echo "Analysis complete."