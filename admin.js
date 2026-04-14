<![CDATA[
// ============================================
// AUTOMATED BANKING - ADMIN DASHBOARD SCRIPTS
// ============================================

// Initialize Admin Dashboard
document.addEventListener('DOMContentLoaded', function() {
  // Check admin authentication
  const adminUser = JSON.parse(localStorage.getItem('adminUser'));
  if (!adminUser) {
    window.location.href = 'index.html';
    return;
  }
  
  // Set admin name
  document.getElementById('adminName').textContent = adminUser.name || 'Administrator';
  
  // Initialize dashboard
  initNavigation();
  loadUsers();
  startTerminalAnimation();
  startRealTimeUpdates();
});

// Navigation Handler
function initNavigation() {
  const navItems = document.querySelectorAll('.nav-item[data-page]');
  
  navItems.forEach(item => {
    item.addEventListener('click', function() {
      const page = this.getAttribute('data-page');
      
      // Update active states
      navItems.forEach(nav => nav.classList.remove('active'));
      this.classList.add('active');
      
      // Show corresponding page
      showPage(page);
    });
  });
}

function showPage(pageName) {
  // Hide all pages
  document.querySelectorAll('.page-section').forEach(section => {
    section.style.display = 'none';
  });
  
  // Show selected page
  const page = document.getElementById(`page-${pageName}`);
  if (page) {
    page.style.display = 'block';
  }
  
  // Update title
  const titles = {
    'dashboard': 'Dashboard Overview',
    'transactions': 'Transaction Management',
    'users': 'User Management',
    'monitoring': 'Monitoring Terminal',
    'fraud': 'Fraud Detection Hub',
    'alerts': 'Real-Time Alerts',
    'kyc': 'KYC/AML Compliance',
    'sanctions': 'Sanctions & PEP Screening',
    'reports': 'SAR Reports',
    'security': 'Security Center',
    'audit': 'Audit Logs',
    'settings': 'System Settings'
  };
  
  document.getElementById('pageTitle').textContent = titles[pageName] || 'Dashboard';
}

// Load Users
function loadUsers() {
  const users = JSON.parse(localStorage.getItem('automatedBankUsers') || '[]');
  
  // Add demo users if empty
  const demoUsers = [
    { accountId: 'AUT-001', firstName: 'John', lastName: 'Doe', email: 'john@example.com', phone: '08012345678', accountNumber: '0123456789', bankName: 'MONNIFY - WEMA', balance: 125000, status: 'active', kycStatus: 'verified', riskScore: 15 },
    { accountId: 'AUT-002', firstName: 'Jane', lastName: 'Smith', email: 'jane@example.com', phone: '08023456789', accountNumber: '0234567890', bankName: 'FLUTTERWAVE - WEMA', balance: 89000, status: 'active', kycStatus: 'verified', riskScore: 22 },
    { accountId: 'AUT-003', firstName: 'Michael', lastName: 'Johnson', email: 'michael@example.com', phone: '08034567890', accountNumber: '0345678901', bankName: 'PALMPAY - WEMA', balance: 45000, status: 'pending', kycStatus: 'pending', riskScore: 45 },
    { accountId: 'AUT-004', firstName: 'Sarah', lastName: 'Williams', email: 'sarah@example.com', phone: '08045678901', accountNumber: '0456789012', bankName: 'OPAY - OPAY MFB', balance: 230000, status: 'active', kycStatus: 'verified', riskScore: 8 },
    { accountId: 'AUT-005', firstName: 'David', lastName: 'Brown', email: 'david@example.com', phone: '08056789012', accountNumber: '0567890123', bankName: 'MONNIFY - WEMA', balance: 15000, status: 'frozen', kycStatus: 'rejected', riskScore: 78 },
    { accountId: 'AUT-006', firstName: 'Emily', lastName: 'Davis', email: 'emily@example.com', phone: '08067890123', accountNumber: '0678901234', bankName: 'FLUTTERWAVE - WEMA', balance: 178000, status: 'active', kycStatus: 'verified', riskScore: 12 },
    { accountId: 'AUT-007', firstName: 'Robert', lastName: 'Miller', email: 'robert@example.com', phone: '08078901234', accountNumber: '0789012345', bankName: 'MONIPONT - WEMA', balance: 67000, status: 'active', kycStatus: 'pending', riskScore: 33 },
    { accountId: 'AUT-008', firstName: 'Jennifer', lastName: 'Wilson', email: 'jennifer@example.com', phone: '08089012345', accountNumber: '0890123456', bankName: 'PALMPAY - WEMA', balance: 312000, status: 'active', kycStatus: 'verified', riskScore: 18 }
  ];
  
  const allUsers = users.length > 0 ? users : demoUsers;
  
  // Save demo users if needed
  if (users.length === 0) {
    localStorage.setItem('automatedBankUsers', JSON.stringify(demoUsers));
  }
  
  renderUsersTable(allUsers);
}

function renderUsersTable(users) {
  const tbody = document.getElementById('usersTable');
  if (!tbody) return;
  
  tbody.innerHTML = users.map(user => `
    <tr>
      <td><span style="font-family: var(--font-mono);">${user.accountId}</span></td>
      <td>${user.firstName} ${user.lastName}</td>
      <td>${user.email}</td>
      <td style="font-family: var(--font-mono);">₦${formatCurrency(user.balance)}</td>
      <td><span class="badge badge-${getStatusBadgeClass(user.status)}">${user.status}</span></td>
      <td><span class="badge badge-${getKycBadgeClass(user.kycStatus)}">${user.kycStatus}</span></td>
      <td>
        <div class="risk-meter">
          <span style="font-size: 0.75rem; color: ${getRiskColor(user.riskScore)};">${user.riskScore}/100</span>
        </div>
      </td>
      <td>
        <div class="flex gap-1">
          <button class="user-action-btn" style="background: rgba(33, 150, 243, 0.2); color: var(--info-color);" onclick="editUser('${user.accountId}')">Edit</button>
          <button class="user-action-btn" style="background: rgba(76, 175, 80, 0.2); color: var(--success-color);" onclick="viewUser('${user.accountId}')">View</button>
        </div>
      </td>
    </tr>
  `).join('');
}

function getStatusBadgeClass(status) {
  const classes = {
    'active': 'success',
    'pending': 'warning',
    'frozen': 'info',
    'deleted': 'danger'
  };
  return classes[status] || 'primary';
}

function getKycBadgeClass(status) {
  const classes = {
    'verified': 'success',
    'pending': 'warning',
    'rejected': 'danger'
  };
  return classes[status] || 'primary';
}

function getRiskColor(score) {
  if (score <= 30) return 'var(--success-color)';
  if (score <= 60) return 'var(--warning-color)';
  return 'var(--danger-color)';
}

function formatCurrency(amount) {
  return new Intl.NumberFormat('en-NG', { minimumFractionDigits: 2 }).format(amount);
}

// Modal Functions
function openModal(modalId) {
  document.getElementById(modalId).classList.add('active');
}

function closeModal(modalId) {
  document.getElementById(modalId).classList.remove('active');
}

function openUserModal() {
  showPage('users');
  document.querySelectorAll('.nav-item').forEach(item => {
    item.classList.remove('active');
    if (item.getAttribute('data-page') === 'users') {
      item.classList.add('active');
    }
  });
}

function openNewAccountModal() {
  openModal('newAccountModal');
}

function openKycReviewModal() {
  alert('KYC Review Queue: 156 pending verifications');
}

function openFreezeModal() {
  const userId = prompt('Enter User ID to freeze account:');
  if (userId) {
    alert(`Account ${userId} has been frozen.`);
  }
}

// User Management Functions
function editUser(userId) {
  const users = JSON.parse(localStorage.getItem('automatedBankUsers') || '[]');
  const user = users.find(u => u.accountId === userId);
  
  if (!user) {
    // Try demo users
    const demoUsers = [
      { accountId: 'AUT-001', firstName: 'John', lastName: 'Doe', email: 'john@example.com', phone: '08012345678', accountNumber: '0123456789', bankName: 'MONNIFY - WEMA', balance: 125000, status: 'active', kycStatus: 'verified', riskScore: 15 },
      { accountId: 'AUT-002', firstName: 'Jane', lastName: 'Smith', email: 'jane@example.com', phone: '08023456789', accountNumber: '0234567890', bankName: 'FLUTTERWAVE - WEMA', balance: 89000, status: 'active', kycStatus: 'verified', riskScore: 22 }
    ];
    const demoUser = demoUsers.find(u => u.accountId === userId);
    if (demoUser) {
      populateEditForm(demoUser);
      openModal('editUserModal');
    }
    return;
  }
  
  populateEditForm(user);
  openModal('editUserModal');
}

function populateEditForm(user) {
  document.getElementById('editUserId').value = user.accountId;
  document.getElementById('editFirstName').value = user.firstName;
  document.getElementById('editLastName').value = user.lastName;
  document.getElementById('editEmail').value = user.email;
  document.getElementById('editPhone').value = user.phone || '';
  document.getElementById('editBalance').value = user.balance;
  document.getElementById('editStatus').value = user.status;
}

function viewUser(userId) {
  alert(`Viewing details for user: ${userId}`);
}

function switchEditTab(tabName) {
  // Update tab buttons
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.classList.remove('active');
    if (btn.textContent.toLowerCase().includes(tabName)) {
      btn.classList.add('active');
    }
  });
  
  // Update tab content
  document.querySelectorAll('.tab-content').forEach(content => {
    content.classList.remove('active');
  });
  document.getElementById(`tab-${tabName}`).classList.add('active');
}

