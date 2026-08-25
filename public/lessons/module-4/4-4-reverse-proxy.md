---
id: 4-4-reverse-proxy
title: Reverse Proxy Policy
module: 4
lesson: 4
points: 400
estimatedTime: 30
prerequisites: ['4-3-custom-port']
---

# Reverse Proxy Configuration with SELinux

One of nginx's most powerful features is reverse proxying. This lesson teaches you how to configure SELinux to allow nginx to proxy requests to backend application servers.

## What is a Reverse Proxy?

nginx receives requests from clients and forwards them to backend servers:

```
Client → nginx (port 80) → Backend App (port 3000)
       ← nginx           ← Backend App
```

Common use cases:
- Node.js/Python/Ruby web applications
- Microservices architecture
- Load balancing
- SSL termination

## The Problem

By default, SELinux blocks nginx from making network connections!

### Scenario: nginx → Node.js App

You have:
- **nginx** on port 80 (frontend)
- **Node.js app** on port 3000 (backend)

### Attempt 1: Basic Reverse Proxy (Will Fail)

```bash
# Simulate backend app
# (In practice, you'd have a real app running)

# Create nginx reverse proxy config
sudo bash -c 'cat > /etc/nginx/conf.d/proxy.conf << EOF
upstream backend {
    server 127.0.0.1:3000;
}

server {
    listen 80;
    server_name app.example.com;

    location / {
        proxy_pass http://backend;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
    }
}
EOF'

# Test config
sudo nginx -t

# Reload
sudo systemctl reload nginx

# Try to access
curl http://localhost/
```

### Result: 502 Bad Gateway!

```bash
# Check nginx error log
sudo tail /var/log/nginx/error.log
```

Output:
```
connect() to 127.0.0.1:3000 failed (13: Permission denied)
while connecting to upstream
```

### The SELinux Denial

```bash
# Check audit log
sudo ausearch -m avc -ts recent | grep nginx | grep name_connect
```

Output:
```
type=AVC avc: denied { name_connect } for comm="nginx"
dest=3000
scontext=system_u:system_r:httpd_t:s0
tcontext=system_u:object_r:ntop_port_t:s0
tclass=tcp_socket
```

**Problem:** nginx (httpd_t) is blocked from connecting to network ports!

## Solution 1: Enable httpd_can_network_connect Boolean

The easiest solution for most cases:

### Enable the Boolean

```bash
# Check current state
getsebool httpd_can_network_connect
# Output: httpd_can_network_connect --> off

# Enable permanently
sudo setsebool -P httpd_can_network_connect on

# Verify
getsebool httpd_can_network_connect
# Output: httpd_can_network_connect --> on
```

### Test Again

```bash
# Reload nginx
sudo systemctl reload nginx

# Test (assuming backend is running)
curl http://localhost/
```

Success! nginx can now connect to backend services.

### What This Boolean Allows

```bash
# Query what it enables
sudo sesearch -b httpd_can_network_connect -A | head -10
```

Allows httpd_t (nginx) to:
- Connect to remote TCP sockets
- Make HTTP/HTTPS requests
- Proxy to backend servers
- Connect to APIs

## Solution 2: Specific Port Labeling (More Restrictive)

For better security, only allow specific backend ports.

### Scenario: Allow Only Port 3000

```bash
# Label port 3000 specifically for HTTP connections
sudo semanage port -a -t http_port_t -p tcp 3000

# Verify
sudo semanage port -l | grep 3000
```

Now nginx can connect to port 3000 without enabling the broad boolean.

### Disable Boolean (If Previously Enabled)

```bash
sudo setsebool -P httpd_can_network_connect off
```

nginx can still connect to port 3000 because it's labeled `http_port_t`.

## Solution 3: Database Connections

### Scenario: nginx → Database

If nginx connects to a database (less common):

```bash
# For database connections specifically
sudo setsebool -P httpd_can_network_connect_db on

# Verify
getsebool httpd_can_network_connect_db
```

This is more restrictive than `httpd_can_network_connect`.

## Real-World Example: Complete Reverse Proxy Setup

### Architecture

```
Internet → nginx:80 → Node.js:3000
                   → Python:5000
                   → Go API:8080
```

### Step 1: Configure Backend Ports

```bash
# Add all backend ports to http_port_t
sudo semanage port -a -t http_port_t -p tcp 3000
sudo semanage port -a -t http_port_t -p tcp 5000
sudo semanage port -m -t http_port_t -p tcp 8080

# Verify
sudo semanage port -l | grep http_port_t | grep -E "(3000|5000|8080)"
```

### Step 2: Enable Network Connect (Optional)

For external backends or additional flexibility:

```bash
sudo setsebool -P httpd_can_network_connect on
```

### Step 3: nginx Configuration

