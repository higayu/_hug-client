CREATE TABLE IF NOT EXISTS `children` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `notes` text DEFAULT NULL,
  `notes2` text DEFAULT NULL,
  `personal_tmp` text DEFAULT NULL,
  `pronunciation_id` int(11) DEFAULT NULL COMMENT '検索文字（ひらがな）',
  `children_type_id` int(11) NOT NULL DEFAULT 1,
  `is_delete` tinyint(4) NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  KEY `FK_children_pronunciation` (`pronunciation_id`),
  KEY `FK_children_children_type` (`children_type_id`) USING BTREE,
  CONSTRAINT `FK_children_children_type` FOREIGN KEY (`children_type_id`) REFERENCES `children_type` (`id`) ON DELETE CASCADE,
  CONSTRAINT `FK_children_pronunciation` FOREIGN KEY (`pronunciation_id`) REFERENCES `pronunciation` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE IF NOT EXISTS `children_type` (
  `id` int(11) NOT NULL,
  `name` varchar(50) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


CREATE TABLE IF NOT EXISTS `child_records` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `children_id` int(11) NOT NULL,
  `record_type_id` int(11) NOT NULL,
  `date` date NOT NULL,
  `score` int(11) DEFAULT NULL,
  `mistakes` int(11) DEFAULT NULL,
  `facility_id` int(11) NOT NULL,
  `memo1` varchar(255) DEFAULT NULL,
  `memo2` text DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `FK_child_records_children` (`children_id`),
  KEY `FK_child_records_record_types` (`record_type_id`),
  KEY `FK_child_records_facilitys` (`facility_id`),
  CONSTRAINT `FK_child_records_children` FOREIGN KEY (`children_id`) REFERENCES `children` (`id`) ON DELETE CASCADE,
  CONSTRAINT `FK_child_records_facilitys` FOREIGN KEY (`facility_id`) REFERENCES `facilitys` (`id`) ON DELETE CASCADE,
  CONSTRAINT `FK_child_records_record_types` FOREIGN KEY (`record_type_id`) REFERENCES `record_types` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=31 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


CREATE TABLE IF NOT EXISTS `facilitys` (
  `id` int(11) NOT NULL,
  `name` varchar(250) DEFAULT NULL,
  `url` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

INSERT INTO `facilitys` (`id`, `name`, `url`) VALUES
	(3, 'PD吉島', 'yoshijima'),
	(6, 'PD光', 'hikari'),
	(7, 'PD横川', 'yokogawa'),
	(8, 'PD五日市駅前', 'itukaiti');

CREATE TABLE IF NOT EXISTS `facility_children` (
  `facility_id` int(11) NOT NULL,
  `children_id` int(11) NOT NULL,
  PRIMARY KEY (`facility_id`,`children_id`),
  KEY `FK__childrens` (`children_id`),
  CONSTRAINT `FK__childrens` FOREIGN KEY (`children_id`) REFERENCES `children` (`id`) ON DELETE CASCADE,
  CONSTRAINT `FK__facility` FOREIGN KEY (`facility_id`) REFERENCES `facilitys` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


CREATE TABLE IF NOT EXISTS `facility_staff` (
  `facility_id` int(11) NOT NULL,
  `staff_id` int(11) NOT NULL,
  PRIMARY KEY (`facility_id`,`staff_id`),
  KEY `FK_facility_staff_staffs` (`staff_id`),
  CONSTRAINT `FK_facility_staff_facilitys` FOREIGN KEY (`facility_id`) REFERENCES `facilitys` (`id`) ON DELETE CASCADE,
  CONSTRAINT `FK_facility_staff_staffs` FOREIGN KEY (`staff_id`) REFERENCES `staffs` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


CREATE TABLE IF NOT EXISTS `managers2` (
  `children_id` int(11) NOT NULL,
  `staff_id` int(11) NOT NULL,
  `day_of_week_id` tinyint(4) NOT NULL,
  `priority` tinyint(4) NOT NULL DEFAULT 0,
  PRIMARY KEY (`children_id`,`staff_id`,`day_of_week_id`),
  KEY `FK_managers2_staffs` (`staff_id`),
  KEY `FK_managers2_day_of_week` (`day_of_week_id`),
  CONSTRAINT `FK_managers2_children` FOREIGN KEY (`children_id`) REFERENCES `children` (`id`) ON DELETE CASCADE,
  CONSTRAINT `FK_managers2_day_of_week` FOREIGN KEY (`day_of_week_id`) REFERENCES `day_of_week` (`id`) ON DELETE CASCADE,
  CONSTRAINT `FK_managers2_staffs` FOREIGN KEY (`staff_id`) REFERENCES `staffs` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


CREATE TABLE IF NOT EXISTS `m_service_items` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(50) NOT NULL DEFAULT '',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


CREATE TABLE IF NOT EXISTS `pc` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `facility_id` int(11) NOT NULL,
  `pc_id` int(11) NOT NULL,
  `name` varchar(50) NOT NULL DEFAULT '',
  `explanation` varchar(50) DEFAULT NULL,
  `memo` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `facility_id_pc_id` (`facility_id`,`pc_id`),
  KEY `FK_pc_facilitys` (`facility_id`),
  CONSTRAINT `FK_pc_facilitys` FOREIGN KEY (`facility_id`) REFERENCES `facilitys` (`id`) ON DELETE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

INSERT INTO `pc` (`id`, `facility_id`, `pc_id`, `name`, `explanation`, `memo`) VALUES
	(1, 3, 21, 'ガレリア21', 'Visual Studio (C#) と Unity(ゲーム開発ソフト）', 'ゲーミングPC'),
	(2, 3, 15, 'Dell-15', 'Dellの黒色', ''),
	(3, 3, 23, 'ガレリア23', 'Visual Studio (C#) ', ''),
	(4, 3, 18, 'Dell-18', '黒のDell', ''),
	(5, 8, 0, 'テスト', '黒のDell', ''),
	(6, 3, 20, 'Dell-20', 'Dell19', ''),
	(7, 3, 19, 'Dell-19', 'dell19', ''),
	(8, 3, 17, 'Dell-17', 'Dell', ''),
	(9, 3, 22, 'ガレリア22', 'Visual Studio (C#) とVScode', '');

CREATE TABLE IF NOT EXISTS `pc_to_children` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `pc_id` int(11) NOT NULL,
  `children_id` int(11) NOT NULL,
  `day_of_week` tinyint(4) DEFAULT NULL,
  `start_time` time DEFAULT NULL,
  `end_time` time DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FK__childrenpc` (`children_id`),
  KEY `FK__pc` (`pc_id`),
  KEY `FK_pc_to_children_day_of_week` (`day_of_week`),
  CONSTRAINT `FK__childrenpc` FOREIGN KEY (`children_id`) REFERENCES `children` (`id`) ON DELETE CASCADE,
  CONSTRAINT `FK__pc` FOREIGN KEY (`pc_id`) REFERENCES `pc` (`id`) ON DELETE CASCADE,
  CONSTRAINT `FK_pc_to_children_day_of_week` FOREIGN KEY (`day_of_week`) REFERENCES `day_of_week` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;



CREATE TABLE IF NOT EXISTS `record_types` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `memo` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

INSERT INTO `record_types` (`id`, `name`, `memo`) VALUES
	(1, '寿司打普通5000円', 'タイピング練習・成績記録'),
	(2, '寿司打練習10000円', 'タイピング練習・成績記録'),
	(3, 'Excel検定準2級', 'Excelスキル評価・検定記録');

CREATE TABLE IF NOT EXISTS `refresh_tokens` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `token` varchar(500) NOT NULL,
  `revoked` tinyint(1) DEFAULT 0,
  `expires_at` datetime NOT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `refresh_tokens_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE IF NOT EXISTS `service_records` (
  `id` int(11) NOT NULL AUTO_INCREMENT COMMENT 'サービス記録ID',
  `user_id` int(11) NOT NULL COMMENT '利用者ID',
  `item_id` int(11) NOT NULL COMMENT 'サービス種別ID',
  `served_time` datetime NOT NULL COMMENT '提供日時',
  `facility_id` int(11) NOT NULL DEFAULT 0 COMMENT '場所ID',
  `note` longtext CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT NULL COMMENT 'メモ',
  `is_copy` int(11) NOT NULL DEFAULT 0 COMMENT '管理日誌に転記するかどうか(1真　0偽)',
  `is_deleted` tinyint(4) NOT NULL DEFAULT 0 COMMENT '論理削除(削除1　有効0)',
  `recorded_staff_id` int(11) NOT NULL DEFAULT -1 COMMENT '担当者ID',
  `created_at` datetime NOT NULL DEFAULT current_timestamp() COMMENT '作成日時',
  `updated_staff_id` int(11) NOT NULL DEFAULT -1 COMMENT '更新者ID',
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp() COMMENT '更新日時',
  PRIMARY KEY (`id`) USING BTREE,
  KEY `item_id` (`item_id`) USING BTREE,
  CONSTRAINT `service_records_ibfk_1` FOREIGN KEY (`item_id`) REFERENCES `m_service_items` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='サービス全体記録';


CREATE TABLE IF NOT EXISTS `staffs` (
  `id` int(11) NOT NULL,
  `name` varchar(50) NOT NULL,
  `notes` text NOT NULL DEFAULT '',
  `is_delete` tinyint(4) NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;