function creditUserAccount() {
  const amount = parseFloat(document.getElementById('creditAmount').value);
  const userId = document.getElementById('editUserId').value;
  
  if (!amount || amount <= 0) {
    alert('Please enter a valid amount');
    return;
  }
  
  // Update balance
  const currentBalance = parseFloat(document.getElementById('editBalance').value);
  document.getElementById('editBalance').value = currentBalance + amount;
  document.getElementById('creditAmount').value = '';
  
  // Add audit log
  addAuditLog('UPDATE', `Credited ₦${formatCurrency(amount)} to ${userId}`);
  
  alert(`Successfully credited ₦${formatCurrency(amount)} to ${userId}`);
}

function debitUserAccount() {
  const amount = parseFloat(document.getElementById('debitAmount').value);
  const userId = document.getElementById('editUserId').value;
  
  if (!amount || amount <= 0) {
    alert('Please enter a valid amount');
    return;
  }
  
  const currentBalance = parseFloat(document.getElementById('editBalance').value);
  if (amount > currentBalance) {
    alert('Insufficient balance');
    return;
  }
  
  document.getElementById('editBalance').value = currentBalance - amount;
  document.getElementById('debitAmount').value = '';
  
  addAuditLog('UPDATE', `Debited ₦${formatCurrency(amount)} from ${userId}`);
  
  alert(`Successfully debited ₦${formatCurrency(amount)} from ${userId}`);
}

