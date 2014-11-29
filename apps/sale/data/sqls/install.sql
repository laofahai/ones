CREATE TABLE IF NOT EXISTS `__PREFIX__orders` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `bill_id` varchar(20) NOT NULL,
  `sale_type` smallint(3) NOT NULL,
  `saler_id` int(11) NOT NULL,
  `customer_id` int(11) NOT NULL,
  `total_num` decimal(10,2) NOT NULL DEFAULT '0.00',
  `total_amount` decimal(10,2) NOT NULL DEFAULT '0.00',
  `total_amount_real` decimal(10,2) NOT NULL DEFAULT '0.00',
  `dateline` varchar(12) NOT NULL,
  `status` smallint(1) NOT NULL DEFAULT '0',
  `memo` varchar(255) DEFAULT NULL,
  `deleted` smallint(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `subject` (`customer_id`,`dateline`,`status`),
  KEY `sale_type` (`sale_type`),
  KEY `saler_id` (`saler_id`),
  KEY `deleted` (`deleted`)
) ENGINE=InnoDB  DEFAULT CHARSET=utf8 AUTO_INCREMENT=1 ;

-- separator

CREATE TABLE IF NOT EXISTS `__PREFIX__orders_detail` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `goods_id` int(11) NOT NULL,
  `factory_code_all` varchar(50) NOT NULL,
  `num` decimal(10,2) NOT NULL,
  `unit_price` decimal(10,2) NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `discount` smallint(3) NOT NULL,
  `order_id` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `goods_id` (`goods_id`,`factory_code_all`,`order_id`)
) ENGINE=InnoDB  DEFAULT CHARSET=utf8 AUTO_INCREMENT=1 ;

-- separator


CREATE TABLE IF NOT EXISTS `__PREFIX__returns` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `bill_id` varchar(30) NOT NULL,
  `returns_type` smallint(3) NOT NULL,
  `saler_id` int(11) NOT NULL,
  `customer_id` int(11) NOT NULL,
  `total_num` decimal(10,2) NOT NULL DEFAULT '0.00',
  `total_amount` decimal(10,2) NOT NULL DEFAULT '0.00',
  `total_amount_real` decimal(10,2) NOT NULL DEFAULT '0.00',
  `dateline` varchar(12) NOT NULL,
  `status` smallint(1) NOT NULL DEFAULT '0',
  `memo` varchar(255) DEFAULT NULL,
  `deleted` smallint(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `subject` (`saler_id`,`customer_id`,`dateline`,`status`),
  KEY `sale_type` (`returns_type`),
  KEY `deleted` (`deleted`)
) ENGINE=InnoDB  DEFAULT CHARSET=utf8 AUTO_INCREMENT=1 ;

-- separator


CREATE TABLE IF NOT EXISTS `__PREFIX__returns_detail` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `returns_id` int(11) NOT NULL,
  `goods_id` int(11) NOT NULL,
  `num` int(11) NOT NULL,
  `factory_code_all` varchar(50) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `order_id` (`returns_id`,`goods_id`,`num`),
  KEY `factory_code_all` (`factory_code_all`)
) ENGINE=InnoDB  DEFAULT CHARSET=utf8 AUTO_INCREMENT=1 ;
