-- phpMyAdmin SQL Dump
-- version 5.2.0
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Mar 10, 2024 at 05:31 PM
-- Server version: 10.4.24-MariaDB
-- PHP Version: 7.4.29

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `emotion_tracker`
--

-- --------------------------------------------------------

--
-- Table structure for table `emotion`
--

CREATE TABLE `emotion` (
  `emotion_id` int(11) NOT NULL,
  `emotion` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `emotion`
--

INSERT INTO `emotion` (`emotion_id`, `emotion`) VALUES
(1, 'Enjoyment'),
(2, 'Sadness'),
(3, 'Anger'),
(4, 'Contempt'),
(5, 'Disgust'),
(6, 'Fear'),
(7, 'Surprise');

-- --------------------------------------------------------

--
-- Table structure for table `emotion_rating`
--

CREATE TABLE `emotion_rating` (
  `emotion_rating_id` int(11) NOT NULL,
  `emotion_id` int(11) NOT NULL,
  `rating_id` int(11) NOT NULL,
  `short_desc` varchar(255) NOT NULL,
  `long_desc` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `emotion_rating`
--

INSERT INTO `emotion_rating` (`emotion_rating_id`, `emotion_id`, `rating_id`, `short_desc`, `long_desc`) VALUES
(11, 2, 1, 'Cheerful', 'You\'re feeling incredibly happy and content, with a heart full of joy'),
(12, 2, 2, 'Content', 'Life is good, and you\'re generally satisfied, but there might be a hint of something on your mind'),
(13, 2, 3, 'Neutral', 'You\'re neither happy nor sad – just cruising through a typical day'),
(14, 2, 4, 'Slightly Melancholy', 'A touch of sadness has crept in, but it\'s nothing overwhelming'),
(15, 2, 5, 'Moderately Sad', 'You\'re feeling a noticeable level of sadness, but it\'s manageable'),
(16, 2, 6, 'Somewhat Blue', 'The sadness is more pronounced, and it\'s starting to affect your mood'),
(17, 2, 7, 'Unsettled', 'You\'re grappling with a significant level of sadness, making it hard to ignore'),
(18, 2, 8, 'Very Sad', 'The weight of sadness is substantial, and it\'s impacting your thoughts and emotions'),
(19, 2, 9, 'Overwhelming Gloom', 'A profound sense of sadness has taken over, making it difficult to find joy'),
(20, 2, 10, 'Utter Despair', 'You\'re experiencing the deepest and most intense sadness imaginable. It\'s crucial to reach out for support'),
(21, 1, 1, 'Uninterested', 'You\'re not finding much joy or interest in your current activities'),
(22, 1, 2, 'Mild Interest', 'There\'s a subtle spark of interest, but it hasn\'t fully caught your attention yet'),
(23, 1, 3, 'Neutral', 'You\'re neither excited nor bored – just going through the motions'),
(24, 1, 4, 'Somewhat Engaged', 'You\'re finding some enjoyment, but it\'s not overly captivating'),
(25, 1, 5, 'Moderately Enjoyable', 'You\'re experiencing a moderate level of enjoyment in your current activities'),
(26, 1, 6, 'Quite Pleasurable', 'The enjoyment is notable, and you\'re genuinely pleased with what you\'re doing'),
(27, 1, 7, 'Very Enjoyable', 'You\'re thoroughly enjoying yourself, and it\'s a positive experience'),
(28, 1, 8, 'Exhilarating', 'The level of enjoyment is high, and you\'re feeling a sense of exhilaration'),
(29, 1, 9, 'Pure Bliss', 'You\'re in a state of pure joy and happiness, savoring the moment'),
(30, 1, 10, 'Ecstatic', 'You\'re overwhelmed with happiness and experiencing the utmost enjoyment'),
(31, 3, 1, 'Calm', 'You\'re completely composed and not experiencing any anger. Your emotions are in check'),
(32, 3, 2, 'Mild Irritation', 'There\'s a hint of annoyance or frustration, but it\'s not disrupting your overall mood'),
(33, 3, 3, 'Displeased', 'You\'re noticeably bothered, and a sense of displeasure is beginning to surface'),
(34, 3, 4, 'Moderately Angry', 'Anger is building up, and you\'re feeling a moderate level of irritation'),
(35, 3, 5, 'Frustrated', 'You\'re notably angry, and frustration is affecting your mindset and mood'),
(36, 3, 6, 'Angry', 'Anger is present, and you\'re actively dealing with a noticeable level of frustration'),
(37, 3, 7, 'Very Angry', 'The intensity of anger has increased, and it\'s becoming challenging to keep it in check'),
(38, 3, 8, 'Furious', 'You\'re on the verge of losing control, and the anger is reaching a boiling point'),
(39, 3, 9, 'Enraged', 'Anger has taken over, and you\'re in a highly agitated and enraged state'),
(40, 3, 10, 'Out of Control', 'You\'re completely consumed by anger, and it\'s crucial to find a way to calm down'),
(41, 4, 1, 'Neutral', 'You\'re emotionally neutral and not expressing any signs of contempt'),
(42, 4, 2, 'Mild Disapproval', 'A subtle sense of disapproval is present, but it\'s not significant'),
(43, 4, 3, 'Slight Contempt', 'There\'s a minor feeling of disdain or disapproval, but it\'s not overwhelming'),
(44, 4, 4, 'Disapproving', 'You\'re showing signs of disapproval, and a sense of contempt is starting to emerge'),
(45, 4, 5, 'Moderately Contemptuous', 'Contempt is noticeable, and there\'s a moderate level of disapproval in your expression'),
(46, 4, 6, 'Disdainful', 'You\'re actively displaying disdain, and your sense of contempt is apparent'),
(47, 4, 7, 'Very Contemptuous', 'The level of contempt is high, and you\'re clearly expressing strong disapproval'),
(48, 4, 8, 'Scornful', 'Contempt has intensified, and you\'re displaying a significant amount of scorn'),
(49, 4, 9, 'Intense Disdain', 'The feeling of contempt is intense, and you\'re actively expressing strong disapproval'),
(50, 4, 10, 'Utter Contempt', 'Contempt has reached its peak, and it\'s crucial to address the underlying issues'),
(51, 5, 1, 'Neutral', 'You\'re emotionally neutral and not experiencing any feelings of disgust'),
(52, 5, 2, 'Slight Unease', 'There\'s a subtle hint of discomfort or unease, but it\'s not significant'),
(53, 5, 3, 'Mild Disgust', 'A minor sense of disgust is present, but it\'s not overwhelming'),
(54, 5, 4, 'Moderately Repulsed', 'Disgust is noticeable, and you\'re feeling a moderate level of repulsion'),
(55, 5, 5, 'Disgusted', 'You\'re actively experiencing disgust, and it\'s impacting your emotional state'),
(56, 5, 6, 'Quite Revolted', 'The feeling of disgust has intensified, and it\'s becoming more pronounced'),
(57, 5, 7, 'Very Disgusted', 'The level of disgust is high, and you\'re clearly expressing strong repulsion'),
(58, 5, 8, 'Utter Repulsion', 'Disgust has reached an intense level, and you\'re actively repelled by the situation'),
(59, 5, 9, 'Intense Disgust', 'The feeling of disgust is overwhelming, and it\'s crucial to address the source'),
(60, 5, 10, 'Extreme Revulsion', 'Disgust has peaked to an extreme level, and it\'s important to seek resolution or support as needed'),
(61, 6, 1, 'Calm', 'You\'re completely composed, and there\'s no sense of fear'),
(62, 6, 2, 'Slight Apprehension', 'A subtle feeling of unease or mild concern is present, but it\'s not overwhelming'),
(63, 6, 3, 'Uneasy', 'There\'s a noticeable sense of discomfort or unease, but it\'s still manageable'),
(64, 6, 4, 'Moderate Anxiety', 'Fear is building up, and you\'re experiencing a moderate level of anxiety'),
(65, 6, 5, 'Worried', 'You\'re notably anxious, and fear is starting to affect your mindset and emotions'),
(66, 6, 6, 'Fearful', 'Fear is present, and you\'re actively dealing with a noticeable level of anxiety'),
(67, 6, 7, 'Very Anxious', 'The intensity of fear has increased, and it\'s becoming challenging to keep it in check'),
(68, 6, 8, 'Panicked', 'You\'re on the verge of panic, and fear is reaching a heightened state'),
(69, 6, 9, 'Terrified', 'Fear has taken over, and you\'re in a highly agitated and terrified state'),
(70, 6, 10, 'Overwhelming Fear', 'You\'re completely consumed by fear, and it\'s crucial to find a way to calm down'),
(71, 7, 1, 'Unfazed', 'You\'re completely composed, and there\'s no sign of surprise. Your emotions are steady'),
(72, 7, 2, 'Mild Astonishment', 'There\'s a subtle sense of astonishment or mild surprise, but it\'s not significant'),
(73, 7, 3, 'Mildly Surprised', 'A minor feeling of surprise is present, but it\'s not overwhelming'),
(74, 7, 4, 'Moderately Astonished', 'Surprise is noticeable, and you\'re feeling a moderate level of astonishment'),
(75, 7, 5, 'Surprised', 'You\'re actively experiencing surprise, and it\'s impacting your emotional state'),
(76, 7, 6, 'Quite Astonished', 'The feeling of surprise has intensified, and it\'s becoming more pronounced'),
(77, 7, 7, 'Very Surprised', 'The level of surprise is high, and you\'re clearly expressing strong astonishment'),
(78, 7, 8, 'Utter Amazement', 'Surprise has reached an intense level, and you\'re in a state of utter amazement'),
(79, 7, 9, 'Intense Surprise', 'The feeling of surprise is overwhelming, and you\'re actively amazed by the situation'),
(80, 7, 10, 'Overwhelming Shock', 'Surprise has peaked to an extreme level, and it\'s crucial to process and understand the unexpected event');

-- --------------------------------------------------------

--
-- Table structure for table `rating`
--

CREATE TABLE `rating` (
  `rating_id` int(11) NOT NULL,
  `rating` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `rating`
--

INSERT INTO `rating` (`rating_id`, `rating`) VALUES
(1, 1),
(2, 2),
(3, 3),
(4, 4),
(5, 5),
(6, 6),
(7, 7),
(8, 8),
(9, 9),
(10, 10);

-- --------------------------------------------------------

--
-- Table structure for table `snapshot`
--

CREATE TABLE `snapshot` (
  `snapshot_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `date` date NOT NULL,
  `time` time NOT NULL,
  `note` text NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `snapshot`
--

INSERT INTO `snapshot` (`snapshot_id`, `user_id`, `date`, `time`, `note`) VALUES
(98, 4, '2024-01-28', '19:21:33', 'Going on holiday tomorrow :)'),
(110, 4, '2024-02-11', '00:49:30', 'Family went on holiday without me'),
(131, 4, '2024-02-22', '23:03:15', 'Went around new york city with a pizza in a limo!'),
(135, 4, '2024-02-24', '21:16:51', 'Setting up traps to outsmart the burglars.'),
(147, 4, '2024-02-25', '22:52:07', 'Marv and Harry broke into the house!'),
(148, 4, '2024-02-29', '22:36:30', 'I saw two burglars trying to break in. Gotta defend my home.'),
(149, 4, '2024-02-29', '22:38:36', 'Looking at our family photo, missing my mom, dad, and Buzz.\r\n                        ');

-- --------------------------------------------------------

--
-- Table structure for table `snapshot_emotion`
--

CREATE TABLE `snapshot_emotion` (
  `snapshot_emotion_id` int(11) NOT NULL,
  `snapshot_id` int(11) NOT NULL,
  `emotion_id` int(11) NOT NULL,
  `rating` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `snapshot_emotion`
--

INSERT INTO `snapshot_emotion` (`snapshot_emotion_id`, `snapshot_id`, `emotion_id`, `rating`) VALUES
(365, 98, 1, 8),
(366, 98, 2, 2),
(367, 98, 3, 2),
(368, 98, 4, 1),
(369, 98, 5, 1),
(370, 98, 6, 3),
(371, 98, 7, 4),
(449, 110, 1, 8),
(450, 110, 2, 1),
(451, 110, 3, 8),
(452, 110, 4, 3),
(453, 110, 5, 5),
(454, 110, 6, 10),
(455, 110, 7, 7),
(596, 131, 1, 10),
(597, 131, 2, 2),
(598, 131, 3, 4),
(599, 131, 4, 3),
(600, 131, 5, 2),
(601, 131, 6, 10),
(602, 131, 7, 7),
(624, 135, 1, 9),
(625, 135, 2, 7),
(626, 135, 3, 2),
(627, 135, 4, 2),
(628, 135, 5, 8),
(629, 135, 6, 2),
(630, 135, 7, 8),
(708, 147, 1, 7),
(709, 147, 2, 10),
(710, 147, 3, 2),
(711, 147, 4, 5),
(712, 147, 5, 5),
(713, 147, 6, 10),
(714, 147, 7, 5),
(715, 148, 1, 4),
(716, 148, 2, 2),
(717, 148, 3, 10),
(718, 148, 4, 8),
(719, 148, 5, 7),
(720, 148, 6, 10),
(721, 148, 7, 7),
(722, 149, 1, 2),
(723, 149, 2, 10),
(724, 149, 3, 2),
(725, 149, 4, 2),
(726, 149, 5, 1),
(727, 149, 6, 10),
(728, 149, 7, 8);

-- --------------------------------------------------------

--
-- Table structure for table `snapshot_trigger`
--

CREATE TABLE `snapshot_trigger` (
  `snapshot_trigger_id` int(11) NOT NULL,
  `snapshot_id` int(11) NOT NULL,
  `trigger_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `snapshot_trigger`
--

INSERT INTO `snapshot_trigger` (`snapshot_trigger_id`, `snapshot_id`, `trigger_id`) VALUES
(202, 98, 3),
(203, 98, 10),
(207, 110, 3),
(208, 110, 6),
(209, 147, 1),
(210, 147, 6),
(211, 147, 8),
(212, 131, 4),
(213, 131, 5),
(214, 131, 6),
(215, 148, 1),
(216, 148, 4),
(217, 135, 2),
(218, 135, 5),
(219, 135, 6),
(220, 135, 8),
(224, 149, 3),
(225, 149, 10);

-- --------------------------------------------------------

--
-- Table structure for table `triggers`
--

CREATE TABLE `triggers` (
  `trigger_id` int(11) NOT NULL,
  `trigger_name` varchar(255) NOT NULL,
  `icon` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `triggers`
--

INSERT INTO `triggers` (`trigger_id`, `trigger_name`, `icon`) VALUES
(1, 'Social interaction', 'bi-people'),
(2, 'Physical activity', 'bi-bicycle'),
(3, 'Family', 'bi-people'),
(4, 'Work', 'bi-laptop'),
(5, 'Sleep', 'bi-cloud'),
(6, 'Weather', 'bi-brightness-alt-high'),
(7, 'Alcohol', 'bi-cup-straw'),
(8, 'Coffee', 'bi-cup'),
(9, 'Food', 'bi-egg'),
(10, 'Travel', 'bi-emoji-sunglasses'),
(11, 'Dating', 'bi-emoji-heart-eyes');

-- --------------------------------------------------------

--
-- Table structure for table `user`
--

CREATE TABLE `user` (
  `user_id` int(11) NOT NULL,
  `first_name` varchar(255) NOT NULL,
  `last_name` varchar(255) NOT NULL,
  `email_address` varchar(255) NOT NULL,
  `password` varbinary(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `user`
--

INSERT INTO `user` (`user_id`, `first_name`, `last_name`, `email_address`, `password`) VALUES
(4, 'Kevin', 'McCallister', 'kevin.mccallister@outlook.com', 0x24326224313024757a79314552473070664f4e7a31522f5946504c6565353346512f587259746b477337317a5561487a6b6f6a43625a627a79684143),
(35, 'Buzz', 'McCallister', 'buzz.mccallister@yahoo.com', 0x243262243130245a4c3178776c4138786f2f4b734447625054626e4f755778632e755a6b4e3959327330314243336e504b67706e5a392e36644d7265);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `emotion`
--
ALTER TABLE `emotion`
  ADD PRIMARY KEY (`emotion_id`);

--
-- Indexes for table `emotion_rating`
--
ALTER TABLE `emotion_rating`
  ADD PRIMARY KEY (`emotion_rating_id`),
  ADD KEY `FK_emotion_emotion_id_two` (`emotion_id`),
  ADD KEY `FK_rating_rating_id` (`rating_id`);

--
-- Indexes for table `rating`
--
ALTER TABLE `rating`
  ADD PRIMARY KEY (`rating_id`);

--
-- Indexes for table `snapshot`
--
ALTER TABLE `snapshot`
  ADD PRIMARY KEY (`snapshot_id`),
  ADD KEY `FK_user_user_id` (`user_id`);

--
-- Indexes for table `snapshot_emotion`
--
ALTER TABLE `snapshot_emotion`
  ADD PRIMARY KEY (`snapshot_emotion_id`),
  ADD KEY `FK_snapshot_snapshot_id` (`snapshot_id`),
  ADD KEY `FK_emotion_emotion_id` (`emotion_id`);

--
-- Indexes for table `snapshot_trigger`
--
ALTER TABLE `snapshot_trigger`
  ADD PRIMARY KEY (`snapshot_trigger_id`),
  ADD KEY `FK_snapshot_snapshot_id_two` (`snapshot_id`),
  ADD KEY `FK_trigger_trigger_id` (`trigger_id`);

--
-- Indexes for table `triggers`
--
ALTER TABLE `triggers`
  ADD PRIMARY KEY (`trigger_id`);

--
-- Indexes for table `user`
--
ALTER TABLE `user`
  ADD PRIMARY KEY (`user_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `emotion`
--
ALTER TABLE `emotion`
  MODIFY `emotion_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `emotion_rating`
--
ALTER TABLE `emotion_rating`
  MODIFY `emotion_rating_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=81;

--
-- AUTO_INCREMENT for table `rating`
--
ALTER TABLE `rating`
  MODIFY `rating_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `snapshot`
--
ALTER TABLE `snapshot`
  MODIFY `snapshot_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=185;

--
-- AUTO_INCREMENT for table `snapshot_emotion`
--
ALTER TABLE `snapshot_emotion`
  MODIFY `snapshot_emotion_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=974;

--
-- AUTO_INCREMENT for table `snapshot_trigger`
--
ALTER TABLE `snapshot_trigger`
  MODIFY `snapshot_trigger_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=372;

--
-- AUTO_INCREMENT for table `triggers`
--
ALTER TABLE `triggers`
  MODIFY `trigger_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT for table `user`
--
ALTER TABLE `user`
  MODIFY `user_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=36;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `emotion_rating`
--
ALTER TABLE `emotion_rating`
  ADD CONSTRAINT `FK_emotion_emotion_id_two` FOREIGN KEY (`emotion_id`) REFERENCES `emotion` (`emotion_id`),
  ADD CONSTRAINT `FK_rating_rating_id` FOREIGN KEY (`rating_id`) REFERENCES `rating` (`rating_id`);

--
-- Constraints for table `snapshot`
--
ALTER TABLE `snapshot`
  ADD CONSTRAINT `FK_user_user_id` FOREIGN KEY (`user_id`) REFERENCES `user` (`user_id`);

--
-- Constraints for table `snapshot_emotion`
--
ALTER TABLE `snapshot_emotion`
  ADD CONSTRAINT `FK_emotion_emotion_id` FOREIGN KEY (`emotion_id`) REFERENCES `emotion` (`emotion_id`),
  ADD CONSTRAINT `FK_snapshot_snapshot_id` FOREIGN KEY (`snapshot_id`) REFERENCES `snapshot` (`snapshot_id`);

--
-- Constraints for table `snapshot_trigger`
--
ALTER TABLE `snapshot_trigger`
  ADD CONSTRAINT `FK_snapshot_snapshot_id_two` FOREIGN KEY (`snapshot_id`) REFERENCES `snapshot` (`snapshot_id`),
  ADD CONSTRAINT `FK_trigger_trigger_id` FOREIGN KEY (`trigger_id`) REFERENCES `triggers` (`trigger_id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
