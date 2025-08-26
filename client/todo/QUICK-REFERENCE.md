# Quick Reference Guide

## 🚀 Essential Commands

### Check Current Status
```bash
# Count total issues
cd client && npm run lint 2>&1 | grep "✖" | wc -l
cd server && npm run lint 2>&1 | grep "✖" | wc -l

# View all issues
cd client && npm run lint
cd server && npm run lint
```

### Auto-fix Available Issues
```bash
# Client side
cd client && npm run lint:fix

# Server side
cd server && npm run lint:fix
```

### Run Tests
```bash
# All tests
npm test

# Specific test file
npm test -- --testPathPattern="DashboardPage.test.js"

# Watch mode
npm run test:watch
```

### Build Application
```bash
# Both client and server
npm run build

# Client only
cd client && npm run build

# Server only
cd server && npm run build
```

## 📁 Key File Locations

### Client Side
- **Main App:** `/client/src/App.js`
- **Components:** `/client/src/components/`
- **Utilities:** `/client/src/utils/`
- **Constants:** `/client/src/utils/constants.js`
- **Tests:** `/client/src/__tests__/`
- **Context:** `/client/src/context/`

### Server Side
- **Main Server:** `/server/server.js`
- **Controllers:** `/server/controllers/`
- **Models:** `/server/models/`
- **Routes:** `/server/routes/`
- **Utilities:** `/server/utils/`
- **Config:** `/server/config/`
- **Tests:** `/server/__tests__/`

## 🔧 Common Fix Patterns

### 1. Radix Parameters
```javascript
// ❌ Wrong
const num = parseInt(value);

// ✅ Correct
const num = parseInt(value, 10);
```

### 2. Equality Operators
```javascript
// ❌ Wrong
if (value == 'active')

// ✅ Correct
if (value === 'active')
```

### 3. PropTypes Validation
```javascript
import PropTypes from 'prop-types';

const Component = ({ title, count }) => (
  <div>
    <h1>{title}</h1>
    <p>{count}</p>
  </div>
);

Component.propTypes = {
  title: PropTypes.string.isRequired,
  count: PropTypes.number
};

Component.displayName = 'Component';
```

### 4. Console Statements
```javascript
// ❌ Wrong
console.log('Debug info');

// ✅ Correct
import { createLogger } from './utils/logger';
const logger = createLogger('Component');
logger.debug('Debug info');
```

### 5. React Hooks Dependencies
```javascript
// ❌ Wrong
const memoizedValue = useMemo(() => processData(data), []);

// ✅ Correct
const memoizedValue = useMemo(() => processData(data), [data]);
```

### 6. Magic Numbers
```javascript
// ❌ Wrong
setTimeout(callback, 5000);

// ✅ Correct
import { TIMEOUT } from './utils/constants';
setTimeout(callback, TIMEOUT.LONG);
```

## 📚 Available Constants

### Time Constants
```javascript
import { TIME, TIMEOUT } from './utils/constants';

// TIME constants
TIME.MILLISECOND // 1
TIME.SECOND      // 1000
TIME.MINUTE      // 60 * 1000

// TIMEOUT constants
TIMEOUT.SHORT    // 1000
TIMEOUT.DEFAULT  // 3000
TIMEOUT.LONG     // 5000
```

### Spacing Constants
```javascript
import { SPACING } from './utils/constants';

SPACING.XS  // 4
SPACING.SM  // 8
SPACING.MD  // 16
SPACING.LG  // 24
SPACING.XL  // 32
```

### Validation Constants
```javascript
import { VALIDATION, PROGRESS } from './utils/constants';

VALIDATION.MIN_PASSWORD_LENGTH  // 8
VALIDATION.MAX_STRING_LENGTH    // 255
PROGRESS.MAX                    // 100
```

## 🎯 Priority Task List

### 🔴 HIGH PRIORITY (Do First)
1. Fix radix parameters in server files
2. Correct equality operators in server files
3. Resolve undefined variables in authController.js
4. Add PropTypes to client components
5. Replace console statements with logger

### 🟡 MEDIUM PRIORITY (Do Second)
1. Replace magic numbers with constants
2. Split oversized files
3. Add JSDoc documentation
4. Remove unused variables
5. Fix anonymous exports

### 🟢 LOW PRIORITY (Polish)
1. Standardize arrow functions
2. Add component display names
3. Refactor complex functions
4. Final testing

## 📞 Need Help?

### Common Issues and Solutions

**1. Import errors after splitting files:**
- Check import paths are correct
- Ensure index.js files export correctly
- Verify file extensions (.js vs .jsx)

**2. PropTypes warnings:**
- Make sure PropTypes are defined for all component props
- Use .isRequired for required props
- Add displayName to all components

**3. Hooks dependency warnings:**
- Include all variables used in the hook callback in dependencies
- Use useCallback for stable function references
- Extract complex dependencies to separate variables

**4. Build failures:**
- Check for syntax errors
- Verify all imports are correct
- Ensure all required dependencies are installed

## 📈 Quick Progress Check

### After Each Task, Run:
```bash
# Check specific issue type
npm run lint | grep "radix"          # For radix issues
npm run lint | grep "prop-types"     # For PropTypes issues
npm run lint | grep "no-console"     # For console issues
npm run lint | grep "exhaustive-deps" # For hooks issues

# Count remaining issues
npm run lint 2>&1 | grep "✖" | wc -l
```

## 🛡️ Best Practices

1. **Work in small increments** - Complete one file at a time
2. **Test frequently** - Run tests after each change
3. **Commit often** - Make small, descriptive commits
4. **Document changes** - Update this progress file
5. **Ask for help** - Don't struggle with difficult issues

---

*Last Updated: 2025-08-26*
*For detailed task information, see the other files in this directory*