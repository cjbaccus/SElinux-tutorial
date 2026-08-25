---
id: 4-5-policy-module
title: Custom Policy Module
module: 4
lesson: 5
points: 500
estimatedTime: 40
prerequisites: ['4-4-reverse-proxy']
---

# Creating a Consolidated nginx Custom Policy Module

Congratulations on reaching the final lesson! Now you'll consolidate everything you've learned into a professional, reusable SELinux policy module for nginx deployments.

## Why Create a Policy Module?

Instead of running multiple commands on each server:

❌ **Without Module:**
```bash
semanage fcontext -a -t httpd_sys_content_t "/srv/website(/.*)?"
restorecon -Rv /srv/website/
semanage port -a -t http_port_t -p tcp 8080
setsebool -P httpd_can_network_connect on
# ... repeat on every server ...
```

✅ **With Module:**
```bash
semodule -i nginx-custom.pp
# Done! All settings applied.
```

## What Our Module Will Include

Our `nginx-custom` module will:
1. ✅ Label custom document roots
2. ✅ Add custom port bindings
3. ✅ Enable network connections
4. ✅ Configure upload directories
5. ✅ Document all changes

## Module Structure

We'll create three files:

```
nginx-custom/
├── nginx-custom.te    # Policy rules
├── nginx-custom.fc    # File contexts
└── nginx-custom.if    # Interfaces (optional)
```

## Step 1: Create the Policy File (.te)

Create `nginx-custom.te`:

```bash
cat > nginx-custom.te << 'EOF'
policy_module(nginx-custom, 1.0.0)

########################################
# Declarations
########################################

# No new types needed - we use existing httpd types

########################################
# Booleans
########################################

# Enable network connections for reverse proxy
# This would normally be: setsebool -P httpd_can_network_connect on
# But we'll handle it via boolean in the module

########################################
# Policy Rules
########################################

# Allow nginx to connect to network services
# Equivalent to: httpd_can_network_connect boolean
corenet_tcp_connect_all_ports(httpd_t)

# Allow nginx to connect to databases
# Equivalent to: httpd_can_network_connect_db boolean
corenet_tcp_connect_postgresql_port(httpd_t)
corenet_tcp_connect_mysqld_port(httpd_t)

# Allow nginx to read/write to custom upload directory
allow httpd_t httpd_sys_rw_content_t:dir { create write add_name remove_name };
allow httpd_t httpd_sys_rw_content_t:file { create write unlink rename };

# Allow binding to custom ports (8080, 8443, 3000-3010)
# This is handled in the port contexts section

EOF
```

## Step 2: Create File Contexts (.fc)

Create `nginx-custom.fc`:

```bash
cat > nginx-custom.fc << 'EOF'
# nginx Custom File Contexts
# File: nginx-custom.fc
# Version: 1.0.0

########################################
# Custom Document Roots
########################################

# Main website directory
/srv/website(/.*)?              gen_context(system_u:object_r:httpd_sys_content_t,s0)

# Multi-site directories
/srv/site1(/.*)?                gen_context(system_u:object_r:httpd_sys_content_t,s0)
/srv/site2(/.*)?                gen_context(system_u:object_r:httpd_sys_content_t,s0)
/srv/site3(/.*)?                gen_context(system_u:object_r:httpd_sys_content_t,s0)

# Data directory (read-only)
/data/website(/.*)?             gen_context(system_u:object_r:httpd_sys_content_t,s0)

########################################
# Read-Write Directories
########################################

# Upload directory (read-write)
/srv/website/uploads(/.*)?      gen_context(system_u:object_r:httpd_sys_rw_content_t,s0)

# Cache directory
/srv/website/cache(/.*)?        gen_context(system_u:object_r:httpd_sys_rw_content_t,s0)

# Temp directory
/srv/website/tmp(/.*)?          gen_context(system_u:object_r:httpd_sys_rw_content_t,s0)

########################################
# Application-Specific Directories
########################################

# Node.js application
/opt/nodejs-app(/.*)?           gen_context(system_u:object_r:httpd_sys_content_t,s0)

# Python application
/opt/python-app(/.*)?           gen_context(system_u:object_r:httpd_sys_content_t,s0)

########################################
# SSL Certificates (if custom location)
########################################

/etc/nginx/ssl(/.*)?            gen_context(system_u:object_r:httpd_config_t,s0)

EOF
```

## Step 3: Create Installation Script

Create `install-nginx-custom.sh`:

