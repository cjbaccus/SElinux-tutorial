---
id: 4-3-custom-port
title: Custom Port Configuration
module: 4
lesson: 3
points: 300
estimatedTime: 20
prerequisites: ['4-2-custom-root']
---

# Custom Port Configuration with SELinux

Running nginx on non-standard ports is common for development, multiple instances, or security through obscurity. This lesson shows you how to configure SELinux for custom ports.

## Scenario: nginx on Port 8080

You want nginx to listen on port 8080 instead of (or in addition to) port 80.

## The Problem

Simply changing the port in nginx config will fail with SELinux!

### Attempt 1: Just Change Config (Will Fail)

```bash
# Create config for port 8080
sudo bash -c 'cat > /etc/nginx/conf.d/port8080.conf << EOF
server {
    listen 8080;
    server_name _;
    root /srv/website;

    location / {
        index index.html;
    }
}
EOF'

# Test configuration
sudo nginx -t
# Syntax OK

# Try to reload
sudo systemctl reload nginx
```

### Result: nginx Fails to Start!

```bash
# Check status
sudo systemctl status nginx
```

Output:
```
nginx.service - The nginx HTTP and reverse proxy server
     Active: failed

nginx: [emerg] bind() to 0.0.0.0:8080 failed (13: Permission denied)
```

### The SELinux Denial

```bash
# Check audit log
sudo ausearch -m avc -ts recent | grep nginx | grep name_bind
```

Output:
```
type=AVC avc: denied { name_bind } for comm="nginx"
src=8080
scontext=system_u:system_r:httpd_t:s0
tcontext=system_u:object_r:http_cache_port_t:s0
tclass=tcp_socket
```

**Problem:** Port 8080 is labeled `http_cache_port_t`, which nginx (httpd_t) cannot bind to!

## Understanding Port Labels

### Check Current Port Label

```bash
sudo semanage port -l | grep 8080
```

Output:
```
http_cache_port_t          tcp      8080, 8118, 8123, 10001-10010
```

Port 8080 exists but with wrong type (`http_cache_port_t`).

### Check What nginx Needs

```bash
# nginx binds to http_port_t
sudo semanage port -l | grep ^http_port_t
```

Output:
```
http_port_t                tcp      80, 81, 443, 488, 8008, 8009, 8443, 9000
```

nginx needs port to be labeled `http_port_t`.

## Solution: Modify Port Label

### Method 1: Add to http_port_t (Recommended)

```bash
# Check if 8080 is already assigned
sudo semanage port -l | grep 8080

# If it shows http_cache_port_t, modify it
sudo semanage port -m -t http_port_t -p tcp 8080

# Verify
sudo semanage port -l | grep http_port_t
```

Now you'll see:
```
http_port_t                tcp      80, 81, 443, 488, 8008, 8009, 8080, 8443, 9000
```

### Method 2: Add New Port (If Not Labeled)

If port wasn't previously labeled:

```bash
sudo semanage port -a -t http_port_t -p tcp 8080
```

### Start nginx

```bash
# Now nginx can start
sudo systemctl reload nginx

# Verify it's listening
sudo ss -tlnp | grep 8080

# Test access
curl http://localhost:8080/
```

Success! 🎉

## Multiple Ports

### Scenario: nginx on Ports 8080, 8081, 8082

```bash
# Add all at once using range
sudo semanage port -a -t http_port_t -p tcp 8080-8082

# Or individually
sudo semanage port -a -t http_port_t -p tcp 8080
sudo semanage port -a -t http_port_t -p tcp 8081
sudo semanage port -a -t http_port_t -p tcp 8082

# Verify
sudo semanage port -l | grep http_port_t
```

### nginx Config

```nginx
# /etc/nginx/conf.d/multiport.conf
server {
    listen 8080;
    server_name site1.example.com;
    root /srv/site1;
}

server {
    listen 8081;
    server_name site2.example.com;
    root /srv/site2;
}

server {
    listen 8082;
    server_name site3.example.com;
    root /srv/site3;
}
```

## Real-World Example: Development Environment

### Setup: Multiple nginx Instances

```bash
# Instance 1: Production (port 80)
# Instance 2: Staging (port 8080)
# Instance 3: Development (port 8888)

# Add custom ports
sudo semanage port -m -t http_port_t -p tcp 8080
sudo semanage port -a -t http_port_t -p tcp 8888

# Verify
sudo semanage port -l | grep http_port_t | grep -E "(8080|8888)"
```

### Config Files

```bash
# /etc/nginx/conf.d/production.conf
server {
    listen 80;
    server_name prod.example.com;
    root /srv/production;
}

# /etc/nginx/conf.d/staging.conf
server {
    listen 8080;
    server_name staging.example.com;
    root /srv/staging;
}

# /etc/nginx/conf.d/dev.conf
server {
    listen 8888;
    server_name dev.example.com;
    root /srv/development;
}
```

