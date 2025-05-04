# Code Quality Setup for House Expense Tracker

This document outlines the code quality tools and practices implemented in this project.

## Tools Implemented

### 1. ESLint
ESLint is configured to enforce consistent code style and catch potential errors:
- Configuration file: `.eslintrc.json`
- Rules include React best practices, accessibility (a11y), and general JavaScript conventions
- Run with `npm run lint` or `npm run lint:fix`

### 2. Prettier
Prettier automatically formats code to ensure consistent style:
- Configuration file: `.prettierrc`
- Ignored files specified in `.prettierignore`
- Run with `npm run format` or `npm run format:check`

### 3. Husky (Git Hooks)
When installed, Husky will run checks before commits:
- Prevents committing code that doesn't meet quality standards
- Uses lint-staged to only check files that are being committed

### 4. lint-staged
Configured to run linters only on staged files:
- Configuration file: `.lintstagedrc`
- Runs ESLint and Prettier on appropriate file types

## Installation

To enable these tools in your development workflow, run:

```bash
# Install dependencies
npm install --save-dev husky lint-staged prettier eslint eslint-config-prettier eslint-plugin-react eslint-plugin-react-hooks eslint-plugin-jsx-a11y

# Set up Husky
npm run prepare
```

## GitHub Actions Integration

The CI/CD pipeline in `.github/workflows/ci-cd.yml` includes steps to:
- Lint code
- Run tests
- Build the application

This ensures that code quality standards are maintained for all pull requests and deployments.

## Best Practices

1. **Always run linters before committing**:
   - `npm run lint:fix` to automatically fix issues
   - `npm run format` to format code

2. **Review ESLint warnings**:
   - Some warnings may need manual fixes
   - Consider if disabling a rule is appropriate (rarely)

3. **Keep dependencies updated**:
   - Regularly update ESLint, Prettier, and plugins
   - Review rule changes when updating

4. **Customize rules as needed**:
   - Adjust `.eslintrc.json` and `.prettierrc` to match team preferences
   - Document any significant deviations from defaults
