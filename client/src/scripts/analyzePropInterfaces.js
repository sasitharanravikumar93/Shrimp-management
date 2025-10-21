#!/usr/bin/env node

/**
 * Component Prop Interface Analyzer
 *
 * This script analyzes React components to identify prop interface inconsistencies
 * and provides recommendations for standardization.
 *
 * Usage: node scripts/analyzePropInterfaces.js
 */

const fs = require('fs');
const path = require('path');

const glob = require('glob');

const logger = require('../utils/logger');

// Configuration
const CONFIG = {
  componentsDir: 'src/components',
  excludePatterns: ['*.test.js', '*.test.tsx', '*.stories.js', '*.d.ts'],
  includePatterns: ['**/*.js', '**/*.jsx', '**/*.ts', '**/*.tsx'],
  outputFile: 'prop-interface-analysis.json'
};

// Patterns to identify prop naming issues
const PROP_PATTERNS = {
  // Anti-patterns to flag
  badPatterns: [
    {
      regex: /handle[A-Z]/,
      message: 'Use on* instead of handle*',
      suggestion: 'onClick, onSubmit, onChange'
    },
    {
      regex: /[a-z]_[a-z]/,
      message: 'Use camelCase instead of snake_case',
      suggestion: 'camelCase naming'
    },
    {
      regex: /btn|Btn/,
      message: 'Use button instead of btn',
      suggestion: 'buttonText, buttonColor'
    },
    { regex: /clk|Clk/, message: 'Use click instead of clk', suggestion: 'onClick' },
    { regex: /txt|Txt/, message: 'Use text instead of txt', suggestion: 'buttonText, labelText' },
    { regex: /img|Img/, message: 'Use image instead of img', suggestion: 'imageSource, imagePath' },
    {
      regex: /bool|Bool/,
      message: 'Use is* for boolean props',
      suggestion: 'isVisible, isDisabled'
    },
    { regex: /flag|Flag/, message: 'Use is* for boolean props', suggestion: 'isActive, isEnabled' }
  ],

  // Good patterns to encourage
  goodPatterns: [
    { regex: /^on[A-Z]/, message: 'Good: Event handler pattern' },
    { regex: /^is[A-Z]/, message: 'Good: Boolean state pattern' },
    { regex: /^show[A-Z]/, message: 'Good: UI visibility pattern' },
    { regex: /^has[A-Z]/, message: 'Good: Boolean property pattern' },
    { regex: /[a-z][A-Z]/, message: 'Good: camelCase naming' }
  ]
};

// Standard prop categories
const STANDARD_PROPS = {
  base: ['id', 'className', 'style', 'testId', 'disabled', 'loading'],
  content: ['title', 'subtitle', 'description', 'children'],
  interaction: ['onClick', 'onSubmit', 'onChange', 'onBlur', 'onFocus'],
  theme: ['color', 'size', 'variant'],
  modal: ['open', 'onClose', 'maxWidth', 'fullWidth'],
  form: ['name', 'label', 'placeholder', 'helperText', 'error', 'required', 'value']
};

class PropInterfaceAnalyzer {
  constructor() {
    this.results = {
      summary: {
        totalFiles: 0,
        componentsAnalyzed: 0,
        issuesFound: 0,
        standardCompliant: 0
      },
      components: [],
      recommendations: []
    };
  }

  /**
   * Main analysis function
   */
  async analyze() {
    logger.debug('🔍 Analyzing component prop interfaces...\n');

    const files = this.getComponentFiles();
    this.results.summary.totalFiles = files.length;

    for (const file of files) {
      // eslint-disable-line no-await-in-loop
      try {
        await this.analyzeFile(file);
      } catch (error) {
        logger.error(`Error analyzing ${file}:`, error.message);
      }
    }

    this.generateRecommendations();
    this.printSummary();
    this.saveResults();
  }

  /**
   * Get all component files
   */
  getComponentFiles() {
    const patterns = CONFIG.includePatterns.map(pattern =>
      path.join(CONFIG.componentsDir, pattern)
    );

    let files = [];
    patterns.forEach(pattern => {
      files = files.concat(glob.sync(pattern));
    });

    // Filter out excluded patterns
    files = files.filter(file => {
      return !CONFIG.excludePatterns.some(exclude =>
        file.match(new RegExp(exclude.replace('*', '.*')))
      );
    });

    return files;
  }

