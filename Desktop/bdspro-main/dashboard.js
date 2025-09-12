// Dashboard JavaScript

// DOM Elements
const userName = document.getElementById('userName');
const userContact = document.getElementById('userContact');
const toast = document.getElementById('toast');

// Dashboard data (simulated - in real app, this would come from backend)
let dashboardData = {
    accountBalance: 0,
    totalEarnings: 0,
    level1Income: 0,
    level2Income: 0,
    rewards: 0,
    level1Business: 0,
    level2Business: 0,
    totalReferrals: 0,
    level1Referrals: 0,
    level2Referrals: 0,
    totalReferralEarnings: 0,
    pendingWithdrawals: 0,
    totalWithdrawn: 0
};

// User data
let userData = null;

// Initialize dashboard
document.addEventListener('DOMContentLoaded', function() {
    console.log('Dashboard initializing...');
    checkAuth();
    initializeDashboard();
    setupEventListeners();
    loadUserData();
    updateDashboardData();
    testAllButtons(); // Test all buttons to ensure they're working
});

// Test all buttons to ensure they're enabled and working
function testAllButtons() {
    console.log('Testing all buttons...');
    
    let totalButtons = 0;
    let enabledButtons = 0;
    
    // Test navigation buttons
    const navLinks = document.querySelectorAll('.nav-link[data-section]');
    navLinks.forEach((link, index) => {
        totalButtons++;
        const isEnabled = !link.disabled && link.style.pointerEvents !== 'none';
        enabledButtons += isEnabled ? 1 : 0;
        console.log(`Navigation button ${index + 1}:`, link.textContent.trim(), 'enabled:', isEnabled);
    });
    
    // Test tab buttons
    const tabBtns = document.querySelectorAll('.tab-btn');
    tabBtns.forEach((btn, index) => {
        totalButtons++;
        const isEnabled = !btn.disabled && btn.style.pointerEvents !== 'none';
        enabledButtons += isEnabled ? 1 : 0;
        console.log(`Tab button ${index + 1}:`, btn.textContent.trim(), 'enabled:', isEnabled);
    });
    
    // Test form submit buttons
    const submitBtns = document.querySelectorAll('button[type="submit"]');
    submitBtns.forEach((btn, index) => {
        totalButtons++;
        const isEnabled = !btn.disabled && btn.style.pointerEvents !== 'none';
        enabledButtons += isEnabled ? 1 : 0;
        console.log(`Submit button ${index + 1}:`, btn.textContent.trim(), 'enabled:', isEnabled);
    });
    
    // Test other action buttons
    const actionBtns = document.querySelectorAll('.btn:not([type="submit"])');
    actionBtns.forEach((btn, index) => {
        totalButtons++;
        const isEnabled = !btn.disabled && btn.style.pointerEvents !== 'none';
        enabledButtons += isEnabled ? 1 : 0;
        console.log(`Action button ${index + 1}:`, btn.textContent.trim(), 'enabled:', isEnabled);
    });
    
    console.log(`Button testing complete! ${enabledButtons}/${totalButtons} buttons are enabled.`);
    
    // Update status indicator
    updateStatusIndicator(enabledButtons, totalButtons);
    
    return { total: totalButtons, enabled: enabledButtons };
}

// Update the status indicator based on button test results
function updateStatusIndicator(enabledCount, totalCount) {
    const statusIndicator = document.querySelector('.status-indicator');
    const statusDot = document.querySelector('.status-dot');
    const statusText = document.querySelector('.status-text');
    
    if (statusIndicator && statusDot && statusText) {
        if (enabledCount === totalCount && totalCount > 0) {
            statusDot.className = 'status-dot enabled';
            statusText.textContent = `All ${totalCount} buttons enabled and functional`;
            statusText.style.color = '#4caf50';
        } else if (enabledCount > 0) {
            statusDot.className = 'status-dot warning';
            statusText.textContent = `${enabledCount}/${totalCount} buttons enabled`;
            statusText.style.color = '#ff9800';
        } else {
            statusDot.className = 'status-dot disabled';
            statusText.textContent = 'No buttons enabled';
            statusText.style.color = '#f44336';
        }
    }
}

