# Security Policy

## Supported Versions

We release security updates for the following versions of CornerKit:

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |
| < 1.0   | :x:                |

## Security Model

### Runtime Security
CornerKit is a client-side JavaScript library that:
- **Zero runtime dependencies** - Minimal attack surface
- **No network requests** - No data exfiltration risk
- **No data collection** - Privacy-first design
- **CSP compatible** - Works with strict Content Security Policies
- **Input validation** - All user inputs are validated and sanitized

### Production Bundle
The production library (`dist/cornerkit.esm.js`, etc.):
- Contains **zero vulnerabilities** (zero runtime dependencies)
- Is signed and verifiable via npm/CDN checksums
- Includes Subresource Integrity (SRI) hashes for CDN usage

### Development Dependencies
Development and testing dependencies may have advisories:
- These dependencies are **not included** in the production bundle
- They are only used during development, testing, and build processes
- We regularly update dev dependencies to address security issues
- Dev dependency vulnerabilities **do not affect** end users

## Reporting a Vulnerability

We take security seriously. If you discover a security vulnerability in CornerKit, please report it responsibly.

### How to Report

**Please DO NOT report security vulnerabilities through public GitHub issues.**

Instead, please email security details to:

📧 **security@cornerkit.dev** (preferred)

Or create a private security advisory:

1. Go to https://github.com/cornerkit/cornerkit/security/advisories
2. Click "New draft security advisory"
3. Fill in the details

### What to Include

Please include the following information:
- Description of the vulnerability
- Steps to reproduce the issue
- Affected versions
- Potential impact
- Suggested fix (if you have one)
- Your contact information (optional, for follow-up)

### Response Timeline

- **Initial Response**: Within 24-48 hours
- **Triage & Assessment**: Within 1 week
- **Fix Development**: Depends on severity (see below)
- **Public Disclosure**: After fix is released

### Severity Levels

We follow the CVSS v3.1 severity rating system:

| Severity | Response Time | Example |
|----------|---------------|---------|
| **Critical** (9.0-10.0) | 1-3 days | RCE, XSS in core functionality |
| **High** (7.0-8.9) | 1-2 weeks | Authentication bypass, data exposure |
| **Medium** (4.0-6.9) | 2-4 weeks | DoS, minor XSS |
| **Low** (0.1-3.9) | Next release | Information disclosure, low-impact issues |

## Security Best Practices

### For Users

When using CornerKit in your application:

#### 1. Use SRI (Subresource Integrity) for CDN
```html
<script
  src="https://cdn.jsdelivr.net/npm/cornerkit@1.0.0/dist/cornerkit.esm.js"
  integrity="sha384-[HASH]"
  crossorigin="anonymous"
></script>
```

#### 2. Validate User Inputs
```javascript
// Always validate radius and smoothing values from user input
const radius = Math.max(0, Math.min(100, parseFloat(userInput)));
ck.apply(element, { radius, smoothing: 0.8 });
```

#### 3. Use Content Security Policy
```http
Content-Security-Policy:
  default-src 'self';
  script-src 'self' https://cdn.jsdelivr.net;
  style-src 'self' 'unsafe-inline';  # Required for .style modifications
```

#### 4. Keep CornerKit Updated
```bash
# Check for updates regularly
npm outdated cornerkit

# Update to latest version
npm update cornerkit
```

#### 5. Audit Your Dependencies
```bash
# Check for vulnerabilities
npm audit

# Check CornerKit specifically
npm audit --package=cornerkit
```

### For Contributors

When contributing code to CornerKit:

#### 1. Never Use Unsafe APIs
❌ **Avoid**:
- `eval()` or `Function()` constructors
- `innerHTML` or `outerHTML` for user content
- `document.write()`
- Inline event handlers (`onclick`, etc.)

✅ **Use**:
- DOM APIs (`.style`, `.setAttribute()`)
- Type validation
- Input sanitization

#### 2. Validate All Inputs
```typescript
// Always validate and sanitize
if (typeof radius !== 'number' || isNaN(radius) || radius < 0) {
  throw new TypeError('radius must be a positive number');
}
```

#### 3. Write Security Tests
```typescript
test('should reject malicious input', () => {
  expect(() => {
    ck.apply(element, { radius: '<script>alert(1)</script>' });
  }).toThrow();
});
```

#### 4. Document Security Considerations
```typescript
/**
 * Apply squircle corners to element
 * @param element - DOM element (validated)
 * @param config - Configuration (validated and sanitized)
 * @security All inputs are validated before use
 */
```

## Security Advisories

### Published Advisories
No security advisories have been published for CornerKit.

### Third-Party Advisories
We monitor the following sources for security advisories:
- [npm Security Advisories](https://github.com/advisories)
- [Snyk Vulnerability Database](https://snyk.io/vuln/)
- [CVE Database](https://cve.mitre.org/)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)

## Security Audit Reports

Detailed security audit reports are available in:
- [packages/core/security/SECURITY-AUDIT.md](packages/core/security/SECURITY-AUDIT.md)

## Security Contact

For security-related questions or concerns:

📧 **security@cornerkit.dev**
🔗 **GitHub Security**: https://github.com/cornerkit/cornerkit/security

## Acknowledgments

We appreciate responsible disclosure of security vulnerabilities. Contributors who report valid security issues will be acknowledged in our:
- Security advisories
- Release notes
- CONTRIBUTORS.md file

Thank you for helping keep CornerKit secure! 🔒

---

**Last Updated**: 2025-01-11
**Policy Version**: 1.0.0
