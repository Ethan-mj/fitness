-- 健身约课系统 MySQL 8.0 初始化脚本
-- 示例管理员：admin / Fit@2026（首次验证后请立即修改密码）

CREATE DATABASE IF NOT EXISTS `fitness`
  DEFAULT CHARACTER SET utf8mb4
  DEFAULT COLLATE utf8mb4_unicode_ci;

USE `fitness`;
SET NAMES utf8mb4;
SET time_zone = '+08:00';

CREATE TABLE IF NOT EXISTS `app_users` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `nickname` VARCHAR(255) NOT NULL,
  `phone` VARCHAR(255) NULL,
  `avatar_url` VARCHAR(255) NULL,
  `password_hash` VARCHAR(255) NULL,
  `role` VARCHAR(20) NOT NULL DEFAULT 'USER',
  `remaining_lessons` INT NOT NULL DEFAULT 0,
  `created_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_app_users_nickname_role` (`nickname`, `role`),
  KEY `idx_app_users_role` (`role`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `coach` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(255) NOT NULL,
  `specialty` VARCHAR(255) NULL,
  `introduction` VARCHAR(1000) NULL,
  `avatar_url` VARCHAR(255) NULL,
  `active` TINYINT(1) NOT NULL DEFAULT 1,
  `created_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_coach_name` (`name`),
  KEY `idx_coach_active_created_at` (`active`, `created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `coach_slot` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `coach_id` BIGINT NOT NULL,
  `start_time` DATETIME(6) NOT NULL,
  `end_time` DATETIME(6) NOT NULL,
  `booked` TINYINT(1) NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_coach_slot_start` (`coach_id`, `start_time`),
  KEY `idx_coach_slot_available` (`booked`, `start_time`),
  CONSTRAINT `fk_coach_slot_coach`
    FOREIGN KEY (`coach_id`) REFERENCES `coach` (`id`)
    ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `booking` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `user_id` BIGINT NOT NULL,
  `coach_id` BIGINT NOT NULL,
  `slot_id` BIGINT NOT NULL,
  `status` VARCHAR(20) NOT NULL DEFAULT 'BOOKED',
  `created_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_booking_slot` (`slot_id`),
  KEY `idx_booking_user_created_at` (`user_id`, `created_at`),
  KEY `idx_booking_coach` (`coach_id`),
  CONSTRAINT `fk_booking_user`
    FOREIGN KEY (`user_id`) REFERENCES `app_users` (`id`)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT `fk_booking_coach`
    FOREIGN KEY (`coach_id`) REFERENCES `coach` (`id`)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT `fk_booking_slot`
    FOREIGN KEY (`slot_id`) REFERENCES `coach_slot` (`id`)
    ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `lesson_change` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `user_id` BIGINT NOT NULL,
  `operator_id` BIGINT NOT NULL,
  `amount` INT NOT NULL,
  `note` VARCHAR(255) NULL,
  `created_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  KEY `idx_lesson_change_user_created_at` (`user_id`, `created_at`),
  KEY `idx_lesson_change_operator` (`operator_id`),
  CONSTRAINT `fk_lesson_change_user`
    FOREIGN KEY (`user_id`) REFERENCES `app_users` (`id`)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT `fk_lesson_change_operator`
    FOREIGN KEY (`operator_id`) REFERENCES `app_users` (`id`)
    ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `member_avatars` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `user_id` BIGINT NOT NULL,
  `content_type` VARCHAR(50) NOT NULL,
  `content` MEDIUMBLOB NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_member_avatars_user` (`user_id`),
  CONSTRAINT `fk_member_avatars_user`
    FOREIGN KEY (`user_id`) REFERENCES `app_users` (`id`)
    ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- BCrypt 密码对应 Fit@2026。Spring Security 可识别 $2a$ 格式。
INSERT INTO `app_users`
  (`id`, `nickname`, `phone`, `avatar_url`, `password_hash`, `role`, `remaining_lessons`)
VALUES
  (1, 'admin', NULL, NULL, '$2a$10$64uRMT8/Yom5Fra2MlE25eUAoMcYApXDqBLvp5nk0rlp4h8tg0aBS', 'ADMIN', 0),
  (2, '林小满', '13800000001', NULL, NULL, 'USER', 11),
  (3, '陈一诺', '13800000002', NULL, NULL, 'USER', 8),
  (4, '周雨桐', '13800000003', NULL, NULL, 'USER', 5)
ON DUPLICATE KEY UPDATE
  `phone` = VALUES(`phone`),
  `avatar_url` = VALUES(`avatar_url`),
  `password_hash` = VALUES(`password_hash`),
  `remaining_lessons` = VALUES(`remaining_lessons`);

INSERT INTO `coach`
  (`id`, `name`, `specialty`, `introduction`, `avatar_url`, `active`)
VALUES
  (1, '陈野', '力量塑形', 'ACE 认证教练，擅长力量训练与体态改善。', 'CY', 1),
  (2, '苏晴', '普拉提 · 核心', '专注女性体态管理与核心稳定训练。', 'SQ', 1),
  (3, '周燃', '燃脂体能', '用循序渐进的训练，让运动真正成为习惯。', 'ZR', 1)
ON DUPLICATE KEY UPDATE
  `specialty` = VALUES(`specialty`),
  `introduction` = VALUES(`introduction`),
  `avatar_url` = VALUES(`avatar_url`),
  `active` = VALUES(`active`);

-- 每次在空库执行都会生成从明天开始的可预约课程。
INSERT INTO `coach_slot`
  (`id`, `coach_id`, `start_time`, `end_time`, `booked`)
VALUES
  (1, 1, DATE_ADD(DATE_ADD(CURDATE(), INTERVAL 1 DAY), INTERVAL 9 HOUR),
          DATE_ADD(DATE_ADD(CURDATE(), INTERVAL 1 DAY), INTERVAL 10 HOUR), 1),
  (2, 2, DATE_ADD(DATE_ADD(CURDATE(), INTERVAL 1 DAY), INTERVAL 14 HOUR),
          DATE_ADD(DATE_ADD(CURDATE(), INTERVAL 1 DAY), INTERVAL 15 HOUR), 0),
  (3, 3, DATE_ADD(DATE_ADD(CURDATE(), INTERVAL 1 DAY), INTERVAL 19 HOUR),
          DATE_ADD(DATE_ADD(CURDATE(), INTERVAL 1 DAY), INTERVAL 20 HOUR), 0),
  (4, 1, DATE_ADD(DATE_ADD(CURDATE(), INTERVAL 2 DAY), INTERVAL 10 HOUR),
          DATE_ADD(DATE_ADD(CURDATE(), INTERVAL 2 DAY), INTERVAL 11 HOUR), 0),
  (5, 2, DATE_ADD(DATE_ADD(CURDATE(), INTERVAL 2 DAY), INTERVAL 15 HOUR),
          DATE_ADD(DATE_ADD(CURDATE(), INTERVAL 2 DAY), INTERVAL 16 HOUR), 0),
  (6, 3, DATE_ADD(DATE_ADD(CURDATE(), INTERVAL 2 DAY), INTERVAL 19 HOUR),
          DATE_ADD(DATE_ADD(CURDATE(), INTERVAL 2 DAY), INTERVAL 20 HOUR), 0),
  (7, 1, DATE_ADD(DATE_ADD(CURDATE(), INTERVAL 3 DAY), INTERVAL 9 HOUR),
          DATE_ADD(DATE_ADD(CURDATE(), INTERVAL 3 DAY), INTERVAL 10 HOUR), 0),
  (8, 2, DATE_ADD(DATE_ADD(CURDATE(), INTERVAL 3 DAY), INTERVAL 14 HOUR),
          DATE_ADD(DATE_ADD(CURDATE(), INTERVAL 3 DAY), INTERVAL 15 HOUR), 0),
  (9, 3, DATE_ADD(DATE_ADD(CURDATE(), INTERVAL 3 DAY), INTERVAL 18 HOUR),
          DATE_ADD(DATE_ADD(CURDATE(), INTERVAL 3 DAY), INTERVAL 19 HOUR), 0)
ON DUPLICATE KEY UPDATE
  `coach_id` = VALUES(`coach_id`),
  `start_time` = VALUES(`start_time`),
  `end_time` = VALUES(`end_time`),
  `booked` = VALUES(`booked`);

INSERT INTO `booking`
  (`id`, `user_id`, `coach_id`, `slot_id`, `status`)
VALUES
  (1, 2, 1, 1, 'BOOKED')
ON DUPLICATE KEY UPDATE
  `user_id` = VALUES(`user_id`),
  `coach_id` = VALUES(`coach_id`),
  `status` = VALUES(`status`);

INSERT INTO `lesson_change`
  (`id`, `user_id`, `operator_id`, `amount`, `note`)
VALUES
  (1, 2, 1, 12, '初始化课时'),
  (2, 3, 1, 8, '初始化课时'),
  (3, 4, 1, 5, '初始化课时')
ON DUPLICATE KEY UPDATE
  `amount` = VALUES(`amount`),
  `note` = VALUES(`note`);

SELECT '数据库初始化完成' AS `message`;
SELECT `id`, `nickname`, `role`, `remaining_lessons` FROM `app_users` ORDER BY `id`;
SELECT `id`, `name`, `specialty`, `active` FROM `coach` ORDER BY `id`;
SELECT `id`, `coach_id`, `start_time`, `end_time`, `booked` FROM `coach_slot` ORDER BY `start_time`;