```bash
cat > install-nginx-custom.sh << 'EOF'
#!/bin/bash
# nginx SELinux Custom Policy Installation Script
# Version: 1.0.0

set -e

echo "Installing nginx-custom SELinux policy module..."

# Check if running as root
if [ "$EUID" -ne 0 ]; then
    echo "Error: Must run as root"
    exit 1
fi

# Build the module
echo "Building policy module..."
checkmodule -M -m -o nginx-custom.mod nginx-custom.te
semodule_package -o nginx-custom.pp -m nginx-custom.mod -fc nginx-custom.fc

# Install the module
echo "Installing policy module..."
semodule -i nginx-custom.pp

# Add port labels
echo "Configuring port labels..."
semanage port -a -t http_port_t -p tcp 8080 2>/dev/null || \
    semanage port -m -t http_port_t -p tcp 8080
semanage port -a -t http_port_t -p tcp 8443 2>/dev/null || \
    semanage port -m -t http_port_t -p tcp 8443
semanage port -a -t http_port_t -p tcp 3000-3010 2>/dev/null || \
    echo "Ports 3000-3010 already configured"

# Enable boolean (alternative to policy rules)
echo "Configuring booleans..."
setsebool -P httpd_can_network_connect on
setsebool -P httpd_unified on

# Apply file contexts to existing directories (if they exist)
echo "Applying file contexts..."
for dir in /srv/website /srv/site{1,2,3} /data/website /opt/nodejs-app /opt/python-app; do
    if [ -d "$dir" ]; then
        echo "  Relabeling $dir..."
        restorecon -Rv "$dir" 2>/dev/null || true
    fi
done

# Verify installation
echo ""
echo "Verifying installation..."
semodule -l | grep nginx-custom && echo "✓ Module installed" || echo "✗ Module not found"

# Show summary
echo ""
echo "================================"
echo "Installation Complete!"
echo "================================"
echo ""
echo "Configured:"
echo "  - Custom document roots: /srv/website, /srv/site{1,2,3}"
echo "  - Port labels: 8080, 8443, 3000-3010"
echo "  - Network connections: enabled"
echo "  - Read-write directories: uploads, cache, tmp"
echo ""
echo "Next steps:"
echo "  1. Create your directory structure"
echo "  2. Deploy your nginx configuration"
echo "  3. Run: systemctl reload nginx"
echo ""

EOF

chmod +x install-nginx-custom.sh
```

## Step 4: Build and Install

### Build the Module

```bash
# Compile .te to .mod
checkmodule -M -m -o nginx-custom.mod nginx-custom.te

# Package with file contexts
semodule_package -o nginx-custom.pp -m nginx-custom.mod -fc nginx-custom.fc

# Verify the package was created
ls -lh nginx-custom.pp
```

### Install the Module

```bash
# Install
sudo semodule -i nginx-custom.pp

# Verify installation
sudo semodule -l | grep nginx-custom
```

Output:
```
nginx-custom    1.0.0
```

### Apply File Contexts

```bash
# Create directories (if they don't exist)
sudo mkdir -p /srv/website

# Apply contexts
sudo restorecon -Rv /srv/website
```

## Step 5: Test the Module

### Test 1: Custom Document Root

```bash
# Create test file
echo "<h1>Custom Module Test</h1>" | sudo tee /srv/website/index.html

# Check context (should be httpd_sys_content_t)
ls -Z /srv/website/index.html

# Configure nginx
sudo bash -c 'cat > /etc/nginx/conf.d/custom-test.conf << EOF
server {
    listen 80;
    root /srv/website;
}
EOF'

# Test
sudo nginx -t
sudo systemctl reload nginx
curl http://localhost/
```

### Test 2: Custom Port

```bash
# Configure port 8080
sudo bash -c 'cat > /etc/nginx/conf.d/port-test.conf << EOF
server {
    listen 8080;
    root /srv/website;
}
EOF'

# Test (port should already be labeled)
sudo systemctl reload nginx
curl http://localhost:8080/
```

### Test 3: Reverse Proxy

```bash
# Configure proxy (assuming backend on 3000)
sudo bash -c 'cat > /etc/nginx/conf.d/proxy-test.conf << EOF
server {
    listen 80;
    location /api {
        proxy_pass http://127.0.0.1:3000;
    }
}
EOF'

# Test
sudo systemctl reload nginx
```

## Module Management

### Update Module

When you make changes:

```bash
# 1. Edit .te or .fc files
vim nginx-custom.te

# 2. Increment version
# policy_module(nginx-custom, 1.1.0)

# 3. Rebuild
checkmodule -M -m -o nginx-custom.mod nginx-custom.te
semodule_package -o nginx-custom.pp -m nginx-custom.mod -fc nginx-custom.fc

# 4. Update (not install)
sudo semodule -u nginx-custom.pp

# 5. Reapply contexts
sudo restorecon -Rv /srv/website
```

### Remove Module

```bash
# Remove policy module
sudo semodule -r nginx-custom

# Port labels remain (remove manually if needed)
sudo semanage port -d -t http_port_t -p tcp 8080
```

### Disable Temporarily

```bash
# Disable without removing
sudo semodule -d nginx-custom

# Re-enable
sudo semodule -e nginx-custom
```

## Distribution

### Package for Deployment

```bash
# Create deployment package
tar czf nginx-custom-selinux-1.0.0.tar.gz \
    nginx-custom.te \
    nginx-custom.fc \
    nginx-custom.pp \
    install-nginx-custom.sh \
    README.md

# Copy to other servers
scp nginx-custom-selinux-1.0.0.tar.gz user@server2:/tmp/
```

### Installation on Other Servers

```bash
# On target server
cd /tmp
tar xzf nginx-custom-selinux-1.0.0.tar.gz
cd nginx-custom-selinux-1.0.0
sudo ./install-nginx-custom.sh
```

## Documentation

### Create README.md

```bash
cat > README.md << 'EOF'
# nginx Custom SELinux Policy Module

Version: 1.0.0

## Overview

This module configures SELinux for nginx with:
- Custom document roots
- Non-standard ports
- Reverse proxy capabilities
- Read-write upload directories

## Installation

```bash
sudo ./install-nginx-custom.sh
```

## What It Configures

### File Contexts
- `/srv/website` → httpd_sys_content_t
- `/srv/website/uploads` → httpd_sys_rw_content_t
- `/data/website` → httpd_sys_content_t
- `/opt/nodejs-app` → httpd_sys_content_t

### Ports
- 8080 → http_port_t
- 8443 → http_port_t
- 3000-3010 → http_port_t

### Booleans
- httpd_can_network_connect → on
- httpd_unified → on

## Usage

After installation:

1. Create directory structure:
   ```bash
   sudo mkdir -p /srv/website/{uploads,cache}
   ```

2. Deploy content:
   ```bash
   sudo cp -r /path/to/site/* /srv/website/
   ```

3. Configure nginx and reload:
   ```bash
   sudo systemctl reload nginx
   ```

## Troubleshooting

Check for denials:
```bash
sudo ausearch -m avc -ts recent | grep nginx
```

Verify module:
```bash
sudo semodule -l | grep nginx-custom
```

Reapply contexts:
```bash
sudo restorecon -Rv /srv/website
```

## Author

Created for SELinux Tutorial
Version 1.0.0
EOF
```

## Best Practices for Policy Modules

### 1. Version Your Modules

```
policy_module(nginx-custom, 1.0.0)  # Initial release
policy_module(nginx-custom, 1.1.0)  # Minor update
policy_module(nginx-custom, 2.0.0)  # Major change
```

### 2. Comment Your Policy

```
# Allow nginx to bind to development ports
# Required for staging environment on port 8080
corenet_tcp_bind_all_unreserved_ports(httpd_t)
```

### 3. Use Specific Rules

```
# Bad: Too permissive
allow httpd_t file_type:file read;

# Good: Specific types
allow httpd_t httpd_sys_content_t:file { read open getattr };
```

### 4. Test Before Deployment

```bash
# Test in permissive mode first
sudo setenforce 0
# ... test thoroughly ...
sudo setenforce 1
```

### 5. Document Everything

- README with installation instructions
- Changelog for version history
- Comments in .te and .fc files
- Example configurations

## Key Takeaways

✅ Policy modules package SELinux configuration for reuse
✅ .te file contains policy rules
✅ .fc file contains file context definitions
✅ Use checkmodule and semodule_package to build
✅ Install with semodule -i, update with semodule -u
✅ Create installation scripts for easy deployment
✅ Version your modules and document changes
✅ Test thoroughly before production deployment
✅ Package modules with documentation

**🎉 CONGRATULATIONS! 🎉**

You've completed the entire SELinux tutorial! You've mastered:
- SELinux fundamentals and modes
- Security contexts and type enforcement
- Boolean and file context management
- Troubleshooting techniques
- Policy module development
- Real-world nginx configuration

You now have the skills to secure any Linux system with SELinux!

**Click "Complete Lesson" to earn your final 500 points and unlock all achievements!**
