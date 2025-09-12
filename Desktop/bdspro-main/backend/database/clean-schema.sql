-- Users table
CREATE TABLE users (
    user_id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    phone VARCHAR(20) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    account_balance DECIMAL(15,2) DEFAULT 0.00,
    total_earning DECIMAL(15,2) DEFAULT 0.00,
    rewards DECIMAL(15,2) DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Network/Referral table
CREATE TABLE network (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    level1_income DECIMAL(15,2) DEFAULT 0.00,
    level2_income DECIMAL(15,2) DEFAULT 0.00,
    level1_business DECIMAL(15,2) DEFAULT 0.00,
    level2_business DECIMAL(15,2) DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- Transactions table
CREATE TABLE transactions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    type ENUM('deposit', 'withdrawal', 'cashback', 'level1_income', 'level2_income', 'reward') NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    credit DECIMAL(15,2) DEFAULT 0.00,
    debit DECIMAL(15,2) DEFAULT 0.00,
    balance DECIMAL(15,2) NOT NULL,
    description TEXT,
    status ENUM('pending', 'completed', 'failed', 'cancelled') DEFAULT 'pending',
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- Referrals table
CREATE TABLE referrals (
    id INT PRIMARY KEY AUTO_INCREMENT,
    referrer_id INT NOT NULL,
    referred_id INT NOT NULL,
    level INT NOT NULL DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (referrer_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (referred_id) REFERENCES users(user_id) ON DELETE CASCADE,
    UNIQUE KEY unique_referral (referrer_id, referred_id)
);

-- Insert sample data
INSERT INTO users (name, email, phone, password_hash, account_balance, total_earning, rewards) VALUES
('John Doe', 'john@example.com', '+1234567890', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/8KzqK2', 2500.00, 1500.00, 250.00),
('Jane Smith', 'jane@example.com', '+1234567891', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/8KzqK2', 1800.00, 1200.00, 180.00),
('Mike Johnson', 'mike@example.com', '+1234567892', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/8KzqK2', 3200.00, 2000.00, 320.00);

-- Insert network data
INSERT INTO network (user_id, level1_income, level2_income, level1_business, level2_business) VALUES
(1, 500.00, 200.00, 1000.00, 500.00),
(2, 300.00, 150.00, 800.00, 400.00),
(3, 800.00, 300.00, 1500.00, 700.00);

-- Insert sample transactions
INSERT INTO transactions (user_id, type, amount, credit, debit, balance, description, status) VALUES
(1, 'deposit', 1000.00, 1000.00, 0.00, 1000.00, 'Initial deposit', 'completed'),
(1, 'level1_income', 100.00, 100.00, 0.00, 1100.00, 'Level 1 referral income', 'completed'),
(1, 'withdrawal', 200.00, 0.00, 200.00, 900.00, 'Withdrawal request', 'completed'),
(2, 'deposit', 500.00, 500.00, 0.00, 500.00, 'Initial deposit', 'completed'),
(2, 'level1_income', 50.00, 50.00, 0.00, 550.00, 'Level 1 referral income', 'completed'),
(3, 'deposit', 2000.00, 2000.00, 0.00, 2000.00, 'Initial deposit', 'completed'),
(3, 'level1_income', 200.00, 200.00, 0.00, 2200.00, 'Level 1 referral income', 'completed'),
(3, 'level2_income', 100.00, 100.00, 0.00, 2300.00, 'Level 2 referral income', 'completed');

-- Insert sample referrals
INSERT INTO referrals (referrer_id, referred_id, level) VALUES
(1, 2, 1),
(1, 3, 1),
(2, 3, 2);