function activateAccount() {
  document.getElementById('editStatus').value = 'active';
  alert('Account activated successfully');
}

function freezeAccount() {
  document.getElementById('editStatus').value = 'frozen';
  alert('Account frozen successfully');
}

function deleteAccount() {
  if (confirm('Are you sure you want to delete this account? This action cannot be undone.')) {
    document.getElementById('editStatus').value = 'deleted';
    alert('Account marked for deletion');
  }
}

function saveUserEdits() {
  const userId = document.getElementById('editUserId').value;
  
  // Get existing users
  let users = JSON.parse(localStorage.getItem('automatedBankUsers') || '[]');
  const userIndex = users.findIndex(u => u.accountId === userId);
  
  const updatedUser = {
    accountId: userId,
    firstName: document.getElementById('editFirstName').value,
    lastName: document.getElementById('editLastName').value,
    email: document.getElementById('editEmail').value,
    phone: document.getElementById('editPhone').value,
    balance: parseFloat(document.getElementById('editBalance').value),
    status: document.getElementById('editStatus').value
  };
  
  if (userIndex >= 0) {
    users[userIndex] = { ...users[userIndex], ...updatedUser };
  } else {
    users.push(updatedUser);
  }
  
  localStorage.setItem('automatedBankUsers', JSON.stringify(users));
  
  addAuditLog('UPDATE', `Updated user ${userId} profile`);
  
  closeModal('editUserModal');
  loadUsers();
  alert('User updated successfully!');
}

