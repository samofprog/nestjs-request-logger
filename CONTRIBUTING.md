# Contributing to NestJS Request Logger

Thank you for your interest in contributing to NestJS Request Logger! We appreciate your help in making this project better.

## Code of Conduct

We are committed to providing a welcoming and inspiring community for all. Please be respectful and constructive in all interactions.

## Getting Started

### Prerequisites

- Node.js >= 14.0.0
- Yarn or NPM
- Git

### Setup Development Environment

1. **Fork the repository** on GitHub
2. **Clone your fork**:
   ```bash
   git clone https://github.com/YOUR_USERNAME/nestjs-request-logger.git
   cd nestjs-request-logger
   ```

3. **Install dependencies**:
   ```bash
   yarn install
   ```

4. **Setup Git hooks** (automatically runs `prepare` script):
   ```bash
   yarn prepare
   ```

## Development Workflow

### Branch Naming

- Feature: `feature/feature-name`
- Bug fix: `fix/bug-description`
- Documentation: `docs/doc-update`
- Refactoring: `refactor/refactor-description`

### Making Changes

1. **Create a branch** from `main`:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes** and commit regularly:
   ```bash
   git add .
   git commit -m "feat: clear description of changes"
   ```

3. **Follow commit conventions** (Conventional Commits):
   - `feat:` for new features
   - `fix:` for bug fixes
   - `docs:` for documentation
   - `style:` for code style changes
   - `refactor:` for refactoring
   - `test:` for test additions
   - `chore:` for maintenance

### Code Style

This project uses:
- **ESLint** for linting
- **Prettier** for code formatting
- **TypeScript** with strict mode enabled

#### Run Linting and Formatting

```bash
# Fix linting issues automatically
yarn lint

# Check for linting issues without fixing
yarn lint:check

# Format code with Prettier
yarn format
```

### Testing

Tests are automatically run before commits. You can also run them manually:

```bash
# Run tests once
yarn test

# Watch mode (re-run on changes)
yarn test:watch

# Coverage report
yarn test:coverage
```

### Building

```bash
# Clean build with linting
yarn build

# This runs:
# 1. Clean dist folder
# 2. Run lint (fixes issues)
# 3. Compile TypeScript
```

## Pull Request Process

1. **Ensure your code**:
   - Passes all linting checks
   - Is properly formatted
   - Has passing tests
   - Includes appropriate comments/documentation

2. **Update documentation** if needed:
   - Update README.md for user-facing changes
   - Update CHANGELOG.md following the existing format
   - Add JSDoc comments for new functions/classes

3. **Create a Pull Request**:
   - Give it a clear, descriptive title
   - Describe what changes you made and why
   - Reference any related issues (e.g., `Fixes #123`)
   - Ensure CI/CD checks pass

4. **Code Review**:
   - Be open to feedback
   - Address review comments
   - Feel free to ask for clarifications

## Reporting Bugs

When reporting bugs:

1. **Use a clear title** describing the issue
2. **Include reproduction steps**:
   ```
   1. Do this...
   2. Then that...
   3. Expected behavior...
   4. Actual behavior...
   ```

3. **Provide your environment**:
   - Node.js version
   - NestJS version
   - OS

4. **Include code samples** if applicable

## Suggesting Enhancements

Enhancement suggestions are welcome! Please:

1. **Use a clear title**
2. **Provide detailed description** of the enhancement
3. **Explain the use case** and benefits
4. **Include code examples** if applicable
5. **Check existing issues** to avoid duplicates

## Project Structure

```
nestjs-request-logger/
├── src/
│   ├── constants/          # DI tokens
│   ├── factories/          # Factory functions
│   ├── middlewares/        # Middleware implementations
│   ├── providers/          # NestJS providers
│   ├── types/              # Type definitions
│   ├── utils/              # Utility classes
│   └── index.ts            # Main export
├── tests/                  # Test files
├── .github/workflows/      # CI/CD configurations
├── package.json
├── tsconfig.json
├── jest.config.js
└── README.md
```

## Documentation

- **JSDoc comments** for all public APIs
- **README.md** for user documentation
- **CHANGELOG.md** for version changes
- **CONTRIBUTING.md** (this file) for contributor guidelines

## Questions?

- **Open an issue** for bugs
- **Start a discussion** for questions
- **Check the README** for usage examples

## License

By contributing to this project, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing! 🎉