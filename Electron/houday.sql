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


-- houday のデータベース構造をダンプしています
CREATE DATABASE IF NOT EXISTS `houday` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci */;
USE `houday`;

--  テーブル houday.children の構造をダンプしています
CREATE TABLE IF NOT EXISTS `children` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `notes` text DEFAULT NULL,
  `notes2` text DEFAULT NULL,
  `personal_tmp` text DEFAULT NULL,
  `pronunciation_id` int(11) DEFAULT NULL COMMENT '検索文字（ひらがな）',
  `children_type_id` int(11) NOT NULL DEFAULT 1,
  `is_delete` tinyint(4) NOT NULL DEFAULT 0,
  `leaving_at` date DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FK_children_pronunciation` (`pronunciation_id`),
  KEY `FK_children_children_type` (`children_type_id`) USING BTREE,
  CONSTRAINT `FK_children_children_type` FOREIGN KEY (`children_type_id`) REFERENCES `children_type` (`id`) ON DELETE CASCADE,
  CONSTRAINT `FK_children_pronunciation` FOREIGN KEY (`pronunciation_id`) REFERENCES `pronunciation` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- エクスポートするデータが選択されていません

--  ビュー houday.children_facility2_v の構造をダンプしています
-- VIEW 依存エラーを克服するために、一時テーブルを作成
CREATE TABLE `children_facility2_v` (
	`children_id` INT(11) NOT NULL,
	`children_name` VARCHAR(100) NOT NULL COLLATE 'utf8mb4_general_ci',
	`is_delete` TINYINT(4) NOT NULL,
	`children_pronunciation` VARCHAR(10) NULL COLLATE 'utf8mb4_general_ci',
	`children_notes` TEXT NULL COLLATE 'utf8mb4_general_ci',
	`children_type_id` INT(11) NOT NULL,
	`children_type_name` VARCHAR(50) NULL COLLATE 'utf8mb4_general_ci',
	`facility_ids` MEDIUMTEXT NULL COLLATE 'utf8mb4_general_ci',
	`facility_names` MEDIUMTEXT NULL COLLATE 'utf8mb4_general_ci',
	`pc_ids` MEDIUMTEXT NULL COLLATE 'utf8mb4_general_ci',
	`pc_names` MEDIUMTEXT NULL COLLATE 'utf8mb4_general_ci',
	`pc_explanations` MEDIUMTEXT NULL COLLATE 'utf8mb4_general_ci',
	`pc_memos` MEDIUMTEXT NULL COLLATE 'utf8mb4_general_ci',
	`pc_days_of_week` MEDIUMTEXT NULL COLLATE 'utf8mb4_general_ci',
	`ptc_ids` MEDIUMTEXT NULL COLLATE 'utf8mb4_general_ci',
	`manager_day_of_week_ids` MEDIUMTEXT NULL COLLATE 'utf8mb4_general_ci',
	`manager_days_of_week` MEDIUMTEXT NULL COLLATE 'utf8mb4_general_ci'
) ENGINE=MyISAM;

--  ビュー houday.children_facility_all2_v の構造をダンプしています
-- VIEW 依存エラーを克服するために、一時テーブルを作成
CREATE TABLE `children_facility_all2_v` (
	`children_id` INT(11) NOT NULL,
	`children_name` VARCHAR(100) NOT NULL COLLATE 'utf8mb4_general_ci',
	`is_delete` TINYINT(4) NOT NULL,
	`children_pronunciation` VARCHAR(10) NULL COLLATE 'utf8mb4_general_ci',
	`children_notes` TEXT NULL COLLATE 'utf8mb4_general_ci',
	`children_type_id` INT(11) NOT NULL,
	`children_type_name` VARCHAR(50) NULL COLLATE 'utf8mb4_general_ci',
	`facility_ids` MEDIUMTEXT NULL COLLATE 'utf8mb4_general_ci',
	`facility_names` MEDIUMTEXT NULL COLLATE 'utf8mb4_general_ci',
	`pc_ids` MEDIUMTEXT NULL COLLATE 'utf8mb4_general_ci',
	`pc_names` MEDIUMTEXT NULL COLLATE 'utf8mb4_general_ci',
	`pc_explanations` MEDIUMTEXT NULL COLLATE 'utf8mb4_general_ci',
	`pc_memos` MEDIUMTEXT NULL COLLATE 'utf8mb4_general_ci',
	`pc_days_of_week` MEDIUMTEXT NULL COLLATE 'utf8mb4_general_ci',
	`ptc_ids` MEDIUMTEXT NULL COLLATE 'utf8mb4_general_ci',
	`manager_day_of_week_ids` MEDIUMTEXT NULL COLLATE 'utf8mb4_general_ci',
	`manager_days_of_week` MEDIUMTEXT NULL COLLATE 'utf8mb4_general_ci'
) ENGINE=MyISAM;

--  テーブル houday.children_type の構造をダンプしています
CREATE TABLE IF NOT EXISTS `children_type` (
  `id` int(11) NOT NULL,
  `name` varchar(50) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- エクスポートするデータが選択されていません

--  テーブル houday.child_records の構造をダンプしています
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
) ENGINE=InnoDB AUTO_INCREMENT=50 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- エクスポートするデータが選択されていません

--  ビュー houday.child_records_v の構造をダンプしています
-- VIEW 依存エラーを克服するために、一時テーブルを作成
CREATE TABLE `child_records_v` (
	`id` INT(11) NOT NULL,
	`date` DATE NOT NULL,
	`children_id` INT(11) NOT NULL,
	`child_name` VARCHAR(100) NULL COLLATE 'utf8mb4_general_ci',
	`child_type_name` VARCHAR(50) NULL COLLATE 'utf8mb4_general_ci',
	`record_type_id` INT(11) NOT NULL,
	`record_type_name` VARCHAR(100) NULL COLLATE 'utf8mb4_general_ci',
	`facility_id` INT(11) NOT NULL,
	`facility_name` VARCHAR(250) NULL COLLATE 'utf8mb4_general_ci',
	`score` INT(11) NULL,
	`mistakes` INT(11) NULL,
	`memo1` VARCHAR(255) NULL COLLATE 'utf8mb4_general_ci',
	`memo2` TEXT NULL COLLATE 'utf8mb4_general_ci',
	`created_at` DATETIME NULL,
	`updated_at` DATETIME NULL
) ENGINE=MyISAM;

--  テーブル houday.day_of_week の構造をダンプしています
CREATE TABLE IF NOT EXISTS `day_of_week` (
  `id` tinyint(4) NOT NULL,
  `label_jp` varchar(10) NOT NULL,
  `label_en` varchar(10) DEFAULT NULL,
  `sort_order` tinyint(4) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- エクスポートするデータが選択されていません

--  ビュー houday.experience_children_v の構造をダンプしています
-- VIEW 依存エラーを克服するために、一時テーブルを作成
CREATE TABLE `experience_children_v` (
	`children_id` INT(11) NOT NULL,
	`children_name` VARCHAR(100) NOT NULL COLLATE 'utf8mb4_general_ci',
	`notes` TEXT NULL COLLATE 'utf8mb4_general_ci',
	`is_delete` TINYINT(4) NOT NULL,
	`pronunciation_id` INT(11) NULL COMMENT '検索文字（ひらがな）',
	`children_type_id` INT(11) NOT NULL,
	`pc_id` INT(11) NULL,
	`pc_name` VARCHAR(50) NULL COLLATE 'utf8mb4_general_ci',
	`explanation` VARCHAR(50) NULL COLLATE 'utf8mb4_general_ci',
	`memo` VARCHAR(255) NULL COLLATE 'utf8mb4_general_ci',
	`facility_id` INT(11) NULL,
	`ptc_id` INT(11) NULL
) ENGINE=MyISAM;

--  テーブル houday.facilitys の構造をダンプしています
CREATE TABLE IF NOT EXISTS `facilitys` (
  `id` int(11) NOT NULL,
  `name` varchar(250) DEFAULT NULL,
  `url` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- エクスポートするデータが選択されていません

--  テーブル houday.facility_children の構造をダンプしています
CREATE TABLE IF NOT EXISTS `facility_children` (
  `facility_id` int(11) NOT NULL,
  `children_id` int(11) NOT NULL,
  PRIMARY KEY (`facility_id`,`children_id`),
  KEY `FK__childrens` (`children_id`),
  CONSTRAINT `FK__childrens` FOREIGN KEY (`children_id`) REFERENCES `children` (`id`) ON DELETE CASCADE,
  CONSTRAINT `FK__facility` FOREIGN KEY (`facility_id`) REFERENCES `facilitys` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- エクスポートするデータが選択されていません

--  テーブル houday.facility_staff の構造をダンプしています
CREATE TABLE IF NOT EXISTS `facility_staff` (
  `facility_id` int(11) NOT NULL,
  `staff_id` int(11) NOT NULL,
  PRIMARY KEY (`facility_id`,`staff_id`),
  KEY `FK_facility_staff_staffs` (`staff_id`),
  CONSTRAINT `FK_facility_staff_facilitys` FOREIGN KEY (`facility_id`) REFERENCES `facilitys` (`id`) ON DELETE CASCADE,
  CONSTRAINT `FK_facility_staff_staffs` FOREIGN KEY (`staff_id`) REFERENCES `staffs` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- エクスポートするデータが選択されていません

--  プロシージャ houday.GetChildKadaiGraph の構造をダンプしています
DELIMITER //
CREATE PROCEDURE `GetChildKadaiGraph`(
    IN p_children_id INT,
    IN p_record_type_id INT
)
BEGIN
    SELECT 
        cr.id AS id,
        cr.date AS date,
        cr.children_id AS children_id,
        c.name AS child_name,
        ct.name AS child_type_name,
        cr.record_type_id AS record_type_id,
        rt.name AS record_type_name,
        cr.facility_id AS facility_id,
        f.name AS facility_name,
        cr.score AS score,
        cr.mistakes AS mistakes,
        cr.memo1 AS memo1,
        cr.memo2 AS memo2,
        cr.created_at AS created_at,
        cr.updated_at AS updated_at
    FROM child_records cr
        LEFT JOIN children c ON cr.children_id = c.id
        LEFT JOIN children_type ct ON c.children_type_id = ct.id
        LEFT JOIN record_types rt ON cr.record_type_id = rt.id
        LEFT JOIN facilitys f ON cr.facility_id = f.id
    WHERE
        (p_children_id IS NULL OR cr.children_id = p_children_id)
        AND (p_record_type_id IS NULL OR cr.record_type_id = p_record_type_id)
    ORDER BY
        cr.date ASC;
END//
DELIMITER ;

--  プロシージャ houday.GetChildrenByStaff2 の構造をダンプしています
DELIMITER //
CREATE PROCEDURE `GetChildrenByStaff2`(
	IN `p_staff_id` INT,
	IN `p_day` TINYINT
)
BEGIN
    SELECT 
        v.*
    FROM children_facility2_v v
        INNER JOIN managers2 m
            ON v.children_id = m.children_id
    WHERE 
        m.staff_id = p_staff_id
        AND (
            p_day IS NULL
            OR m.day_of_week_id = p_day
        )
    ORDER BY v.children_name ASC;
END//
DELIMITER ;

--  プロシージャ houday.GetchildrenByStaffAndDay2 の構造をダンプしています
DELIMITER //
CREATE PROCEDURE `GetchildrenByStaffAndDay2`(
    IN `p_staff_id` INT,
    IN `p_day` TINYINT
)
BEGIN
    SELECT 
        c.id AS `children_id`,
        c.name AS `children_name`,
        c.pronunciation_id AS `children_pronunciation_id`,
        p.pronunciation AS `children_pronunciation`,
        c.notes,
        c.children_type_id AS `children_type_id`,
        ct.name AS `children_type_name`,

        pc.id AS `pc_id`,
        pc.name AS `pc_name`,
        pc.explanation AS `pc_explanation`,
        pc.memo AS `pc_memo`,
        ptc.day_of_week AS `pc_day_of_week`,
        ptc.id AS `ptc_id`,
        ptc.start_time AS start_time,
        ptc.end_time AS end_time

    FROM children c
        INNER JOIN managers2 m
            ON c.id = m.children_id
        INNER JOIN staffs s
            ON m.staff_id = s.id
        LEFT JOIN pc_to_children ptc 
            ON c.id = ptc.children_id
            AND (
                p_day IS NULL
                OR ptc.day_of_week = p_day
                OR ptc.day_of_week IS NULL
            )
        LEFT JOIN pc
            ON ptc.pc_id = pc.id
        LEFT JOIN pronunciation p
            ON c.pronunciation_id = p.id
        LEFT JOIN children_type ct
            ON c.children_type_id = ct.id
    WHERE 
        s.id = p_staff_id
        AND (
            p_day IS NULL
            OR m.day_of_week_id = p_day
        )
    ORDER BY c.name ASC;
END//
DELIMITER ;

--  プロシージャ houday.get_children_by_facility_id の構造をダンプしています
DELIMITER //
CREATE PROCEDURE `get_children_by_facility_id`(
    IN `p_facility_id` INT
)
BEGIN
    SELECT
        children_id,
        children_name,
        is_delete,
        children_pronunciation,
        children_notes,
        children_type_id,
        children_type_name,
        facility_ids,
        facility_names,
        pc_ids,
        pc_names,
        pc_explanations,
        pc_memos,
        pc_days_of_week,
        ptc_ids,
        manager_day_of_week_ids,
        manager_days_of_week
    FROM
        children_facility2_v
    WHERE
        FIND_IN_SET(p_facility_id, facility_ids);
END//
DELIMITER ;

--  プロシージャ houday.Get_waiting_children_pc の構造をダンプしています
DELIMITER //
CREATE PROCEDURE `Get_waiting_children_pc`(
	IN `in_facility_id` INT
)
BEGIN
    SELECT
        c.id AS children_id,
        c.name AS children_name,
        c.notes AS notes,
        c.is_delete AS is_delete,
        c.pronunciation_id AS pronunciation_id,
        c.children_type_id AS children_type_id,
        p.id AS pc_id,
        p.name AS pc_name,
        p.explanation AS explanation,
        p.memo AS memo,
        p.facility_id AS pc_facility_id,
        ptc.id AS ptc_id,
        f.id AS facility_id,
        f.name AS facility_name
    FROM
        facility_children fc
        INNER JOIN facilitys f ON fc.facility_id = f.id
        INNER JOIN children c ON fc.children_id = c.id
        LEFT JOIN pc_to_children ptc ON c.id = ptc.children_id
        LEFT JOIN pc p ON ptc.pc_id = p.id
    WHERE
        c.children_type_id = 2
        AND fc.facility_id = in_facility_id
        AND c.is_delete = 0;
END//
DELIMITER ;

--  プロシージャ houday.insert_child_with_facility の構造をダンプしています
DELIMITER //
CREATE PROCEDURE `insert_child_with_facility`(
    IN p_child_id INT,
    IN p_name VARCHAR(100),
    IN p_notes TEXT,
    IN p_pronunciation_id INT,
    IN p_children_type_id INT,
    IN p_facility_ids TEXT  -- カンマ区切り文字列 ("1,3,5" など)
)
BEGIN
    DECLARE v_exists INT DEFAULT 0;
    DECLARE v_facility_id INT;
    DECLARE v_pos INT DEFAULT 0;
    DECLARE v_facility_list TEXT;
    DECLARE v_facility_count INT DEFAULT 0;

    -- ローカル変数として宣言
    DECLARE v_errno INT DEFAULT 0;
    DECLARE v_errmsg TEXT;
    DECLARE v_fullmsg TEXT;

    -- 例外ハンドラ（詳細エラー付き）
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        GET DIAGNOSTICS CONDITION 1
            v_errno = MYSQL_ERRNO,
            v_errmsg = MESSAGE_TEXT;

        SET v_fullmsg = CONCAT('児童登録処理中にエラーが発生しました: ', v_errno, ' - ', v_errmsg);

        ROLLBACK;
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = v_fullmsg;
    END;

    START TRANSACTION;

    -- ① すでに児童IDが存在するか確認
    SELECT COUNT(*) INTO v_exists
    FROM children
    WHERE id = p_child_id;

    IF v_exists > 0 THEN
        ROLLBACK;
        SIGNAL SQLSTATE '45001'
            SET MESSAGE_TEXT = '指定した児童IDはすでに登録されています。';
    END IF;

    -- ② 児童登録
    INSERT INTO children (
        id, name, notes, pronunciation_id, children_type_id, is_delete
    )
    VALUES (
        p_child_id, p_name, p_notes, p_pronunciation_id, p_children_type_id, 0
    );

    -- ③ カンマ区切りの施設IDをパースしてループ挿入
    SET v_facility_list = CONCAT(p_facility_ids, ',');  -- 最後にカンマを追加
    SET v_pos = LOCATE(',', v_facility_list);

    WHILE v_pos > 0 DO
        SET v_facility_id = CAST(TRIM(SUBSTRING(v_facility_list, 1, v_pos - 1)) AS UNSIGNED);
        IF v_facility_id IS NOT NULL AND v_facility_id > 0 THEN
            INSERT INTO facility_children (facility_id, children_id)
            VALUES (v_facility_id, p_child_id);
            SET v_facility_count = v_facility_count + 1;
        END IF;
        SET v_facility_list = SUBSTRING(v_facility_list, v_pos + 1);
        SET v_pos = LOCATE(',', v_facility_list);
    END WHILE;

    IF v_facility_count = 0 THEN
        ROLLBACK;
        SIGNAL SQLSTATE '45002'
            SET MESSAGE_TEXT = '施設IDが無効または空です。';
    END IF;

    COMMIT;
END//
DELIMITER ;

--  プロシージャ houday.insert_manager_p の構造をダンプしています
DELIMITER //
CREATE PROCEDURE `insert_manager_p`(
  IN p_child_id INT,
  IN p_child_name VARCHAR(255),
  IN p_notes TEXT,
  IN p_pronunciation_id INT,
  IN p_children_type_id INT,
  IN p_staff_id INT,
  IN p_facility_id INT,
  IN p_day_of_week_id TINYINT,
  IN p_priority TINYINT
)
BEGIN
  DECLARE v_exists_child INT;

  START TRANSACTION;

  -- ① children 存在チェック
  SELECT COUNT(*) INTO v_exists_child
  FROM children
  WHERE id = p_child_id;

  IF v_exists_child = 0 THEN
    INSERT INTO children (
      id,
      name,
      notes,
      pronunciation_id,
      children_type_id
    ) VALUES (
      p_child_id,
      p_child_name,
      p_notes,
      p_pronunciation_id,
      p_children_type_id
    );
  END IF;

  -- ② facility_children 存在チェック
  IF NOT EXISTS (
    SELECT 1
    FROM facility_children
    WHERE children_id = p_child_id
      AND facility_id = p_facility_id
  ) THEN
    INSERT INTO facility_children (
      children_id,
      facility_id
    ) VALUES (
      p_child_id,
      p_facility_id
    );
  END IF;

  -- ③ managers2：1曜日1レコード upsert
  INSERT INTO managers2 (
    children_id,
    staff_id,
    day_of_week_id,
    priority
  ) VALUES (
    p_child_id,
    p_staff_id,
    p_day_of_week_id,
    p_priority
  )
  ON DUPLICATE KEY UPDATE
    priority = p_priority;

  COMMIT;
END//
DELIMITER ;

--  テーブル houday.managers2 の構造をダンプしています
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

-- エクスポートするデータが選択されていません

--  ビュー houday.managers2_pri_v の構造をダンプしています
-- VIEW 依存エラーを克服するために、一時テーブルを作成
CREATE TABLE `managers2_pri_v` (
	`children_id` INT(11) NOT NULL,
	`children_name` VARCHAR(100) NOT NULL COLLATE 'utf8mb4_general_ci',
	`staff_id` INT(11) NOT NULL,
	`staff_name` VARCHAR(50) NOT NULL COLLATE 'utf8mb4_general_ci',
	`day_of_week_id` TINYINT(4) NOT NULL,
	`day_of_week_label` VARCHAR(10) NOT NULL COLLATE 'utf8mb4_general_ci',
	`day_sort_order` TINYINT(4) NOT NULL,
	`priority` TINYINT(4) NOT NULL
) ENGINE=MyISAM;

--  ビュー houday.managers2_v の構造をダンプしています
-- VIEW 依存エラーを克服するために、一時テーブルを作成
CREATE TABLE `managers2_v` (
	`children_id` INT(11) NOT NULL,
	`children_name` VARCHAR(100) NOT NULL COLLATE 'utf8mb4_general_ci',
	`staff_id` INT(11) NOT NULL,
	`staff_name` VARCHAR(50) NOT NULL COLLATE 'utf8mb4_general_ci',
	`day_of_week` MEDIUMTEXT NULL COLLATE 'utf8mb4_general_ci',
	`day_of_week_id` MEDIUMTEXT NULL COLLATE 'utf8mb4_general_ci'
) ENGINE=MyISAM;

--  テーブル houday.memo の構造をダンプしています
CREATE TABLE IF NOT EXISTS `memo` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `title` varchar(250) NOT NULL DEFAULT '',
  `content` text NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- エクスポートするデータが選択されていません

--  テーブル houday.m_service_items の構造をダンプしています
CREATE TABLE IF NOT EXISTS `m_service_items` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(50) NOT NULL DEFAULT '',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- エクスポートするデータが選択されていません

--  テーブル houday.pc の構造をダンプしています
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

-- エクスポートするデータが選択されていません

--  テーブル houday.pc_to_children の構造をダンプしています
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
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- エクスポートするデータが選択されていません

--  ビュー houday.pc_to_children_v の構造をダンプしています
-- VIEW 依存エラーを克服するために、一時テーブルを作成
CREATE TABLE `pc_to_children_v` (
	`id` INT(11) NOT NULL,
	`pc_id` INT(11) NOT NULL,
	`pcid` INT(11) NOT NULL,
	`pc_name` VARCHAR(50) NOT NULL COLLATE 'utf8mb4_general_ci',
	`pc_explanation` VARCHAR(50) NULL COLLATE 'utf8mb4_general_ci',
	`children_id` INT(11) NOT NULL,
	`children_name` VARCHAR(100) NOT NULL COLLATE 'utf8mb4_general_ci',
	`day_of_week` TINYINT(4) NULL,
	`facility_name` VARCHAR(250) NULL COLLATE 'utf8mb4_general_ci',
	`start_time` TIME NULL,
	`end_time` TIME NULL
) ENGINE=MyISAM;

--  テーブル houday.pronunciation の構造をダンプしています
CREATE TABLE IF NOT EXISTS `pronunciation` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `pronunciation` varchar(10) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=47 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- エクスポートするデータが選択されていません

--  テーブル houday.record_types の構造をダンプしています
CREATE TABLE IF NOT EXISTS `record_types` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `memo` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- エクスポートするデータが選択されていません

--  テーブル houday.refresh_tokens の構造をダンプしています
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
) ENGINE=InnoDB AUTO_INCREMENT=20 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- エクスポートするデータが選択されていません

--  テーブル houday.service_record の構造をダンプしています
CREATE TABLE IF NOT EXISTS `service_record` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT COMMENT 'サービス記録ID',
  `children_id` int(11) NOT NULL COMMENT '利用者ID',
  `day_of_week_id` tinyint(4) NOT NULL,
  `item_id` int(11) NOT NULL COMMENT 'サービス種別ID',
  `served_date` date NOT NULL COMMENT '提供日時',
  `facility_id` int(11) NOT NULL COMMENT '場所ID',
  `note` longtext CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT NULL COMMENT 'メモ',
  `is_copy` int(11) NOT NULL DEFAULT 0 COMMENT '管理日誌に転記するかどうか(1真　0偽)',
  `is_deleted` tinyint(4) NOT NULL DEFAULT 0 COMMENT '論理削除(削除1　有効0)',
  `recorded_staff_id` int(11) NOT NULL DEFAULT -1 COMMENT '担当者ID',
  `created_at` datetime NOT NULL DEFAULT current_timestamp() COMMENT '作成日時',
  `updated_staff_id` int(11) NOT NULL DEFAULT -1 COMMENT '更新者ID',
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp() COMMENT '更新日時',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE KEY `children_id_day_of_week_id_item_id_served_time` (`children_id`,`day_of_week_id`,`item_id`,`served_date`) USING BTREE,
  KEY `item_id` (`item_id`) USING BTREE,
  KEY `FK_service_record_day_of_week` (`day_of_week_id`),
  KEY `FK_service_record_facilitys` (`facility_id`),
  CONSTRAINT `FK_service_record_children` FOREIGN KEY (`children_id`) REFERENCES `children` (`id`) ON DELETE CASCADE,
  CONSTRAINT `FK_service_record_day_of_week` FOREIGN KEY (`day_of_week_id`) REFERENCES `day_of_week` (`id`) ON DELETE CASCADE,
  CONSTRAINT `FK_service_record_facilitys` FOREIGN KEY (`facility_id`) REFERENCES `facilitys` (`id`) ON DELETE CASCADE,
  CONSTRAINT `service_record_ibfk_1` FOREIGN KEY (`item_id`) REFERENCES `m_service_items` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='サービス全体記録';

-- エクスポートするデータが選択されていません

--  テーブル houday.staffs の構造をダンプしています
CREATE TABLE IF NOT EXISTS `staffs` (
  `id` int(11) NOT NULL,
  `name` varchar(50) NOT NULL,
  `notes` text NOT NULL DEFAULT '',
  `is_delete` tinyint(4) NOT NULL DEFAULT 0,
  `admin` tinyint(4) DEFAULT NULL,
  `leaving_at` date DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- エクスポートするデータが選択されていません

--  ビュー houday.staff_all_v の構造をダンプしています
-- VIEW 依存エラーを克服するために、一時テーブルを作成
CREATE TABLE `staff_all_v` (
	`staff_id` INT(11) NOT NULL,
	`staff_admin` TINYINT(4) NULL,
	`staff_name` VARCHAR(50) NOT NULL COLLATE 'utf8mb4_general_ci',
	`notes` TEXT NOT NULL COLLATE 'utf8mb4_general_ci',
	`is_delete` TINYINT(4) NOT NULL,
	`facility_ids` MEDIUMTEXT NULL COLLATE 'utf8mb4_general_ci',
	`facility_names` MEDIUMTEXT NULL COLLATE 'utf8mb4_general_ci'
) ENGINE=MyISAM;

--  ビュー houday.staff_facility_v の構造をダンプしています
-- VIEW 依存エラーを克服するために、一時テーブルを作成
CREATE TABLE `staff_facility_v` (
	`staff_id` INT(11) NOT NULL,
	`staff_admin` TINYINT(4) NULL,
	`staff_name` VARCHAR(50) NOT NULL COLLATE 'utf8mb4_general_ci',
	`notes` TEXT NOT NULL COLLATE 'utf8mb4_general_ci',
	`is_delete` TINYINT(4) NOT NULL,
	`facility_ids` MEDIUMTEXT NULL COLLATE 'utf8mb4_general_ci',
	`facility_names` MEDIUMTEXT NULL COLLATE 'utf8mb4_general_ci'
) ENGINE=MyISAM;

--  ビュー houday.staff_v の構造をダンプしています
-- VIEW 依存エラーを克服するために、一時テーブルを作成
CREATE TABLE `staff_v` (
	`staff_id` INT(11) NOT NULL,
	`staff_admin` TINYINT(4) NULL,
	`staff_name` VARCHAR(50) NOT NULL COLLATE 'utf8mb4_general_ci',
	`notes` TEXT NOT NULL COLLATE 'utf8mb4_general_ci',
	`is_delete` TINYINT(4) NOT NULL,
	`facility_ids` MEDIUMTEXT NULL COLLATE 'utf8mb4_general_ci',
	`facility_names` MEDIUMTEXT NULL COLLATE 'utf8mb4_general_ci'
) ENGINE=MyISAM;

--  テーブル houday.text_data の構造をダンプしています
CREATE TABLE IF NOT EXISTS `text_data` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `genre` varchar(255) NOT NULL,
  `group` varchar(255) NOT NULL,
  `sort` int(10) unsigned NOT NULL,
  `value` text NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=32 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- エクスポートするデータが選択されていません

--  テーブル houday.toolbox の構造をダンプしています
CREATE TABLE IF NOT EXISTS `toolbox` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL COMMENT 'ツール名（例：マイクラコマンド集）',
  `description` varchar(255) DEFAULT NULL COMMENT 'ツールの説明（任意）',
  `layout` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL COMMENT 'Excel風レイアウトの行データをJSONで保存' CHECK (json_valid(`layout`)),
  `is_tools` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `permission` tinyint(10) NOT NULL DEFAULT 0,
  `facility_id` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FK_toolbox_facilitys` (`facility_id`),
  CONSTRAINT `FK_toolbox_facilitys` FOREIGN KEY (`facility_id`) REFERENCES `facilitys` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

