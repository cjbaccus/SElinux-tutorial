---
id: 1-1-intro
title: Introduction to SELinux
module: 1
lesson: 1
points: 100
estimatedTime: 15
prerequisites: []
---

# Introduction to SELinux

Welcome to the SELinux Tutorial! In this lesson, you'll learn what SELinux is and why it's an essential security feature for modern Linux systems.

## What is SELinux?

**Security-Enhanced Linux (SELinux)** is a security architecture integrated into the Linux kernel that provides a mechanism for supporting access control security policies. Originally developed by the National Security Agency (NSA), SELinux is now a critical component of enterprise Linux distributions like Red Hat Enterprise Linux (RHEL), CentOS, and Fedora.

## Why SELinux Matters

Traditional Linux security relies on **Discretionary Access Control (DAC)**, where users control access to their own files. While useful, DAC has limitations:

- Users can accidentally expose sensitive files
- Compromised processes can access any file the user can access
- Limited protection against privilege escalation

SELinux implements **Mandatory Access Control (MAC)**, where:

- System-wide security policy overrides user permissions
- Processes run with minimal privileges (principle of least privilege)
- Even root-compromised processes are restricted
- Fine-grained control over system resources

## Real-World Example

Imagine a web server running as user `apache`. Under DAC alone:

- If compromised, an attacker could read any file the `apache` user can read
- The attacker might access log files, configuration files, or even other applications' data

With SELinux enabled:

- The web server process is confined to specific contexts
- It can only read files labeled for web content
- Even if compromised, the attacker cannot access databases, logs, or other services
- System integrity is maintained

## Key Concepts Preview

As you progress through this tutorial, you'll master these core concepts:

1. **SELinux Modes** - Enforcing, Permissive, and Disabled
2. **Security Contexts** - Labels that define access rules
3. **Policies** - Rules that govern system access
4. **Booleans** - On/off switches for policy features
5. **File Contexts** - How SELinux labels files and directories

## Your First Command

Let's check if SELinux is running on your system. Try this command in the terminal below:

```bash
getenforce
```

This command shows the current SELinux mode. You should see one of:
- **Enforcing** - SELinux is active and blocking unauthorized access
- **Permissive** - SELinux is active but only logging violations (not blocking)
- **Disabled** - SELinux is not running

## What's Next?

In the next lesson, you'll learn about SELinux modes in detail and how to switch between them safely. You'll also learn when to use each mode for development, testing, and production environments.

---

**Congratulations!** You've completed the introduction to SELinux. Click "Complete & Continue" below to move on to the next lesson and earn your first 100 points!