// Check if user is authenticated
function checkAuth() {
    const storedUserData = localStorage.getItem('userData');
    if (!storedUserData) {
        // Redirect to login if not authenticated
        window.location.href = 'index.html';
        return;
    }
    
    try {
        userData = JSON.parse(storedUserData);
        updateUserInfo();
    } catch (error) {
        console.error('Error parsing user data:', error);
        localStorage.removeItem('userData');
        window.location.href = 'index.html';
    }
}

// Initialize dashboard
function initializeDashboard() {
    // Set up navigation
    setupNavigation();
    
    // Set up tabs
    setupTabs();
    
    // Load initial data
    loadDashboardData();
}

// Set up navigation
function setupNavigation() {
    const navLinks = document.querySelectorAll('.nav-link[data-section]');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Remove active class from all nav items
            document.querySelectorAll('.nav-item').forEach(item => {
                item.classList.remove('active');
            });
            
            // Add active class to clicked nav item
            this.parentElement.classList.add('active');
            
            // Show corresponding section
            const sectionId = this.getAttribute('data-section');
            showSection(sectionId);
        });
    });
}

// Show section
function showSection(sectionId) {
    // Hide all sections
    document.querySelectorAll('.content-section').forEach(section => {
        section.classList.remove('active');
    });
    
    // Show target section
    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
        targetSection.classList.add('active');
    }
}

// Set up tabs
function setupTabs() {
    const tabBtns = document.querySelectorAll('.tab-btn');
    
    tabBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const tabId = this.getAttribute('data-tab');
            
            // Remove active class from all tab buttons
            tabBtns.forEach(b => b.classList.remove('active'));
            
            // Add active class to clicked button
            this.classList.add('active');
            
            // Show corresponding tab content
            showTabContent(tabId);
        });
    });
}

// Show tab content
function showTabContent(tabId) {
    // Hide all tab contents
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    
    // Show target tab content
    const targetContent = document.getElementById(tabId);
    if (targetContent) {
        targetContent.classList.add('active');
    }
}

// Set up event listeners
function setupEventListeners() {
    // Deposit form
    const depositForm = document.getElementById('depositForm');
    if (depositForm) {
        depositForm.addEventListener('submit', handleDeposit);
    }
    
    // Withdraw form
    const withdrawForm = document.getElementById('withdrawForm');
    if (withdrawForm) {
        withdrawForm.addEventListener('submit', handleWithdraw);
    }
    
    // History filter
    const historyType = document.getElementById('historyType');
    if (historyType) {
        historyType.addEventListener('change', filterHistory);
    }
    
    // Ensure all buttons are enabled and have event listeners
    enableAllButtons();
}

// Function to enable all buttons and add event listeners
function enableAllButtons() {
    console.log('Enabling all buttons...');
    
    // Enable all buttons by removing disabled attribute
    const allButtons = document.querySelectorAll('button');
    allButtons.forEach(button => {
        if (button.hasAttribute('disabled')) {
            button.removeAttribute('disabled');
            console.log('Removed disabled attribute from:', button.textContent.trim());
        }
        
        // Add click event listener if it doesn't have one
        if (!button.hasAttribute('data-has-listener')) {
            button.setAttribute('data-has-listener', 'true');
            button.addEventListener('click', function(e) {
                console.log('Button clicked:', this.textContent.trim());
                
                // Handle specific button actions
                if (this.textContent.includes('Copy')) {
                    copyReferralLink();
                } else if (this.textContent.includes('Logout')) {
                    logout();
                }
            });
        }
    });
    
    // Enable all navigation links
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        if (link.hasAttribute('disabled')) {
            link.removeAttribute('disabled');
            console.log('Removed disabled attribute from nav link:', link.textContent.trim());
        }
    });
    
    // Enable all tab buttons
    const tabBtns = document.querySelectorAll('.tab-btn');
    tabBtns.forEach(btn => {
        if (btn.hasAttribute('disabled')) {
            btn.removeAttribute('disabled');
            console.log('Removed disabled attribute from tab button:', btn.textContent.trim());
        }
    });
    
    console.log('All buttons enabled successfully!');
}

