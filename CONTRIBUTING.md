# Contributing to Shrimp Farm Management System

Thank you for your interest in contributing to the Shrimp Farm Management System! We welcome contributions from the community and are excited to see how you can help improve this project.

## Code of Conduct

This project and everyone participating in it is governed by our Code of Conduct. By participating, you are expected to uphold this code. Please report unacceptable behavior to the project maintainers.

## How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check the existing issues as you might find out that you don't need to create one. When you are creating a bug report, please include as much detail as possible:

- **Use a clear and descriptive title** for the issue
- **Describe the exact steps** which reproduce the problem
- **Provide specific examples** to demonstrate the steps
- **Describe the behavior you observed** after following the steps
- **Explain which behavior you expected** to see instead
- **Include screenshots** if possible
- **Note your environment** (OS, browser, etc.)

### Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. When creating an enhancement suggestion, please include:

- **Use a clear and descriptive title** for the issue
- **Provide a step-by-step description** of the suggested enhancement
- **Provide specific examples** to demonstrate the steps
- **Describe the current behavior** and **explain which behavior you expected** to see instead
- **Explain why this enhancement would be useful** to most users

### Code Contributions

#### Setting Up Your Environment

1. Fork the repository
2. Clone your fork locally
3. Install dependencies for both client and server:
   ```bash
   cd client && npm install
   cd ../server && npm install
   ```
4. Create a new branch for your feature or bugfix:
   ```bash
   git checkout -b feature/your-feature-name
   ```

#### Development Workflow

1. **Write Code**: Follow the existing code style and patterns
2. **Write Tests**: Ensure your changes are covered by tests
3. **Run Tests**: Make sure all tests pass
   ```bash
   npm test
   ```
4. **Check Code Quality**: Run linting
   ```bash
   npm run lint
   ```
5. **Commit Changes**: Use clear, descriptive commit messages
6. **Push to Your Fork**: 
   ```bash
   git push origin feature/your-feature-name
   ```
7. **Create Pull Request**: Submit your changes for review

#### Coding Standards

##### JavaScript/React
- Follow the existing code style (ESLint configuration)
- Use functional components and hooks where possible
- Write clear, self-documenting code
- Use meaningful variable and function names
- Comment complex logic and algorithms
- Keep functions small and focused
- Use PropTypes or TypeScript for type checking

##### API Design
- Follow RESTful principles
- Use consistent naming conventions
- Return appropriate HTTP status codes
- Provide meaningful error messages
- Document API endpoints

##### Testing
- Write unit tests for utility functions and helpers
- Write integration tests for components and pages
- Use realistic test data and scenarios
- Test both happy paths and error cases
- Aim for high test coverage (>80%)

##### Performance
- Minimize unnecessary re-renders
- Use React.memo() and useMemo() where appropriate
- Implement lazy loading for large components
- Optimize images and assets
- Use efficient algorithms and data structures

#### Pull Request Process

1. **Create PR**: Submit your pull request with a clear title and description
2. **Link Issues**: Reference any related issues in your PR description
3. **Request Review**: Assign reviewers from the core team
4. **Address Feedback**: Make requested changes promptly
5. **Merge**: Once approved, your PR will be merged by maintainers

### Styleguides

#### Git Commit Messages
- Use the present tense ("Add feature" not "Added feature")
- Use the imperative mood ("Move cursor to..." not "Moves cursor to...")
- Limit the first line to 72 characters or less
- Reference issues and pull requests liberally after the first line

#### JavaScript Styleguide
- All JavaScript must adhere to Airbnb JavaScript Style Guide
- Use semicolons
- Use single quotes for strings
- Use camelCase for variables and functions
- Use PascalCase for constructors and React components
- Use UPPER_CASE for constants
- Use descriptive variable names
- Avoid deeply nested code

#### CSS/SASS Styleguide
- Use CSS Modules or styled-components when possible
- Follow BEM methodology for class naming
- Use meaningful class names
- Organize styles logically
- Use rem units for font sizes
- Use flexbox or grid for layouts

#### Documentation Styleguide
- Use Markdown for documentation
- Reference assets and examples when possible
- Keep documentation up to date with code changes
- Use clear, concise language
- Include code examples where helpful

## Additional Notes

### Issue and Pull Request Labels

This project uses labels to organize and prioritize issues and pull requests:

- `bug` - Something isn't working
- `documentation` - Improvements or additions to documentation
- `duplicate` - This issue or pull request already exists
- `enhancement` - New feature or request
- `good first issue` - Good for newcomers
- `help wanted` - Extra attention is needed
- `invalid` - This doesn't seem right
- `question` - Further information is requested
- `wontfix` - This will not be worked on

### Recognition

Contributors who make significant improvements to the project will be recognized in:
- Release notes
- Contributor list
- Special thanks in documentation

### Questions?

If you have any questions about contributing, feel free to:
- Create an issue
- Contact the maintainers directly
- Join our community discussions

Thank you for contributing to the Shrimp Farm Management System!