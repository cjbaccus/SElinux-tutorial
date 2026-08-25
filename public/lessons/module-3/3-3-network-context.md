---
id: 3-3-network-context
title: Port and Network Context
module: 3
lesson: 3
points: 200
estimatedTime: 20
prerequisites: ['3-2-custom-policies']
---

# Port and Network Context Management

SELinux doesn't just protect files—it also controls network access. This lesson covers how SELinux labels and controls network ports, ensuring services can only bind to authorized ports.

## SELinux Port Labeling

Just like files have contexts, network ports have context labels that determine which services can use them.

### Why Port Labeling Matters

Without SELinux port controls:
- Any compromised service could bind to any port
- Attackers could run malicious services on privileged ports
- Port conflicts could occur

With SELinux:
- Services can only use specifically labeled ports
- Unauthorized port binding is blocked
- Network attack surface is reduced

## Viewing Port Labels

### List All Port Labels

```bash
sudo semanage port -l
```

Output shows:
```
http_port_t                tcp      80, 81, 443, 488, 8008, 8009, 8443, 9000
ssh_port_t                 tcp      22
smtp_port_t                tcp      25, 465, 587
postgresql_port_t          tcp      5432, 5433
```

### Search for Specific Service

```bash
# HTTP/HTTPS ports
sudo semanage port -l | grep http

# SSH ports
sudo semanage port -l | grep ssh

# Database ports
sudo semanage port -l | grep -E "(postgresql|mysql)"
```

### Check Specific Port

```bash
# What type is port 8080?
sudo semanage port -l | grep 8080
```

## Common Port Types

### Web Services
```
http_port_t          80, 443, 8008, 8009, 8443
http_cache_port_t    3128, 8080, 8118, 8123
```

### Database Services
```
postgresql_port_t    5432, 5433
mysqld_port_t        1186, 3306, 63132-63164
mongodb_port_t       27017-27019, 28017-28019
```

### Mail Services
```
smtp_port_t          25, 465, 587
pop_port_t           106, 109, 110, 143, 220, 993, 995
```

### Remote Access
```
ssh_port_t           22
vnc_port_t           5900-5983, 5985-5999
```

## Adding Custom Ports

### Scenario: Run nginx on Port 8080

By default, nginx can only bind to ports in `http_port_t`.

```bash
# Try to start nginx on 8080 (if not labeled)
sudo nginx -c /etc/nginx/nginx-8080.conf

# Error: "Permission denied" or SELinux denial
```

### Check if Port is Labeled

```bash
sudo semanage port -l | grep 8080

# If you see http_cache_port_t, it won't work for httpd/nginx
# Need to add to http_port_t
```

### Add Port to Existing Type

```bash
# Add 8080 to http_port_t
sudo semanage port -a -t http_port_t -p tcp 8080

# Verify
sudo semanage port -l | grep http_port_t
```

**Flags:**
- `-a` = Add
- `-t` = Type
- `-p` = Protocol (tcp or udp)

### Now nginx Can Bind

```bash
sudo nginx -c /etc/nginx/nginx-8080.conf
# Success!
```

## Modifying Existing Port Labels

### Change Port Type

If a port is already labeled but with wrong type:

```bash
# Modify existing port
sudo semanage port -m -t http_port_t -p tcp 8080
```

**Flags:**
- `-m` = Modify

## Removing Port Labels

### Delete Custom Port

```bash
# Remove port label
sudo semanage port -d -t http_port_t -p tcp 8080
```

**Flags:**
- `-d` = Delete

⚠️ **Warning:** Only delete custom labels, not system defaults!

## Real-World Example: Custom Application Server

### Scenario

You're running a Node.js app on port 3000 and nginx reverse proxy on port 8080.

```bash
# 1. Check current labels
sudo semanage port -l | grep -E "(3000|8080)"

# 2. Add Node.js port (3000)
sudo semanage port -a -t http_port_t -p tcp 3000

# 3. Add nginx reverse proxy port (8080)
sudo semanage port -a -t http_port_t -p tcp 8080

# 4. Verify
sudo semanage port -l | grep http_port_t
# Should show: ... 3000, 8080 ...

# 5. Start services
sudo systemctl start myapp
sudo systemctl start nginx

# 6. Check for denials
sudo ausearch -m avc -ts recent
# No denials!
```

## Port Ranges

### Add Range of Ports

```bash
# Add ports 8080-8090
sudo semanage port -a -t http_port_t -p tcp 8080-8090

# Verify
sudo semanage port -l | grep http_port_t
```

Useful for:
- Clustered applications
- Dynamic port allocation
- Load balancer pools

## Multiple Protocols

### TCP and UDP

Some services use both protocols:

