CREATE TABLE IF NOT EXISTS `__PREFIX__goods` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `goods_category_id` int(11) NOT NULL,
  `name` varchar(20) NOT NULL,
  `pinyin` varchar(20) NOT NULL,
  `measure` varchar(5) NOT NULL DEFAULT '件',
  `price` decimal(8,2) NOT NULL,
  `cost` decimal(10,2) NOT NULL,
  `factory_code` varchar(10) NOT NULL,
  `store_min` decimal(5,2) NOT NULL DEFAULT '-1.00',
  `store_max` decimal(5,2) NOT NULL DEFAULT '0.00',
  `deleted` smallint(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  UNIQUE KEY `factory_code_2` (`factory_code`),
  KEY `goods_category_id` (`goods_category_id`),
  KEY `factory_code` (`factory_code`),
  KEY `store_max` (`store_max`),
  KEY `pinyin` (`pinyin`),
  KEY `deleted` (`deleted`)
) ENGINE=MyISAM  DEFAULT CHARSET=utf8 AUTO_INCREMENT=1 ;

-- separator

CREATE TABLE IF NOT EXISTS `__PREFIX__goods_category` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `pid` int(5) NOT NULL DEFAULT '0',
  `name` varchar(50) NOT NULL,
  `pinyin` varchar(15) DEFAULT NULL,
  `lft` smallint(5) NOT NULL,
  `rgt` smallint(5) NOT NULL,
  `listorder` smallint(5) NOT NULL DEFAULT '99',
  `deleted` smallint(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `lft` (`lft`,`rgt`,`listorder`),
  KEY `parentid` (`pid`),
  KEY `pinyin` (`pinyin`),
  KEY `deleted` (`deleted`)
) ENGINE=InnoDB  DEFAULT CHARSET=utf8 AUTO_INCREMENT=1 ;

-- separator

INSERT INTO `__PREFIX__goods_category` (id, pid, name, pinyin, lft, rgt, listorder, deleted) VALUES(null,0,"ROOT",null,1,2,0,0);