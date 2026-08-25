---
id: 3-1-policy-modules
title: Understanding Policy Modules
module: 3
lesson: 1
points: 250
estimatedTime: 25
prerequisites: ['2-3-troubleshooting']
---

# Understanding SELinux Policy Modules

SELinux policy is modular, composed of many independent policy modules that work together. Understanding policy modules is essential for advanced SELinux management and custom policy development.

## What Are Policy Modules?

Policy modules are compiled policy components that define:
- **Types** - Labels for processes and objects
- **Rules** - What interactions are allowed
- **Roles** - What users can do
- **Constraints** - Additional restrictions

Think of modules as building blocks that combine to create the complete SELinux policy.

## Policy Types

RHEL systems use **targeted policy**:

```bash
# Check your policy type
sestatus | grep "Loaded policy"
# Output: Loaded policy name: targeted
```

### Targeted Policy

- **Confined processes**: Network-facing services (httpd, sshd, nginx)
- **Unconfined processes**: User processes and most system processes
- **Goal**: Protect critical services while allowing flexibility

### Other Policy Types

- **MLS** (Multi-Level Security): For classified environments
- **Minimum**: Minimal protection for specific processes

## Viewing Policy Modules

### List All Modules

```bash
sudo semodule -l
```

Output:
```
abrt 1.6.3
accountsd 1.2.0
apache 1.14.0
bluetooth 1.5.2
...
nginx 1.16.0
postgresql 1.12.0
ssh 1.14.0
```

Shows module name and version.

### Count Total Modules

```bash
sudo semodule -l | wc -l
# Output: ~400 modules (varies by distribution)
```

### View Module Details

```bash
# Full module information
sudo semodule -l --full

# Specific module
sudo semodule -l | grep httpd
```

## Module States

Modules can be enabled or disabled. To check the state of modules:

```bash
# List all modules with full details (shows enabled/disabled state)
sudo semodule -lfull

# Or use semodule with extended listing
sudo semodule --list-modules=full

# Check if a specific module is enabled/disabled
sudo semodule -l | grep module_name
```

The output shows priority and enabled state:
```
100 nginx          enabled
400 custom-policy  enabled
```

### Enable/Disable Modules

```bash
# Disable a module (temporarily)
sudo semodule -d module_name

# Enable a module
sudo semodule -e module_name

# Remove a module completely
sudo semodule -r module_name
```

⚠️ **Warning:** Disabling modules can break services!

## Policy Module Structure

### Inside a Module

A policy module (.te file) contains:

```
# Type declarations
type httpd_t;
type httpd_sys_content_t;

# Access rules
allow httpd_t httpd_sys_content_t:file { read open };

# File context rules
/var/www(/.*)?    gen_context(system_u:object_r:httpd_sys_content_t,s0)
```

**Components:**
- **Type declarations**: Define new types
- **Allow rules**: Grant permissions
- **File contexts**: Default labels for files

## Inspecting Policy Rules

### Installing SELinux Policy Tools

The `seinfo` and `sesearch` tools are part of the SETools package, which is not installed by default:

```bash
# Install SELinux policy analysis tools
sudo dnf install setools-console -y

# Or on older RHEL/CentOS 7
sudo yum install setools-console -y

# Verify installation
which seinfo sesearch
```

### seinfo - Policy Information

```bash
# Count types
sudo seinfo -t | wc -l

# List all types
sudo seinfo -t

# Search for httpd types
sudo seinfo -t | grep httpd
```

### sesearch - Search Policy Rules

```bash
# Find what httpd_t can do
sudo sesearch -s httpd_t -A

# Find what can access httpd_sys_content_t
sudo sesearch -t httpd_sys_content_t -A

# Specific permission
sudo sesearch -s httpd_t -t httpd_sys_content_t -c file -p read -A
```

Flags:
- `-s` = Source type
- `-t` = Target type
- `-c` = Class (file, socket, etc.)
- `-p` = Permission (read, write, etc.)
- `-A` = Allow rules

### Example Queries

```bash
# What can httpd_t read?
sudo sesearch -s httpd_t -p read -A

# What processes can become root?
sudo sesearch -t root_t -p transition -A

# Network permissions for httpd
sudo sesearch -s httpd_t -c tcp_socket -A
```

## Common System Modules

### Web Servers
```bash
apache    # Apache HTTP Server
nginx     # Nginx web server
```

### Databases
```bash
postgresql  # PostgreSQL database
mysql       # MySQL/MariaDB
mongodb     # MongoDB
```

