---
id: 4-2-custom-root
title: Custom Document Root
module: 4
lesson: 2
points: 300
estimatedTime: 25
prerequisites: ['4-1-nginx-setup']
---

# Configuring Custom Document Root with SELinux

Real-world deployments rarely use `/usr/share/nginx/html`. This lesson teaches you how to configure nginx with a custom document root while maintaining proper SELinux security.

## Scenario: Move to /srv/website

You want to serve content from `/srv/website` instead of the default location.

### Why This Matters

Custom document roots are common for:
- Separate application deployments
- NFS/shared storage mounts
- Organized multi-site hosting
- Development workflows

## The Problem

Simply changing nginx config won't work due to SELinux!

### Attempt 1: Just Change Config (Will Fail)

```bash
# Create directory
sudo mkdir -p /srv/website

# Add content
sudo bash -c 'cat > /srv/website/index.html << EOF
<h1>Custom Root</h1>
<p>This is from /srv/website</p>
EOF'

# Update nginx config
sudo bash -c 'cat > /etc/nginx/conf.d/custom.conf << EOF
server {
    listen 80;
    server_name _;
    root /srv/website;

    location / {
        index index.html;
    }
}
EOF'

# Test config
sudo nginx -t

# Reload nginx
sudo systemctl reload nginx

# Try to access
curl http://localhost/
```

### Result: 403 Forbidden!

```bash
# Check nginx error log
sudo tail /var/log/nginx/error.log
```

Output:
```
[crit] 1234#0: *1 open() "/srv/website/index.html" failed
(13: Permission denied), client: 127.0.0.1
```

### The SELinux Denial

```bash
# Check audit log
sudo ausearch -m avc -ts recent | grep nginx
```

You'll see:
```
type=AVC avc: denied { read } for comm="nginx"
path="/srv/website/index.html"
scontext=system_u:system_r:httpd_t:s0
tcontext=system_u:object_r:var_t:s0
tclass=file
```

**Problem:** nginx (httpd_t) cannot read var_t files!

## The Solution: Proper File Contexts

### Step 1: Check Current Context

```bash
ls -Z /srv/website/
```

Output:
```
system_u:object_r:var_t:s0 index.html
```

Wrong type! Should be `httpd_sys_content_t`.

### Step 2: Add SELinux File Context Rule

```bash
# Add permanent rule for /srv/website
sudo semanage fcontext -a -t httpd_sys_content_t "/srv/website(/.*)?"

# Verify rule was added
sudo semanage fcontext -l | grep /srv/website
```

Output:
```
/srv/website(/.*)?    all files    system_u:object_r:httpd_sys_content_t:s0
```

### Step 3: Apply the Context

```bash
# Apply to existing files
sudo restorecon -Rv /srv/website/
```

Output:
```
Relabeled /srv/website from unconfined_u:object_r:var_t:s0
         to system_u:object_r:httpd_sys_content_t:s0
Relabeled /srv/website/index.html from unconfined_u:object_r:var_t:s0
         to system_u:object_r:httpd_sys_content_t:s0
```

### Step 4: Verify Context

```bash
ls -Z /srv/website/
```

Output:
```
system_u:object_r:httpd_sys_content_t:s0 index.html
```

Perfect! ✅

### Step 5: Test Access

```bash
curl http://localhost/
```

Output:
```
<h1>Custom Root</h1>
<p>This is from /srv/website</p>
```

Success! 🎉

## Read-Only vs Read-Write Content

### Read-Only Content (Default)

For static files that nginx only reads:

```bash
# Use httpd_sys_content_t
sudo semanage fcontext -a -t httpd_sys_content_t "/srv/website(/.*)?"
sudo restorecon -Rv /srv/website/
```

nginx can:
- ✅ Read files
- ❌ Write files
- ❌ Create files
- ❌ Delete files

### Read-Write Content (For Uploads)

For directories where nginx needs to write (uploads, cache):

```bash
# Create upload directory
sudo mkdir -p /srv/website/uploads

# Use httpd_sys_rw_content_t
sudo semanage fcontext -a -t httpd_sys_rw_content_t "/srv/website/uploads(/.*)?"
sudo restorecon -Rv /srv/website/uploads/

# Set permissions
sudo chown nginx:nginx /srv/website/uploads/
sudo chmod 755 /srv/website/uploads/
```

nginx can:
- ✅ Read files
- ✅ Write files
- ✅ Create files
- ✅ Delete files

## Real-World Example: Multi-Site Setup

### Scenario: Host Multiple Sites

```bash
# Create structure
sudo mkdir -p /srv/{site1,site2,site3}

# Add content to each
for site in site1 site2 site3; do
    sudo bash -c "cat > /srv/$site/index.html << EOF
<h1>Welcome to $site</h1>
EOF"
done

# Add SELinux contexts
sudo semanage fcontext -a -t httpd_sys_content_t "/srv/site1(/.*)?"
sudo semanage fcontext -a -t httpd_sys_content_t "/srv/site2(/.*)?"
sudo semanage fcontext -a -t httpd_sys_content_t "/srv/site3(/.*)?"

# Apply contexts
sudo restorecon -Rv /srv/site*/

# Verify
ls -Z /srv/site*/index.html
```

### nginx Config