  /**
   * Analyze a single file
   */
  async analyzeFile(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    const componentInfo = this.extractComponentInfo(content, filePath);

    if (componentInfo.hasComponents) {
      this.results.summary.componentsAnalyzed++;

      const analysis = this.analyzeProps(componentInfo);

      this.results.components.push({
        file: filePath,
        ...componentInfo,
        analysis
      });

      if (analysis.issues.length > 0) {
        this.results.summary.issuesFound += analysis.issues.length;
      } else {
        this.results.summary.standardCompliant++;
      }
    }
  }

  /**
   * Extract component information from file content
   */
  extractComponentInfo(content, filePath) {
    const info = {
      hasComponents: false,
      components: [],
      props: [],
      propTypes: null,
      defaultProps: null,
      typescript: filePath.endsWith('.ts') || filePath.endsWith('.tsx')
    };

    // Find React component definitions
    const componentRegex =
      /(?:const|function|class)\s+([A-Z][a-zA-Z0-9]*)\s*[=:]\s*(?:React\.)?(?:FC|Component|memo\()?.*?\(\s*\{([^}]*)\}/g;
    let match;

    while ((match = componentRegex.exec(content)) !== null) {
      info.hasComponents = true;
      const componentName = match[1];
      const propsString = match[2];

      if (propsString) {
        const props = this.extractPropsFromString(propsString);
        info.components.push({
          name: componentName,
          props
        });
        info.props = info.props.concat(props);
      }
    }

    // Find PropTypes definitions
    const propTypesRegex = /(\w+)\.propTypes\s*=\s*\{([^}]+)\}/;
    const propTypesMatch = content.match(propTypesRegex);
    if (propTypesMatch) {
      info.propTypes = propTypesMatch[2];
    }

    // Find defaultProps definitions
    const defaultPropsRegex = /(\w+)\.defaultProps\s*=\s*\{([^}]+)\}/;
    const defaultPropsMatch = content.match(defaultPropsRegex);
    if (defaultPropsMatch) {
      info.defaultProps = defaultPropsMatch[2];
    }