### Services
```bash
ssh         # SSH server
ftpd        # FTP server
samba       # Samba file sharing
nfs         # NFS file system
```

### System
```bash
systemd     # Init system
kernel      # Kernel policies
userdomain  # User policies
```

## Module Dependencies

Modules can depend on each other. While `semodule` doesn't directly show dependencies, you can inspect module details:

```bash
# View module with full details
sudo semodule -lfull | grep module_name

# Extract and examine module source (advanced)
sudo semodule -e module_name

# Check if module is loaded
sudo semodule -l | grep module_name
```

**Note:** Module dependencies are typically handled automatically during installation. If a module requires another module, the installation will fail with an error message indicating the missing dependency.

Example: Custom web app module might require:
- `apache` module
- `postgresql` module
- `logging` module

## Module Versioning

Modules have versions for tracking updates:

```bash
# View versions
sudo semodule -l

# Example output
nginx 1.16.0
postgresql 1.12.0
```

When you update RHEL, modules are updated automatically.

## Real-World Example: Nginx Module

### What the nginx Module Provides

```bash
# View nginx-related types
sudo seinfo -t | grep nginx

# Common types:
# nginx_t              - Nginx process type
# nginx_exec_t         - Nginx binary
# nginx_var_run_t      - PID files
# nginx_log_t          - Log files
# nginx_conf_t         - Config files
```

### nginx Module Rules

```bash
# What can nginx_t do?
sudo sesearch -s nginx_t -A | head -20

# Examples:
# allow nginx_t nginx_conf_t:file read;
# allow nginx_t http_port_t:tcp_socket name_bind;
# allow nginx_t nginx_log_t:file { write append };
```

### File Contexts from nginx Module

```bash
# View nginx file contexts
sudo semanage fcontext -l | grep nginx

# Examples:
# /etc/nginx(/.*)?           nginx_conf_t
# /usr/sbin/nginx            nginx_exec_t
# /var/log/nginx(/.*)?       nginx_log_t
```

## Module Interaction

Modules work together through interfaces:

### Example: Web App + Database

```
apache module provides:
  - httpd_t type
  - Port bindings
  - File access rules

postgresql module provides:
  - postgresql_t type
  - Database port labels
  - Socket access rules

Boolean connects them:
  httpd_can_network_connect_db
```

When you enable the boolean, it activates rules that allow `httpd_t` to communicate with `postgresql_t`.

## Practice: Exploring Modules

Try these commands:

```bash
# List all modules
sudo semodule -l

# Search for web-related modules
sudo semodule -l | grep -E "(http|nginx|apache)"

# View httpd types
sudo seinfo -t | grep httpd

# Find httpd rules
sudo sesearch -s httpd_t -A | head -20
```

## Module Management Commands

### Install Module
```bash
# Install a new policy module
sudo semodule --install mymodule.pp

# Short form (same as above)
sudo semodule -i mymodule.pp
```

### Update Module
```bash
# Update an existing module
sudo semodule --upgrade mymodule.pp

# Short form
sudo semodule -u mymodule.pp
```

### Remove Module
```bash
# Remove a policy module
sudo semodule --remove mymodule

# Short form
sudo semodule -r mymodule
```

### Reload All Modules
```bash
# Reload entire policy
sudo semodule --rebuild

# Short form
sudo semodule -R
```

### List Custom Modules
```bash
# Show only locally customized modules (priority 400)
sudo semodule -lfull | grep "^400"

# Or list all and filter
sudo semodule -l
```

## Understanding Base vs. Custom Modules

### Base Modules
- Provided by distribution
- Updated with system updates
- Located in `/usr/share/selinux/`

### Custom Modules
- Created by administrators
- Installed via `sudo semodule -i` or `sudo semodule --install`
- Stored in `/etc/selinux/targeted/modules/`

## Policy Priority

When rules conflict:
1. **Custom modules** override base modules
2. **Later loaded** modules override earlier ones
3. **More specific** rules win over generic ones

## Key Takeaways

✅ Policy is modular - composed of ~400 modules
✅ Use `semodule -l` to list modules
✅ Use `seinfo` to explore types
✅ Use `sesearch` to find rules
✅ Modules provide types, rules, and file contexts
✅ Booleans connect modules together
✅ Custom modules override base policy

**Excellent!** You now understand how SELinux policy modules work. Click "Complete & Continue" to earn 250 points and learn how to create custom policies!