// Update user info in navigation
function updateUserInfo() {
    if (userData) {
        userName.textContent = userData.name || 'User';
        userContact.textContent = userData.email || userData.phone || 'user@email.com';
    }
}

// Load user data
function loadUserData() {
    // In a real app, this would fetch from backend
    // For demo, we'll use localStorage and simulate some data
    const storedData = localStorage.getItem('dashboardData');
    if (storedData) {
        try {
            dashboardData = JSON.parse(storedData);
        } catch (error) {
            console.error('Error parsing dashboard data:', error);
        }
    }
}

// Update dashboard data display
function updateDashboardData() {
    // Update dashboard cards
    document.getElementById('accountBalance').textContent = `$${dashboardData.accountBalance.toFixed(2)} USDT`;
    document.getElementById('totalEarnings').textContent = `$${dashboardData.totalEarnings.toFixed(2)} USDT`;
    document.getElementById('level1Income').textContent = `$${dashboardData.level1Income.toFixed(2)} USDT`;
    document.getElementById('level2Income').textContent = `$${dashboardData.level2Income.toFixed(2)} USDT`;
    document.getElementById('rewards').textContent = `$${dashboardData.rewards.toFixed(2)} USDT`;
    document.getElementById('level1Business').textContent = `$${dashboardData.level1Business.toFixed(2)} USDT`;
    document.getElementById('level2Business').textContent = `$${dashboardData.level2Business.toFixed(2)} USDT`;
    
    // Update referral stats
    document.getElementById('totalReferrals').textContent = dashboardData.totalReferrals;
    document.getElementById('level1Referrals').textContent = dashboardData.level1Referrals;
    document.getElementById('level2Referrals').textContent = dashboardData.level2Referrals;
    document.getElementById('totalReferralEarnings').textContent = `$${dashboardData.totalReferralEarnings.toFixed(2)}`;
    
    // Update withdrawal stats
    document.getElementById('pendingWithdrawals').textContent = dashboardData.pendingWithdrawals;
    document.getElementById('totalWithdrawn').textContent = `$${dashboardData.totalWithdrawn.toFixed(2)}`;
    
    // Update available balance for withdrawal
    document.getElementById('availableBalance').textContent = `$${dashboardData.accountBalance.toFixed(2)} USDT`;
}

// Load dashboard data (simulate API call)
function loadDashboardData() {
    // Simulate loading data from backend
    showToast('Loading dashboard data...', 'info');
    
    setTimeout(() => {
        // In a real app, this would be an API call
        // For demo, we'll simulate some data
        dashboardData = {
            accountBalance: 1250.50,
            totalEarnings: 345.75,
            level1Income: 120.25,
            level2Income: 45.50,
            rewards: 180.00,
            level1Business: 2500.00,
            level2Business: 1200.00,
            totalReferrals: 8,
            level1Referrals: 5,
            level2Referrals: 3,
            totalReferralEarnings: 165.75,
            pendingWithdrawals: 2,
            totalWithdrawn: 500.00
        };
        
        updateDashboardData();
        loadTransactionHistory();
        loadReferralList();
        loadWithdrawalHistory();
        
        showToast('Dashboard data loaded successfully!', 'success');
    }, 1000);
}

// Handle deposit form submission
function handleDeposit(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const amount = parseFloat(formData.get('amount'));
    const method = formData.get('method');
    const note = formData.get('note');
    
    if (amount < 50) {
        showToast('Minimum deposit amount is 50 USDT', 'error');
        return;
    }
    
    if (!method) {
        showToast('Please select a payment method', 'error');
        return;
    }
    
    showToast('Processing deposit request...', 'info');
    
    // Simulate API call
    setTimeout(() => {
        // Update dashboard data
        dashboardData.accountBalance += amount;
        
        // Add to transaction history
        addTransaction({
            date: new Date().toISOString(),
            type: 'deposit',
            amount: amount,
            status: 'pending',
            details: `Deposit via ${method}${note ? ` - ${note}` : ''}`
        });
        
        updateDashboardData();
        e.target.reset();
        
        showToast('Deposit request submitted successfully!', 'success');
    }, 1500);
}

