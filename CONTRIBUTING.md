# Contributing to Basic Mining Wallet

Thank you for your interest in contributing to Basic Mining Wallet! We welcome contributions from the community and are grateful for your help in making this project better.

## 📋 Table of Contents
- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [How to Contribute](#how-to-contribute)
- [Development Workflow](#development-workflow)
- [Coding Standards](#coding-standards)
- [Testing](#testing)
- [Security](#security)
- [Documentation](#documentation)
- [Community](#community)

## 🤝 Code of Conduct

This project adheres to a code of conduct to ensure a welcoming environment for all contributors. By participating, you agree to:

- Be respectful and inclusive
- Focus on constructive feedback
- Accept responsibility for mistakes
- Show empathy towards other contributors
- Help create a positive community

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ or Python 3.9+
- Git
- Docker (recommended)

### Setup
1. Fork the repository on GitHub
2. Clone your fork locally:
   `ash
   git clone https://github.com/your-username/basic-mining-wallet.git
   cd basic-mining-wallet
   `
3. Set up the development environment:
   `ash
   # Install dependencies
   npm install  # or pip install -r requirements.txt

   # Set up environment variables
   cp .env.example .env
   `
4. Create a feature branch:
   `ash
   git checkout -b feature/your-feature-name
   `

## 💡 How to Contribute

### Types of Contributions
- **🐛 Bug Fixes**: Fix existing issues
- **✨ Features**: Add new functionality
- **📚 Documentation**: Improve documentation
- **🧪 Tests**: Add or improve tests
- **🔒 Security**: Security-related improvements
- **🎨 UI/UX**: User interface improvements

### Finding Issues
- Check the [Issues](https://github.com/luckyduckcode/basic-mining-wallet/issues) page
- Look for issues labeled good first issue or help wanted
- Comment on issues you'd like to work on

## 🔄 Development Workflow

1. **Choose an Issue**: Select or create an issue to work on
2. **Create a Branch**: Use descriptive branch names
   `ash
   git checkout -b feature/add-wallet-encryption
   git checkout -b bugfix/fix-transaction-validation
   git checkout -b docs/update-api-documentation
   `
3. **Make Changes**: Implement your solution
4. **Write Tests**: Add tests for your changes
5. **Update Documentation**: Update relevant docs
6. **Commit Changes**: Use clear commit messages
   `ash
   git commit -m "feat: add wallet encryption with AES-256

   - Implement AES-256 encryption for wallet files
   - Add encryption key management
   - Update wallet backup functionality
   - Add unit tests for encryption features"
   `
7. **Push and Create PR**: Push your branch and create a pull request

## 📝 Coding Standards

### General Guidelines
- Follow the existing code style
- Write clear, readable, and maintainable code
- Add comments for complex logic
- Use meaningful variable and function names
- Keep functions small and focused

### JavaScript/TypeScript
`javascript
// ✅ Good
const calculateTransactionFee = (amount, feeRate) => {
  return amount * feeRate;
};

// ❌ Avoid
const calc = (a, f) => a * f;
`

### Python
`python
# ✅ Good
def calculate_transaction_fee(amount: float, fee_rate: float) -> float:
    """Calculate the transaction fee based on amount and fee rate."""
    return amount * fee_rate

# ❌ Avoid
def calc(a, f):
    return a * f
`

### Commit Message Format
`
type(scope): description

[optional body]

[optional footer]
`

Types:
- eat: New feature
- ix: Bug fix
- docs: Documentation
- style: Code style changes
- efactor: Code refactoring
- 	est: Adding tests
- chore: Maintenance

## 🧪 Testing

### Running Tests
`ash
# Run all tests
npm test

# Run specific test file
npm test wallet.test.js

# Run tests with coverage
npm run test:coverage
`

### Writing Tests
- Write tests for all new features
- Include both positive and negative test cases
- Use descriptive test names
- Test edge cases and error conditions

### Test Coverage
- Aim for 80%+ code coverage
- Focus on critical security functions
- Include integration tests for API endpoints

## 🔒 Security

### Security Considerations
- Never commit sensitive information
- Use environment variables for secrets
- Follow OWASP guidelines
- Implement proper input validation
- Use secure coding practices

### Reporting Security Issues
- **DO NOT** create public issues for security vulnerabilities
- Email security concerns to: security@basicminingwallet.com
- Include detailed information about the vulnerability
- Allow reasonable time for fixes before public disclosure

## 📚 Documentation

### Documentation Standards
- Keep README files up to date
- Document all public APIs
- Include code comments for complex logic
- Update documentation with code changes

### API Documentation
`javascript
/**
 * Creates a new wallet with the specified parameters
 * @param {Object} options - Wallet creation options
 * @param {string} options.name - Wallet name
 * @param {string} options.type - Wallet type ('bitcoin' | 'monero')
 * @returns {Promise<Wallet>} Created wallet instance
 */
async function createWallet(options) {
  // Implementation
}
`

## 🌐 Community

### Communication
- **GitHub Issues**: Bug reports and feature requests
- **GitHub Discussions**: General discussions and questions
- **Discord**: Real-time chat (link coming soon)

### Getting Help
- Check existing issues and documentation first
- Use clear, descriptive titles for issues
- Provide steps to reproduce bugs
- Include relevant code snippets and error messages

## 🙏 Recognition

Contributors will be recognized in:
- Repository contributors list
- Release notes
- Project documentation

## 📄 License

By contributing to this project, you agree that your contributions will be licensed under the same license as the project (MIT License).

---

Thank you for contributing to Basic Mining Wallet! Your efforts help make cryptocurrency more accessible and secure for miners worldwide. 🚀
