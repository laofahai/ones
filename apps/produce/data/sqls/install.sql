CREATE TABLE IF NOT EXISTS `__PREFIX__craft` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(50) NOT NULL,
  `listorder` smallint(3) NOT NULL DEFAULT '99',
  `memo` varchar(255) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `listorder` (`listorder`)
) ENGINE=MyISAM  DEFAULT CHARSET=utf8 AUTO_INCREMENT=1 ;

-- separator

CREATE TABLE IF NOT EXISTS `__PREFIX__goods_craft` (
  `goods_id` int(11) NOT NULL AUTO_INCREMENT,
  `craft_id` smallint(5) NOT NULL,
  `listorder` smallint(3) NOT NULL DEFAULT '99',
  KEY `goods_id` (`goods_id`,`craft_id`,`listorder`)
) ENGINE=MyISAM  DEFAULT CHARSET=utf8 AUTO_INCREMENT=1 ;

-- separator

CREATE TABLE IF NOT EXISTS `__PREFIX__produce_boms` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `plan_id` int(11) NOT NULL,
  `plan_detail_id` int(11) NOT NULL,
  `goods_id` int(11) NOT NULL,
  `factory_code_all` varchar(40) NOT NULL,
  `num` decimal(10,2) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `plan_id` (`plan_id`,`plan_detail_id`,`goods_id`,`factory_code_all`)
) ENGINE=InnoDB  DEFAULT CHARSET=utf8 AUTO_INCREMENT=1 ;

-- separator

CREATE TABLE IF NOT EXISTS `__PREFIX__produce_plan` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `type` smallint(4) NULL,
  `total_num` decimal(10,2) NOT NULL,
  `start_time` varchar(12) NOT NULL,
  `end_time` varchar(12) NOT NULL,
  `create_time` varchar(12) NOT NULL,
  `status` smallint(1) NOT NULL DEFAULT '0',
  `memo` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `type` (`type`,`start_time`,`end_time`,`create_time`,`status`)
) ENGINE=InnoDB  DEFAULT CHARSET=utf8 AUTO_INCREMENT=1 ;

-- separator

CREATE TABLE IF NOT EXISTS `__PREFIX__produce_plan_detail` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `plan_id` int(11) NOT NULL,
  `goods_id` int(11) NOT NULL,
  `factory_code_all` varchar(40) NOT NULL,
  `num` decimal(10,2) NOT NULL,
  `start_time` varchar(12) NOT NULL,
  `end_time` varchar(12) NOT NULL,
  `status` smallint(1) NOT NULL,
  `memo` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `plan_id` (`plan_id`,`goods_id`,`factory_code_all`,`start_time`,`end_time`,`status`)
) ENGINE=InnoDB  DEFAULT CHARSET=utf8 AUTO_INCREMENT=1 ;

-- separator

CREATE TABLE IF NOT EXISTS `__PREFIX__produce_process` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `plan_id` int(11) NOT NULL,
  `plan_detail_id` int(11) NOT NULL,
  `goods_id` int(11) NOT NULL,
  `factory_code_all` varchar(40) NOT NULL,
  `craft_id` smallint(3) NOT NULL,
  `start_time` varchar(12) NOT NULL,
  `end_time` varchar(12) DEFAULT NULL,
  `status` smallint(1) NOT NULL DEFAULT '0',
  `memo` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `plan_id` (`plan_id`,`plan_detail_id`,`start_time`,`end_time`,`status`),
  KEY `craft_id` (`craft_id`),
  KEY `goods_id` (`goods_id`,`factory_code_all`)
) ENGINE=InnoDB  DEFAULT CHARSET=utf8 AUTO_INCREMENT=1 ;

-- separator

CREATE TABLE IF NOT EXISTS `__PREFIX__product_tpl` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `goods_id` int(11) NOT NULL,
  `factory_code_all` varchar(50) NOT NULL,
  `memo` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `goods_id` (`goods_id`,`factory_code_all`)
) ENGINE=MyISAM  DEFAULT CHARSET=utf8 AUTO_INCREMENT=1 ;

-- separator

CREATE TABLE IF NOT EXISTS `__PREFIX__product_tpl_detail` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `tpl_id` smallint(5) NOT NULL,
  `goods_id` int(11) NOT NULL,
  `factory_code_all` varchar(50) NOT NULL,
  `num` int(11) NOT NULL,
  `memo` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `tpl_id` (`tpl_id`,`goods_id`,`factory_code_all`),
  KEY `goods_id` (`goods_id`)
) ENGINE=MyISAM  DEFAULT CHARSET=utf8 AUTO_INCREMENT=1 ;