---
id: 2-3-troubleshooting
title: Troubleshooting SELinux
module: 2
lesson: 3
points: 300
estimatedTime: 30
prerequisites: ['2-2-file-contexts']
---

# Troubleshooting SELinux

When applications don't work with SELinux enabled, don't disable it—debug it! This lesson teaches you how to identify, understand, and fix SELinux denials using audit logs and analysis tools.

## The Troubleshooting Mindset

### ❌ Don't Do This
```bash
# Giving up
setenforce 0
# or
SELINUX=disabled
```

### ✅ Do This Instead
1. Check audit logs
2. Understand the denial
3. Fix the root cause
4. Test the fix
5. Make it permanent

## SELinux Audit System

### Where Denials Are Logged

SELinux logs all policy violations to:
- `/var/log/audit/audit.log` (main audit log)
- `/var/log/messages` (if auditd not running)

### AVC Denials

**AVC** = Access Vector Cache

An AVC denial looks like:
```
type=AVC msg=audit(1234567890.123:456): avc: denied { read }
  for pid=1234 comm="httpd" name="index.html" dev="sda1" ino=567890
  scontext=system_u:system_r:httpd_t:s0
  tcontext=system_u:object_r:user_home_t:s0
  tclass=file permissive=0
```

Let's decode this:
- **denied { read }** - Read operation was blocked
- **comm="httpd"** - Process: Apache web server
- **scontext** - Source context (httpd_t = Apache process)
- **tcontext** - Target context (user_home_t = user home file)
- **tclass=file** - Type of object (file, socket, etc.)

## Essential Troubleshooting Tools

### 1. ausearch - Search Audit Logs

```bash
# View recent AVC denials
sudo ausearch -m avc -ts recent

# AVC denials in the last hour
sudo ausearch -m avc -ts today

# Filter by command
sudo ausearch -m avc -c httpd

# Last 10 minutes
sudo ausearch -m avc -ts recent -i
```

Flags:
- `-m avc` = AVC messages only
- `-ts recent` = Recent entries (last 10 min)
- `-ts today` = Today's entries
- `-c httpd` = Filter by command name
- `-i` = Interpret (human-readable)

### 2. audit2why - Explain Denials

```bash
# Analyze recent denials
sudo ausearch -m avc -ts recent | audit2why
```

Output:
```
type=AVC msg=audit(1234567890.123:456): avc: denied { name_connect }
  for pid=1234 comm="httpd" dest=8080
  scontext=system_u:system_r:httpd_t:s0
  tcontext=system_u:object_r:http_port_t:s0
  tclass=tcp_socket

    Was caused by:
    One of the following booleans was set incorrectly.
    Description:
    Allow httpd to act as a relay

    Allow access by executing:
    # setsebool -P httpd_can_network_relay 1
```

`audit2why` tells you:
- ✅ What caused the denial
- ✅ How to fix it
- ✅ Specific commands to run

### 3. audit2allow - Generate Policy

When no boolean exists, generate a custom policy:

```bash
# Generate policy module
sudo ausearch -m avc -ts recent | audit2allow -M my-httpd

# This creates:
# - my-httpd.te (policy source)
# - my-httpd.pp (compiled module)

# Install the module
sudo semodule -i my-httpd.pp
```

⚠️ **Warning:** Only use `audit2allow` when:
- No boolean solution exists
- You understand what you're allowing
- You've verified the denial is legitimate

### 4. sealert - Detailed Analysis

If `setroubleshoot` is installed:

```bash
# Analyze a specific AVC
sudo sealert -a /var/log/audit/audit.log

# View browser-friendly report
sealert -b
```

## Common Denial Scenarios

### Scenario 1: Web Server Can't Read Files

**Symptom:** 403 Forbidden

```bash
# Check audit logs
sudo ausearch -m avc -ts recent | grep httpd

# Look for
denied { read } ... scontext=...httpd_t... tcontext=...wrong_type_t...
```

**Diagnosis:** File has wrong context

**Solution:**
```bash
# Check file context
ls -Z /var/www/html/file.html

# Fix it
sudo restorecon -v /var/www/html/file.html
```

### Scenario 2: Web Server Can't Connect to Database

**Symptom:** Database connection refused (but firewall allows it)

```bash
# Check for network denials
sudo ausearch -m avc -ts recent | grep connect
```

**Diagnosis:** Boolean disabled

**Solution:**
```bash
# Enable database connections
sudo setsebool -P httpd_can_network_connect_db on
```

### Scenario 3: Service Can't Bind to Port

**Symptom:** "Permission denied" when starting service

```bash
# Check for port denials
sudo ausearch -m avc -ts recent | grep name_bind
```

**Diagnosis:** Port not labeled for service

**Solution:**
```bash
# Add port to allowed list
sudo semanage port -a -t http_port_t -p tcp 8080

# Or modify existing
sudo semanage port -m -t http_port_t -p tcp 8080
```

### Scenario 4: Can't Write to Directory

**Symptom:** Write operations fail

