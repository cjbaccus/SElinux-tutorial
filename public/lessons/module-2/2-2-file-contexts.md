---
id: 2-2-file-contexts
title: File Context Management
module: 2
lesson: 2
points: 250
estimatedTime: 25
prerequisites: ['2-1-booleans']
---

# File Context Management

File contexts are SELinux labels that determine what processes can access which files. Understanding how to view, set, and restore file contexts is essential for SELinux administration.

## Understanding File Contexts

Every file and directory has a security context with four parts:
```
user:role:type:level
```

The **type** is the most important for file access control.

### Default File Contexts

SELinux has default contexts for standard locations:

| Location | Default Type | Purpose |
|----------|-------------|---------|
| `/var/www/html` | `httpd_sys_content_t` | Web content |
| `/etc/nginx` | `httpd_config_t` | Web server config |
| `/var/log/httpd` | `httpd_log_t` | Web server logs |
| `/home/user` | `user_home_t` | User home directories |
| `/tmp` | `tmp_t` | Temporary files |

## Viewing File Contexts

### View File Contexts

```bash
ls -Z /var/www/html
```

Output:
```
-rw-r--r--. apache apache system_u:object_r:httpd_sys_content_t:s0 index.html
```

### View Directory Tree

```bash
ls -lZR /var/www/
```

### View Current Directory

```bash
ls -Z
```

## The Context Mismatch Problem

### Common Scenario

You create a file in `/tmp` then move it to `/var/www/html`:

```bash
# Create in /tmp (gets tmp_t context)
echo "Hello" > /tmp/test.html

# Check context
ls -Z /tmp/test.html
# Output: unconfined_u:object_r:tmp_t:s0 test.html

# Move to web directory
sudo mv /tmp/test.html /var/www/html/

# Check context (still tmp_t!)
ls -Z /var/www/html/test.html
# Output: unconfined_u:object_r:tmp_t:s0 test.html
```

**Problem:** Apache cannot serve files with `tmp_t` context!

## Fixing File Contexts

### Method 1: restorecon (Recommended)

`restorecon` restores the default context based on policy:

```bash
# Restore single file
sudo restorecon /var/www/html/test.html

# Restore recursively with verbose output
sudo restorecon -Rv /var/www/html/
```

Output:
```
Relabeled /var/www/html/test.html from unconfined_u:object_r:tmp_t:s0
         to system_u:object_r:httpd_sys_content_t:s0
```

### Method 2: chcon (Temporary)

`chcon` changes context temporarily (not persistent):

```bash
# Change type only
sudo chcon -t httpd_sys_content_t /var/www/html/test.html

# Change full context
sudo chcon -u system_u -r object_r -t httpd_sys_content_t /var/www/html/test.html

# Recursive
sudo chcon -R -t httpd_sys_content_t /var/www/html/
```

⚠️ **Warning:** `chcon` changes are lost when you run `restorecon`!

### When to Use Each

| Command | Use When |
|---------|----------|
| `restorecon` | Permanent fix, aligns with policy |
| `chcon` | Temporary testing only |

## Managing Default Contexts

### View Context Rules

```bash
# View all file context rules
sudo semanage fcontext -l

# Filter for web server
sudo semanage fcontext -l | grep httpd

# Search for specific path
sudo semanage fcontext -l | grep '/var/www'
```

### Add Custom Context Rule

When you use non-standard directories:

```bash
# Add new rule
sudo semanage fcontext -a -t httpd_sys_content_t "/web-content(/.*)?"

# Apply the rule
sudo restorecon -Rv /web-content/
```

**Explanation:**
- `-a` = add rule
- `-t` = specify type
- `"/web-content(/.*)?"` = regex pattern (directory and all contents)

### Modify Existing Rule

```bash
# Modify existing rule
sudo semanage fcontext -m -t httpd_sys_rw_content_t "/var/www/uploads(/.*)?"

# Apply
sudo restorecon -Rv /var/www/uploads/
```

### Delete Context Rule

```bash
# Delete rule
sudo semanage fcontext -d "/web-content(/.*)?"
```

## Real-World Example

### Custom Web Directory

You want to serve content from `/data/website` instead of `/var/www/html`:

```bash
# 1. Create directory
sudo mkdir -p /data/website

# 2. Add files
sudo cp index.html /data/website/

# 3. Check context (wrong!)
ls -Z /data/website/
# Output: unconfined_u:object_r:default_t:s0 index.html

# 4. Add SELinux rule
sudo semanage fcontext -a -t httpd_sys_content_t "/data/website(/.*)?"

# 5. Apply the rule
sudo restorecon -Rv /data/website/

# 6. Verify
ls -Z /data/website/
# Output: system_u:object_r:httpd_sys_content_t:s0 index.html

# 7. Configure web server to use /data/website
# Now Apache can serve files!
```

## Common Context Types

### Web Server
```bash
httpd_sys_content_t       # Read-only web content
httpd_sys_rw_content_t    # Read-write web content
httpd_sys_script_exec_t   # CGI scripts
httpd_log_t               # Log files
httpd_config_t            # Configuration files
```

### Database
```bash
postgresql_db_t           # Database files
mysqld_db_t              # MySQL database files
```

### User Files
```bash
user_home_t              # User home directories
admin_home_t             # Admin home directories
```

## Best Practices

### 1. Always Use restorecon

```bash
# After copying files
sudo cp /source/file.html /var/www/html/
sudo restorecon /var/www/html/file.html
```

### 2. Use rsync to Preserve Contexts

```bash
# rsync preserves contexts
sudo rsync -av --no-o --no-g /source/ /var/www/html/
```

### 3. Create Rules for Custom Directories

```bash
# Don't fight SELinux, teach it!
sudo semanage fcontext -a -t httpd_sys_content_t "/custom/path(/.*)?"
sudo restorecon -Rv /custom/path/
```

### 4. Check Contexts After Deployment

```bash
# Verify contexts are correct
ls -lZR /var/www/html/
```

### 5. Document Custom Rules

```bash
# List all custom rules
sudo semanage fcontext -l -C
```

## Troubleshooting Context Issues

### Symptom: Permission Denied

```bash
# 1. Check file contexts
ls -Z /var/www/html/problematic-file.html

# 2. Check expected context
sudo semanage fcontext -l | grep '/var/www/html'

# 3. Fix if wrong
sudo restorecon -v /var/www/html/problematic-file.html
```

### Symptom: Context Keeps Changing Back

You're probably using `chcon`. Switch to `semanage`:

```bash
# Wrong (temporary)
sudo chcon -t httpd_sys_content_t /custom/dir

# Right (permanent)
sudo semanage fcontext -a -t httpd_sys_content_t "/custom/dir(/.*)?"
sudo restorecon -Rv /custom/dir
```

## Practice Exercise

Try these commands:

```bash
# View file contexts
ls -Z /var/www/html

# View context rules
semanage fcontext -l | grep httpd

# Simulate restoring contexts
restorecon -Rv /var/www/html
```

## Key Takeaways

✅ Every file has a security context (user:role:type:level)
✅ Use `ls -Z` to view contexts
✅ Use `restorecon` to fix contexts (permanent)
✅ Use `semanage fcontext` to create rules for custom directories
✅ Avoid `chcon` for permanent changes
✅ The type field controls most access decisions

**Great job!** You can now manage file contexts like a pro. Click "Complete & Continue" to earn 250 points and learn about troubleshooting SELinux!