```nginx
# /etc/nginx/conf.d/reverse-proxy.conf

upstream nodejs {
    server 127.0.0.1:3000;
}

upstream python {
    server 127.0.0.1:5000;
}

upstream golang {
    server 127.0.0.1:8080;
}

server {
    listen 80;
    server_name api.example.com;

    location /nodejs/ {
        proxy_pass http://nodejs/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    location /python/ {
        proxy_pass http://python/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    location /api/ {
        proxy_pass http://golang/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### Step 4: Test Configuration

```bash
# Test nginx config
sudo nginx -t

# Reload
sudo systemctl reload nginx

# Test each backend (if running)
curl http://localhost/nodejs/
curl http://localhost/python/
curl http://localhost/api/
```

### Step 5: Verify No Denials

```bash
sudo ausearch -m avc -ts recent | grep nginx
# Should show no denials
```

## Load Balancing with SELinux

### Scenario: Multiple Backend Servers

```nginx
upstream backend_pool {
    server 10.0.1.10:3000;
    server 10.0.1.11:3000;
    server 10.0.1.12:3000;
}

server {
    listen 80;
    location / {
        proxy_pass http://backend_pool;
    }
}
```

### SELinux Configuration

```bash
# Enable network connections
sudo setsebool -P httpd_can_network_connect on

# If using specific ports, label them
sudo semanage port -a -t http_port_t -p tcp 3000
```

## WebSocket Proxy

### nginx Config

```nginx
server {
    listen 80;

    location /ws {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

### SELinux Config

Same as regular proxy:

```bash
sudo setsebool -P httpd_can_network_connect on
# OR
sudo semanage port -a -t http_port_t -p tcp 3000
```

## SSL/TLS Termination

### nginx Handles SSL, Proxies to HTTP Backend

```nginx
server {
    listen 443 ssl;
    ssl_certificate /etc/nginx/ssl/cert.pem;
    ssl_certificate_key /etc/nginx/ssl/key.pem;

    location / {
        proxy_pass http://127.0.0.1:3000;
    }
}
```

### SELinux Considerations

```bash
# Certificate files need correct context
sudo semanage fcontext -a -t httpd_config_t "/etc/nginx/ssl(/.*)?"
sudo restorecon -Rv /etc/nginx/ssl/

# Network connections
sudo setsebool -P httpd_can_network_connect on
```

## Troubleshooting Proxy Issues

### Problem: 502 Bad Gateway

```bash
# 1. Check SELinux denials
sudo ausearch -m avc -ts recent | grep nginx | grep name_connect

# 2. Check boolean state
getsebool httpd_can_network_connect

# 3. Check backend is running
sudo ss -tlnp | grep 3000

# 4. Check nginx error log
sudo tail -f /var/log/nginx/error.log

# 5. Enable boolean if needed
sudo setsebool -P httpd_can_network_connect on
```

### Problem: Specific Port Blocked

```bash
# Check port label
sudo semanage port -l | grep YOUR_PORT

# Add to http_port_t if needed
sudo semanage port -a -t http_port_t -p tcp YOUR_PORT
```

### Problem: External Hosts Unreachable

```bash
# Need full network connect permission
sudo setsebool -P httpd_can_network_connect on

# Check firewall
sudo firewall-cmd --list-all
```

## Security Considerations

### Principle of Least Privilege

**More Restrictive (Preferred):**
```bash
# Allow only specific ports
sudo semanage port -a -t http_port_t -p tcp 3000
# Boolean stays OFF
```

**Less Restrictive (Easier):**
```bash
# Allow all network connections
sudo setsebool -P httpd_can_network_connect on
```

Choose based on your security requirements!

### Monitor Connections

```bash
# Watch nginx connections
sudo ss -tnp | grep nginx

# Monitor for unexpected connections
sudo ausearch -m avc -ts recent | grep httpd_t
```

## Practice Exercise

Set up a simple reverse proxy:

```bash
# 1. Enable network connect
setsebool -P httpd_can_network_connect on

# 2. Create proxy config
cat > /etc/nginx/conf.d/test-proxy.conf << EOF
server {
    listen 80;
    location /api {
        proxy_pass http://127.0.0.1:3000;
    }
}
EOF

# 3. Test config
nginx -t

# 4. Reload nginx
systemctl reload nginx

# 5. Check for denials
ausearch -m avc -ts recent | grep nginx
```

## Key Takeaways

✅ By default, nginx cannot make network connections
✅ Enable `httpd_can_network_connect` for reverse proxy
✅ Or label specific backend ports with `http_port_t`
✅ Use `httpd_can_network_connect_db` for database connections
✅ Check denials with `ausearch | grep name_connect`
✅ Label backend ports for better security
✅ Use booleans for external/dynamic backends
✅ Monitor for unexpected network access

**Outstanding work!** You can now configure nginx as a reverse proxy with proper SELinux security. Click "Complete & Continue" to earn 400 points and create a consolidated policy module!
