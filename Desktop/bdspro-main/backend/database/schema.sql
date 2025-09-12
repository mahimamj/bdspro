-- BDS PRO Database Schema
-- This file contains all the necessary tables for the deposit and referral system

-- Users table
CREATE TABLE IF NOT EXISTS users (
    user_id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    referral_code VARCHAR(20) UNIQUE NOT NULL,
    referrer_id INT NULL,
    account_balance DECIMAL(15,2) DEFAULT 0.00,
    total_earning DECIMAL(15,2) DEFAULT 0.00,
    rewards DECIMAL(15,2) DEFAULT 0.00,
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (referrer_id) REFERENCES users(user_id) ON DELETE SET NULL,
    INDEX idx_referral_code (referral_code),
    INDEX idx_referrer_id (referrer_id)
);

-- Transactions table
CREATE TABLE IF NOT EXISTS transactions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    type ENUM('deposit', 'withdrawal', 'growth', 'level1_income', 'level2_income', 'level1_business', 'level2_business') NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    credit DECIMAL(15,2) DEFAULT 0.00,
    debit DECIMAL(15,2) DEFAULT 0.00,
    balance DECIMAL(15,2) NOT NULL,
    description TEXT,
    status ENUM('pending', 'completed', 'failed', 'cancelled') DEFAULT 'completed',
    related_user_id INT NULL, -- For referral income tracking
    related_transaction_id INT NULL, -- For linking related transactions
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (related_user_id) REFERENCES users(user_id) ON DELETE SET NULL,
    FOREIGN KEY (related_transaction_id) REFERENCES transactions(id) ON DELETE SET NULL,
    INDEX idx_user_id (user_id),
    INDEX idx_type (type),
    INDEX idx_timestamp (timestamp),
    INDEX idx_related_user (related_user_id)
);

