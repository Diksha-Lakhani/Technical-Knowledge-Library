CREATE DATABASE  IF NOT EXISTS `epskp` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `epskp`;
-- MySQL dump 10.13  Distrib 8.0.33, for Win64 (x86_64)
--
-- Host: localhost    Database: epskp
-- ------------------------------------------------------
-- Server version	8.0.33

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `admin_req`
--

DROP TABLE IF EXISTS `admin_req`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `admin_req` (
  `id` int NOT NULL AUTO_INCREMENT,
  `request_type` enum('create_prob_sol','create_sol','update_sol','delete_sol') DEFAULT NULL,
  `target_solution_id` int DEFAULT NULL,
  `payload` json DEFAULT NULL,
  `requested_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `requested_by` varchar(10) DEFAULT NULL,
  `reviewed_at` datetime DEFAULT NULL,
  `reviewed_by` varchar(10) DEFAULT NULL,
  `status` enum('pending','approved','rejected') DEFAULT 'pending',
  `problem_id` int DEFAULT NULL,
  `remarks` mediumtext,
  PRIMARY KEY (`id`),
  KEY `target_solution_id` (`target_solution_id`),
  KEY `requested_by` (`requested_by`),
  KEY `reviewed_by` (`reviewed_by`),
  KEY `fk_admin_req_problem` (`problem_id`),
  CONSTRAINT `admin_req_ibfk_2` FOREIGN KEY (`requested_by`) REFERENCES `user` (`empid`),
  CONSTRAINT `admin_req_ibfk_3` FOREIGN KEY (`reviewed_by`) REFERENCES `user` (`empid`),
  CONSTRAINT `fk_admin_req_problem` FOREIGN KEY (`problem_id`) REFERENCES `problem` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=39 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `attachment`
--

DROP TABLE IF EXISTS `attachment`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `attachment` (
  `id` int NOT NULL AUTO_INCREMENT,
  `problem_id` int DEFAULT NULL,
  `solution_id` int DEFAULT NULL,
  `file_path` text,
  `file_type` varchar(255) DEFAULT NULL,
  `original_name` text,
  PRIMARY KEY (`id`),
  KEY `attachment_ibfk_1` (`problem_id`),
  KEY `attachment_ibfk_2` (`solution_id`),
  CONSTRAINT `attachment_ibfk_1` FOREIGN KEY (`problem_id`) REFERENCES `problem` (`id`) ON DELETE CASCADE,
  CONSTRAINT `attachment_ibfk_2` FOREIGN KEY (`solution_id`) REFERENCES `solution` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `category`
--

DROP TABLE IF EXISTS `category`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `category` (
  `id` int NOT NULL,
  `name` varchar(20) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `history`
--

DROP TABLE IF EXISTS `history`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `history` (
  `id` int NOT NULL AUTO_INCREMENT,
  `request_type` enum('create_prob_sol','create_sol','update_sol','delete_sol') DEFAULT NULL,
  `prob_title` varchar(255) DEFAULT NULL,
  `prob_descrip` mediumtext,
  `category_id` int DEFAULT NULL,
  `location_id` int DEFAULT NULL,
  `solution` mediumtext,
  `requested_by` varchar(10) DEFAULT NULL,
  `requested_at` datetime DEFAULT NULL,
  `status` enum('approved','rejected') DEFAULT NULL,
  `remarks` mediumtext,
  `reviewed_by` varchar(10) DEFAULT NULL,
  `reviewed_at` datetime DEFAULT NULL,
  `attachment` json DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `category_id` (`category_id`),
  KEY `location_id` (`location_id`),
  KEY `requested_by` (`requested_by`),
  KEY `reviewed_by` (`reviewed_by`),
  CONSTRAINT `history_ibfk_1` FOREIGN KEY (`category_id`) REFERENCES `category` (`id`),
  CONSTRAINT `history_ibfk_2` FOREIGN KEY (`location_id`) REFERENCES `location` (`id`),
  CONSTRAINT `history_ibfk_3` FOREIGN KEY (`requested_by`) REFERENCES `user` (`empid`),
  CONSTRAINT `history_ibfk_4` FOREIGN KEY (`reviewed_by`) REFERENCES `user` (`empid`)
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `location`
--

DROP TABLE IF EXISTS `location`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `location` (
  `id` int NOT NULL,
  `name` varchar(20) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `problem`
--

DROP TABLE IF EXISTS `problem`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `problem` (
  `id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(255) DEFAULT NULL,
  `description` mediumtext,
  `category_id` int DEFAULT NULL,
  `location_id` int DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `category_id` (`category_id`),
  KEY `location_id` (`location_id`),
  CONSTRAINT `problem_ibfk_1` FOREIGN KEY (`category_id`) REFERENCES `category` (`id`) ON DELETE CASCADE,
  CONSTRAINT `problem_ibfk_2` FOREIGN KEY (`location_id`) REFERENCES `location` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `solution`
--

DROP TABLE IF EXISTS `solution`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `solution` (
  `id` int NOT NULL AUTO_INCREMENT,
  `problem_id` int DEFAULT NULL,
  `description` mediumtext,
  `solved_by` varchar(20) DEFAULT NULL,
  `solved_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `location_id` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `solved_by` (`solved_by`),
  KEY `solution_ibfk_1` (`problem_id`),
  KEY `location_id` (`location_id`),
  CONSTRAINT `solution_ibfk_1` FOREIGN KEY (`problem_id`) REFERENCES `problem` (`id`) ON DELETE CASCADE,
  CONSTRAINT `solution_ibfk_2` FOREIGN KEY (`solved_by`) REFERENCES `user` (`empid`) ON DELETE CASCADE,
  CONSTRAINT `solution_ibfk_3` FOREIGN KEY (`location_id`) REFERENCES `location` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=26 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `trend`
--

DROP TABLE IF EXISTS `trend`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `trend` (
  `id` int NOT NULL AUTO_INCREMENT,
  `category_id` int DEFAULT NULL,
  `location_id` int DEFAULT NULL,
  `problem_id` int DEFAULT NULL,
  `problem_title` varchar(255) DEFAULT NULL,
  `viewed_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `category_id` (`category_id`),
  KEY `location_id` (`location_id`),
  CONSTRAINT `trend_ibfk_1` FOREIGN KEY (`category_id`) REFERENCES `category` (`id`),
  CONSTRAINT `trend_ibfk_2` FOREIGN KEY (`location_id`) REFERENCES `location` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=127 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `user`
--

DROP TABLE IF EXISTS `user`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user` (
  `empid` varchar(10) NOT NULL,
  `password` varchar(20) DEFAULT NULL,
  `role` varchar(10) DEFAULT NULL,
  `name` varchar(20) DEFAULT NULL,
  `location_id` int DEFAULT NULL,
  PRIMARY KEY (`empid`),
  KEY `fk` (`location_id`),
  CONSTRAINT `fk` FOREIGN KEY (`location_id`) REFERENCES `location` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-10-08 15:23:00
