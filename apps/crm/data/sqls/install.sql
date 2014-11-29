CREATE TABLE IF NOT EXISTS `__PREFIX__relationship_company` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(50) NOT NULL,
  `pinyin` varchar(50) NOT NULL,
  `address` varchar(255) DEFAULT NULL,
  `discount` smallint(2) NOT NULL DEFAULT '100',
  `user_id` int(11) NOT NULL,
  `group_id` smallint(5) NOT NULL,
  `dateline` varchar(12) NOT NULL,
  `status` int(11) NOT NULL,
  `memo` text,
  `deleted` smallint(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `name` (`name`,`user_id`),
  KEY `dateline` (`dateline`,`status`),
  KEY `group_id` (`group_id`),
  KEY `pinyin` (`pinyin`),
  KEY `delete` (`deleted`)
) ENGINE=MyISAM  DEFAULT CHARSET=utf8 AUTO_INCREMENT=1 ;

-- separator


CREATE TABLE IF NOT EXISTS `__PREFIX__relationship_company_group` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(30) NOT NULL,
  `alias` varchar(50) NOT NULL,
  `discount` smallint(2) NOT NULL DEFAULT '1',
  PRIMARY KEY (`id`),
  UNIQUE KEY `alias` (`alias`)
) ENGINE=MyISAM  DEFAULT CHARSET=utf8 AUTO_INCREMENT=4 ;


-- separator

INSERT INTO `__PREFIX__relationship_company_group` (`id`, `name`, `alias`, `discount`) VALUES
(1, '客户', 'customer', 100),
(2, '供应商', 'supplier', 100),
(3, 'VIP客户', 'vip', 90);

-- separator

CREATE TABLE IF NOT EXISTS `__PREFIX__relationship_company_linkman` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `relationship_company_id` int(11) NOT NULL,
  `contact` varchar(20) NOT NULL,
  `mobile` varchar(50) NOT NULL,
  `tel` varchar(50) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `qq` varchar(20) DEFAULT NULL,
  `extra` text,
  `dateline` varchar(12) NOT NULL,
  `is_primary` smallint(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `customer_id` (`relationship_company_id`,`dateline`),
  KEY `is_primary` (`is_primary`)
) ENGINE=MyISAM  DEFAULT CHARSET=utf8 AUTO_INCREMENT=1;