# Security Policy

## 🔒 Supported Versions

Currently supported versions with security updates:

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |
| < 1.0   | :x:                |

## 🚨 Reporting a Vulnerability

We take security seriously. If you discover a security vulnerability, please follow these steps:

### 1. **DO NOT** Create a Public Issue

Please do not create a public GitHub issue for security vulnerabilities.

### 2. Report Privately

Send an email to: **security@basma-restaurant.uz** (or your security contact)

Include:
- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if any)

### 3. Response Time

- **Initial Response:** Within 48 hours
- **Status Update:** Within 7 days
- **Fix Timeline:** Depends on severity

### 4. Disclosure Policy

- We will acknowledge your report within 48 hours
- We will provide a detailed response within 7 days
- We will work on a fix and keep you updated
- Once fixed, we will publicly disclose the vulnerability (with your permission)
- We will credit you in the security advisory (if you wish)

## 🛡️ Security Best Practices

### For Developers

1. **Never commit sensitive data**
   - No API keys, passwords, or tokens in code
   - Use environment variables
   - Check `.gitignore` is properly configured

2. **Keep dependencies updated**
   ```bash
   npm audit
   npm audit fix
   ```

3. **Use strong authentication**
   - Change default passwords
   - Use strong JWT secrets
   - Implement rate limiting

4. **Validate all inputs**
   - Sanitize user inputs
   - Use validation libraries
   - Prevent injection attacks

5. **Use HTTPS in production**
   - Never use HTTP for sensitive data
   - Implement SSL/TLS
   - Use secure cookies

### For Administrators

1. **Change default credentials immediately**
   - All default passwords must be changed
   - Use strong, unique passwords
   - Enable 2FA if available

2. **Secure your database**
   - Use strong database passwords
   - Enable IP whitelisting
   - Regular backups
   - Enable encryption at rest

3. **Monitor and log**
   - Enable application logging
   - Monitor for suspicious activity
   - Set up alerts for anomalies

4. **Regular updates**
   - Keep Node.js updated
   - Update dependencies regularly
   - Apply security patches promptly

5. **Network security**
   - Use firewall rules
   - Limit exposed ports
   - Use VPN for admin access

## 🔐 Security Features

### Current Implementation

- ✅ JWT authentication
- ✅ Bcrypt password hashing
- ✅ Role-based access control (RBAC)
- ✅ Rate limiting
- ✅ Helmet.js security headers
- ✅ CORS configuration
- ✅ Input validation
- ✅ MongoDB injection prevention
- ✅ XSS protection

### Planned Enhancements

- [ ] Two-factor authentication (2FA)
- [ ] Session management
- [ ] IP-based access control
- [ ] Audit logging
- [ ] Intrusion detection
- [ ] Automated security scanning

## 📋 Security Checklist

Before deploying to production:

- [ ] All default passwords changed
- [ ] JWT_SECRET is strong and unique
- [ ] Database credentials are secure
- [ ] HTTPS is enabled
- [ ] CORS is properly configured
- [ ] Rate limiting is enabled
- [ ] Input validation is implemented
- [ ] Error messages don't leak sensitive info
- [ ] Logging is enabled
- [ ] Backups are configured
- [ ] Security headers are set
- [ ] Dependencies are up to date
- [ ] Security audit completed

## 🚫 Known Security Considerations

### Development Environment

The development environment includes:
- Default credentials (MUST be changed in production)
- Relaxed CORS settings
- Detailed error messages
- Debug logging

**⚠️ NEVER use development settings in production!**

### Third-party Dependencies

We regularly audit our dependencies for vulnerabilities:
```bash
npm audit
```

If you find a vulnerable dependency, please report it.

## 📚 Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)
- [Express Security Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)
- [MongoDB Security Checklist](https://docs.mongodb.com/manual/administration/security-checklist/)

## 🏆 Security Hall of Fame

We appreciate security researchers who help us keep BASMA secure:

<!-- List of contributors who reported security issues -->
- *Your name could be here!*

## 📞 Contact

For security concerns: **security@basma-restaurant.uz**

For general questions: **support@basma-restaurant.uz**

---

**Last Updated:** February 6, 2026  
**Version:** 1.0.0