// New Account Creation
function createNewAccount() {
  const firstName = document.getElementById('newFirstName').value;
  const lastName = document.getElementById('newLastName').value;
  const email = document.getElementById('newEmail').value;
  const phone = document.getElementById('newPhone').value;
  const partner = document.getElementById('newPartner').value;
  const balance = parseFloat(document.getElementById('newBalance').value) || 0;
  
  if (!firstName || !lastName || !email || !phone) {
    alert('Please fill all required fields');
    return;
  }
  
  const partners = {
    monnify: 'MONNIFY - WEMA BANK',
    flutterwave: 'FLUTTERWAVE - WEMA BANK',
    palmpay: 'PALMPAY - WEMA BANK',
    opay: 'OPAY - OPAY MFB'
  };
  
  const newUser = {
    accountId: 'AUT-' + Math.random().toString(36).substr(2, 6).toUpperCase(),
    firstName,
    lastName,
    email,
    phone,
    accountNumber: Math.floor(1000000000 + Math.random() * 9000000000).toString(),
    bankName: partners[partner],
    balance,
    status: 'active',
    kycStatus: 'pending',
    riskScore: Math.floor(Math.random() * 30),
    createdAt: new Date().toISOString()
  };
  
  let users = JSON.parse(localStorage.getItem('automatedBankUsers') || '[]');
  users.push(newUser);
  localStorage.setItem('automatedBankUsers', JSON.stringify(users));
  
  addAuditLog('CREATE', `Created new account ${newUser.accountId} for ${firstName} ${lastName}`);
  
  closeModal('newAccountModal');
  loadUsers();
  alert(`Account created successfully!\nAccount ID: ${newUser.accountId}\nAccount Number: ${newUser.accountNumber}`);
}

// Terminal Animation
function startTerminalAnimation() {
  const terminalOutput = document.getElementById('terminalOutput');
  if (!terminalOutput) return;
  
  const commands = [
    { type: 'command', text: 'scan_anomalies()' },
    { type: 'output', text: '✓ Scanning 3,456 transactions...' },
    { type: 'success', text: '✓ No anomalies detected' },
    { type: 'command', text: 'check_suspicious_patterns()' },
    { type: 'output', text: '→ Pattern analysis in progress...' },
    { type: 'warning', text: '⚠ [ALERT] Rapid succession detected: User AUT-3321' },
    { type: 'output', text: '→ 5 transactions in 2 minutes' },
    { type: 'output', text: '→ Total: ₦450,000' },
    { type: 'command', text: 'calculate_risk_score("AUT-3321")' },
    { type: 'output', text: '→ Risk Score: 67/100' },
    { type: 'warning', text: '⚠ Flagged for manual review' },
    { type: 'command', text: 'monitor_geo_locations()' },
    { type: 'output', text: '→ Tracking 892 active sessions' },
    { type: 'success', text: '✓ All locations verified' }
  ];
  
  let index = 0;
  
  setInterval(() => {
    const cmd = commands[index % commands.length];
    const line = document.createElement('div');
    line.className = 'terminal-line';
    
    if (cmd.type === 'command') {
      line.innerHTML = `<span class="terminal-prompt">$</span> <span class="terminal-command">${cmd.text}</span>`;
    } else if (cmd.type === 'success') {
      line.innerHTML = `<span class="terminal-success">${cmd.text}</span>`;
    } else if (cmd.type === 'warning') {
      line.innerHTML = `<span class="terminal-warning">${cmd.text}</span>`;
    } else {
      line.innerHTML = `<span class="terminal-output">${cmd.text}</span>`;
    }
    
    terminalOutput.appendChild(line);
    terminalOutput.scrollTop = terminalOutput.scrollHeight;
    
    // Keep only last 50 lines
    while (terminalOutput.children.length > 50) {
      terminalOutput.removeChild(terminalOutput.firstChild);
    }
    
    index++;
  }, 3000);
}

