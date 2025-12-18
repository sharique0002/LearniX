# Contributing to LearniX

Thank you for your interest in contributing to LearniX! This document provides guidelines and instructions for contributing.

## 🌿 Branch Strategy

We use the following branch structure:

- `main` - Production-ready code
- `feature` - New features development
- `test` - Testing and QA
- `bugfix` - Bug fixes
- `experiment` - Experimental features

## 🔄 Workflow

### 1. Create a Feature

```bash
git checkout feature
git pull origin feature
# Make your changes
git add .
git commit -m "feat: Your feature description"
git push origin feature
```

### 2. Fix a Bug

```bash
git checkout bugfix
git pull origin bugfix
# Make your fixes
git add .
git commit -m "fix: Bug description"
git push origin bugfix
```

### 3. Add Tests

```bash
git checkout test
git pull origin test
# Add your tests
git add .
git commit -m "test: Test description"
git push origin test
```

## 📝 Commit Message Convention

We follow Conventional Commits:

- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `test:` - Adding or modifying tests
- `refactor:` - Code refactoring
- `style:` - Formatting changes
- `chore:` - Maintenance tasks

## 🧪 Testing Requirements

- All new features must include tests
- Run `npm test` before committing
- Ensure all tests pass

## 📋 Pull Request Process

1. Update the README.md if needed
2. Ensure all tests pass
3. Request review from maintainers
4. Squash commits if requested

## 📞 Contact

- GitHub Issues for bug reports
- Discussions for questions