```bash
# Check for write denials
sudo ausearch -m avc -ts recent | grep write
```

**Diagnosis:** Directory has read-only context

**Solution:**
```bash
# Change to read-write context
sudo semanage fcontext -a -t httpd_sys_rw_content_t "/var/www/uploads(/.*)?"
sudo restorecon -Rv /var/www/uploads/
```

## Step-by-Step Troubleshooting Process

### Step 1: Reproduce the Problem

Trigger the denial in a controlled way:
```bash
# Try to access the resource
curl http://localhost/problematic-file.html
```

### Step 2: Check for AVC Denials

```bash
# Look for recent denials
sudo ausearch -m avc -ts recent
```

### Step 3: Analyze the Denial

```bash
# Get explanation
sudo ausearch -m avc -ts recent | audit2why
```

### Step 4: Apply the Fix

Based on `audit2why` output:

**Option A: Boolean**
```bash
sudo setsebool -P suggested_boolean on
```

**Option B: File Context**
```bash
sudo restorecon -v /path/to/file
```

**Option C: Port Label**
```bash
sudo semanage port -a -t service_port_t -p tcp PORT
```

**Option D: Custom Policy** (last resort)
```bash
sudo ausearch -m avc -ts recent | audit2allow -M mypolicy
sudo semodule -i mypolicy.pp
```

### Step 5: Test

```bash
# Try again
curl http://localhost/problematic-file.html

# Verify no new denials
sudo ausearch -m avc -ts recent
```

### Step 6: Document

```bash
# Note what you changed
echo "Enabled httpd_can_network_connect for database access" >> /root/selinux-changes.txt
```

## Real-World Example

### Problem: Apache Can't Serve Files from /srv/website

```bash
# 1. Try to access
curl http://localhost/test.html
# Error: 403 Forbidden

# 2. Check audit log
sudo ausearch -m avc -ts recent | audit2why
# Output: denied { read } ... tcontext=var_t ...

# 3. Check file context
ls -Z /srv/website/test.html
# Output: system_u:object_r:var_t:s0 test.html

# 4. Fix context
sudo semanage fcontext -a -t httpd_sys_content_t "/srv/website(/.*)?"
sudo restorecon -Rv /srv/website/

# 5. Test again
curl http://localhost/test.html
# Success!

# 6. Verify
ls -Z /srv/website/test.html
# Output: system_u:object_r:httpd_sys_content_t:s0 test.html
```

## Advanced: Reading Audit Logs

### Understanding the Format

```
type=AVC msg=audit(TIMESTAMP:SERIAL): avc: RESULT { PERMISSION }
  for pid=PID comm="COMMAND" name="FILE"
  scontext=SOURCE_CONTEXT
  tcontext=TARGET_CONTEXT
  tclass=CLASS
```

### Key Fields

- **RESULT**: denied or granted
- **PERMISSION**: read, write, execute, open, etc.
- **COMMAND**: Process name
- **scontext**: What tried to do it (source)
- **tcontext**: What it tried to access (target)
- **tclass**: Type of object (file, socket, capability)

## Best Practices

### 1. Enable Permissive Mode for Testing

```bash
# Temporarily - doesn't block, only logs
sudo setenforce 0
# Test application
# Review logs
# Fix issues
# Re-enable enforcing
sudo setenforce 1
```

### 2. Use Specific Time Ranges

```bash
# Yesterday
sudo ausearch -m avc -ts yesterday

# Specific time
sudo ausearch -m avc -ts 14:30 -te 14:45
```

### 3. Filter by Process

```bash
# Only nginx denials
sudo ausearch -m avc -c nginx -ts recent
```

### 4. Create Targeted Policies

```bash
# Generate policy only for specific denial
sudo grep 'denied.*httpd' /var/log/audit/audit.log | audit2allow -M httpd-custom
```

### 5. Review Before Installing Policies

```bash
# View policy before installing
audit2allow -M mypolicy < denials.log
cat mypolicy.te  # Review source
# Only install if you understand it
```

## Common Mistakes

### ❌ Disabling SELinux
Never disable SELinux in production!

### ❌ Blindly Running audit2allow
Understand what the policy allows before installing.

### ❌ Ignoring Boolean Solutions
Check for booleans before creating custom policies.

### ❌ Using chcon for Permanent Fixes
Use `semanage fcontext` + `restorecon` instead.

## Practice Exercise

Try these troubleshooting commands:

```bash
# View recent AVC denials
ausearch -m avc -ts recent

# Analyze them
ausearch -m avc -ts recent | audit2why

# Search for httpd denials
ausearch -m avc -c httpd -ts today
```

## Key Takeaways

✅ Never disable SELinux without investigating
✅ Use `ausearch` to find denials
✅ Use `audit2why` to understand them
✅ Fix with booleans, file contexts, or port labels
✅ Use `audit2allow` only as last resort
✅ Test after applying fixes
✅ Document all changes

**Congratulations!** You've completed Module 2 and mastered core SELinux skills. Click "Complete & Continue" to earn 300 points and unlock Module 3 on policy development!
