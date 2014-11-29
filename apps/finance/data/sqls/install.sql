CREATE TABLE IF NOT EXISTS `__PREFIX__finance_account` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(50) NOT NULL,
  `listorder` smallint(3) NOT NULL DEFAULT '99',
  `balance` float(10,2) NOT NULL DEFAULT '0.00',
  PRIMARY KEY (`id`),
  KEY `listorder` (`listorder`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 AUTO_INCREMENT=1 ;

-- separator

CREATE TABLE IF NOT EXISTS `__PREFIX__finance_pay_plan` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `subject` varchar(50) NULL,
  `type_id` smallint(5) DEFAULT NULL,
  `user_id` int(11) NOT NULL,
  `financer_id` int(11) NOT NULL DEFAULT '0',
  `account_id` int(11) NOT NULL DEFAULT '0',
  `supplier_id` int(11) DEFAULT NULL,
  `source_model` varchar(50) DEFAULT NULL,
  `source_id` int(11) DEFAULT NULL,
  `amount` float(10,2) NOT NULL,
  `create_dateline` varchar(12) NOT NULL,
  `pay_dateline` varchar(12) DEFAULT NULL,
  `memo` varchar(255) DEFAULT NULL,
  `status` smallint(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`,`supplier_id`,`source_model`,`source_id`,`status`),
  KEY `create_dateline` (`create_dateline`),
  KEY `pay_dateline` (`pay_dateline`),
  KEY `account_id` (`account_id`),
  KEY `financer_id` (`financer_id`),
  KEY `type_id` (`type_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 AUTO_INCREMENT=1 ;

-- separator

CREATE TABLE IF NOT EXISTS `__PREFIX__finance_receive_plan` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `subject` varchar(50) NULL,
  `type_id` smallint(5) NULL,
  `user_id` int(11) NOT NULL,
  `financer_id` int(11) NOT NULL DEFAULT '0',
  `account_id` int(11) NOT NULL DEFAULT '0',
  `customer_id` int(11) NULL,
  `source_model` varchar(50) DEFAULT NULL,
  `source_id` int(11) DEFAULT NULL,
  `amount` float(10,2) NOT NULL,
  `create_dateline` varchar(12) NOT NULL,
  `pay_dateline` varchar(12) NOT NULL,
  `memo` varchar(255) NULL,
  `status` smallint(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`,`customer_id`,`source_model`,`source_id`,`status`),
  KEY `create_dateline` (`create_dateline`),
  KEY `pay_dateline` (`pay_dateline`),
  KEY `account_id` (`account_id`),
  KEY `financer_id` (`financer_id`),
  KEY `type_id` (`type_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 AUTO_INCREMENT=1 ;

-- separator

CREATE TABLE IF NOT EXISTS `__PREFIX__finance_record` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `type_id` smallint(5) NOT NULL,
  `account_id` smallint(3) NOT NULL,
  `user_id` int(11) NOT NULL,
  `financer_id` int(11) DEFAULT NULL,
  `amount` decimal(10,2) NOT NULL,
  `type` smallint(1) NOT NULL DEFAULT '1' COMMENT '1进2出',
  `status` smallint(1) NOT NULL DEFAULT '0',
  `dateline` varchar(12) NOT NULL,
  `memo` varchar(255) DEFAULT NULL,
  `deleted` smallint(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `account_id` (`account_id`),
  KEY `type` (`type`,`status`),
  KEY `dateline` (`dateline`),
  KEY `user_id` (`user_id`),
  KEY `financer_id` (`financer_id`),
  KEY `type_id` (`type_id`),
  KEY `deleted` (`deleted`)
) ENGINE=MyISAM  DEFAULT CHARSET=utf8 AUTO_INCREMENT=1 ;