## HTTPS on Custom Ports

### Scenario: SSL on Port 8443

```bash
# Check if 8443 is already in http_port_t
sudo semanage port -l | grep 8443
# It is! (default)

# If not, add it:
# sudo semanage port -a -t http_port_t -p tcp 8443
```

### nginx SSL Config

```nginx
server {
    listen 8443 ssl;
    server_name secure.example.com;

    ssl_certificate /etc/nginx/ssl/cert.pem;
    ssl_certificate_key /etc/nginx/ssl/key.pem;

    root /srv/secure;
}
```

No additional SELinux config needed - 8443 is already in `http_port_t`!

## Troubleshooting Port Issues

### Problem: nginx Still Won't Bind

```bash
# 1. Verify port is labeled correctly
sudo semanage port -l | grep YOUR_PORT

# 2. Check for SELinux denials
sudo ausearch -m avc -ts recent | grep name_bind

# 3. Check if another process is using the port
sudo ss -tlnp | grep YOUR_PORT

# 4. Restart nginx (reload may not be enough)
sudo systemctl restart nginx
```

### Problem: Port Already in Use by Another Service

```bash
# Check what's using the port
sudo lsof -i :8080

# If it's another service, either:
# a) Stop that service
# b) Use a different port
# c) Configure port sharing (advanced)
```

### Problem: Firewall Blocking

```bash
# SELinux allows it, but firewall blocks it
sudo firewall-cmd --add-port=8080/tcp --permanent
sudo firewall-cmd --reload

# Verify
sudo firewall-cmd --list-ports
```

## Removing Port Labels

### When Decommissioning

```bash
# Remove custom port
sudo semanage port -d -t http_port_t -p tcp 8888

# Verify removal
sudo semanage port -l | grep 8888
```

⚠️ **Warning:** Only delete ports you added, never default ports!

## Viewing Custom Ports Only

```bash
# List only local modifications
sudo semanage port -l -C
```

Shows only ports you've added/modified, not system defaults.

## Port Ranges for Dynamic Applications

### Scenario: Cluster with Dynamic Ports

```bash
# Application cluster uses ports 9000-9010
sudo semanage port -a -t http_port_t -p tcp 9000-9010

# Verify
sudo semanage port -l | grep http_port_t
# Shows: ... 9000, 9001, 9002, ... 9010 ...
```

Useful for:
- Kubernetes NodePorts
- Docker Swarm
- Load balancer pools

## Security Considerations

### High Ports vs Low Ports

**Low ports (< 1024):**
- Require root to bind
- Standard service ports
- More restrictive

**High ports (≥ 1024):**
- Non-privileged users can bind
- Commonly used for custom services
- Less restrictive

Both need SELinux port labeling!

### Avoid Obscure Ports

```bash
# Bad: Random high port
listen 54321;  # Hard to remember, document, and firewall

# Good: Standard or well-known alternatives
listen 8080;   # Common alternative HTTP port
listen 8443;   # Common alternative HTTPS port
```

## Documentation

### Document Port Changes

```bash
# Create port mapping document
cat > /root/nginx-port-mappings.txt << EOF
# nginx SELinux Port Configuration
# Date: $(date)

Production:   80   (default)
Staging:      8080 (added to http_port_t)
Development:  8888 (added to http_port_t)
SSL Prod:     443  (default)
SSL Staging:  8443 (default)
EOF

# List all custom ports
echo "" >> /root/nginx-port-mappings.txt
echo "Custom port labels:" >> /root/nginx-port-mappings.txt
sudo semanage port -l -C >> /root/nginx-port-mappings.txt
```

## Practice Exercise

Configure nginx on port 8080:

```bash
# 1. Check current port label
semanage port -l | grep 8080

# 2. Modify to http_port_t
semanage port -m -t http_port_t -p tcp 8080

# 3. Create nginx config
cat > /etc/nginx/conf.d/test8080.conf << EOF
server {
    listen 8080;
    root /srv/website;
}
EOF

# 4. Test config
nginx -t

# 5. Reload nginx
systemctl reload nginx

# 6. Test access
curl http://localhost:8080/
```

## Key Takeaways

✅ nginx needs ports labeled as `http_port_t`
✅ Use `semanage port -l` to view port labels
✅ Use `semanage port -m` to modify existing port labels
✅ Use `semanage port -a` to add new port labels
✅ Port ranges: `8080-8090` for multiple ports
✅ Check for denials with `ausearch -m avc | grep name_bind`
✅ Document custom port configurations
✅ Don't forget firewall rules!

**Excellent!** You can now run nginx on any port with proper SELinux configuration. Click "Complete & Continue" to earn 300 points and learn about reverse proxy configuration!