```nginx
# /etc/nginx/conf.d/multisite.conf
server {
    listen 80;
    server_name site1.example.com;
    root /srv/site1;
}

server {
    listen 80;
    server_name site2.example.com;
    root /srv/site2;
}

server {
    listen 80;
    server_name site3.example.com;
    root /srv/site3;
}
```

## Using Symbolic Links

### Scenario: Content in Multiple Locations

```bash
# Actual content location
sudo mkdir -p /data/website
echo "<h1>From /data</h1>" | sudo tee /data/website/index.html

# Label it correctly
sudo semanage fcontext -a -t httpd_sys_content_t "/data/website(/.*)?"
sudo restorecon -Rv /data/website/

# Create symlink
sudo ln -s /data/website /srv/website-link

# Enable boolean to follow symlinks
sudo setsebool -P httpd_enable_homedirs on

# OR: Label the symlink
sudo semanage fcontext -a -t httpd_sys_content_t "/srv/website-link(/.*)?"
sudo restorecon -Rv /srv/website-link
```

## Script: Automated Setup

Create a helper script for new sites:

```bash
#!/bin/bash
# /usr/local/bin/add-nginx-site.sh

SITE_NAME=$1
SITE_ROOT="/srv/$SITE_NAME"

if [ -z "$SITE_NAME" ]; then
    echo "Usage: $0 <site-name>"
    exit 1
fi

# Create directory
mkdir -p "$SITE_ROOT"

# Add sample content
cat > "$SITE_ROOT/index.html" << EOF
<h1>Welcome to $SITE_NAME</h1>
EOF

# Set ownership
chown -R nginx:nginx "$SITE_ROOT"

# Add SELinux context
semanage fcontext -a -t httpd_sys_content_t "$SITE_ROOT(/.*)?"

# Apply context
restorecon -Rv "$SITE_ROOT"

# Verify
ls -Z "$SITE_ROOT"

echo "Site $SITE_NAME created at $SITE_ROOT"
echo "Add nginx server block in /etc/nginx/conf.d/$SITE_NAME.conf"
```

Usage:
```bash
sudo chmod +x /usr/local/bin/add-nginx-site.sh
sudo /usr/local/bin/add-nginx-site.sh mysite
```

## Troubleshooting Custom Roots

### Problem: Still Getting 403

```bash
# 1. Check file context
ls -Z /srv/website/

# 2. Check SELinux rules
sudo semanage fcontext -l | grep /srv/website

# 3. Check for denials
sudo ausearch -m avc -ts recent | audit2why

# 4. Re-apply contexts
sudo restorecon -Rv /srv/website/

# 5. Check file permissions (Linux DAC)
ls -l /srv/website/
# nginx user needs read access
```

### Problem: Context Changes Back After Reboot

You used `chcon` instead of `semanage`!

```bash
# Wrong (temporary):
sudo chcon -t httpd_sys_content_t /srv/website/

# Right (permanent):
sudo semanage fcontext -a -t httpd_sys_content_t "/srv/website(/.*)?"
sudo restorecon -Rv /srv/website/
```

### Problem: New Files Have Wrong Context

```bash
# After adding new files
sudo restorecon -Rv /srv/website/

# Or: Set directory context so new files inherit it
sudo semanage fcontext -a -t httpd_sys_content_t "/srv/website(/.*)?"
```

## Best Practices

### 1. Always Use semanage + restorecon

```bash
# Step 1: Define rule
sudo semanage fcontext -a -t httpd_sys_content_t "/path(/.*)?"

# Step 2: Apply rule
sudo restorecon -Rv /path
```

### 2. Use Regex Patterns Correctly

```bash
# Match directory and all contents
"/srv/website(/.*)?"

# Match only directory
"/srv/website"

# Match specific files
"/srv/website/.*\.html"
```

### 3. Separate Read-Only and Read-Write

```bash
# Static content
/srv/website/public/       → httpd_sys_content_t

# Upload directory
/srv/website/uploads/      → httpd_sys_rw_content_t
```

### 4. Document Custom Roots

```bash
# List all custom file context rules
sudo semanage fcontext -l -C > /root/selinux-file-contexts.txt
```

### 5. Test After Setup

```bash
# Test reading
curl http://localhost/

# Test writing (if applicable)
curl -X POST -F "file=@test.txt" http://localhost/upload
```

## Practice Exercise

Set up your own custom document root:

```bash
# 1. Create directory
mkdir -p /srv/mysite

# 2. Add content
echo "<h1>My Custom Site</h1>" > /srv/mysite/index.html

# 3. Check current context
ls -Z /srv/mysite/index.html

# 4. Add SELinux rule
semanage fcontext -a -t httpd_sys_content_t "/srv/mysite(/.*)?"

# 5. Apply context
restorecon -Rv /srv/mysite/

# 6. Verify
ls -Z /srv/mysite/index.html
```

## Key Takeaways

✅ Custom document roots need proper SELinux contexts
✅ Use `httpd_sys_content_t` for read-only content
✅ Use `httpd_sys_rw_content_t` for writable content
✅ Always use `semanage fcontext` + `restorecon` (not `chcon`)
✅ Regex pattern: "/path(/.*)?" for directory and contents
✅ Run `restorecon` after adding new files
✅ Test access after configuration
✅ Document custom context rules

**Great work!** You can now configure custom document roots securely. Click "Complete & Continue" to earn 300 points and learn about custom port configuration!
