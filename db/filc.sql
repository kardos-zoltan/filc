-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: localhost
-- Generation Time: Mar 26, 2026 at 10:36 AM
-- Server version: 10.4.28-MariaDB
-- PHP Version: 8.2.4

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `filc`
--

-- --------------------------------------------------------

--
-- Table structure for table `comments`
--

CREATE TABLE `comments` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `post_id` int(11) NOT NULL,
  `content` varchar(2000) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;

--
-- Dumping data for table `comments`
--

INSERT INTO `comments` (`id`, `user_id`, `post_id`, `content`) VALUES
(1, 7, 14, 'asd'),
(2, 7, 14, 'komment!'),
(3, 7, 14, 'a');

-- --------------------------------------------------------

--
-- Table structure for table `courses`
--

CREATE TABLE `courses` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;

--
-- Dumping data for table `courses`
--

INSERT INTO `courses` (`id`, `name`) VALUES
(1, 'Math 101'),
(2, 'Physics 101'),
(3, 'History 101'),
(4, 'Furulya 4'),
(5, 'Computer Science 101'),
(8, 'krzus'),
(10, 'asd'),
(12, 'aha aha aha');

-- --------------------------------------------------------

--
-- Table structure for table `grades`
--

CREATE TABLE `grades` (
  `id` int(11) NOT NULL,
  `course_id` int(11) NOT NULL,
  `weight` double NOT NULL DEFAULT 1,
  `name` varchar(100) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;

--
-- Dumping data for table `grades`
--

INSERT INTO `grades` (`id`, `course_id`, `weight`, `name`) VALUES
(1, 1, 1, 'Homework'),
(2, 1, 2, 'Midterm'),
(3, 1, 3, 'Final'),
(4, 2, 1, 'Lab'),
(5, 3, 1, 'Essay');

-- --------------------------------------------------------

--
-- Table structure for table `join_codes`
--

CREATE TABLE `join_codes` (
  `course_id` int(11) NOT NULL,
  `code` varchar(8) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;

--
-- Dumping data for table `join_codes`
--

INSERT INTO `join_codes` (`course_id`, `code`) VALUES
(8, 'aaaaaaaa'),
(2, 'bbbbbbbb');

-- --------------------------------------------------------

--
-- Table structure for table `posts`
--

CREATE TABLE `posts` (
  `id` int(11) NOT NULL,
  `type_id` tinyint(4) NOT NULL,
  `course_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `posted_at` datetime NOT NULL DEFAULT current_timestamp(),
  `content` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`content`))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;

--
-- Dumping data for table `posts`
--

INSERT INTO `posts` (`id`, `type_id`, `course_id`, `user_id`, `posted_at`, `content`) VALUES
(14, 1, 12, 7, '2026-03-25 05:16:39', '\"asdkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk\\n\\n\\nNamsfdglkfdmlkdmhlkgfmnh\\n\\n\\nfghjéfglhkélghfjkpél\"');

-- --------------------------------------------------------

--
-- Table structure for table `post_completed`
--

CREATE TABLE `post_completed` (
  `post_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `completed_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;

-- --------------------------------------------------------

--
-- Table structure for table `post_types`
--

CREATE TABLE `post_types` (
  `id` tinyint(4) NOT NULL,
  `name` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;

--
-- Dumping data for table `post_types`
--

INSERT INTO `post_types` (`id`, `name`) VALUES
(1, 'text'),
(2, 'quiz');

-- --------------------------------------------------------

--
-- Table structure for table `sessions`
--

CREATE TABLE `sessions` (
  `id` varchar(64) NOT NULL,
  `user_id` int(11) NOT NULL,
  `expires_at` datetime NOT NULL DEFAULT (current_timestamp() + interval 30 day)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;

--
-- Dumping data for table `sessions`
--

INSERT INTO `sessions` (`id`, `user_id`, `expires_at`) VALUES
('1PwwMzqShUPggCnCEB9mGkkF4KQa8EoIw/DTo51z/mU=', 7, '2026-04-09 10:58:06'),
('2/73v++KDcYdC8F8+WwndajYgIQjwhQaU/JZ20z2WDg=', 7, '2026-04-09 10:58:07'),
('2WfQxvMgNEpfC9oFJnjXuAEAJDU89+y+7uejbGTMpMU=', 7, '2026-04-09 10:58:07'),
('BPsSVbMhr6hQ4cM4ml/TRsfoWsVrT9vLbESERkp13KY=', 7, '2026-04-09 10:58:12'),
('gJ1XiDLlc7x/Uw2DR7gmenHW2HFPUIi49JiqDgW9h9Y=', 7, '2026-04-19 16:25:32'),
('oNs7gDJ9m3vguQePLU5NPPMnnSUx0W13AyiBBwI8bnU=', 7, '2026-04-09 10:58:12'),
('OSwgkAeXqWyyehtP87R7SdsqcAuVcrKP7gn5Au2f558=', 7, '2026-04-09 10:58:00'),
('qvzHhovnoGtXwxvWvdkmVKzVYPkScXpl6ap9HPh8dHM=', 7, '2026-04-09 10:58:11'),
('tafUaTkv/pVsuaF6tXoNEzP7F4uMWU9+INUJA5KrOP0=', 7, '2026-04-09 10:58:08'),
('UAtkBNwwZXsLiCcMSWz2BVRPPLQOSPeqoqm0GCWNNjg=', 6, '2026-03-14 15:28:06'),
('WdmYvSoXaff/827ozGq8Gtstml5VJBA92RShjSF5Pjs=', 7, '2026-03-27 13:07:23'),
('wk9h2XeHBccCVt3SlYEtvYIf19Ctjk5N4uC6CoXDiy8=', 7, '2026-04-09 10:58:12');

-- --------------------------------------------------------

--
-- Table structure for table `student_grades`
--

CREATE TABLE `student_grades` (
  `student_id` int(11) NOT NULL,
  `grade_id` int(11) NOT NULL,
  `grade` tinyint(4) DEFAULT NULL CHECK (`grade` between 1 and 5 or `grade` is null)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;

--
-- Dumping data for table `student_grades`
--

INSERT INTO `student_grades` (`student_id`, `grade_id`, `grade`) VALUES
(2, 1, 4),
(2, 2, 5),
(3, 1, 3),
(4, 4, 4),
(3, 5, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `hash` varchar(172) NOT NULL,
  `salt` varchar(24) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `name`, `email`, `hash`, `salt`) VALUES
(1, 'Alice Teacher', 'alice@school.com', 'hash1', 'salt1'),
(2, 'Bob Student', 'bob@student.com', 'hash2', 'salt2'),
(3, 'Carol Student', 'carol@student.com', 'hash3', 'salt3'),
(4, 'Dave Student', 'dave@student.com', 'hash4', 'salt4'),
(5, 'Eve Teacher', 'eve@school.com', 'hash5', 'salt5'),
(6, 'Név Neves', 'neves@nev.com', 'lJiIobcBnYeDF2Mmgylgd4/cxksGeeP/eNvHc8y+F7X53amH+IIZ4ZrZNJWE6K/El8ScVb6l+IdQIOePgMoDO1RtmHhfhmCJL/w8DfVN3+rs5imCNNwAygVsh/XiBrL1VvZANv47WhsfGn3TjzPJ3/4X7TIdBqipiQF+0SiDzYE=', 'J48nI18EYZEc0pH7UoVZTA=='),
(7, 'asd', 'aha@aha.aha', '/IlXy+iM1trI4TLS3MCf86ffQSGMkzWxAYBvKENUpDMeaCd8Ck1thtFRKAnKwcfxba1n0/uBZMEhq5Z8K1SsTeN36+IWBJ4uf+HQQ7BDpVnsHsOfklDcJB0h2VakhDgf13FtLzVnka9K2EM9UGLcOxMLPuc0fQ5wiPfGUHIIpFI=', '7MwVvNlglgWUb+OsZ0Wpiw=='),
(8, 'asd', 'asd2@asd.com', 'CNSJ+q33M/EFDUVucY+x2joSs3Uh3au128owG/+uScgKnhvKg9QNIueL9VQumooLYRlmtyykgX4WipnovGD1s5UY4udciEQp7FV1Tgh1Dcc9HxhX96Ie+VGwC8fuEmi5L/RPtijfRopM8X1wWQq/MaK6KfGL7v1r7Tsj0KAhR88=', 'UqosOIuQwOmPQyBKPQ/3+Q==');

-- --------------------------------------------------------

--
-- Table structure for table `user_courses`
--

CREATE TABLE `user_courses` (
  `user_id` int(11) NOT NULL,
  `course_id` int(11) NOT NULL,
  `role_id` tinyint(4) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;

--
-- Dumping data for table `user_courses`
--

INSERT INTO `user_courses` (`user_id`, `course_id`, `role_id`) VALUES
(2, 1, 1),
(3, 1, 1),
(4, 2, 1),
(1, 1, 2),
(5, 2, 2),
(5, 3, 2),
(7, 8, 2),
(7, 10, 2),
(7, 12, 2);

-- --------------------------------------------------------

--
-- Table structure for table `user_roles`
--

CREATE TABLE `user_roles` (
  `id` tinyint(4) NOT NULL,
  `name` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;

--
-- Dumping data for table `user_roles`
--

INSERT INTO `user_roles` (`id`, `name`) VALUES
(1, 'student'),
(2, 'teacher');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `comments`
--
ALTER TABLE `comments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `post_id` (`post_id`);

--
-- Indexes for table `courses`
--
ALTER TABLE `courses`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `grades`
--
ALTER TABLE `grades`
  ADD PRIMARY KEY (`id`),
  ADD KEY `course_id` (`course_id`);

--
-- Indexes for table `join_codes`
--
ALTER TABLE `join_codes`
  ADD PRIMARY KEY (`course_id`),
  ADD UNIQUE KEY `code` (`code`);

--
-- Indexes for table `posts`
--
ALTER TABLE `posts`
  ADD PRIMARY KEY (`id`),
  ADD KEY `course_id` (`course_id`),
  ADD KEY `type_id` (`type_id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `post_completed`
--
ALTER TABLE `post_completed`
  ADD KEY `post_id` (`post_id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `post_types`
--
ALTER TABLE `post_types`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `sessions`
--
ALTER TABLE `sessions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `student_grades`
--
ALTER TABLE `student_grades`
  ADD KEY `student_id` (`student_id`),
  ADD KEY `grade_id` (`grade_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- Indexes for table `user_courses`
--
ALTER TABLE `user_courses`
  ADD PRIMARY KEY (`user_id`,`course_id`),
  ADD KEY `role_id` (`role_id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `course_id` (`course_id`);

--
-- Indexes for table `user_roles`
--
ALTER TABLE `user_roles`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `comments`
--
ALTER TABLE `comments`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `courses`
--
ALTER TABLE `courses`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT for table `grades`
--
ALTER TABLE `grades`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `posts`
--
ALTER TABLE `posts`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;

--
-- AUTO_INCREMENT for table `post_types`
--
ALTER TABLE `post_types`
  MODIFY `id` tinyint(4) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `user_roles`
--
ALTER TABLE `user_roles`
  MODIFY `id` tinyint(4) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `grades`
--
ALTER TABLE `grades`
  ADD CONSTRAINT `grades_ibfk_1` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `posts`
--
ALTER TABLE `posts`
  ADD CONSTRAINT `posts_ibfk_1` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `posts_ibfk_2` FOREIGN KEY (`type_id`) REFERENCES `post_types` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `sessions`
--
ALTER TABLE `sessions`
  ADD CONSTRAINT `sessions_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `student_grades`
--
ALTER TABLE `student_grades`
  ADD CONSTRAINT `student_grades_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `student_grades_ibfk_2` FOREIGN KEY (`grade_id`) REFERENCES `grades` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `user_courses`
--
ALTER TABLE `user_courses`
  ADD CONSTRAINT `user_courses_ibfk_1` FOREIGN KEY (`role_id`) REFERENCES `user_roles` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `user_courses_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `user_courses_ibfk_3` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
