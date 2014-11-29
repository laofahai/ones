CREATE TABLE IF NOT EXISTS `__PREFIX__purchase` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `bill_id` varchar(20) NOT NULL,
  `purchase_type` smallint(3) NOT NULL,
  `source_model` varchar(50) DEFAULT NULL,
  `source_id` int(11) DEFAULT NULL,
  `user_id` int(11) NOT NULL,
  `supplier_id` int(11) NOT NULL,
  `total_num` decimal(10,2) NOT NULL DEFAULT '0.00',
  `total_amount` decimal(10,2) NOT NULL DEFAULT '0.00',
  `total_amount_real` decimal(10,2) NOT NULL DEFAULT '0.00',
  `dateline` varchar(12) NOT NULL,
  `status` smallint(1) NOT NULL DEFAULT '0',
  `memo` varchar(255) DEFAULT NULL,
  `deleted` smallint(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `subject` (`supplier_id`,`dateline`,`status`),
  KEY `sale_type` (`purchase_type`),
  KEY `user_id` (`user_id`),
  KEY `deleted` (`deleted`),
  KEY `source_model` (`source_model`),
  KEY `source_id` (`source_id`)
) ENGINE=MyISAM  DEFAULT CHARSET=utf8 AUTO_INCREMENT=1 ;

-- separator

CREATE TABLE IF NOT EXISTS `__PREFIX__purchase_detail` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `purchase_id` int(11) NOT NULL,
  `goods_id` int(11) NOT NULL,
  `num` decimal(10,2) NOT NULL,
  `unit_price` decimal(10,2) NOT NULL,
  `price` decimal(10,2) NOT NULL,
  `factory_code_all` varchar(50) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `order_id` (`purchase_id`,`goods_id`,`num`),
  KEY `factory_code_all` (`factory_code_all`)
) ENGINE=InnoDB  DEFAULT CHARSET=utf8 ROW_FORMAT=DYNAMIC AUTO_INCREMENT=1 ;