// Terminal Command Execution
function executeTerminalCommand() {
  const input = document.getElementById('terminalInput');
  const command = input.value.trim().toLowerCase();
  const terminal = document.getElementById('advancedTerminal');
  
  if (!command) return;
  
  const line = document.createElement('div');
  line.className = 'terminal-line';
  line.innerHTML = `<span class="terminal-prompt">$</span> <span class="terminal-command">${command}</span>`;
  terminal.appendChild(line);
  
  // Process commands
  setTimeout(() => {
    const output = document.createElement('div');
    output.className = 'terminal-line';
    
    if (command.includes('help')) {
      output.innerHTML = `<span class="terminal-output">
Available commands:
- list_users : Show all users
- check_risk [user_id] : Get risk score
- freeze [user_id] : Freeze account
- scan_transactions : Run fraud scan
- system_status : Check system health
- clear : Clear terminal
      </span>`;
    } else if (command.includes('list_users')) {
      const users = JSON.parse(localStorage.getItem('automatedBankUsers') || '[]');
      output.innerHTML = `<span class="terminal-output">Found ${users.length || 8} users in database</span>`;
    } else if (command.includes('scan')) {
      output.innerHTML = `<span class="terminal-success">✓ Scan complete. 3 high-risk transactions flagged.</span>`;
    } else if (command.includes('system')) {
      output.innerHTML = `<span class="terminal-success">✓ All systems operational
API: 99.9% uptime
Database: Normal
Queue: 847 pending</span>`;
    } else if (command.includes('clear')) {
      terminal.innerHTML = '';
      return;
    } else {
      output.innerHTML = `<span class="terminal-error">Command not recognized. Type 'help' for available commands.</span>`;
    }
    
    terminal.appendChild(output);
    terminal.scrollTop = terminal.scrollHeight;
  }, 500);
  
  input.value = '';
}

// Real-time Updates
function startRealTimeUpdates() {
  // Simulate real-time alert updates
  setInterval(() => {
    const alertBadge = document.querySelector('.nav-item[data-page="alerts"] .nav-item-badge');
    if (alertBadge) {
      const current = parseInt(alertBadge.textContent);
      if (Math.random() > 0.7) {
        alertBadge.textContent = current + 1;
      }
    }
  }, 10000);
}

// Kill Switch
function activateKillSwitch() {
  if (confirm('⚠️ EMERGENCY KILL SWITCH\n\nThis will terminate all suspicious sessions immediately.\n\nProceed?')) {
    addAuditLog('DELETE', 'Emergency kill switch activated - All suspicious sessions terminated');
    alert('✓ Kill switch activated. 3 suspicious sessions terminated.');
  }
}

// Audit Log
function addAuditLog(action, description) {
  const adminUser = JSON.parse(localStorage.getItem('adminUser'));
  const log = {
    timestamp: new Date().toISOString().replace('T', ' ').substr(0, 19),
    action,
    user: adminUser?.email || 'system',
    description,
    ip: '197.210.xxx.xxx'
  };
  
  let logs = JSON.parse(localStorage.getItem('auditLogs') || '[]');
  logs.unshift(log);
  logs = logs.slice(0, 100); // Keep only last 100 logs
  localStorage.setItem('auditLogs', JSON.stringify(logs));
}

function exportAuditLogs() {
  const logs = JSON.parse(localStorage.getItem('auditLogs') || '[]');
  const csv = 'Timestamp,Action,User,Description,IP\n' + 
    logs.map(l => `${l.timestamp},${l.action},${l.user},${l.description},${l.ip}`).join('\n');
  
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `audit_logs_${new Date().toISOString().split('T')[0]}.csv`;
  a.click();
  
  alert('Audit logs exported successfully!');
}

// Admin Logout
function adminLogout() {
  localStorage.removeItem('adminUser');
  window.location.href = 'index.html';
}

// Sidebar Toggle for Mobile
document.getElementById('sidebarToggle')?.addEventListener('click', function() {
  document.getElementById('adminSidebar').classList.toggle('open');
});

// Close modals on overlay click
document.querySelectorAll('.modal-overlay').forEach(overlay => {
  overlay.addEventListener('click', function(e) {
    if (e.target === this) {
      this.classList.remove('active');
    }
  });
});

// Keyboard shortcuts
document.addEventListener('keydown', function(e) {
  // ESC to close modals
  if (e.key === 'Escape') {
    document.querySelectorAll('.modal-overlay.active').forEach(modal => {
      modal.classList.remove('active');
    });
  }
});
]]>