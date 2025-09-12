-- BDS PRO Multi-Level Referral Views
-- This file contains SQL views and procedures for managing referral relationships

-- =============================================
-- 1. USER REFERRALS VIEW (Level 1 & 2)
-- =============================================

-- Create or replace the view for 2-level referrals
CREATE OR REPLACE VIEW user_referrals AS
    -- Level 1 (Direct referrals)
    SELECT 
        u.user_id AS referrer,
        u.name AS referrer_name,
        c.user_id AS referral,
        c.name AS referral_name,
        c.email AS referral_email,
        c.created_at AS referral_joined_date,
        1 AS level,
        'Direct' AS relationship_type
    FROM users u
    JOIN users c ON c.referrer_id = u.user_id

    UNION ALL

    -- Level 2 (Indirect referrals)
    SELECT 
        u.user_id AS referrer,
        u.name AS referrer_name,
        gc.user_id AS referral,
        gc.name AS referral_name,
        gc.email AS referral_email,
        gc.created_at AS referral_joined_date,
        2 AS level,
        'Indirect' AS relationship_type
    FROM users u
    JOIN users c  ON c.referrer_id = u.user_id
    JOIN users gc ON gc.referrer_id = c.user_id;

-- =============================================
-- 2. REFERRAL STATISTICS VIEW
-- =============================================

CREATE OR REPLACE VIEW referral_stats AS
SELECT 
    u.user_id,
    u.name,
    u.email,
    u.referral_code,
    COUNT(CASE WHEN ur.level = 1 THEN 1 END) AS level1_count,
    COUNT(CASE WHEN ur.level = 2 THEN 1 END) AS level2_count,
    COUNT(ur.referral) AS total_referrals,
    COALESCE(SUM(CASE WHEN ur.level = 1 THEN 1 ELSE 0 END), 0) AS direct_referrals,
    COALESCE(SUM(CASE WHEN ur.level = 2 THEN 1 ELSE 0 END), 0) AS indirect_referrals
FROM users u
LEFT JOIN user_referrals ur ON u.user_id = ur.referrer
GROUP BY u.user_id, u.name, u.email, u.referral_code;

-- =============================================
-- 3. REFERRAL EARNINGS VIEW
-- =============================================

CREATE OR REPLACE VIEW referral_earnings AS
SELECT 
    u.user_id,
    u.name,
    u.email,
    COALESCE(SUM(CASE WHEN t.type = 'level1_income' THEN t.amount ELSE 0 END), 0) AS level1_earnings,
    COALESCE(SUM(CASE WHEN t.type = 'level2_income' THEN t.amount ELSE 0 END), 0) AS level2_earnings,
    COALESCE(SUM(CASE WHEN t.type IN ('level1_income', 'level2_income') THEN t.amount ELSE 0 END), 0) AS total_referral_earnings,
    COALESCE(SUM(CASE WHEN t.type = 'level1_business' THEN t.amount ELSE 0 END), 0) AS level1_business,
    COALESCE(SUM(CASE WHEN t.type = 'level2_business' THEN t.amount ELSE 0 END), 0) AS level2_business,
    COALESCE(SUM(CASE WHEN t.type IN ('level1_business', 'level2_business') THEN t.amount ELSE 0 END), 0) AS total_business_volume
FROM users u
LEFT JOIN transactions t ON u.user_id = t.user_id
GROUP BY u.user_id, u.name, u.email;

-- =============================================
-- 4. PERFORMANCE INDEXES
-- =============================================

-- Add indexes for better performance (if they don't exist)
CREATE INDEX IF NOT EXISTS idx_users_referrer_id ON users(referrer_id);
CREATE INDEX IF NOT EXISTS idx_transactions_user_type ON transactions(user_id, type);
CREATE INDEX IF NOT EXISTS idx_transactions_related_user ON transactions(related_user_id);

-- =============================================
-- 5. STORED PROCEDURES
-- =============================================

-- Procedure to get all referrals for a specific user
DELIMITER //

CREATE OR REPLACE PROCEDURE GetUserReferrals(IN p_user_id INT)
BEGIN
    SELECT 
        referrer,
        referrer_name,
        referral,
        referral_name,
        referral_email,
        referral_joined_date,
        level,
        relationship_type
    FROM user_referrals 
    WHERE referrer = p_user_id
    ORDER BY level, referral_joined_date DESC;
END //

-- Procedure to get referral statistics for a specific user
CREATE OR REPLACE PROCEDURE GetUserReferralStats(IN p_user_id INT)
BEGIN
    SELECT 
        user_id,
        name,
        email,
        referral_code,
        level1_count,
        level2_count,
        total_referrals,
        direct_referrals,
        indirect_referrals
    FROM referral_stats 
    WHERE user_id = p_user_id;
END //

-- Procedure to get referral earnings for a specific user
CREATE OR REPLACE PROCEDURE GetUserReferralEarnings(IN p_user_id INT)
BEGIN
    SELECT 
        user_id,
        name,
        email,
        level1_earnings,
        level2_earnings,
        total_referral_earnings,
        level1_business,
        level2_business,
        total_business_volume
    FROM referral_earnings 
    WHERE user_id = p_user_id;
END //

-- Procedure to get complete referral dashboard data
CREATE OR REPLACE PROCEDURE GetReferralDashboard(IN p_user_id INT)
BEGIN
    -- Get referral statistics
    SELECT 
        'stats' as data_type,
        user_id,
        name,
        email,
        referral_code,
        level1_count,
        level2_count,
        total_referrals,
        direct_referrals,
        indirect_referrals
    FROM referral_stats 
    WHERE user_id = p_user_id
    
    UNION ALL
    
    -- Get referral earnings
    SELECT 
        'earnings' as data_type,
        user_id,
        name,
        email,
        level1_earnings,
        level2_earnings,
        total_referral_earnings,
        level1_business,
        level2_business,
        total_business_volume
    FROM referral_earnings 
    WHERE user_id = p_user_id;
END //

DELIMITER ;

-- =============================================
-- 6. USAGE EXAMPLES AND TEST QUERIES
-- =============================================

-- Example 1: Get all referrals for user 2
-- SELECT * FROM user_referrals WHERE referrer = 2;

-- Example 2: Count referrals by level for all users
-- SELECT referrer, level, COUNT(*) AS total FROM user_referrals GROUP BY referrer, level;

-- Example 3: Get top referrers
-- SELECT referrer, referrer_name, COUNT(*) as total_referrals 
-- FROM user_referrals 
-- GROUP BY referrer, referrer_name 
-- ORDER BY total_referrals DESC 
-- LIMIT 10;

-- Example 4: Get referral statistics for all users
-- SELECT * FROM referral_stats ORDER BY total_referrals DESC;

-- Example 5: Get referral earnings for all users
-- SELECT * FROM referral_earnings ORDER BY total_referral_earnings DESC;

-- Example 6: Get complete dashboard for user 2
-- CALL GetReferralDashboard(2);

-- Example 7: Find users with no referrals
-- SELECT u.user_id, u.name, u.email 
-- FROM users u 
-- LEFT JOIN user_referrals ur ON u.user_id = ur.referrer 
-- WHERE ur.referrer IS NULL;

-- Example 8: Get referral chain (who referred whom)
-- SELECT 
--     u1.name as referrer,
--     u2.name as level1_referral,
--     u3.name as level2_referral
-- FROM users u1
-- LEFT JOIN users u2 ON u2.referrer_id = u1.user_id
-- LEFT JOIN users u3 ON u3.referrer_id = u2.user_id
-- WHERE u1.user_id = 2;
