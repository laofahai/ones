CREATE TABLE IF NOT EXISTS `__PREFIX__stock` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `managers` varchar(50) NOT NULL DEFAULT '',
  `name` varchar(50) NOT NULL,
  `pinyin` varchar(20) NOT NULL,
  `deleted` smallint(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `name` (`name`),
  KEY `deleted` (`deleted`),
  KEY `pinyin` (`pinyin`)
) ENGINE=InnoDB  DEFAULT CHARSET=utf8 AUTO_INCREMENT=2 ;

-- separator

INSERT INTO `__PREFIX__stock` (`id`, `managers`, `name`, `pinyin`, `deleted`) VALUES (1, '1', '总库', '', 0);

-- separator

CREATE TABLE IF NOT EXISTS `__PREFIX__stockin` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `bill_id` varchar(50) NOT NULL,
  `type_id` smallint(5) DEFAULT NULL,
  `subject` varchar(255) DEFAULT NULL,
  `dateline` varchar(12) NOT NULL,
  `total_num` decimal(11,2) NOT NULL,
  `ined_num` decimal(10,2) NOT NULL,
  `user_id` int(11) NOT NULL,
  `stock_manager` int(11) NOT NULL,
  `status` smallint(1) NOT NULL DEFAULT '0',
  `source_model` varchar(50) DEFAULT NULL,
  `source_id` int(11) DEFAULT NULL,
  `memo` varchar(255) DEFAULT NULL,
  `deleted` smallint(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  UNIQUE KEY `bill_id` (`bill_id`),
  KEY `type_id` (`type_id`,`dateline`,`user_id`,`stock_manager`,`source_model`,`source_id`),
  KEY `status` (`status`),
  KEY `deleted` (`deleted`)
) ENGINE=MyISAM  DEFAULT CHARSET=utf8 AUTO_INCREMENT=1 ;

-- separator

CREATE TABLE IF NOT EXISTS `__PREFIX__stockin_detail` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `stockin_id` int(11) NOT NULL,
  `goods_id` int(11) NOT NULL,
  `num` decimal(10,2) NOT NULL,
  `ined` decimal(10,2) NOT NULL,
  `factory_code_all` varchar(40) NOT NULL,
  `stock_id` smallint(5) DEFAULT NULL,
  `memo` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `stockin_id` (`stockin_id`,`goods_id`),
  KEY `factory_code_all` (`factory_code_all`),
  KEY `stock_id` (`stock_id`)
) ENGINE=MyISAM  DEFAULT CHARSET=utf8 AUTO_INCREMENT=1 ;

-- separator

CREATE TABLE IF NOT EXISTS `__PREFIX__stockout` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `bill_id` varchar(50) NOT NULL,
  `source_id` int(11) DEFAULT NULL,
  `source_model` varchar(20) DEFAULT NULL,
  `dateline` varchar(12) NOT NULL,
  `outtime` varchar(12) DEFAULT NULL,
  `total_num` decimal(10,2) NOT NULL,
  `outed_num` decimal(10,2) NOT NULL DEFAULT '0.00',
  `stock_manager` int(11) NOT NULL DEFAULT '0',
  `express_id` int(11) DEFAULT NULL,
  `status` smallint(1) NOT NULL,
  `memo` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `source_id` (`source_id`,`dateline`,`outtime`,`stock_manager`),
  KEY `status` (`status`),
  KEY `source_model` (`source_model`),
  KEY `express_id` (`express_id`)
) ENGINE=MyISAM  DEFAULT CHARSET=utf8 AUTO_INCREMENT=1 ;

-- separator


CREATE TABLE IF NOT EXISTS `__PREFIX__stockout_detail` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `stockout_id` int(11) NOT NULL,
  `factory_code_all` varchar(50) NOT NULL,
  `goods_id` int(11) NOT NULL,
  `stock_id` smallint(5) NOT NULL,
  `num` decimal(10,2) NOT NULL,
  `outed` decimal(10,2) NOT NULL DEFAULT '0.00',
  `memo` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `stockout_id` (`stockout_id`),
  KEY `factory_code_all` (`factory_code_all`,`goods_id`,`stock_id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8 AUTO_INCREMENT=1 ;

-- separator


CREATE TABLE IF NOT EXISTS `__PREFIX__stock_product_list` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `factory_code_all` varchar(40) NOT NULL,
  `goods_id` int(11) NOT NULL,
  `stock_id` int(11) NOT NULL,
  `store_min` decimal(10,2) NOT NULL DEFAULT '0.00',
  `store_max` decimal(10,2) NOT NULL DEFAULT '0.00',
  `unit_price` decimal(10,2) NOT NULL,
  `cost` decimal(10,2) NOT NULL,
  `num` decimal(8,2) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `factory_code_all` (`factory_code_all`,`stock_id`),
  KEY `goods_id` (`goods_id`,`stock_id`),
  KEY `store_min` (`store_min`,`store_max`)
) ENGINE=MyISAM  DEFAULT CHARSET=utf8 AUTO_INCREMENT=1 ;

-- separator

CREATE TABLE IF NOT EXISTS `__PREFIX__stock_log` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `type` smallint(1) NOT NULL,
  `user_id` int(11) NOT NULL,
  `source_id` int(11) NOT NULL,
  `repository_id` smallint(5) NOT NULL,
  `dateline` int(11) NOT NULL,
  `goods_id` int(11) NOT NULL,
  `factory_code_all` varchar(80) NOT NULL,
  `num` decimal(10,2) NOT NULL,
  `memo` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`,`repository_id`,`factory_code_all`),
  KEY `source_id` (`source_id`),
  KEY `goods_id` (`goods_id`)
) ENGINE=MyISAM  DEFAULT CHARSET=utf8 AUTO_INCREMENT=1 ;
