---
id: 4-1-nginx-setup
title: Nginx Installation & Basic Setup
module: 4
lesson: 1
points: 200
estimatedTime: 20
prerequisites: ['3-3-network-context']
---

# Nginx Installation & Basic Setup with SELinux

Welcome to the capstone project! In this module, you'll configure nginx with custom SELinux policies for real-world scenarios. Let's start with installation and understanding the default SELinux configuration.

## Module 4 Overview

You'll build a complete nginx deployment with:
1. **Basic installation** with SELinux (this lesson)
2. **Custom document root** with proper contexts
3. **Non-standard ports** with port labeling
4. **Reverse proxy** with network permissions
5. **Consolidated policy module** for deployment

## Installing Nginx

### On RHEL/CentOS

```bash
# Install nginx
sudo dnf install nginx -y

# Or on older systems
sudo yum install nginx -y

# Start and enable
sudo systemctl start nginx
sudo systemctl enable nginx
```

### Verify Installation

```bash
# Check service status
sudo systemctl status nginx

# Test locally
curl http://localhost

# Should see: "Welcome to nginx!"
```

## Understanding Default nginx SELinux Policy

### nginx Process Type

```bash
# Check nginx process context
ps -efZ | grep nginx
```

Output:
```
system_u:system_r:httpd_t:s0 nginx: master process
system_u:system_r:httpd_t:s0 nginx: worker process
```

**Key observation:** nginx runs as `httpd_t` (same as Apache!)

### nginx File Contexts

```bash
# nginx binary
ls -Z /usr/sbin/nginx
# system_u:object_r:httpd_exec_t:s0

# Configuration directory
ls -Z /etc/nginx/
# system_u:object_r:httpd_config_t:s0

# Document root
ls -Z /usr/share/nginx/html/
# system_u:object_r:httpd_sys_content_t:s0

# Log files
ls -Z /var/log/nginx/
# system_u:object_r:httpd_log_t:s0
```

### Standard nginx Locations

| Path | SELinux Type | Purpose |
|------|--------------|---------|
| `/usr/sbin/nginx` | `httpd_exec_t` | Binary |
| `/etc/nginx/` | `httpd_config_t` | Configuration |
| `/usr/share/nginx/html/` | `httpd_sys_content_t` | Default web root |
| `/var/log/nginx/` | `httpd_log_t` | Logs |
| `/var/run/nginx.pid` | `httpd_var_run_t` | PID file |

## Testing Default Configuration

### Create Test Page

```bash
# Create custom index page
sudo bash -c 'cat > /usr/share/nginx/html/test.html << EOF
<!DOCTYPE html>
<html>
<head><title>SELinux Test</title></head>
<body>
<h1>nginx with SELinux - Working!</h1>
<p>If you see this, SELinux is configured correctly.</p>
</body>
</html>
EOF'

# Check its context
ls -Z /usr/share/nginx/html/test.html
# Should be: httpd_sys_content_t
```

### Access Test Page

```bash
curl http://localhost/test.html
# Success! SELinux allows this.
```

### Why It Works

1. nginx process runs as `httpd_t`
2. File has type `httpd_sys_content_t`
3. Policy allows: `httpd_t → httpd_sys_content_t:file read`

## Default nginx SELinux Permissions

### What nginx Can Do (by default)

```bash
# Query policy rules
sudo sesearch -s httpd_t -A | grep -E "(read|write)" | head -20
```

nginx (httpd_t) can:
- ✅ Read files with `httpd_sys_content_t`
- ✅ Write logs to `httpd_log_t`
- ✅ Read config from `httpd_config_t`
- ✅ Bind to ports with `http_port_t` (80, 443, etc.)

### What nginx Cannot Do (by default)

- ❌ Read user home directories
- ❌ Connect to network services (databases, APIs)
- ❌ Write to document root
- ❌ Access files in /tmp
- ❌ Bind to non-standard ports

You'll fix these limitations in upcoming lessons!

## nginx-Specific Booleans

### View nginx/httpd Booleans

```bash
getsebool -a | grep httpd
```

Key booleans:
```
httpd_can_network_connect --> off       # Connect to backends
httpd_can_network_connect_db --> off    # Connect to databases
httpd_enable_homedirs --> off           # Serve from ~/public_html
httpd_unified --> off                   # Read/write to content dirs
httpd_use_nfs --> off                   # Use NFS-mounted content
```

### Most Useful for nginx

```bash
# Allow proxy to backends (needed for reverse proxy)
httpd_can_network_connect

# Allow database connections
httpd_can_network_connect_db

# Allow read/write to content directories
httpd_unified
```

We'll use these in later lessons!

## Verifying SELinux Enforcement

### Check SELinux Mode

```bash
getenforce
# Should be: Enforcing
```

### Check nginx Denials

```bash
# Any recent denials?
sudo ausearch -m avc -ts recent -c nginx
```

If the default setup works, you should see **no denials**.

## Basic nginx Configuration

### View Main Config

```bash
cat /etc/nginx/nginx.conf
```

Key sections:
```nginx
user nginx;
worker_processes auto;
error_log /var/log/nginx/error.log;
pid /run/nginx.pid;

http {
    server {
        listen 80;
        server_name _;
        root /usr/share/nginx/html;

        location / {
            index index.html;
        }
    }
}
```

### Test Configuration Syntax

```bash
sudo nginx -t
```

Output:
```
nginx: the configuration file /etc/nginx/nginx.conf syntax is ok
nginx: configuration file /etc/nginx/nginx.conf test is successful
```

## Monitoring nginx with SELinux

### Watch for Denials in Real-time

```bash
# Terminal 1: Watch audit log
sudo tail -f /var/log/audit/audit.log | grep nginx

# Terminal 2: Generate traffic
curl http://localhost/test.html
```

With default setup, you should see **no AVC denials**.

## Common Issues & Solutions

### Issue 1: Cannot Start nginx

```bash
# Check SELinux denials
sudo ausearch -m avc -ts recent -c nginx | audit2why

# Common causes:
# - PID file wrong context
# - Port already in use
# - Config file wrong context
```

### Issue 2: 403 Forbidden

```bash
# Check file contexts
ls -Z /usr/share/nginx/html/

# If wrong:
sudo restorecon -Rv /usr/share/nginx/html/
```

### Issue 3: Logs Not Writing

```bash
# Check log directory context
ls -Z /var/log/nginx/

# If wrong:
sudo restorecon -Rv /var/log/nginx/
```

## Practice Exercise

Complete these tasks:

```bash
# 1. Check nginx process context
ps -efZ | grep nginx

# 2. View nginx file contexts
ls -Z /etc/nginx/nginx.conf

# 3. Check for any denials
ausearch -m avc -ts recent -c nginx

# 4. View nginx-related port labels
semanage port -l | grep http_port_t
```

## What's Next?

In the remaining lessons, you'll:
- **Lesson 4-2**: Move document root to `/srv/website`
- **Lesson 4-3**: Run nginx on port 8080
- **Lesson 4-4**: Configure reverse proxy to backend app
- **Lesson 4-5**: Create unified policy module

Each lesson builds on the previous one!

## Key Takeaways

✅ nginx uses the same SELinux policy as Apache (httpd_t)
✅ Default setup works with standard paths and port 80
✅ nginx can read httpd_sys_content_t files
✅ nginx logs to httpd_log_t directories
✅ nginx binds to http_port_t ports (80, 443)
✅ Custom configurations need SELinux adjustments
✅ Always check for denials with ausearch

**Excellent!** You've set up nginx with SELinux successfully. Click "Complete & Continue" to earn 200 points and learn about custom document roots!