-- Referrals table
CREATE TABLE IF NOT EXISTS referrals (
    id INT AUTO_INCREMENT PRIMARY KEY,
    referrer_id VARCHAR(50) NOT NULL,
    referred_id VARCHAR(50) NOT NULL,
    level TINYINT NOT NULL DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (referrer_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (referred_id) REFERENCES users(user_id) ON DELETE CASCADE,
    UNIQUE KEY unique_referral (referrer_id, referred_id),
    INDEX idx_referrer (referrer_id),
    INDEX idx_referred (referred_id),
    INDEX idx_level (level)
);

-- Network table for tracking referral statistics
CREATE TABLE IF NOT EXISTS network (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR(50) NOT NULL,
    level1_income DECIMAL(15,2) DEFAULT 0.00,
    level2_income DECIMAL(15,2) DEFAULT 0.00,
    level1_business DECIMAL(15,2) DEFAULT 0.00,
    level2_business DECIMAL(15,2) DEFAULT 0.00,
    total_referral_income DECIMAL(15,2) DEFAULT 0.00,
    total_business_volume DECIMAL(15,2) DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_network (user_id),
    INDEX idx_user_id (user_id)
);

-- Growth tracking table for 6% monthly growth
CREATE TABLE IF NOT EXISTS growth_tracking (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR(50) NOT NULL,
    original_deposit_id INT NOT NULL,
    original_amount DECIMAL(15,2) NOT NULL,
    growth_amount DECIMAL(15,2) NOT NULL,
    growth_percentage DECIMAL(5,2) DEFAULT 6.00,
    processed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status ENUM('pending', 'processed', 'failed') DEFAULT 'pending',
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (original_deposit_id) REFERENCES transactions(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_status (status),
    INDEX idx_processed_at (processed_at)
);

-- Referral income tracking table
CREATE TABLE IF NOT EXISTS referral_income_tracking (
    id INT AUTO_INCREMENT PRIMARY KEY,
    referrer_id VARCHAR(50) NOT NULL,
    depositor_id VARCHAR(50) NOT NULL,
    deposit_transaction_id INT NOT NULL,
    level TINYINT NOT NULL,
    referral_income DECIMAL(15,2) NOT NULL,
    business_volume DECIMAL(15,2) NOT NULL,
    processed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status ENUM('pending', 'processed', 'failed') DEFAULT 'pending',
    FOREIGN KEY (referrer_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (depositor_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (deposit_transaction_id) REFERENCES transactions(id) ON DELETE CASCADE,
    INDEX idx_referrer (referrer_id),
    INDEX idx_depositor (depositor_id),
    INDEX idx_level (level),
    INDEX idx_status (status)
);

-- System settings table for configuration
CREATE TABLE IF NOT EXISTS system_settings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    setting_key VARCHAR(100) UNIQUE NOT NULL,
    setting_value TEXT NOT NULL,
    description TEXT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_setting_key (setting_key)
);

-- Insert default system settings
INSERT INTO system_settings (setting_key, setting_value, description) VALUES
('growth_percentage', '6.00', 'Monthly growth percentage'),
('level1_referral_percentage', '1.00', 'Level 1 referral income percentage'),
('level2_referral_percentage', '1.00', 'Level 2 referral income percentage'),
('growth_processing_days', '30', 'Days after deposit to process growth'),
('referral_processing_days', '30', 'Days after deposit to process referral income'),
('max_referral_levels', '2', 'Maximum referral levels for income calculation')
ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value);

-- Deposits table
CREATE TABLE IF NOT EXISTS deposits (
    deposit_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    network VARCHAR(20) NOT NULL,
    address VARCHAR(100) NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    transaction_hash VARCHAR(100) UNIQUE,
    status ENUM('pending', 'confirmed', 'failed', 'cancelled') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_status (status),
    INDEX idx_created_at (created_at)
);

-- Investments table (for tracking 1-month investments)
CREATE TABLE IF NOT EXISTS investments (
    investment_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    deposit_date DATE NOT NULL,
    maturity_date DATE NOT NULL,
    status ENUM('active', 'matured', 'cancelled') DEFAULT 'active',
    growth_amount DECIMAL(15,2) DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_status (status),
    INDEX idx_maturity_date (maturity_date)
);

-- Earnings table (for tracking all types of earnings)
CREATE TABLE IF NOT EXISTS earnings (
    earning_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    source_user_id INT NULL,
    amount DECIMAL(15,2) NOT NULL,
    type ENUM('self_growth', 'referral_level_1', 'referral_level_2', 'rewards') NOT NULL,
    investment_id INT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (source_user_id) REFERENCES users(user_id) ON DELETE SET NULL,
    FOREIGN KEY (investment_id) REFERENCES investments(investment_id) ON DELETE SET NULL,
    INDEX idx_user_id (user_id),
    INDEX idx_type (type),
    INDEX idx_created_at (created_at)
);

-- Business tracking table (for tracking transaction volumes)
CREATE TABLE IF NOT EXISTS business_tracking (
    business_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    source_user_id INT NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    level ENUM('level_1', 'level_2') NOT NULL,
    transaction_type ENUM('deposit', 'investment', 'trade') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (source_user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_level (level),
    INDEX idx_created_at (created_at)
);

-- Create views for easier reporting
CREATE OR REPLACE VIEW user_summary AS
SELECT 
    u.user_id,
    u.name,
    u.email,
    u.account_balance,
    u.total_earning,
    u.rewards,
    COALESCE(n.level1_income, 0) as level1_income,
    COALESCE(n.level2_income, 0) as level2_income,
    COALESCE(n.level1_business, 0) as level1_business,
    COALESCE(n.level2_business, 0) as level2_business,
    COALESCE(n.total_referral_income, 0) as total_referral_income,
    COALESCE(n.total_business_volume, 0) as total_business_volume,
    u.created_at,
    u.updated_at
FROM users u
LEFT JOIN network n ON u.user_id = n.user_id;

-- Create view for transaction summary
CREATE OR REPLACE VIEW transaction_summary AS
SELECT 
    t.id,
    t.user_id,
    u.name as user_name,
    t.type,
    t.amount,
    t.credit,
    t.debit,
    t.balance,
    t.description,
    t.status,
    t.related_user_id,
    ru.name as related_user_name,
    t.timestamp
FROM transactions t
LEFT JOIN users u ON t.user_id = u.user_id
LEFT JOIN users ru ON t.related_user_id = ru.user_id
ORDER BY t.timestamp DESC;

-- Create view for referral network
CREATE OR REPLACE VIEW referral_network AS
SELECT 
    r.id,
    r.referrer_id,
    ru.name as referrer_name,
    ru.email as referrer_email,
    r.referred_id,
    red.name as referred_name,
    red.email as referred_email,
    r.level,
    r.created_at
FROM referrals r
LEFT JOIN users ru ON r.referrer_id = ru.user_id
LEFT JOIN users red ON r.referred_id = red.user_id
ORDER BY r.created_at DESC;