/**
 * Command database for terminal simulator
 * Maps commands to their simulated outputs
 */

export const commandDatabase = {
  // SELinux status commands
  getenforce: {
    output: 'Enforcing',
    description: 'Get the current SELinux mode',
  },

  'getenforce --help': {
    output: `usage: getenforce
Get the current mode of SELinux`,
  },

  // SELinux mode setting
  'setenforce 0': {
    output: '',
    requiresRoot: true,
    sideEffect: 'mode-permissive',
  },

  'setenforce 1': {
    output: '',
    requiresRoot: true,
    sideEffect: 'mode-enforcing',
  },

  // Context viewing
  'ls -Z': {
    output: `-rw-r--r--. root root unconfined_u:object_r:admin_home_t:s0 file1.txt
-rw-r--r--. root root unconfined_u:object_r:admin_home_t:s0 file2.txt
drwxr-xr-x. root root unconfined_u:object_r:admin_home_t:s0 documents`,
  },

  'ls -Z /var/www/html': {
    output: `-rw-r--r--. apache apache system_u:object_r:httpd_sys_content_t:s0 index.html
-rw-r--r--. apache apache system_u:object_r:httpd_sys_content_t:s0 about.html`,
  },

  'ps -Z': {
    output: `LABEL                             PID TTY      STAT   TIME COMMAND
system_u:system_r:init_t:s0         1 ?        Ss     0:01 /usr/lib/systemd/systemd
system_u:system_r:sshd_t:s0       987 ?        Ss     0:00 /usr/sbin/sshd -D
unconfined_u:unconfined_r:unconfined_t:s0 1234 pts/0 Ss 0:00 -bash`,
  },

  'id -Z': {
    output: 'unconfined_u:unconfined_r:unconfined_t:s0-s0:c0.c1023',
  },

  // Boolean management
  'getsebool -a': {
    output: `httpd_can_network_connect --> off
httpd_enable_homedirs --> off
httpd_use_nfs --> off
httpd_use_cifs --> off`,
  },

  'getsebool httpd_can_network_connect': {
    output: 'httpd_can_network_connect --> off',
  },

  'setsebool -P httpd_can_network_connect on': {
    output: '',
    requiresRoot: true,
  },

  // File context management
  'semanage fcontext -l': {
    output: `/var/www(/.*)?    all files    system_u:object_r:httpd_sys_content_t:s0
/etc/nginx(/.*)?   all files    system_u:object_r:httpd_config_t:s0`,
    requiresRoot: true,
  },

  'restorecon -Rv /var/www/html': {
    output: `Relabeled /var/www/html from unconfined_u:object_r:admin_home_t:s0 to system_u:object_r:httpd_sys_content_t:s0`,
    requiresRoot: true,
  },

  // Audit logs
  'ausearch -m avc -ts recent': {
    output: `----
time->Wed Jan 10 14:23:45 2024
type=AVC msg=audit(1704900225.123:456): avc:  denied  { name_connect } for  pid=1234 comm="nginx" dest=8080 scontext=system_u:system_r:httpd_t:s0 tcontext=system_u:object_r:http_port_t:s0 tclass=tcp_socket permissive=0`,
    requiresRoot: true,
  },

  'audit2why < /var/log/audit/audit.log': {
    output: `type=AVC msg=audit(1704900225.123:456): avc:  denied  { name_connect } for  pid=1234 comm="nginx" dest=8080 scontext=system_u:system_r:httpd_t:s0 tcontext=system_u:object_r:http_port_t:s0 tclass=tcp_socket permissive=0

    Was caused by:
    One of the following booleans was set incorrectly.
    Description:
    Allow httpd to act as a relay

    Allow access by executing:
    # setsebool -P httpd_can_network_relay 1`,
  },

  // Port management
  'semanage port -l | grep http': {
    output: `http_cache_port_t              tcp      8080, 8118, 8123, 10001-10010
http_port_t                    tcp      80, 81, 443, 488, 8008, 8009, 8443, 9000`,
    requiresRoot: true,
  },

  'semanage port -a -t http_port_t -p tcp 8080': {
    output: '',
    requiresRoot: true,
  },

  // Module management
  'semodule -l': {
    output: `abrt
accountsd
httpd
nginx
postgresql
ssh
systemd
unconfined`,
  },

  'semodule -lfull': {
    output: `100 abrt           pp enabled
100 accountsd      pp enabled
100 httpd          pp enabled
100 nginx          pp enabled
100 postgresql     pp enabled
100 ssh            pp enabled
400 custom-policy  pp enabled`,
  },

  'semodule --list-modules=full': {
    output: `100 abrt           pp enabled
100 accountsd      pp enabled
100 httpd          pp enabled
100 nginx          pp enabled
100 postgresql     pp enabled
100 ssh            pp enabled
400 custom-policy  pp enabled`,
  },

  // Policy inspection tools (setools-console package required)
  'seinfo -t': {
    output: `httpd_t
httpd_sys_content_t
httpd_sys_rw_content_t
httpd_config_t
httpd_log_t
httpd_exec_t
nginx_t
postgresql_t
mysqld_t
sshd_t
user_t
unconfined_t
init_t
kernel_t
... (400+ types total)`,
  },

  'sesearch -s httpd_t -A': {
    output: `allow httpd_t httpd_sys_content_t:file { getattr open read };
allow httpd_t httpd_log_t:file { append create write };
allow httpd_t http_port_t:tcp_socket { bind name_bind };
allow httpd_t httpd_config_t:file { getattr open read };
... (100+ rules total)`,
  },

  'sesearch -s httpd_t -t httpd_sys_content_t -c file -p read -A': {
    output: `allow httpd_t httpd_sys_content_t:file { getattr open read };`,
  },

  // Help commands
  help: {
    output: `Available commands:
  getenforce          - Show current SELinux mode
  setenforce [0|1]    - Set SELinux mode (0=Permissive, 1=Enforcing)
  ls -Z               - List files with security contexts
  ps -Z               - List processes with security contexts
  id -Z               - Show your security context
  getsebool           - View SELinux boolean values
  setsebool           - Set SELinux boolean values
  semanage            - SELinux policy management tool
  restorecon          - Restore file security contexts
  ausearch            - Search audit logs
  audit2why           - Translate audit messages
  semodule            - Manage SELinux policy modules
  seinfo              - Query SELinux policy information (requires setools-console)
  sesearch            - Search SELinux policy rules (requires setools-console)
  clear               - Clear the terminal`,
  },

  clear: {
    output: 'CLEAR',
  },
};

/**
 * Execute a command in the simulator
 * @param {string} command - Command to execute
 * @param {Object} context - Execution context (permissions, state, etc.)
 * @returns {Object} Command result
 */
export function executeCommand(command, context = {}) {
  const trimmedCommand = command.trim();

  // Handle empty command
  if (!trimmedCommand) {
    return { output: '', error: false };
  }

  // Check if command exists in database
  const commandDef = commandDatabase[trimmedCommand];

  if (!commandDef) {
    // Check for partial matches or common variations
    const baseCommand = trimmedCommand.split(' ')[0];

    if (baseCommand === 'sudo' && context.isRoot !== true) {
      // Simulate sudo
      const sudoCommand = trimmedCommand.substring(5).trim();
      return executeCommand(sudoCommand, { ...context, isRoot: true });
    }

    return {
      output: `bash: ${baseCommand}: command not found\n\nTry 'help' to see available commands.`,
      error: true,
    };
  }

  // Check root permission
  if (commandDef.requiresRoot && !context.isRoot) {
    return {
      output: `Permission denied. Try running with 'sudo'.`,
      error: true,
    };
  }

  // Return command output
  return {
    output: commandDef.output,
    error: false,
    sideEffect: commandDef.sideEffect,
  };
}