-- エクスポートするデータが選択されていません

--  プロシージャ houday.UpsertServiceRecord の構造をダンプしています
DELIMITER //
CREATE PROCEDURE `UpsertServiceRecord`(
    IN p_children_id INT,
    IN p_day_of_week_id TINYINT,
    IN p_item_id INT,
    IN p_served_date DATE,
    IN p_facility_id INT,
    IN p_note LONGTEXT,
    IN p_is_copy INT,
    IN p_is_deleted TINYINT,
    IN p_recorded_staff_id INT,
    IN p_updated_staff_id INT
)
BEGIN
    INSERT INTO service_record (
        children_id,
        day_of_week_id,
        item_id,
        served_date,
        facility_id,
        note,
        is_copy,
        is_deleted,
        recorded_staff_id,
        created_at,
        updated_staff_id,
        updated_at
    )
    VALUES (
        p_children_id,
        p_day_of_week_id,
        p_item_id,
        p_served_date,
        p_facility_id,
        p_note,
        p_is_copy,
        p_is_deleted,
        p_recorded_staff_id,
        CURRENT_TIMESTAMP,
        p_updated_staff_id,
        CURRENT_TIMESTAMP
    )
    ON DUPLICATE KEY UPDATE
        facility_id = VALUES(facility_id),
        note = VALUES(note),
        is_copy = VALUES(is_copy),
        is_deleted = VALUES(is_deleted),
        updated_staff_id = VALUES(updated_staff_id),
        updated_at = CURRENT_TIMESTAMP;
