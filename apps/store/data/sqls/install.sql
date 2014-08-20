CREATE TABLE IF NOT EXISTS `[PREFIX]stock` (
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

INSERT INTO `[PREFIX]stock` (`id`, `managers`, `name`, `pinyin`, `deleted`) VALUES (1, '1', '总库', '', 0);

CREATE TABLE IF NOT EXISTS `[PREFIX]stockin` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `bill_id` varchar(50) NOT NULL,
  `type_id` smallint(5) DEFAULT NULL,
  `subject` varchar(255) DEFAULT NULL,
  `dateline` varchar(12) NOT NULL,
  `total_num` decimal(11,2) NOT NULL,
  `user_id` int(11) NOT NULL,
  `stock_manager` int(11) NOT NULL,
  `status` smallint(1) NOT NULL DEFAULT '0',
  `source_model` varchar(50) DEFAULT NULL,
  `source_id` int(11) DEFAULT NULL,
  `memo` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `bill_id` (`bill_id`),
  KEY `type_id` (`type_id`,`dateline`,`user_id`,`stock_manager`,`source_model`,`source_id`),
  KEY `status` (`status`)
) ENGINE=InnoDB  DEFAULT CHARSET=utf8 AUTO_INCREMENT=1;

CREATE TABLE IF NOT EXISTS `[PREFIX]stockin_detail` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `stockin_id` int(11) NOT NULL,
  `goods_id` int(11) NOT NULL,
  `num` decimal(10,2) NOT NULL,
  `factory_code_all` varchar(40) NOT NULL,
  `stock_id` smallint(5) DEFAULT NULL,
  `memo` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `stockin_id` (`stockin_id`,`goods_id`),
  KEY `factory_code_all` (`factory_code_all`),
  KEY `stock_id` (`stock_id`)
) ENGINE=InnoDB  DEFAULT CHARSET=utf8 AUTO_INCREMENT=1;

CREATE TABLE IF NOT EXISTS `[PREFIX]stockout` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `bill_id` varchar(50) NOT NULL,
  `source_id` int(11) NOT NULL,
  `source_model` varchar(20) NOT NULL,
  `dateline` varchar(12) NOT NULL,
  `outtime` varchar(12) DEFAULT NULL,
  `total_num` decimal(10,2) NOT NULL,
  `stock_manager` int(11) NOT NULL DEFAULT '0',
  `status` smallint(1) NOT NULL,
  `memo` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `source_id` (`source_id`,`dateline`,`outtime`,`stock_manager`),
  KEY `status` (`status`),
  KEY `source_model` (`source_model`)
) ENGINE=InnoDB  DEFAULT CHARSET=utf8 AUTO_INCREMENT=1 ;

CREATE TABLE IF NOT EXISTS `[PREFIX]stockout_detail` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `stockout_id` int(11) NOT NULL,
  `factory_code_all` varchar(50) NOT NULL,
  `goods_id` int(11) NOT NULL,
  `stock_id` smallint(5) NOT NULL,
  `num` decimal(10,2) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `stockout_id` (`stockout_id`),
  KEY `factory_code_all` (`factory_code_all`,`goods_id`,`stock_id`)
) ENGINE=InnoDB  DEFAULT CHARSET=utf8 AUTO_INCREMENT=1 ;


CREATE TABLE IF NOT EXISTS `[PREFIX]stock_product_list` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `factory_code_all` varchar(40) NOT NULL,
  `goods_id` int(11) NOT NULL,
  `stock_id` int(11) NOT NULL,
  `unit_price` decimal(10,2) NOT NULL,
  `cost` decimal(10,2) NOT NULL,
  `num` decimal(8,2) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `factory_code_all` (`factory_code_all`,`stock_id`),
  KEY `goods_id` (`goods_id`,`stock_id`)
) ENGINE=InnoDB  DEFAULT CHARSET=utf8 AUTO_INCREMENT=1;