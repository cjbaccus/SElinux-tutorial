---
id: 1-2-modes
title: SELinux Modes
module: 1
lesson: 2
points: 150
estimatedTime: 20
prerequisites: ['1-1-intro']
---

# SELinux Modes

SELinux operates in three distinct modes, each serving different purposes in your security strategy. Understanding when and how to use each mode is crucial for effective SELinux management.

## The Three Modes

### 1. Enforcing Mode

In **Enforcing** mode, SELinux:
- Actively enforces the security policy
- Blocks unauthorized access attempts
- Logs all policy violations
- Provides maximum security

This is the **recommended mode for production systems**.

### 2. Permissive Mode

In **Permissive** mode, SELinux:
- Does NOT block any actions
- Logs what WOULD have been blocked
- Useful for troubleshooting
- Helps develop custom policies

Use this mode for **testing and development**.

### 3. Disabled Mode

In **Disabled** mode, SELinux:
- Completely turned off
- No logging or enforcement
- Should be avoided in production
- Requires system reboot to re-enable

**Warning:** Disabling SELinux reduces system security significantly!

## Checking Current Mode

Use the `getenforce` command to check the current mode:

```bash
getenforce
```

For more detailed information, use:

```bash
sestatus
```

This shows the current mode, policy type, and whether SELinux is enabled.

## Switching Modes

### Temporary Mode Changes

To switch between Enforcing and Permissive temporarily (until reboot):

```bash
# Switch to Permissive
sudo setenforce 0

# Switch to Enforcing
sudo setenforce 1
```

**Note:** These changes don't survive a reboot!

### Permanent Mode Changes

To make permanent changes, edit `/etc/selinux/config`:

```bash
# Set to one of: enforcing, permissive, disabled
SELINUX=enforcing
```

Changes to `disabled` or from `disabled` require a system reboot.

## When to Use Each Mode

| Mode | Use Case | Risk Level |
|------|----------|-----------|
| **Enforcing** | Production systems | Low |
| **Permissive** | Troubleshooting, Policy development | Medium |
| **Disabled** | Legacy compatibility (last resort) | High |

## Best Practices

1. **Start with Permissive** when deploying new applications
2. **Review audit logs** to identify issues
3. **Fix policy violations** or adjust policies
4. **Switch to Enforcing** once everything works
5. **Never disable SELinux** without a strong reason

## Practice Exercise

Try checking your system's SELinux status in the terminal simulator below!

**Congratulations!** You now understand SELinux modes and how to manage them. Click "Complete & Continue" to earn 150 points and move to the next lesson about SELinux contexts!
