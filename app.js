<![CDATA[
// ============================================
// AUTOMATED BANKING - CORE APPLICATION SCRIPTS
// ============================================

// Global Configuration
const CONFIG = {
  currency: 'NGN',
  currencySymbol: '₦',
  locale: 'en-NG',
  paymentPartners: {
    monnify: { name: 'Monnify', bank: 'WEMA BANK' },
    flutterwave: { name: 'Flutterwave', bank: 'WEMA BANK' },
    palmpay: { name: 'Palmpay', bank: 'WEMA BANK' },
    opay: { name: 'OPay', bank: 'OPAY MFB' },
    monipoint: { name: 'Monipoint', bank: 'WEMA BANK' }
  },
  banks: [
    { code: '044', name: 'Access Bank' },
    { code: '058', name: 'GTBank' },
    { code: '033', name: 'UBA' },
    { code: '057', name: 'Zenith Bank' },
    { code: '011', name: 'First Bank' },
    { code: '035', name: 'Wema Bank' },
    { code: '090', name: 'Kuda Bank' },
    { code: '999', name: 'OPay' }
  ]
};

// Utility Functions
const Utils = {
  formatCurrency(amount, includeSymbol = true) {
    const formatted = new Intl.NumberFormat(CONFIG.locale, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
    return includeSymbol ? `${CONFIG.currencySymbol}${formatted}` : formatted;
  },

  formatDate(date, format = 'full') {
    const d = new Date(date);
    const options = {
      full: { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' },
      short: { year: 'numeric', month: 'short', day: 'numeric' },
      time: { hour: '2-digit', minute: '2-digit' }
    };
    return d.toLocaleDateString(CONFIG.locale, options[format]);
  },

  generateId(prefix = 'TXN') {
    return `${prefix}-${Date.now().toString(36).toUpperCase()}${Math.random().toString(36).substr(2, 4).toUpperCase()}`;
  },

  generateAccountNumber() {
    return Math.floor(1000000000 + Math.random() * 9000000000).toString();
  },

  validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  },

  validatePhone(phone) {
    return /^0[7-9][0-1][0-9]{8}$/.test(phone);
  },

  validateBVN(bvn) {
    return /^[0-9]{11}$/.test(bvn);
  },

  showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 1rem 1.5rem;
      background: var(--bg-card);
      border: 1px solid var(--border-color);
      border-radius: 8px;
      z-index: 10000;
      animation: slideInRight 0.3s ease;
    `;
    toast.innerHTML = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
  }
};

// Double-Entry Ledger System
const Ledger = {
  async createEntry(type, amount, userId, description, reference) {
    const entry = {
      id: Utils.generateId('LED'),
      type, // 'credit' or 'debit'
      amount,
      userId,
      description,
      reference,
      timestamp: new Date().toISOString(),
      balance: 0 // Will be calculated
    };

    // Get current balance
    const user = Storage.getUser(userId);
    if (!user) throw new Error('User not found');

    if (type === 'credit') {
      entry.balance = user.balance + amount;
    } else {
      if (user.balance < amount) throw new Error('Insufficient balance');
      entry.balance = user.balance - amount;
    }

    // Store entry
    const entries = Storage.get('ledgerEntries') || [];
    entries.push(entry);
    Storage.set('ledgerEntries', entries);

    // Update user balance
    user.balance = entry.balance;
    Storage.updateUser(userId, user);

    return entry;
  },

  getEntries(userId) {
    const entries = Storage.get('ledgerEntries') || [];
    return userId ? entries.filter(e => e.userId === userId) : entries;
  },

  getBalance(userId) {
    const user = Storage.getUser(userId);
    return user ? user.balance : 0;
  }
};

// Transaction Manager
const TransactionManager = {
  create(data) {
    const transaction = {
      id: Utils.generateId('TXN'),
      ...data,
      timestamp: new Date().toISOString(),
      status: data.status || 'completed'
    };

    const transactions = Storage.get('transactions') || [];
    transactions.unshift(transaction);
    Storage.set('transactions', transactions);

    return transaction;
  },

  getAll(limit = 50) {
    const transactions = Storage.get('transactions') || [];
    return transactions.slice(0, limit);
  },

  getByUser(userId) {
    const transactions = Storage.get('transactions') || [];
    return transactions.filter(t => t.userId === userId);
  },

  updateStatus(transactionId, status) {
    const transactions = Storage.get('transactions') || [];
    const index = transactions.findIndex(t => t.id === transactionId);
    if (index !== -1) {
      transactions[index].status = status;
      Storage.set('transactions', transactions);
    }
  }
};

// Risk Scoring Engine
const RiskEngine = {
  calculateRiskScore(user, transaction = null) {
    let score = 0;
    
    // Base score factors
    if (user.kycStatus !== 'verified') score += 20;
    if (user.accountAge < 30) score += 10; // New account
    
    // Transaction-based factors
    if (transaction) {
      // Large transaction
      if (transaction.amount > 500000) score += 25;
      else if (transaction.amount > 100000) score += 10;
      
      // Rapid transactions
      const recentTxns = TransactionManager.getByUser(user.accountId)
        .filter(t => Date.now() - new Date(t.timestamp).getTime() < 3600000);
      if (recentTxns.length > 5) score += 30;
    }
    
    return Math.min(score, 100);
  },

  getRiskLevel(score) {
    if (score <= 30) return { level: 'low', color: 'success', label: 'Low Risk' };
    if (score <= 60) return { level: 'medium', color: 'warning', label: 'Medium Risk' };
    return { level: 'high', color: 'danger', label: 'High Risk' };
  }
};

// Notification System
const Notification = {
  send(userId, type, data) {
    const notification = {
      id: Utils.generateId('NOTIF'),
      userId,
      type, // 'credit', 'debit', 'alert', 'kyc'
      title: data.title,
      message: data.message,
      timestamp: new Date().toISOString(),
      read: false
    };

    const notifications = Storage.get('notifications') || [];
    notifications.unshift(notification);
    Storage.set('notifications', notifications);

    // Simulate SMS/Email
    console.log(`[SMS/Email] To: ${userId} | ${notification.title}: ${notification.message}`);

    return notification;
  },

  getUnread(userId) {
    const notifications = Storage.get('notifications') || [];
    return notifications.filter(n => n.userId === userId && !n.read);
  },

  markAsRead(notificationId) {
    const notifications = Storage.get('notifications') || [];
    const index = notifications.findIndex(n => n.id === notificationId);
    if (index !== -1) {
      notifications[index].read = true;
      Storage.set('notifications', notifications);
    }
  }
};

// Webhook Handler (Simulation)
const WebhookHandler = {
  processPayment(data) {
    // Simulate webhook from payment provider
    console.log('[Webhook] Processing payment:', data);
    
    // Find user by account number
    const users = Storage.get('automatedBankUsers') || [];
    const user = users.find(u => u.accountNumber === data.accountNumber);
    
    if (user) {
      // Credit user account
      const oldBalance = user.balance;
      user.balance += data.amount;
      Storage.updateUser(user.accountId, user);
      
      // Create transaction
      TransactionManager.create({
        type: 'credit',
        userId: user.accountId,
        amount: data.amount,
        title: 'Wallet Funding',
        description: `Deposit via ${data.provider || 'Bank Transfer'}`,
        reference: data.reference || Utils.generateId('PAY'),
        status: 'completed'
      });
      
      // Create ledger entry
      Ledger.createEntry('credit', data.amount, user.accountId, 'Wallet funding', data.reference);
      
      // Send notification
      Notification.send(user.accountId, 'credit', {
        title: 'Credit Alert',
        message: `Your account has been credited with ${Utils.formatCurrency(data.amount)}. New balance: ${Utils.formatCurrency(user.balance)}`
      });
      
      console.log(`[Webhook] Credited ${data.amount} to ${user.accountId}`);
      return { success: true, newBalance: user.balance };
    }
    
    return { success: false, error: 'Account not found' };
  },

  processPayout(data) {
    console.log('[Webhook] Processing payout:', data);
    // Simulate payout callback
    return { success: true };
  }
};

// Storage Manager
const Storage = {
  get(key) {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : null;
    } catch (e) {
      console.error('Storage get error:', e);
      return null;
    }
  },

  set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (e) {
      console.error('Storage set error:', e);
      return false;
    }
  },

  remove(key) {
    localStorage.removeItem(key);
  },

  getUser(userId) {
    const users = this.get('automatedBankUsers') || [];
    return users.find(u => u.accountId === userId);
  },

  updateUser(userId, userData) {
    const users = this.get('automatedBankUsers') || [];
    const index = users.findIndex(u => u.accountId === userId);
    if (index !== -1) {
      users[index] = { ...users[index], ...userData };
      this.set('automatedBankUsers', users);
      return true;
    }
    return false;
  }
};

// Audit Logger
const AuditLogger = {
  log(action, category, details, userId = null) {
    const entry = {
      id: Utils.generateId('AUDIT'),
      timestamp: new Date().toISOString(),
      action,
      category,
      details,
      userId,
      ip: this.getClientIP(),
      userAgent: navigator.userAgent
    };

    const logs = Storage.get('auditLogs') || [];
    logs.unshift(entry);
    
    // Keep only last 1000 logs
    if (logs.length > 1000) logs.pop();
    
    Storage.set('auditLogs', logs);
    return entry;
  },

  getLogs(filters = {}) {
    let logs = Storage.get('auditLogs') || [];
    
    if (filters.action) {
      logs = logs.filter(l => l.action === filters.action);
    }
    if (filters.userId) {
      logs = logs.filter(l => l.userId === filters.userId);
    }
    if (filters.startDate) {
      logs = logs.filter(l => new Date(l.timestamp) >= new Date(filters.startDate));
    }
    
    return logs;
  },

  getClientIP() {
    // In production, this would be obtained from the server
    return '197.210.xxx.xxx';
  }
};

// Fraud Detection System
const FraudDetection = {
  analyze(transaction, user) {
    const alerts = [];
    
    // Check for smurfing (rapid small transactions)
    const recentTxns = TransactionManager.getByUser(user.accountId)
      .filter(t => Date.now() - new Date(t.timestamp).getTime() < 1800000); // 30 mins
    
    if (recentTxns.length >= 5) {
      alerts.push({
        type: 'smurfing',
        severity: 'high',
        message: `Rapid succession of ${recentTxns.length} transactions detected`
      });
    }
    
    // Check for unusually large transaction
    const avgTransaction = user.avgTransactionAmount || 50000;
    if (transaction.amount > avgTransaction * 5) {
      alerts.push({
        type: 'large_transaction',
        severity: 'medium',
        message: `Transaction ${Utils.formatCurrency(transaction.amount)} exceeds normal pattern`
      });
    }
    
    // Check for new device/location
    // This would integrate with device fingerprinting in production
    
    return alerts;
  },

  flagTransaction(transactionId, reason) {
    const flags = Storage.get('flaggedTransactions') || [];
    flags.push({
      transactionId,
      reason,
      flaggedAt: new Date().toISOString(),
      status: 'pending_review'
    });
    Storage.set('flaggedTransactions', flags);
    
    AuditLogger.log('FLAG', 'fraud', `Transaction ${transactionId} flagged: ${reason}`);
  }
};

// Initialize application
document.addEventListener('DOMContentLoaded', function() {
  console.log('🚀 Automated Banking Platform initialized');
  
  // Add keyboard navigation
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
      // Close any open modals
      document.querySelectorAll('.modal-overlay.active').forEach(modal => {
        modal.classList.remove('active');
      });
    }
  });
  
  // Add smooth scrolling
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        target.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });
});

// Export for use in other modules
window.AutomatedBanking = {
  Utils,
  Ledger,
  TransactionManager,
  RiskEngine,
  Notification,
  WebhookHandler,
  Storage,
  AuditLogger,
  FraudDetection,
  CONFIG
};
]]>