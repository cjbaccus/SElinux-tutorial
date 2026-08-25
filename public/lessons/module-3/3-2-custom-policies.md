---
id: 3-2-custom-policies
title: Creating Custom Policies
module: 3
lesson: 2
points: 300
estimatedTime: 35
prerequisites: ['3-1-policy-modules']
---

# Creating Custom SELinux Policies

Sometimes booleans and file contexts aren't enough. This lesson teaches you how to create custom policy modules for unique application requirements.

## When to Create Custom Policies

Create custom policies when:
- ✅ No existing boolean solves your problem
- ✅ audit2why suggests creating a policy
- ✅ You need unique type enforcement for custom apps
- ✅ Vendor applications have specific SELinux needs

**Don't create custom policies for:**
- ❌ Standard applications (use booleans)
- ❌ File context issues (use semanage/restorecon)
- ❌ Port labeling (use semanage port)

## Custom Policy Workflow

```
1. Identify denials (ausearch)
   ↓
2. Generate policy (audit2allow)
   ↓
3. Review policy source
   ↓
4. Compile policy (.pp file)
   ↓
5. Install policy (semodule)
   ↓
6. Test and verify
```

## Method 1: audit2allow (Quick & Easy)

### Step-by-Step Process

```bash
# 1. Run your application in permissive mode
sudo setenforce 0

# 2. Exercise all features (generates denials)
# Use your application fully

# 3. Generate policy from recent denials
sudo ausearch -m avc -ts recent | audit2allow -M my-custom-app

# Output:
# ******************** IMPORTANT ***********************
# To make this policy package active, execute:
# semodule -i my-custom-app.pp

# 4. Review what was generated
cat my-custom-app.te

# 5. Install the module
sudo semodule -i my-custom-app.pp

# 6. Re-enable enforcing mode
sudo setenforce 1

# 7. Test your application
```

### What audit2allow Creates

Two files are generated:

**my-custom-app.te** (policy source):
```
module my-custom-app 1.0;

require {
    type httpd_t;
    type user_home_t;
    class file { read open };
}

#============= httpd_t ==============
allow httpd_t user_home_t:file { read open };
```

**my-custom-app.pp** (compiled module):
- Binary policy package
- Ready to install with `semodule`

### Understanding .te Policy Syntax

```
module MODULE_NAME VERSION;

require {
    type SOURCE_TYPE;
    type TARGET_TYPE;
    class OBJECT_CLASS;
}

allow SOURCE_TYPE TARGET_TYPE:CLASS { PERMISSIONS };
```

**Example:**
```
allow httpd_t httpd_sys_content_t:file { read open };
```

Means: "Allow httpd_t to read and open files of type httpd_sys_content_t"

## Method 2: Manual Policy Writing

For more control, write policies manually.

### Basic Policy Template

Create `my-app.te`:

```
policy_module(my-app, 1.0.0)

########################################
# Declarations
########################################

type my-app_t;
type my-app_exec_t;
type my-app_log_t;

init_daemon_domain(my-app_t, my-app_exec_t)

########################################
# Local policy
########################################

# Allow the app to write logs
allow my-app_t my-app_log_t:file { create write append };

# Allow network access
corenet_tcp_bind_generic_node(my-app_t)
corenet_tcp_bind_http_port(my-app_t)

# Allow reading config files
files_read_etc_files(my-app_t)
```

### Compile Manual Policy

```bash
# Compile .te to .pp
checkmodule -M -m -o my-app.mod my-app.te
semodule_package -o my-app.pp -m my-app.mod

# Install
sudo semodule -i my-app.pp
```

## Real-World Example: Custom Python Web App

### Scenario

You have a Python Flask app at `/opt/myapp/app.py` that:
- Listens on port 5000
- Writes to `/var/log/myapp/`
- Reads config from `/etc/myapp/`

### Step 1: Run in Permissive & Collect Denials

```bash
# Enable permissive
sudo setenforce 0

# Start app
/opt/myapp/app.py

# Use all features
curl http://localhost:5000/
# ... test all endpoints ...

# Check denials
sudo ausearch -m avc -ts recent | grep myapp
```

### Step 2: Generate Initial Policy

```bash
sudo ausearch -m avc -ts recent | audit2allow -M myapp-policy
```

### Step 3: Review Generated Policy

```bash
cat myapp-policy.te
```

Output might be:
```
module myapp-policy 1.0;

require {
    type init_t;
    type var_log_t;
    type tmp_t;
    class file { write create };
}

allow init_t var_log_t:file { write create };
allow init_t tmp_t:file write;
```

### Step 4: Refine the Policy

**Problem:** Too permissive! `init_t` shouldn't have these permissions.

**Solution:** Create specific types:

```
policy_module(myapp-policy, 1.0.0)

# Declare custom types
type myapp_t;
type myapp_exec_t;
type myapp_log_t;
type myapp_config_t;

init_daemon_domain(myapp_t, myapp_exec_t)

# Log file access
logging_log_file(myapp_log_t)
allow myapp_t myapp_log_t:file { create write append };

# Config file access
files_config_file(myapp_config_t)
allow myapp_t myapp_config_t:file { read open };

# Network access on port 5000
corenet_tcp_bind_generic_node(myapp_t)
allow myapp_t http_port_t:tcp_socket name_bind;

# Python interpreter access
corecmd_exec_bin(myapp_t)
libs_use_ld_so(myapp_t)
libs_use_shared_libs(myapp_t)
```

### Step 5: Add File Contexts

Create `myapp-policy.fc`:

```
/opt/myapp/app\.py          --  gen_context(system_u:object_r:myapp_exec_t,s0)
/etc/myapp(/.*)?                gen_context(system_u:object_r:myapp_config_t,s0)
/var/log/myapp(/.*)?            gen_context(system_u:object_r:myapp_log_t,s0)
```

### Step 6: Compile with File Contexts

```bash
# Build policy package with file contexts
make -f /usr/share/selinux/devel/Makefile myapp-policy.pp

# Or manually:
checkmodule -M -m -o myapp-policy.mod myapp-policy.te
semodule_package -o myapp-policy.pp -m myapp-policy.mod -fc myapp-policy.fc
```

### Step 7: Install & Apply

```bash
# Install policy
sudo semodule -i myapp-policy.pp

# Apply file contexts
sudo restorecon -Rv /opt/myapp /etc/myapp /var/log/myapp

# Enable enforcing
sudo setenforce 1

# Test
/opt/myapp/app.py
```

## Policy Interfaces

SELinux provides interfaces (macros) for common operations:

### File Operations
```
files_read_etc_files(my-app_t)      # Read /etc
files_read_usr_files(my-app_t)      # Read /usr
logging_log_file(my-log_t)           # Mark as log file
```

### Network Operations
```
corenet_tcp_bind_generic_node(my-app_t)    # Bind to any interface
corenet_tcp_bind_http_port(my-app_t)       # Bind to HTTP ports
corenet_tcp_connect_http_port(my-app_t)    # Connect to HTTP ports
```

### Process Operations
```
init_daemon_domain(my-app_t, my-app_exec_t)  # System daemon
domain_use_interactive_fds(my-app_t)          # Use terminals
```

## Managing Custom Modules

### List Custom Modules

```bash
# Show all modules
sudo semodule -l

# Show only custom (priority 400)
sudo semodule -l | grep -v "^100 "
```

### Update Module

```bash
# Modify .te file, then:
sudo semodule -u mymodule.pp
```

### Remove Module

```bash
sudo semodule -r mymodule
```

### Disable Temporarily

```bash
# Disable without removing
sudo semodule -d mymodule

# Re-enable
sudo semodule -e mymodule
```

## Best Practices

### 1. Start with audit2allow, Then Refine

```bash
# Generate initial policy
audit2allow -M initial < denials.log

# Review and refine manually
vim initial.te

# Recompile
checkmodule -M -m -o initial.mod initial.te
semodule_package -o initial.pp -m initial.mod
```

### 2. Create Specific Types

❌ **Bad:**
```
allow init_t var_t:file write;
```

✅ **Good:**
```
type myapp_t;
type myapp_log_t;
allow myapp_t myapp_log_t:file write;
```

### 3. Use Policy Interfaces

❌ **Bad:**
```
allow myapp_t etc_t:file read;
allow myapp_t etc_t:dir list;
allow myapp_t etc_t:lnk_file read;
```

✅ **Good:**
```
files_read_etc_files(myapp_t)
```

### 4. Version Your Policies

```
module myapp 1.0.0    # Initial
module myapp 1.1.0    # Bug fix
module myapp 2.0.0    # Major change
```

### 5. Document Your Policies

```
# Custom policy for MyApp web service
# Created: 2024-01-15
# Reason: Requires access to custom log directory
# Reference: Ticket #12345
```

### 6. Test in Permissive First

```bash
# Always test new policies
sudo setenforce 0
# ... test thoroughly ...
sudo setenforce 1
```

## Troubleshooting Custom Policies

### Policy Won't Compile

```bash
# Check syntax
checkmodule -M -m -o test.mod test.te

# Look for line numbers in error message
```

### Policy Doesn't Work

```bash
# Verify module loaded
sudo semodule -l | grep mymodule

# Check file contexts applied
ls -Z /path/to/files

# Look for new denials
sudo ausearch -m avc -ts recent
```

### Remove Problematic Policy

```bash
# Remove and reboot to be safe
sudo semodule -r mymodule
sudo reboot
```

## Key Takeaways

✅ Use audit2allow to generate initial policies
✅ Always review generated .te files before installing
✅ Create specific types for applications
✅ Use policy interfaces for common operations
✅ Include file contexts (.fc files)
✅ Test in permissive mode first
✅ Version and document your policies
✅ Use custom policies only when necessary

**Outstanding!** You can now create custom SELinux policies for unique applications. Click "Complete & Continue" to earn 300 points and learn about port and network context management!