```bash
# Add TCP port
sudo semanage port -a -t dns_port_t -p tcp 5353

# Add UDP port
sudo semanage port -a -t dns_port_t -p udp 5353

# Verify both
sudo semanage port -l | grep dns_port_t
```

## Troubleshooting Port Issues

### Symptom: "Permission Denied" When Binding

```bash
# 1. Check SELinux audit logs
sudo ausearch -m avc -ts recent | grep name_bind

# 2. Look for denied port binding
# Example output:
# denied { name_bind } ... dest=8080 ...

# 3. Check port label
sudo semanage port -l | grep 8080

# 4. Add/modify label
sudo semanage port -a -t http_port_t -p tcp 8080

# 5. Retry
```

### Symptom: Service Won't Start After Adding Port

```bash
# 1. Verify port was added
sudo semanage port -l | grep YOUR_PORT

# 2. Check service type needs the port type
sudo sesearch -s httpd_t -t http_port_t -c tcp_socket -p name_bind -A

# 3. Check for other issues
sudo ausearch -m avc -ts recent
```

## Network Connect vs. Bind

### name_bind - Bind to Port (Server)

Service listens on a port:

```bash
# nginx binding to port 8080
allow httpd_t http_port_t:tcp_socket name_bind;
```

### name_connect - Connect to Port (Client)

Service connects to remote port:

```bash
# nginx connecting to backend on port 3000
allow httpd_t http_port_t:tcp_socket name_connect;
```

### Example: Reverse Proxy

nginx needs both:

```bash
# Bind to 8080 (accept connections)
sudo semanage port -a -t http_port_t -p tcp 8080

# Connect to 3000 (proxy to backend)
# Usually allowed by http_port_t rules already
# If not, enable boolean:
sudo setsebool -P httpd_can_network_connect on
```

## Best Practices

### 1. Use Standard Ports When Possible

Standard ports are already labeled:

```bash
# Prefer port 80 or 443 (already labeled)
# Over custom ports like 8765 (needs labeling)
```

### 2. Group Related Ports Together

```bash
# Add all app ports at once
sudo semanage port -a -t http_port_t -p tcp 8080-8090
```

### 3. Document Custom Port Labels

```bash
# Keep a record
echo "Added port 8080 for nginx reverse proxy" >> /root/selinux-changes.txt
```

### 4. Check Before Deleting

```bash
# Verify it's safe to delete
sudo semanage port -l | grep PORT_NUMBER
# Only delete if you added it
```

### 5. Use Correct Port Type

```bash
# Match service to port type
HTTP service → http_port_t
SSH service → ssh_port_t
Database → appropriate db port type
```

## Viewing Only Custom Ports

```bash
# Show only non-default port assignments
sudo semanage port -l -C
```

This shows ports you've added/modified.

## Advanced: Port Type for Custom Service

For custom applications, you might create a custom port type:

```bash
# In custom policy module
type myapp_port_t;
corenet_port(myapp_port_t)

# Then label ports
sudo semanage port -a -t myapp_port_t -p tcp 9000
```

This requires a custom policy module (covered in previous lesson).

## Common Port Scenarios

### Scenario 1: Development Server

```bash
# Django on 8000
sudo semanage port -a -t http_port_t -p tcp 8000

# Flask on 5000
sudo semanage port -a -t http_port_t -p tcp 5000
```

### Scenario 2: Database Cluster

```bash
# PostgreSQL replica on 5433
sudo semanage port -a -t postgresql_port_t -p tcp 5433

# MongoDB shards 27018-27020
sudo semanage port -a -t mongodb_port_t -p tcp 27018-27020
```

### Scenario 3: Multi-tier Application

```bash
# Frontend nginx on 8080
sudo semanage port -a -t http_port_t -p tcp 8080

# Backend API on 3000
sudo semanage port -a -t http_port_t -p tcp 3000

# WebSocket on 3001
sudo semanage port -a -t http_port_t -p tcp 3001
```

## Practice Exercise

Try these commands:

```bash
# View HTTP ports
semanage port -l | grep http_port_t

# View SSH ports
semanage port -l | grep ssh_port_t

# View all port types
semanage port -l | head -20
```

## Key Takeaways

✅ Network ports have SELinux type labels
✅ Services can only bind to authorized port types
✅ Use `semanage port -l` to view port labels
✅ Use `semanage port -a` to add custom ports
✅ Match service type to port type (http → http_port_t)
✅ Document custom port labels
✅ Check for name_bind denials when debugging
✅ Use port ranges for clustered services

**Fantastic!** You've completed Module 3 and mastered policy development. Click "Complete & Continue" to earn 200 points and begin the nginx capstone project in Module 4!
