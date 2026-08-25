---
id: 1-3-contexts
title: SELinux Contexts
module: 1
lesson: 3
points: 200
estimatedTime: 25
prerequisites: ['1-1-intro', '1-2-modes']
---

# SELinux Contexts

SELinux contexts (also called labels) are the foundation of SELinux security. Every file, process, and system resource has a context that determines what operations are allowed.

## Context Format

SELinux contexts follow this format:

```
user:role:type:level
```

For example:
```
system_u:object_r:httpd_sys_content_t:s0
```

Let's break down each component:

### 1. User (`user`)

The SELinux user (not the same as Linux user):
- `system_u` - System processes
- `unconfined_u` - Unconfined users
- `user_u` - Regular confined users

### 2. Role (`role`)

Defines what the user can do:
- `object_r` - Files and objects
- `system_r` - System processes
- `unconfined_r` - Unconfined role

### 3. Type (`type`) - Most Important!

The **type** is the most critical part for type enforcement:
- `httpd_sys_content_t` - Web server content
- `httpd_config_t` - Web server configuration
- `admin_home_t` - Administrator home files
- `user_home_t` - User home files

SELinux policy rules define which types can interact with each other.

### 4. Level (`level`)

Used for Multi-Level Security (MLS):
- `s0` - Lowest sensitivity level
- `s0:c0.c1023` - With categories
- Usually `s0` for standard systems

## Viewing Contexts

Use the `-Z` flag with common commands:

### File Contexts
```bash
ls -Z /var/www/html
```

Output:
```
-rw-r--r--. apache apache system_u:object_r:httpd_sys_content_t:s0 index.html
```

### Process Contexts
```bash
ps -Z
```

### Your Context
```bash
id -Z
```

## How Contexts Work

SELinux uses **type enforcement** to control access. A process with type `httpd_t` can only:

1. Read files with type `httpd_sys_content_t`
2. Write to files with type `httpd_log_t`
3. Connect to ports with type `http_port_t`

Any other access is denied by default!

## Example Scenario

An Apache web server process runs with context:
```
system_u:system_r:httpd_t:s0
```

It tries to access a file:
```
system_u:object_r:httpd_sys_content_t:s0  ✓ Allowed
system_u:object_r:admin_home_t:s0        ✗ Denied
```

Even if Unix permissions allow it, SELinux blocks unauthorized access!

## Practice: View Contexts

Try these commands in the terminal:

```bash
# View file contexts
ls -Z

# View process contexts
ps -Z

# View your security context
id -Z
```

## Key Takeaways

1. Every resource has a security context
2. The **type** field controls most access decisions
3. Use `-Z` flag to view contexts
4. SELinux enforces type-based access control
5. Contexts override traditional Unix permissions

**Excellent work!** You've completed Module 1 fundamentals. Click "Complete & Continue" to earn 200 points and unlock Module 2 on working with SELinux!
