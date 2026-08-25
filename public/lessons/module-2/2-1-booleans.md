---
id: 2-1-booleans
title: Boolean Management
module: 2
lesson: 1
points: 200
estimatedTime: 20
prerequisites: ['1-3-contexts']
---

# SELinux Boolean Management

SELinux booleans are on/off switches that allow you to modify SELinux policy behavior without rewriting the entire policy. They provide flexibility for common use cases while maintaining security.

## What Are SELinux Booleans?

Booleans are policy settings that can be toggled to enable or disable specific features. Think of them as configuration flags that control SELinux behavior.

### Why Use Booleans?

Instead of writing custom policies for common scenarios, you can simply:
- Enable home directory access for web servers
- Allow network connections
- Enable NFS/CIFS mounting
- Configure FTP access modes

## Viewing Booleans

### List All Booleans

```bash
getsebool -a
```

This shows all available booleans and their current state (on/off).

### View Specific Boolean

```bash
getsebool httpd_can_network_connect
```

Output:
```
httpd_can_network_connect --> off
```

### Get Boolean Description

```bash
semanage boolean -l | grep httpd_can_network_connect
```

This shows what the boolean does.

## Setting Booleans

### Temporary Change (Until Reboot)

```bash
sudo setsebool httpd_can_network_connect on
```

Use this for **testing** - changes don't persist!

### Permanent Change

```bash
sudo setsebool -P httpd_can_network_connect on
```

The `-P` flag makes it **permanent** (survives reboots).

## Common Web Server Booleans

### Network Connectivity

```bash
# Allow httpd to make network connections
httpd_can_network_connect --> off

# Allow httpd to connect to databases
httpd_can_network_connect_db --> off

# Allow httpd to act as a relay
httpd_can_network_relay --> off
```

### File Access

```bash
# Allow httpd to access user home directories
httpd_enable_homedirs --> off

# Allow httpd to use NFS mounted files
httpd_use_nfs --> off

# Allow httpd to use CIFS mounted files
httpd_use_cifs --> off
```

### Email & Scripting

```bash
# Allow httpd to send mail
httpd_can_sendmail --> off

# Allow httpd scripts and modules to connect to the network
httpd_can_network_connect --> off
```

## Real-World Example

### Scenario: Web Application Needs Database Access

Your web application running on Apache needs to connect to a PostgreSQL database on port 5432.

**Problem:** SELinux denies the connection by default.

**Solution:** Enable the appropriate boolean:

```bash
# Check current state
getsebool httpd_can_network_connect_db

# Enable permanently
sudo setsebool -P httpd_can_network_connect_db on

# Verify
getsebool httpd_can_network_connect_db
```

**Result:** Apache can now connect to the database!

## Best Practices

### 1. Use Booleans Instead of Permissive Mode

❌ **Don't do this:**
```bash
setenforce 0  # Disables ALL SELinux protection
```

✅ **Do this:**
```bash
setsebool -P httpd_can_network_connect on  # Enables only what you need
```

### 2. Always Use -P for Production

```bash
# Temporary (testing)
setsebool httpd_enable_homedirs on

# Permanent (production)
setsebool -P httpd_enable_homedirs on
```

### 3. Document Your Changes

Keep track of which booleans you've enabled and why:

```bash
# List all non-default booleans
semanage boolean -l | grep "on.*off\|off.*on"
```

### 4. Principle of Least Privilege

Only enable booleans you actually need. Each enabled boolean slightly reduces security.

## Practice Exercise

Try these commands in the terminal:

```bash
# View all httpd-related booleans
getsebool -a | grep httpd

# Check a specific boolean
getsebool httpd_can_network_connect

# View boolean descriptions
semanage boolean -l | grep httpd_can_network_connect
```

## Common Boolean Patterns

### FTP Server
```bash
ftpd_full_access on          # Allow FTP full access
ftpd_anon_write on           # Allow anonymous FTP uploads
ftpd_connect_all_unreserved on  # Allow FTP to connect to any port
```

### Samba
```bash
samba_enable_home_dirs on    # Share home directories
samba_export_all_rw on       # Allow read/write to any file
```

### NFS
```bash
nfs_export_all_rw on         # Allow NFS exports read/write
nfs_export_all_ro on         # Allow NFS exports read-only
```

## Troubleshooting with Booleans

When SELinux denies access:

1. **Check audit logs** for suggestions:
   ```bash
   audit2why < /var/log/audit/audit.log
   ```

2. **Look for boolean recommendations** in the output

3. **Enable the suggested boolean**:
   ```bash
   setsebool -P suggested_boolean on
   ```

4. **Test your application**

5. **Verify it works**, then document the change

## Key Takeaways

✅ Booleans are on/off switches for SELinux features
✅ Use `getsebool` to view, `setsebool` to change
✅ Always use `-P` flag for permanent changes
✅ Booleans are safer than permissive mode
✅ Only enable what you actually need
✅ Check audit logs for boolean suggestions

**Excellent work!** You now understand how to use SELinux booleans to configure policy behavior. Click "Complete & Continue" to earn 200 points and move to file context management!