// Handle withdraw form submission
function handleWithdraw(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const amount = parseFloat(formData.get('amount'));
    const address = formData.get('address');
    const note = formData.get('note');
    
    if (amount < 10) {
        showToast('Minimum withdrawal amount is 10 USDT', 'error');
        return;
    }
    
    if (amount > dashboardData.accountBalance) {
        showToast('Insufficient balance for withdrawal', 'error');
        return;
    }
    
    if (!address || address.length < 10) {
        showToast('Please enter a valid USDT address', 'error');
        return;
    }
    
    showToast('Processing withdrawal request...', 'info');
    
    // Simulate API call
    setTimeout(() => {
        // Update dashboard data
        dashboardData.accountBalance -= amount;
        dashboardData.pendingWithdrawals += 1;
        
        // Add to transaction history
        addTransaction({
            date: new Date().toISOString(),
            type: 'withdraw',
            amount: amount,
            status: 'pending',
            details: `Withdrawal to ${address.substring(0, 10)}...${note ? ` - ${note}` : ''}`
        });
        
        // Add to withdrawal history
        addWithdrawal({
            date: new Date().toISOString(),
            amount: amount,
            address: address,
            status: 'pending',
            transactionId: 'TX' + Date.now()
        });
        
        updateDashboardData();
        e.target.reset();
        
        showToast('Withdrawal request submitted successfully!', 'success');
    }, 1500);
}

// Add transaction to history
function addTransaction(transaction) {
    const transactions = JSON.parse(localStorage.getItem('transactions') || '[]');
    transactions.unshift(transaction);
    localStorage.setItem('transactions', JSON.stringify(transactions));
    loadTransactionHistory();
}

// Add withdrawal to history
function addWithdrawal(withdrawal) {
    const withdrawals = JSON.parse(localStorage.getItem('withdrawals') || '[]');
    withdrawals.unshift(withdrawal);
    localStorage.setItem('withdrawals', JSON.stringify(withdrawals));
    loadWithdrawalHistory();
}

// Load transaction history
function loadTransactionHistory() {
    const transactions = JSON.parse(localStorage.getItem('transactions') || '[]');
    const tbody = document.getElementById('historyTableBody');
    
    if (transactions.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="no-data">No transactions found</td></tr>';
        return;
    }
    
    tbody.innerHTML = transactions.map(transaction => `
        <tr>
            <td>${formatDate(transaction.date)}</td>
            <td><span class="transaction-type ${transaction.type}">${transaction.type.toUpperCase()}</span></td>
            <td>$${transaction.amount.toFixed(2)} USDT</td>
            <td><span class="status ${transaction.status}">${transaction.status}</span></td>
            <td>${transaction.details}</td>
        </tr>
    `).join('');
}

// Load referral list
function loadReferralList() {
    // Simulate referral data
    const referrals = [
        { name: 'John Doe', email: 'john@example.com', level: 1, joinDate: '2024-01-15', status: 'active' },
        { name: 'Jane Smith', email: 'jane@example.com', level: 1, joinDate: '2024-01-20', status: 'active' },
        { name: 'Bob Johnson', email: 'bob@example.com', level: 2, joinDate: '2024-01-25', status: 'pending' }
    ];
    
    const tbody = document.getElementById('referralTableBody');
    
    if (referrals.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="no-data">No referrals yet</td></tr>';
        return;
    }
    
    tbody.innerHTML = referrals.map(referral => `
        <tr>
            <td>${referral.name}</td>
            <td>${referral.email}</td>
            <td>Level ${referral.level}</td>
            <td>${formatDate(referral.joinDate)}</td>
            <td><span class="status ${referral.status}">${referral.status}</span></td>
        </tr>
    `).join('');
}