    return info;
  }

  /**
   * Extract prop names from destructuring string
   */
  extractPropsFromString(propsString) {
    const props = [];

    // Clean up the string and split by commas
    const cleanProps = propsString
      .replace(/\/\*[\s\S]*?\*\//g, '') // Remove block comments
      .replace(/\/\/.*$/gm, '') // Remove line comments
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim();

    // Split by commas and extract prop names
    const propItems = cleanProps.split(',');

    propItems.forEach(item => {
      const trimmed = item.trim();
      if (trimmed) {
        // Extract prop name (before = or :)
        const propMatch = trimmed.match(/^([a-zA-Z_$][a-zA-Z0-9_$]*)/);
        if (propMatch) {
          props.push(propMatch[1]);
        }
      }
    });

    return props;
  }

  /**
   * Analyze props for naming issues and standards compliance
   */
  analyzeProps(componentInfo) {
    const analysis = {
      issues: [],
      suggestions: [],
      compliance: {
        hasBaseProps: false,
        hasStandardNaming: true,
        hasPropTypes: !!componentInfo.propTypes,
        hasDefaultProps: !!componentInfo.defaultProps
      }
    };

    componentInfo.props.forEach(prop => {
      // Check against bad patterns
      PROP_PATTERNS.badPatterns.forEach(pattern => {
        if (pattern.regex.test(prop)) {
          analysis.issues.push({
            prop,
            type: 'naming',
            message: pattern.message,
            suggestion: pattern.suggestion
          });
          analysis.compliance.hasStandardNaming = false;
        }
      });

      // Check for good patterns
      const hasGoodPattern = PROP_PATTERNS.goodPatterns.some(pattern => pattern.regex.test(prop));

      if (!hasGoodPattern && prop.length > 2) {
        analysis.suggestions.push({
          prop,
          message: 'Consider using standard prop naming patterns',
          examples: this.getSuggestedPropNames(prop)
        });
      }
    });

    // Check for standard base props
    const hasBaseProps = STANDARD_PROPS.base.some(baseProp =>
      componentInfo.props.includes(baseProp)
    );
    analysis.compliance.hasBaseProps = hasBaseProps;

    // TypeScript vs PropTypes validation
    if (!componentInfo.typescript && !componentInfo.propTypes) {
      analysis.issues.push({
        type: 'validation',
        message: 'Component lacks PropTypes validation',
        suggestion: 'Add PropTypes for runtime prop validation'
      });
    }

    return analysis;
  }

  /**
   * Generate suggested prop names based on common patterns
   */
  getSuggestedPropNames(prop) {
    const suggestions = [];

    // Common transformations
    if (prop.includes('handle')) {
      suggestions.push(prop.replace('handle', 'on'));
    }

    if (prop.includes('_')) {
      suggestions.push(prop.replace(/_([a-z])/g, (match, letter) => letter.toUpperCase()));
    }

    if (prop.startsWith('show') || prop.startsWith('hide')) {
      // Already good
    } else if (prop.includes('visible') || prop.includes('enabled')) {
      suggestions.push(`is${prop.charAt(0).toUpperCase()}${prop.slice(1)}`);
    }

    return suggestions;
  }

  /**
   * Generate overall recommendations
   */
  generateRecommendations() {
    const recommendations = [];

    // Count common issues
    const issueTypes = {};
    this.results.components.forEach(component => {
      component.analysis.issues.forEach(issue => {
        issueTypes[issue.type] = (issueTypes[issue.type] || 0) + 1;
      });
    });

    // Generate recommendations based on most common issues
    Object.entries(issueTypes).forEach(([type, count]) => {
      if (type === 'naming' && count > 5) {
        recommendations.push({
          priority: 'high',
          title: 'Standardize prop naming conventions',
          description: `${count} components have prop naming issues. Consider using camelCase and standard patterns like on*, is*, show*.`,
          action: 'Review and update prop names to follow naming conventions'
        });
      }

      if (type === 'validation' && count > 3) {
        recommendations.push({
          priority: 'medium',
          title: 'Add PropTypes validation',
          description: `${count} components lack prop validation. Add PropTypes for better error catching.`,
          action: 'Import and define PropTypes for each component'
        });
      }
    });

    // Standard compliance recommendations
    const lowCompliance = this.results.components.filter(c => c.analysis.issues.length > 2).length;

    if (lowCompliance > this.results.components.length * 0.3) {
      recommendations.push({
        priority: 'high',
        title: 'Improve overall prop interface standards',
        description: `${lowCompliance} components have multiple prop interface issues.`,
        action: 'Consider refactoring components to use standardized prop interfaces'
      });
    }

    this.results.recommendations = recommendations;
  }

  /**
   * Print analysis summary
   */
  printSummary() {
    const { summary, recommendations } = this.results;

    logger.debug('📊 Analysis Summary');
    logger.debug('==================');
    logger.debug(`Total files scanned: ${summary.totalFiles}`);
    logger.debug(`Components analyzed: ${summary.componentsAnalyzed}`);
    logger.debug(`Issues found: ${summary.issuesFound}`);
    logger.debug(`Standard compliant: ${summary.standardCompliant}`);
    logger.debug(
      `Compliance rate: ${Math.round(
        (summary.standardCompliant / summary.componentsAnalyzed) * 100
      )}%\n`
    );

    if (recommendations.length > 0) {
      logger.debug('🎯 Recommendations');
      logger.debug('=================');
      recommendations.forEach((rec, index) => {
        logger.debug(`${index + 1}. [${rec.priority.toUpperCase()}] ${rec.title}`);
        logger.debug(`   ${rec.description}`);
        logger.debug(`   Action: ${rec.action}
`);
      });
    }

    // Show top issues
    const issuesByComponent = this.results.components
      .filter(c => c.analysis.issues.length > 0)
      .sort((a, b) => b.analysis.issues.length - a.analysis.issues.length)
      .slice(0, 5);

    if (issuesByComponent.length > 0) {
      logger.debug('⚠️  Components with Most Issues');
      logger.debug('=============================');
      issuesByComponent.forEach(component => {
        logger.debug(`${component.file} (${component.analysis.issues.length} issues)`);
        component.analysis.issues.slice(0, 3).forEach(issue => {
          logger.debug(`  - ${issue.prop}: ${issue.message}`);
        });
        logger.debug('');
      });
    }
  }

  /**
   * Save results to JSON file
   */
  saveResults() {
    const outputPath = path.join(process.cwd(), CONFIG.outputFile);
    fs.writeFileSync(outputPath, JSON.stringify(this.results, null, 2));
    logger.debug(`📄 Detailed results saved to: ${outputPath}`);
  }
}

// Run the analyzer
if (require.main === module) {
  const analyzer = new PropInterfaceAnalyzer();
  analyzer.analyze().catch(logger.error);
}

module.exports = PropInterfaceAnalyzer;
