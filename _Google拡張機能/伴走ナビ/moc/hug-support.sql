-- --------------------------------------------------------
-- ホスト:                          192.168.1.229
-- サーバーのバージョン:                   10.11.14-MariaDB-0ubuntu0.24.04.1 - Ubuntu 24.04
-- サーバー OS:                      debian-linux-gnu
-- HeidiSQL バージョン:               12.6.0.6765
-- --------------------------------------------------------

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET NAMES utf8 */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;


-- hug_ai_support のデータベース構造をダンプしています
CREATE DATABASE IF NOT EXISTS `hug_ai_support` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci */;
USE `hug_ai_support`;

--  テーブル hug_ai_support.ai_correction_logs の構造をダンプしています
CREATE TABLE IF NOT EXISTS `ai_correction_logs` (
  `log_id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `history_id` int(11) NOT NULL,
  `additional_prompt` text DEFAULT NULL,
  `original_text` text NOT NULL,
  `result_text` text NOT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`log_id`),
  KEY `idx_ai_correction_logs_user_id` (`user_id`),
  KEY `idx_ai_correction_logs_history_id` (`history_id`),
  KEY `idx_ai_correction_logs_created_at` (`created_at`),
  CONSTRAINT `fk_ai_correction_logs_history` FOREIGN KEY (`history_id`) REFERENCES `ai_prompt_histories` (`history_id`) ON UPDATE CASCADE,
  CONSTRAINT `fk_ai_correction_logs_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='AI校正実行ログ';

-- エクスポートするデータが選択されていません

--  テーブル hug_ai_support.ai_prompts の構造をダンプしています
CREATE TABLE IF NOT EXISTS `ai_prompts` (
  `prompt_id` int(11) NOT NULL AUTO_INCREMENT,
  `feature_key` varchar(100) NOT NULL,
  `content` text NOT NULL,
  `updated_by` int(11) NOT NULL,
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`prompt_id`),
  UNIQUE KEY `uq_ai_prompts_feature_key` (`feature_key`),
  KEY `idx_ai_prompts_updated_by` (`updated_by`),
  CONSTRAINT `fk_ai_prompts_updated_by` FOREIGN KEY (`updated_by`) REFERENCES `users` (`user_id`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='AIプロンプトの最新状態';

-- エクスポートするデータが選択されていません

--  テーブル hug_ai_support.ai_prompt_histories の構造をダンプしています
CREATE TABLE IF NOT EXISTS `ai_prompt_histories` (
  `history_id` int(11) NOT NULL AUTO_INCREMENT,
  `prompt_id` int(11) NOT NULL,
  `content` text NOT NULL,
  `created_by` int(11) NOT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`history_id`),
  KEY `idx_ai_prompt_histories_prompt_id` (`prompt_id`),
  KEY `idx_ai_prompt_histories_created_by` (`created_by`),
  KEY `idx_ai_prompt_histories_created_at` (`created_at`),
  CONSTRAINT `fk_ai_prompt_histories_created_by` FOREIGN KEY (`created_by`) REFERENCES `users` (`user_id`) ON UPDATE CASCADE,
  CONSTRAINT `fk_ai_prompt_histories_prompt` FOREIGN KEY (`prompt_id`) REFERENCES `ai_prompts` (`prompt_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='AIプロンプト変更履歴';

-- エクスポートするデータが選択されていません

--  テーブル hug_ai_support.batch_execution_logs の構造をダンプしています
CREATE TABLE IF NOT EXISTS `batch_execution_logs` (
  `log_id` int(11) NOT NULL AUTO_INCREMENT,
  `job_name` varchar(100) NOT NULL,
  `status` varchar(50) NOT NULL,
  `started_at` datetime NOT NULL,
  `finished_at` datetime DEFAULT NULL,
  `error_message` text DEFAULT NULL,
  PRIMARY KEY (`log_id`),
  KEY `idx_batch_execution_logs_job_name` (`job_name`),
  KEY `idx_batch_execution_logs_status` (`status`),
  KEY `idx_batch_execution_logs_started_at` (`started_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='バッチ処理実行履歴';

-- エクスポートするデータが選択されていません

--  テーブル hug_ai_support.children の構造をダンプしています
CREATE TABLE IF NOT EXISTS `children` (
  `child_id` int(11) NOT NULL AUTO_INCREMENT,
  `facility_id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`child_id`),
  KEY `idx_children_facility_id` (`facility_id`),
  CONSTRAINT `fk_children_facility` FOREIGN KEY (`facility_id`) REFERENCES `facilities` (`facility_id`) ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=683 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='児童マスタ';

-- エクスポートするデータが選択されていません

--  テーブル hug_ai_support.facilities の構造をダンプしています
CREATE TABLE IF NOT EXISTS `facilities` (
  `facility_id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`facility_id`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='事業所マスタ';

-- エクスポートするデータが選択されていません

--  テーブル hug_ai_support.support_records の構造をダンプしています
CREATE TABLE IF NOT EXISTS `support_records` (
  `record_id` int(11) NOT NULL AUTO_INCREMENT,
  `child_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `content` text NOT NULL,
  `target_date` date NOT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`record_id`),
  KEY `idx_support_records_child_date` (`child_id`,`target_date`),
  KEY `idx_support_records_user_id` (`user_id`),
  KEY `idx_support_records_target_date` (`target_date`),
  CONSTRAINT `fk_support_records_child` FOREIGN KEY (`child_id`) REFERENCES `children` (`child_id`) ON UPDATE CASCADE,
  CONSTRAINT `fk_support_records_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='支援記録データ';

-- エクスポートするデータが選択されていません

--  テーブル hug_ai_support.users の構造をダンプしています
CREATE TABLE IF NOT EXISTS `users` (
  `user_id` int(11) NOT NULL AUTO_INCREMENT,
  `facility_id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `role` varchar(50) NOT NULL DEFAULT 'staff',
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`user_id`),
  KEY `idx_users_facility_id` (`facility_id`),
  KEY `idx_users_role` (`role`),
  CONSTRAINT `fk_users_facility` FOREIGN KEY (`facility_id`) REFERENCES `facilities` (`facility_id`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='ユーザー／スタッフマスタ';

-- エクスポートするデータが選択されていません

/*!40103 SET TIME_ZONE=IFNULL(@OLD_TIME_ZONE, 'system') */;
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IFNULL(@OLD_FOREIGN_KEY_CHECKS, 1) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40111 SET SQL_NOTES=IFNULL(@OLD_SQL_NOTES, 1) */;