// Load withdrawal history
function loadWithdrawalHistory() {
    const withdrawals = JSON.parse(localStorage.getItem('withdrawals') || '[]');
    const tbody = document.getElementById('withdrawalTableBody');
    
    if (withdrawals.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="no-data">No withdrawal requests</td></tr>';
        return;
    }
    
    tbody.innerHTML = withdrawals.map(withdrawal => `
        <tr>
            <td>${formatDate(withdrawal.date)}</td>
            <td>$${withdrawal.amount.toFixed(2)} USDT</td>
            <td>${withdrawal.address.substring(0, 15)}...</td>
            <td><span class="status ${withdrawal.status}">${withdrawal.status}</span></td>
            <td>${withdrawal.transactionId}</td>
        </tr>
    `).join('');
}

// Filter history
function filterHistory() {
    const filterType = document.getElementById('historyType').value;
    const transactions = JSON.parse(localStorage.getItem('transactions') || '[]');
    const tbody = document.getElementById('historyTableBody');
    
    let filteredTransactions = transactions;
    if (filterType !== 'all') {
        filteredTransactions = transactions.filter(t => t.type === filterType);
    }
    
    if (filteredTransactions.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="no-data">No transactions found</td></tr>';
        return;
    }
    
    tbody.innerHTML = filteredTransactions.map(transaction => `
        <tr>
            <td>${formatDate(transaction.date)}</td>
            <td><span class="transaction-type ${transaction.type}">${transaction.type.toUpperCase()}</span></td>
            <td>$${transaction.amount.toFixed(2)} USDT</td>
            <td><span class="status ${transaction.status}">${transaction.status}</span></td>
            <td>${transaction.details}</td>
        </tr>
    `).join('');
}

// Copy referral link
function copyReferralLink() {
    const referralLink = document.getElementById('referralLink');
    referralLink.select();
    referralLink.setSelectionRange(0, 99999); // For mobile devices
    
    try {
        document.execCommand('copy');
        showToast('Referral link copied to clipboard!', 'success');
    } catch (err) {
        showToast('Failed to copy referral link', 'error');
    }
}

// Logout function
function logout() {
    if (confirm('Are you sure you want to logout?')) {
        localStorage.removeItem('userData');
        localStorage.removeItem('dashboardData');
        window.location.href = 'index.html';
    }
}

// Format date
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Toast notification function
function showToast(message, type = 'success', duration = 3000) {
    toast.textContent = message;
    toast.className = `toast ${type}`;
    toast.classList.add('show');
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, duration);
}

// Save dashboard data to localStorage
function saveDashboardData() {
    localStorage.setItem('dashboardData', JSON.stringify(dashboardData));
}

// Auto-save dashboard data every 30 seconds
setInterval(saveDashboardData, 30000);

// Check and enable all buttons every 10 seconds to ensure they stay enabled
setInterval(enableAllButtons, 10000);

// Manual function to enable all buttons (can be called from console)
window.enableAllDashboardButtons = function() {
    console.log('Manually enabling all dashboard buttons...');
    enableAllButtons();
    testAllButtons();
    showToast('All buttons have been enabled!', 'success');
};

// Add some CSS for transaction types and status
const style = document.createElement('style');
style.textContent = `
    .transaction-type {
        padding: 4px 8px;
        border-radius: 4px;
        font-size: 12px;
        font-weight: 600;
        text-transform: uppercase;
    }
    
    .transaction-type.deposit {
        background: rgba(76, 175, 80, 0.1);
        color: #4caf50;
    }
    
    .transaction-type.withdraw {
        background: rgba(244, 67, 54, 0.1);
        color: #f44336;
    }
    
    .transaction-type.earning {
        background: rgba(33, 150, 243, 0.1);
        color: #2196f3;
    }
    
    .status {
        padding: 4px 8px;
        border-radius: 4px;
        font-size: 12px;
        font-weight: 600;
        text-transform: uppercase;
    }
    
    .status.pending {
        background: rgba(255, 193, 7, 0.1);
        color: #ffc107;
    }
    
    .status.completed {
        background: rgba(76, 175, 80, 0.1);
        color: #4caf50;
    }
    
    .status.failed {
        background: rgba(244, 67, 54, 0.1);
        color: #f44336;
    }
    
    .status.active {
        background: rgba(76, 175, 80, 0.1);
        color: #4caf50;
    }
`;
document.head.appendChild(style);
