CREATE TABLE IF NOT EXISTS `__PREFIX__data_model` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(15) NOT NULL,
  `alias` varchar(50) NOT NULL,
  `type` varchar(20) NOT NULL,
  `listAble` smallint(1) NOT NULL DEFAULT '1',
  `deleted` smallint(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `type` (`type`),
  KEY `deleted` (`deleted`),
  KEY `ailas` (`alias`)
) ENGINE=MyISAM  DEFAULT CHARSET=utf8 AUTO_INCREMENT=1 ;

-- separator

CREATE TABLE IF NOT EXISTS `__PREFIX__data_model_data` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `source_id` int(11) NOT NULL,
  `model_id` int(11) NOT NULL,
  `field_id` int(11) NOT NULL,
  `data` varchar(50) NOT NULL,
  `pinyin` varchar(50) NOT NULL,
  `deleted` smallint(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `source_id` (`source_id`,`field_id`),
  KEY `model_id` (`model_id`),
  KEY `deleted` (`deleted`),
  KEY `pinyi` (`pinyin`),
  KEY `data` (`data`)
) ENGINE=MyISAM  DEFAULT CHARSET=utf8 AUTO_INCREMENT=1 ;

-- separator

CREATE TABLE IF NOT EXISTS `__PREFIX__data_model_fields` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `model_id` int(11) NOT NULL,
  `display_name` varchar(30) NOT NULL,
  `field_name` varchar(30) NOT NULL,
  `input_type` varchar(20) NOT NULL,
  `extra_data` text NOT NULL,
  `listorder` smallint(2) NOT NULL DEFAULT '99',
  `deleted` smallint(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `model_id` (`model_id`),
  KEY `type` (`input_type`),
  KEY `listorder` (`listorder`),
  KEY `deleted` (`deleted`)
) ENGINE=MyISAM  DEFAULT CHARSET=utf8 AUTO_INCREMENT=1 ;

-- separator

INSERT INTO `__PREFIX__data_model`(id,name,alias,type,listAble,deleted)VALUES(null,"产品基础信息模型","goodsBaseInfo","product",1,0);
-- separator
INSERT INTO `__PREFIX__data_model`(id,name,alias,type,listAble,deleted)VALUES(null,"产品扩展属性模型","product","product",1,0);
-- separator
INSERT INTO `__PREFIX__data_model`(id,name,alias,type,listAble,deleted)VALUES(null,"往来单位基本信息扩展模型","crmBaseInfo","crm",1,0);
-- separator
INSERT INTO `__PREFIX__data_model`(id,name,alias,type,listAble,deleted)VALUES(null,"往来单位联系人信息扩展","crmContact","crm",1,0);
