DELETE FROM `__PREFIX__types` WHERE type = 'express';
-- separator
DELETE FROM `__PREFIX__auth_rule` WHERE name LIKE 'shipment.express.%';
-- separator

CREATE TABLE IF NOT EXISTS `__PREFIX__express` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `stockout_id` int(11) DEFAULT '0',
  `express_type` smallint(5) NOT NULL,
  `from_name` varchar(50) NOT NULL,
  `from_company` varchar(100) NOT NULL,
  `from_address` varchar(255) NOT NULL,
  `from_phone` varchar(50) NOT NULL,
  `to_name` varchar(50) NOT NULL,
  `to_company` varchar(100) NOT NULL,
  `to_address` varchar(255) NOT NULL,
  `to_phone` varchar(50) NOT NULL,
  `freight_type` smallint(5) NOT NULL DEFAULT '10',
  `freight` float(5,2) NOT NULL,
  `weight` varchar(20) NOT NULL,
  `total_num` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `stockout_id` (`stockout_id`),
  KEY `express_type` (`express_type`),
  KEY `freight_type` (`freight_type`)
) ENGINE=InnoDB  DEFAULT CHARSET=utf8 AUTO_INCREMENT=1;