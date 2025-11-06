START TRANSACTION;

CREATE TABLE IF NOT EXISTS `user_types` (
    `id` BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `name` VARCHAR(255) NOT NULL
);

CREATE TABLE IF NOT EXISTS `users` (
    `id` BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `type_id` BIGINT NOT NULL,
    `name` VARCHAR(255) NOT NULL,
    `email` VARCHAR(255) NOT NULL UNIQUE,
    `password` VARCHAR(255) NOT NULL,
    
    FOREIGN KEY (`type_id`) REFERENCES `user_types`(`id`) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS `courses` (
    `id` BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `teacher_id` BIGINT NOT NULL,
    `name` VARCHAR(255) NOT NULL,

    FOREIGN KEY (`teacher_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS `student_courses` (
    `user_id` BIGINT NOT NULL,
    `course_id` BIGINT NOT NULL,

    FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`course_id`) REFERENCES `courses`(`id`) ON DELETE CASCADE
);


CREATE TABLE IF NOT EXISTS `post_types` (
    `id` BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `name` VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS `posts` (
    `id` BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `course_id` BIGINT NOT NULL,
    `type_id` BIGINT NOT NULL,
    `content` JSON NOT NULL,

    FOREIGN KEY (`course_id`) REFERENCES `courses`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`type_id`) REFERENCES `post_types`(`id`) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS `grades` (
    `id` BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `course_id` BIGINT NOT NULL,
    `weight` DOUBLE NOT NULL DEFAULT 1,
    `name` VARCHAR(100),

    FOREIGN KEY (`course_id`) REFERENCES `courses`(`id`) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS `student_grades` (
    `student_id` BIGINT NOT NULL,
    `grade_id` BIGINT NOT NULL,
    `grade` tinyint CHECK (grade BETWEEN 1 AND 5 OR grade IS NULL),

    FOREIGN KEY (`student_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`grade_id`) REFERENCES `grades`(`id`) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS `sessions` (
    `id` VARCHAR(64) NOT NULL PRIMARY KEY,
    `user_id` BIGINT NOT NULL,
    `expires_at` DATETIME NOT NULL,

    FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
)

COMMIT;