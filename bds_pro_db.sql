-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1:3307
-- Generation Time: Sep 05, 2025 at 01:24 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.1.25

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `bds_pro_db`
--

-- --------------------------------------------------------

--
-- Table structure for table `business_tracking`
--

CREATE TABLE `business_tracking` (
  `business_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `source_user_id` int(11) NOT NULL,
  `amount` decimal(15,2) NOT NULL,
  `level` enum('level_1','level_2') NOT NULL,
  `transaction_type` enum('deposit','investment','trade') NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `dashboard_transactions`
--

CREATE TABLE `dashboard_transactions` (
  `id` int(11) NOT NULL,
  `category` varchar(255) NOT NULL,
  `date` datetime NOT NULL,
  `withdrawal_amount` decimal(18,2) NOT NULL,
  `transaction_id` varchar(255) NOT NULL,
  `withdrawal_from` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `dashboard_transactions`
--

INSERT INTO `dashboard_transactions` (`id`, `category`, `date`, `withdrawal_amount`, `transaction_id`, `withdrawal_from`) VALUES
(1, 'My Level 1 Income', '2025-09-04 02:38:26', 39.93, 'TX1757020105556', 'Cashback'),
(2, 'My Level 1 Income', '2025-08-26 02:38:26', 27.59, 'TX1757020104556', 'Cashback'),
(3, 'My Level 1 Income', '2025-08-16 02:38:26', 61.25, 'TX1757020103556', 'Level 1'),
(4, 'My Level 1 Income', '2025-08-06 02:38:26', 43.55, 'TX1757020102556', 'Level 2');

-- --------------------------------------------------------

--
-- Table structure for table `deposits`
--

CREATE TABLE `deposits` (
  `deposit_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `network` varchar(20) NOT NULL,
  `address` varchar(100) NOT NULL,
  `amount` decimal(15,2) NOT NULL,
  `transaction_hash` varchar(100) DEFAULT NULL,
  `status` enum('pending','confirmed','failed','cancelled') DEFAULT 'pending',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `earnings`
--

CREATE TABLE `earnings` (
  `earning_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `source_user_id` int(11) DEFAULT NULL,
  `amount` decimal(15,2) NOT NULL,
  `type` enum('self_growth','referral_level_1','referral_level_2','rewards') NOT NULL,
  `investment_id` int(11) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `investments`
--

CREATE TABLE `investments` (
  `investment_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `amount` decimal(15,2) NOT NULL,
  `deposit_date` date NOT NULL,
  `maturity_date` date NOT NULL,
  `status` enum('active','matured','cancelled') DEFAULT 'active',
  `growth_amount` decimal(15,2) DEFAULT 0.00,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `network`
--

CREATE TABLE `network` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `level1_income` decimal(15,2) DEFAULT 0.00,
  `level2_income` decimal(15,2) DEFAULT 0.00,
  `level1_business` decimal(15,2) DEFAULT 0.00,
  `level2_business` decimal(15,2) DEFAULT 0.00,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `referrals`
--

CREATE TABLE `referrals` (
  `id` int(11) NOT NULL,
  `referrer_id` int(11) NOT NULL,
  `referred_id` int(11) NOT NULL,
  `level` int(11) NOT NULL DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `transactions`
--

CREATE TABLE `transactions` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `type` enum('deposit','withdrawal','cashback','level1_income','level2_income','reward') NOT NULL,
  `amount` decimal(15,2) NOT NULL,
  `credit` decimal(15,2) DEFAULT 0.00,
  `debit` decimal(15,2) DEFAULT 0.00,
  `balance` decimal(15,2) NOT NULL,
  `description` text DEFAULT NULL,
  `status` enum('pending','completed','failed','cancelled') DEFAULT 'pending',
  `timestamp` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `user_id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `phone` varchar(20) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `account_balance` decimal(15,2) DEFAULT 0.00,
  `total_earning` decimal(15,2) DEFAULT 0.00,
  `rewards` decimal(15,2) DEFAULT 0.00,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `referral_code` varchar(20) DEFAULT NULL,
  `referrer_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`user_id`, `name`, `email`, `phone`, `password_hash`, `account_balance`, `total_earning`, `rewards`, `created_at`, `updated_at`, `referral_code`, `referrer_id`) VALUES
(2, 'nitin', 'nitinkandpal00@gmail.com', '', '$2a$12$ZOBUW5zM5Gkdvqtg.57ZtuY3X7mQTqKG7xvliZST4du/0tEXK7JNK', 0.00, 0.00, 0.00, '2025-09-04 20:51:07', '2025-09-04 20:51:07', 'BDSVB3SO7', NULL),
(3, 'Nitin kandpal', 'nitinkandpalco@gmail.com', '', '$2a$12$pZiLvMf60uRTQMSLopX8JeMG8IQgB915niPS8t2adBk.1JhNye.xy', 0.00, 0.00, 0.00, '2025-09-04 13:51:16', '2025-09-04 15:50:57', 'BDSV3FPP5', NULL),
(7, 'MAHIMA', 'joshimahima798@gmail.com', '', '$2a$12$YdIZ/UVBjgudYO/JxE2tS.7v9MC2UhwQKldvuk.CLG6zO5RLFfk0W', 0.00, 0.00, 0.00, '2025-09-04 13:16:20', '2025-09-04 15:50:57', 'BDSK04IUP', NULL),
(404, 'Mahima Joshi', 'mahimasocialtusk@gmail.com', '', '$2a$12$ouLWPh7st7fpiitoSMpLVuehtBI.ntY5K/S6YdxjwB8EEJpkQTi7.', 0.00, 0.00, 0.00, '2025-09-04 13:23:06', '2025-09-04 15:50:57', 'BDSA9FXUH', NULL),
(598, 'okay 123', 'okayjoshi12@gmail.com', '', '$2a$12$uo5L0Yx4m16GxqjR7c7MzuoIVugLrwQxPWWQGj7knKCdmwT.4UmBC', 0.00, 0.00, 0.00, '2025-09-04 16:28:10', '2025-09-04 16:28:10', 'BDSG3X4X3', 648565),
(51753, 'Nitin Pagal', 'pagalhumai12@gmail.com', '', '$2a$12$ZlqFulaOhDJEDgK7G7hBlOFIqkaRTSC5/m7R60ncf4hTwznCPw7Jy', 0.00, 0.00, 0.00, '2025-09-04 21:39:14', '2025-09-04 21:39:14', 'BDS53O8OT', NULL),
(68695, 'Bhoomika', 'bhoomika123@gmail.com', '', '$2a$12$dlDU9gZbJ.dCYhOUfgdaMOVpiD3EnXtnpYLrg69RNbAfRO.F.KwTe', 0.00, 0.00, 0.00, '2025-09-04 16:12:11', '2025-09-04 16:12:11', 'BDS0NNUH1', 7),
(68696, 'nandini', 'nandinikh67@gmai.com', '', '$2a$12$qfQbjnmlhyMqDLuxCst9n.qqR4.Eh4rZ2qpI51auaTN8vEw/AQgRK', 0.00, 0.00, 0.00, '2025-09-04 16:15:51', '2025-09-04 16:15:51', 'BDSH3Y7PZ', NULL),
(648565, 'Nitin kandpal newww', 'nitinkandpal3344@gmai.com', '', '$2a$12$1WcrxiouvEcqPPkpgm72V.hFlELAsdEEKLsiEvIgSQYhA4CSV3Tue', 0.00, 0.00, 0.00, '2025-09-04 16:17:40', '2025-09-04 16:17:40', 'BDS4Q8NX1', NULL),
(648566, 'Khushi', 'khushi345@gmail.com', '', '$2a$12$ctrEUsEqspDUTFvMG6dfW.X5XqNRbhrZ06pg8kQ.OjzF2CZcjjG9G', 0.00, 0.00, 0.00, '2025-09-04 16:30:41', '2025-09-04 16:30:41', 'BDSWX7A6S', NULL),
(648567, 'naina', 'nainaokay33@gmail.com', '', '$2a$12$ZDW1cwe6bV/FhIMPBvluZuhckcJrryONpwplqxpO4ig/mhdo55gla', 0.00, 0.00, 0.00, '2025-09-04 19:59:09', '2025-09-04 19:59:09', 'BDSLHPPGZ', NULL),
(648568, 'gedbjnnd', 'jhbnsccdds722@gmail.com', '', '$2a$12$DZExfvpG28wxzzd8zbRKXujhhQuDULPtpM7csZBO2br0G3YKlpGjK', 0.00, 0.00, 0.00, '2025-09-04 20:00:33', '2025-09-04 20:00:33', 'BDSGE1X30', NULL),
(648569, 'MAHi', 'okshimahima798@gmail.com', '', '$2a$12$Nnzjc0JEklbj4s.UbC38LeWR2fXpBPdpREIGPRBgQ2u/WaFiYow/e', 0.00, 0.00, 0.00, '2025-09-04 20:31:18', '2025-09-04 20:31:18', 'BDSOWAKCG', NULL),
(648570, 'NITIN AJKDJ', 'nitinkandpal75@gmail.com', '', '$2a$12$jbOTCq2EEt1ulCwwbhD6yOP82gaLYafKmT50oR.nPfmU77./xabiG', 0.00, 0.00, 0.00, '2025-09-04 21:37:41', '2025-09-04 21:37:41', 'BDS5RW9YV', NULL),
(648571, 'Test User', 'test@example.com', '', '$2a$12$vgDwZGeZzGv4pKpTVEJhsOQhYMCQKOuqzLB8tnNisHTej2oDvEFGm', 0.00, 0.00, 0.00, '2025-09-04 21:44:28', '2025-09-04 21:44:28', 'BDSAZZN6K', NULL),
(648573, 'Test User 2', 'test2@example.com', '', '$2a$12$aaaRqmqwrAVmkwRlLSHQYeoFdn2bmL.jnOpL9h8rb9C6R/QFRqsDe', 0.00, 0.00, 0.00, '2025-09-04 21:50:22', '2025-09-04 21:50:22', 'BDSV6SOBQ', NULL),
(648574, 'Test User 3', 'test3@example.com', '', '$2a$12$pXT51GMZW6efj6HUCO8nh.f21p.RUHhcXNuxIGuQYARqZjQioGPZy', 0.00, 0.00, 0.00, '2025-09-04 22:08:24', '2025-09-04 22:08:24', 'BDSZ4D83C', NULL),
(648575, 'mnm', 'kmayank2231@gmail.com', '', '$2a$12$CMy3Q9oZFdgbWNsP5pmcIe8LTx.scCL964n.jkepAzJucM53/DVby', 0.00, 0.00, 0.00, '2025-09-04 22:30:22', '2025-09-04 22:30:22', 'BDS1XZN4A', NULL);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `business_tracking`
--
ALTER TABLE `business_tracking`
  ADD PRIMARY KEY (`business_id`),
  ADD KEY `source_user_id` (`source_user_id`),
  ADD KEY `idx_user_id` (`user_id`),
  ADD KEY `idx_level` (`level`),
  ADD KEY `idx_created_at` (`created_at`);

--
-- Indexes for table `dashboard_transactions`
--
ALTER TABLE `dashboard_transactions`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `deposits`
--
ALTER TABLE `deposits`
  ADD PRIMARY KEY (`deposit_id`),
  ADD UNIQUE KEY `transaction_hash` (`transaction_hash`),
  ADD KEY `idx_user_id` (`user_id`),
  ADD KEY `idx_status` (`status`),
  ADD KEY `idx_created_at` (`created_at`);

--
-- Indexes for table `earnings`
--
ALTER TABLE `earnings`
  ADD PRIMARY KEY (`earning_id`),
  ADD KEY `source_user_id` (`source_user_id`),
  ADD KEY `investment_id` (`investment_id`),
  ADD KEY `idx_user_id` (`user_id`),
  ADD KEY `idx_type` (`type`),
  ADD KEY `idx_created_at` (`created_at`);

--
-- Indexes for table `investments`
--
ALTER TABLE `investments`
  ADD PRIMARY KEY (`investment_id`),
  ADD KEY `idx_user_id` (`user_id`),
  ADD KEY `idx_status` (`status`),
  ADD KEY `idx_maturity_date` (`maturity_date`);

--
-- Indexes for table `network`
--
ALTER TABLE `network`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `referrals`
--
ALTER TABLE `referrals`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_referral` (`referrer_id`,`referred_id`),
  ADD KEY `referred_id` (`referred_id`);

--
-- Indexes for table `transactions`
--
ALTER TABLE `transactions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`user_id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD UNIQUE KEY `referral_code` (`referral_code`),
  ADD KEY `referrer_id` (`referrer_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `business_tracking`
--
ALTER TABLE `business_tracking`
  MODIFY `business_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `dashboard_transactions`
--
ALTER TABLE `dashboard_transactions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `deposits`
--
ALTER TABLE `deposits`
  MODIFY `deposit_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `earnings`
--
ALTER TABLE `earnings`
  MODIFY `earning_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `investments`
--
ALTER TABLE `investments`
  MODIFY `investment_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `network`
--
ALTER TABLE `network`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `referrals`
--
ALTER TABLE `referrals`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `transactions`
--
ALTER TABLE `transactions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `user_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=648576;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `business_tracking`
--
ALTER TABLE `business_tracking`
  ADD CONSTRAINT `business_tracking_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `business_tracking_ibfk_2` FOREIGN KEY (`source_user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE;

--
-- Constraints for table `deposits`
--
ALTER TABLE `deposits`
  ADD CONSTRAINT `deposits_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE;

--
-- Constraints for table `earnings`
--
ALTER TABLE `earnings`
  ADD CONSTRAINT `earnings_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `earnings_ibfk_2` FOREIGN KEY (`source_user_id`) REFERENCES `users` (`user_id`) ON DELETE SET NULL,
  ADD CONSTRAINT `earnings_ibfk_3` FOREIGN KEY (`investment_id`) REFERENCES `investments` (`investment_id`) ON DELETE SET NULL;

--
-- Constraints for table `investments`
--
ALTER TABLE `investments`
  ADD CONSTRAINT `investments_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE;

--
-- Constraints for table `network`
--
ALTER TABLE `network`
  ADD CONSTRAINT `network_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE;

--
-- Constraints for table `referrals`
--
ALTER TABLE `referrals`
  ADD CONSTRAINT `referrals_ibfk_1` FOREIGN KEY (`referrer_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `referrals_ibfk_2` FOREIGN KEY (`referred_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE;

--
-- Constraints for table `transactions`
--
ALTER TABLE `transactions`
  ADD CONSTRAINT `transactions_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE;

--
-- Constraints for table `users`
--
ALTER TABLE `users`
  ADD CONSTRAINT `users_ibfk_1` FOREIGN KEY (`referrer_id`) REFERENCES `users` (`user_id`) ON DELETE SET NULL;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