END//
DELIMITER ;

--  プロシージャ houday.upsert_managers2 の構造をダンプしています
DELIMITER //
CREATE PROCEDURE `upsert_managers2`(
  IN p_children_id INT,
  IN p_staff_id INT,
  IN p_day_of_week_id TINYINT,
  IN p_priority TINYINT
)
BEGIN
  START TRANSACTION;

  INSERT INTO managers2 (
    children_id,
    staff_id,
    day_of_week_id,
    priority
  )
  VALUES (
    p_children_id,
    p_staff_id,
    p_day_of_week_id,
    p_priority
  )
  ON DUPLICATE KEY UPDATE
    priority = p_priority;

  COMMIT;
END//
DELIMITER ;

--  テーブル houday.users の構造をダンプしています
CREATE TABLE IF NOT EXISTS `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) DEFAULT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  `leaving_at` date DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- エクスポートするデータが選択されていません

-- 一時テーブルを削除して、最終的な VIEW 構造を作成
DROP TABLE IF EXISTS `children_facility2_v`;
CREATE ALGORITHM=UNDEFINED SQL SECURITY DEFINER VIEW `children_facility2_v` AS select `c`.`id` AS `children_id`,`c`.`name` AS `children_name`,`c`.`is_delete` AS `is_delete`,`p`.`pronunciation` AS `children_pronunciation`,`c`.`notes` AS `children_notes`,`c`.`children_type_id` AS `children_type_id`,`ct`.`name` AS `children_type_name`,group_concat(distinct `f`.`id` order by `f`.`id` ASC separator ',') AS `facility_ids`,group_concat(distinct `f`.`name` order by `f`.`name` ASC separator ',') AS `facility_names`,group_concat(distinct `pc`.`id` order by `pc`.`id` ASC separator ',') AS `pc_ids`,group_concat(distinct `pc`.`name` order by `pc`.`name` ASC separator ',') AS `pc_names`,group_concat(distinct `pc`.`explanation` order by `pc`.`id` ASC separator ',') AS `pc_explanations`,group_concat(distinct `pc`.`memo` order by `pc`.`id` ASC separator ',') AS `pc_memos`,group_concat(distinct `ptc`.`day_of_week` order by `ptc`.`day_of_week` ASC separator ',') AS `pc_days_of_week`,group_concat(distinct `ptc`.`id` order by `ptc`.`id` ASC separator ',') AS `ptc_ids`,group_concat(distinct `m`.`day_of_week_id` order by `d`.`sort_order` ASC separator ',') AS `manager_day_of_week_ids`,group_concat(distinct `d`.`label_jp` order by `d`.`sort_order` ASC separator ',') AS `manager_days_of_week` from ((((((((`children` `c` left join `pronunciation` `p` on(`c`.`pronunciation_id` = `p`.`id`)) left join `facility_children` `fc` on(`c`.`id` = `fc`.`children_id`)) left join `facilitys` `f` on(`fc`.`facility_id` = `f`.`id`)) left join `pc_to_children` `ptc` on(`c`.`id` = `ptc`.`children_id`)) left join `pc` on(`ptc`.`pc_id` = `pc`.`id`)) left join `children_type` `ct` on(`c`.`children_type_id` = `ct`.`id`)) left join `managers2` `m` on(`c`.`id` = `m`.`children_id`)) left join `day_of_week` `d` on(`m`.`day_of_week_id` = `d`.`id`)) where `c`.`children_type_id` <> -1 and `c`.`is_delete` <> 1 group by `c`.`id`,`c`.`name`,`p`.`pronunciation`,`c`.`notes`,`c`.`children_type_id`,`ct`.`name` order by `p`.`id`,`c`.`name`;

-- 一時テーブルを削除して、最終的な VIEW 構造を作成
DROP TABLE IF EXISTS `children_facility_all2_v`;
CREATE ALGORITHM=UNDEFINED SQL SECURITY DEFINER VIEW `children_facility_all2_v` AS select `c`.`id` AS `children_id`,`c`.`name` AS `children_name`,`c`.`is_delete` AS `is_delete`,`p`.`pronunciation` AS `children_pronunciation`,`c`.`notes` AS `children_notes`,`c`.`children_type_id` AS `children_type_id`,`ct`.`name` AS `children_type_name`,group_concat(distinct `f`.`id` order by `f`.`id` ASC separator ',') AS `facility_ids`,group_concat(distinct `f`.`name` order by `f`.`name` ASC separator ',') AS `facility_names`,group_concat(distinct `pc`.`id` order by `pc`.`id` ASC separator ',') AS `pc_ids`,group_concat(distinct `pc`.`name` order by `pc`.`name` ASC separator ',') AS `pc_names`,group_concat(distinct `pc`.`explanation` order by `pc`.`id` ASC separator ',') AS `pc_explanations`,group_concat(distinct `pc`.`memo` order by `pc`.`id` ASC separator ',') AS `pc_memos`,group_concat(distinct `ptc`.`day_of_week` order by `ptc`.`day_of_week` ASC separator ',') AS `pc_days_of_week`,group_concat(distinct `ptc`.`id` order by `ptc`.`id` ASC separator ',') AS `ptc_ids`,group_concat(distinct `m`.`day_of_week_id` order by `d`.`sort_order` ASC separator ',') AS `manager_day_of_week_ids`,group_concat(distinct `d`.`label_jp` order by `d`.`sort_order` ASC separator ',') AS `manager_days_of_week` from ((((((((`children` `c` left join `pronunciation` `p` on(`c`.`pronunciation_id` = `p`.`id`)) left join `facility_children` `fc` on(`c`.`id` = `fc`.`children_id`)) left join `facilitys` `f` on(`fc`.`facility_id` = `f`.`id`)) left join `pc_to_children` `ptc` on(`c`.`id` = `ptc`.`children_id`)) left join `pc` on(`ptc`.`pc_id` = `pc`.`id`)) left join `children_type` `ct` on(`c`.`children_type_id` = `ct`.`id`)) left join `managers2` `m` on(`c`.`id` = `m`.`children_id`)) left join `day_of_week` `d` on(`m`.`day_of_week_id` = `d`.`id`)) where `c`.`children_type_id` <> -1 group by `c`.`id`,`c`.`name`,`p`.`pronunciation`,`c`.`notes`,`c`.`children_type_id`,`ct`.`name` order by `p`.`id`,`c`.`name`;

-- 一時テーブルを削除して、最終的な VIEW 構造を作成
DROP TABLE IF EXISTS `child_records_v`;
CREATE ALGORITHM=UNDEFINED SQL SECURITY DEFINER VIEW `child_records_v` AS select `cr`.`id` AS `id`,`cr`.`date` AS `date`,`cr`.`children_id` AS `children_id`,`c`.`name` AS `child_name`,`ct`.`name` AS `child_type_name`,`cr`.`record_type_id` AS `record_type_id`,`rt`.`name` AS `record_type_name`,`cr`.`facility_id` AS `facility_id`,`f`.`name` AS `facility_name`,`cr`.`score` AS `score`,`cr`.`mistakes` AS `mistakes`,`cr`.`memo1` AS `memo1`,`cr`.`memo2` AS `memo2`,`cr`.`created_at` AS `created_at`,`cr`.`updated_at` AS `updated_at` from ((((`child_records` `cr` left join `children` `c` on(`cr`.`children_id` = `c`.`id`)) left join `children_type` `ct` on(`c`.`children_type_id` = `ct`.`id`)) left join `record_types` `rt` on(`cr`.`record_type_id` = `rt`.`id`)) left join `facilitys` `f` on(`cr`.`facility_id` = `f`.`id`)) order by `cr`.`date` desc;

-- 一時テーブルを削除して、最終的な VIEW 構造を作成
DROP TABLE IF EXISTS `experience_children_v`;
CREATE ALGORITHM=UNDEFINED SQL SECURITY DEFINER VIEW `experience_children_v` AS select `c`.`id` AS `children_id`,`c`.`name` AS `children_name`,`c`.`notes` AS `notes`,`c`.`is_delete` AS `is_delete`,`c`.`pronunciation_id` AS `pronunciation_id`,`c`.`children_type_id` AS `children_type_id`,`p`.`id` AS `pc_id`,`p`.`name` AS `pc_name`,`p`.`explanation` AS `explanation`,`p`.`memo` AS `memo`,`p`.`facility_id` AS `facility_id`,`ptc`.`id` AS `ptc_id` from ((`children` `c` left join `pc_to_children` `ptc` on(`c`.`id` = `ptc`.`children_id`)) left join `pc` `p` on(`ptc`.`pc_id` = `p`.`id`)) where `c`.`children_type_id` = -1;

-- 一時テーブルを削除して、最終的な VIEW 構造を作成
DROP TABLE IF EXISTS `managers2_pri_v`;
CREATE ALGORITHM=UNDEFINED SQL SECURITY DEFINER VIEW `managers2_pri_v` AS select `m`.`children_id` AS `children_id`,`c`.`name` AS `children_name`,`m`.`staff_id` AS `staff_id`,`s`.`name` AS `staff_name`,`m`.`day_of_week_id` AS `day_of_week_id`,`d`.`label_jp` AS `day_of_week_label`,`d`.`sort_order` AS `day_sort_order`,`m`.`priority` AS `priority` from (((`managers2` `m` join `children` `c` on(`c`.`id` = `m`.`children_id`)) join `staffs` `s` on(`s`.`id` = `m`.`staff_id`)) join `day_of_week` `d` on(`d`.`id` = `m`.`day_of_week_id`));

-- 一時テーブルを削除して、最終的な VIEW 構造を作成
DROP TABLE IF EXISTS `managers2_v`;
CREATE ALGORITHM=UNDEFINED SQL SECURITY DEFINER VIEW `managers2_v` AS select `c`.`id` AS `children_id`,`c`.`name` AS `children_name`,`s`.`id` AS `staff_id`,`s`.`name` AS `staff_name`,group_concat(`d`.`label_jp` order by `d`.`sort_order` ASC separator ',') AS `day_of_week`,group_concat(`m`.`day_of_week_id` order by `d`.`sort_order` ASC separator ',') AS `day_of_week_id` from (((`managers2` `m` join `children` `c` on(`m`.`children_id` = `c`.`id`)) join `staffs` `s` on(`m`.`staff_id` = `s`.`id`)) join `day_of_week` `d` on(`m`.`day_of_week_id` = `d`.`id`)) group by `c`.`id`,`c`.`name`,`s`.`id`,`s`.`name` order by `c`.`id`,`s`.`id`;

-- 一時テーブルを削除して、最終的な VIEW 構造を作成
DROP TABLE IF EXISTS `pc_to_children_v`;
CREATE ALGORITHM=UNDEFINED SQL SECURITY DEFINER VIEW `pc_to_children_v` AS select `ptc`.`id` AS `id`,`p`.`pc_id` AS `pc_id`,`p`.`id` AS `pcid`,`p`.`name` AS `pc_name`,`p`.`explanation` AS `pc_explanation`,`c`.`id` AS `children_id`,`c`.`name` AS `children_name`,`ptc`.`day_of_week` AS `day_of_week`,`f`.`name` AS `facility_name`,`ptc`.`start_time` AS `start_time`,`ptc`.`end_time` AS `end_time` from (((`pc_to_children` `ptc` join `pc` `p` on(`ptc`.`pc_id` = `p`.`id`)) join `children` `c` on(`ptc`.`children_id` = `c`.`id`)) join `facilitys` `f` on(`p`.`facility_id` = `f`.`id`)) order by `p`.`pc_id`;

-- 一時テーブルを削除して、最終的な VIEW 構造を作成
DROP TABLE IF EXISTS `staff_all_v`;
CREATE ALGORITHM=UNDEFINED SQL SECURITY DEFINER VIEW `staff_all_v` AS select `s`.`id` AS `staff_id`,`s`.`admin` AS `staff_admin`,`s`.`name` AS `staff_name`,`s`.`notes` AS `notes`,`s`.`is_delete` AS `is_delete`,group_concat(`f`.`id` order by `f`.`id` ASC separator ',') AS `facility_ids`,group_concat(`f`.`name` order by `f`.`name` ASC separator ', ') AS `facility_names` from ((`staffs` `s` left join `facility_staff` `fs` on(`s`.`id` = `fs`.`staff_id`)) left join `facilitys` `f` on(`fs`.`facility_id` = `f`.`id`)) where `s`.`id` <> -1 group by `s`.`id`,`s`.`name`;

-- 一時テーブルを削除して、最終的な VIEW 構造を作成
DROP TABLE IF EXISTS `staff_facility_v`;
CREATE ALGORITHM=UNDEFINED SQL SECURITY DEFINER VIEW `staff_facility_v` AS select `s`.`id` AS `staff_id`,`s`.`admin` AS `staff_admin`,`s`.`name` AS `staff_name`,`s`.`notes` AS `notes`,`s`.`is_delete` AS `is_delete`,group_concat(`f`.`id` order by `f`.`id` ASC separator ',') AS `facility_ids`,group_concat(`f`.`name` order by `f`.`name` ASC separator ', ') AS `facility_names` from ((`facility_staff` `fs` join `staffs` `s` on(`fs`.`staff_id` = `s`.`id`)) join `facilitys` `f` on(`fs`.`facility_id` = `f`.`id`)) where `s`.`id` <> -1 and `s`.`is_delete` <> 1 group by `s`.`id`,`s`.`name`;

-- 一時テーブルを削除して、最終的な VIEW 構造を作成
DROP TABLE IF EXISTS `staff_v`;
CREATE ALGORITHM=UNDEFINED SQL SECURITY DEFINER VIEW `staff_v` AS select `s`.`id` AS `staff_id`,`s`.`admin` AS `staff_admin`,`s`.`name` AS `staff_name`,`s`.`notes` AS `notes`,`s`.`is_delete` AS `is_delete`,group_concat(`f`.`id` order by `f`.`id` ASC separator ',') AS `facility_ids`,group_concat(`f`.`name` order by `f`.`name` ASC separator ', ') AS `facility_names` from ((`staffs` `s` left join `facility_staff` `fs` on(`s`.`id` = `fs`.`staff_id`)) left join `facilitys` `f` on(`fs`.`facility_id` = `f`.`id`)) where `s`.`id` <> -1 and `s`.`is_delete` <> 1 group by `s`.`id`,`s`.`name`;

/*!40103 SET TIME_ZONE=IFNULL(@OLD_TIME_ZONE, 'system') */;
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IFNULL(@OLD_FOREIGN_KEY_CHECKS, 1) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40111 SET SQL_NOTES=IFNULL(@OLD_SQL_NOTES, 1) */;
