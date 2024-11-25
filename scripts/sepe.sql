-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Lis 25, 2024 at 08:20 PM
-- Wersja serwera: 10.4.32-MariaDB
-- Wersja PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";

START TRANSACTION;

SET time_zone = "+00:00";

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */
;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */
;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */
;
/*!40101 SET NAMES utf8mb4 */
;

--
-- Database: `sepe`
--

-- --------------------------------------------------------

--
-- Struktura tabeli dla tabeli `calendar`
--

CREATE TABLE `calendar` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `start` bigint(20) NOT NULL,
  `end` bigint(20) NOT NULL,
  `description` varchar(500) NOT NULL,
  `project` int(11) NOT NULL,
  `remote` tinyint(1) NOT NULL DEFAULT 0,
  `vacation` tinyint(1) NOT NULL,
  `vacation_type` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Struktura tabeli dla tabeli `chat_users`
--

CREATE TABLE `chat_users` (
  `id` int(11) NOT NULL,
  `git_id` int(11) NOT NULL,
  `chat_id` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `username` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Struktura tabeli dla tabeli `emoji`
--

CREATE TABLE `emoji` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `emoji` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Struktura tabeli dla tabeli `log`
--

CREATE TABLE `log` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `date` bigint(20) NOT NULL,
  `info` varchar(500) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Struktura tabeli dla tabeli `project`
--

CREATE TABLE `project` (
  `id` int(11) NOT NULL,
  `name` varchar(50) NOT NULL,
  `color` varchar(10) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Struktura tabeli dla tabeli `vacation`
--

CREATE TABLE `vacation` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `vacation`
--

INSERT INTO `vacation` (`id`, `name`) VALUES
(1, 'Urlop wypoczynkowy'),
(2, 'Urlop UŻ'),
(3, 'Urlop 50');

-- --------------------------------------------------------

--
-- Struktura tabeli dla tabeli `vacation_counter`
--

CREATE TABLE `vacation_counter` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `days` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Indeksy dla zrzutów tabel
--

--
-- Indeksy dla tabeli `calendar`
--
ALTER TABLE `calendar`
  ADD PRIMARY KEY (`id`),
  ADD KEY `vacation` (`vacation_type`),
  ADD KEY `project` (`project`);

--
-- Indeksy dla tabeli `chat_users`
--
ALTER TABLE `chat_users` ADD PRIMARY KEY (`id`);

--
-- Indeksy dla tabeli `emoji`
--
ALTER TABLE `emoji` ADD PRIMARY KEY (`id`);

--
-- Indeksy dla tabeli `log`
--
ALTER TABLE `log` ADD PRIMARY KEY (`id`);

--
-- Indeksy dla tabeli `project`
--
ALTER TABLE `project` ADD PRIMARY KEY (`id`);

--
-- Indeksy dla tabeli `vacation`
--
ALTER TABLE `vacation` ADD PRIMARY KEY (`id`);

--
-- Indeksy dla tabeli `vacation_counter`
--
ALTER TABLE `vacation_counter` ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `calendar`
--
ALTER TABLE `calendar`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=1;

--
-- AUTO_INCREMENT for table `chat_users`
--
ALTER TABLE `chat_users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=1;

--
-- AUTO_INCREMENT for table `emoji`
--
ALTER TABLE `emoji`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=1;

--
-- AUTO_INCREMENT for table `log`
--
ALTER TABLE `log` MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `project`
--
ALTER TABLE `project`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=1;

--
-- AUTO_INCREMENT for table `vacation`
--
ALTER TABLE `vacation`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `vacation_counter`
--
ALTER TABLE `vacation_counter`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=1;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `calendar`
--
ALTER TABLE `calendar`
  ADD CONSTRAINT `project` FOREIGN KEY (`project`) REFERENCES `project` (`id`),
  ADD CONSTRAINT `vacation` FOREIGN KEY (`vacation_type`) REFERENCES `vacation` (`id`);

COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */
;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */
;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */
;