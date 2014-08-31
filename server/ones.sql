CREATE TABLE IF NOT EXISTS `[PREFIX]apps` (
  `id` smallint(3) NOT NULL AUTO_INCREMENT,
  `alias` varchar(50) NOT NULL,
  `abbreviation` varchar(10) NOT NULL,
  `version` varchar(30) NOT NULL,
  `dateline` int(11) NOT NULL,
  `status` smallint(1) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `alias_2` (`alias`),
  KEY `alias` (`alias`,`dateline`,`status`),
  KEY `version` (`version`),
  KEY `abbreviation` (`abbreviation`)
) ENGINE=MyISAM  DEFAULT CHARSET=utf8 AUTO_INCREMENT=4 ;


INSERT INTO `[PREFIX]apps` (`id`, `alias`, `abbreviation`, `version`, `dateline`, `status`) VALUES
(1, 'department', 'DP', '0.1', 1406906639, 1),
(2, 'dashboard', 'DBD', '0.1', 1406906639, 1),
(3, 'services', 'SVS', '0.1', 1406906639, 1);


CREATE TABLE IF NOT EXISTS `[PREFIX]auth_group` (
  `id` mediumint(8) unsigned NOT NULL AUTO_INCREMENT,
  `title` char(100) NOT NULL DEFAULT '',
  `status` tinyint(1) NOT NULL DEFAULT '1',
  PRIMARY KEY (`id`)
) ENGINE=MyISAM  DEFAULT CHARSET=utf8 AUTO_INCREMENT=4 ;


INSERT INTO `[PREFIX]auth_group` (`id`, `title`, `status`) VALUES
(1, '超级管理员', 1),
(2, '库管', 1),
(3, '财务', 1);


CREATE TABLE IF NOT EXISTS `[PREFIX]auth_group_access` (
  `uid` mediumint(8) unsigned NOT NULL,
  `group_id` mediumint(8) unsigned NOT NULL,
  UNIQUE KEY `uid_group_id` (`uid`,`group_id`),
  KEY `uid` (`uid`),
  KEY `group_id` (`group_id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8;


CREATE TABLE IF NOT EXISTS `[PREFIX]auth_group_rule` (
  `group_id` smallint(5) NOT NULL,
  `rule_id` int(11) NOT NULL,
  `flag` tinyint(1) NOT NULL DEFAULT '1',
  KEY `group_id` (`group_id`,`rule_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;


INSERT INTO `[PREFIX]auth_group_rule` (`group_id`, `rule_id`, `flag`) VALUES
(1, 110, 0),
(1, 111, 0),
(1, 112, 0),
(1, 113, 0),
(1, 162, 0),
(1, 163, 0),
(1, 202, 0),
(1, 203, 0),
(1, 204, 0),
(1, 208, 0),
(1, 209, 0),
(1, 210, 0),
(1, 211, 0),
(1, 212, 0),
(1, 213, 0),
(1, 214, 0),
(1, 428, 0),
(1, 429, 0),
(1, 430, 0),
(1, 431, 0),
(1, 432, 0),
(1, 433, 0),
(1, 434, 0),
(1, 435, 0),
(1, 436, 0),
(1, 437, 0),
(1, 438, 0),
(1, 439, 0),
(1, 416, 0),
(1, 417, 0),
(1, 418, 0),
(1, 419, 0),
(1, 420, 0),
(1, 421, 0),
(1, 422, 0),
(1, 423, 0),
(1, 424, 0),
(1, 425, 0),
(1, 426, 0),
(1, 427, 0),
(1, 396, 0),
(1, 397, 0),
(1, 398, 0),
(1, 399, 0),
(1, 400, 0),
(1, 401, 0),
(1, 402, 0),
(1, 403, 0),
(1, 474, 0),
(1, 475, 0),
(1, 476, 0),
(1, 477, 0),
(1, 457, 0),
(1, 458, 0),
(1, 459, 0),
(1, 460, 0),
(1, 461, 0),
(1, 462, 0),
(1, 463, 0),
(1, 464, 0),
(1, 11, 0),
(1, 12, 0),
(1, 13, 0),
(1, 14, 0),
(1, 15, 0),
(1, 16, 0),
(1, 17, 0),
(1, 18, 0),
(1, 19, 0),
(1, 20, 0),
(1, 21, 0),
(1, 28, 0),
(1, 63, 0),
(1, 78, 0),
(1, 79, 0),
(1, 80, 0),
(1, 81, 0),
(1, 94, 0),
(1, 192, 0),
(1, 207, 0),
(1, 440, 0),
(1, 441, 0),
(1, 442, 0),
(1, 443, 0),
(1, 444, 0),
(1, 445, 0),
(1, 446, 0),
(1, 447, 0),
(1, 448, 0),
(1, 449, 0),
(1, 450, 0),
(1, 451, 0),
(1, 452, 0),
(1, 453, 0),
(1, 454, 0),
(1, 455, 0),
(1, 456, 0),
(1, 473, 0),
(1, 472, 0),
(1, 471, 0),
(1, 470, 0),
(1, 469, 0),
(1, 468, 0),
(1, 467, 0),
(1, 466, 0),
(1, 465, 0);


CREATE TABLE IF NOT EXISTS `[PREFIX]auth_rule` (
  `id` mediumint(8) unsigned NOT NULL AUTO_INCREMENT,
  `name` char(80) NOT NULL DEFAULT '',
  `status` tinyint(1) NOT NULL DEFAULT '1',
  `cond` char(100) NOT NULL DEFAULT '',
  `category` varchar(20) NOT NULL DEFAULT 'all',
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`),
  KEY `category` (`category`)
) ENGINE=MyISAM  DEFAULT CHARSET=utf8 AUTO_INCREMENT=215 ;


INSERT INTO `[PREFIX]auth_rule` (`id`, `name`, `status`, `cond`, `category`) VALUES
(11, 'department.authgroup.read', 1, '', 'set'),
(12, 'department.authrule.add', 1, '', 'set'),
(13, 'department.authrule.edit', 1, '', 'set'),
(14, 'department.authrule.delete', 1, '', 'set'),
(15, 'department.department.add', 1, '', 'set'),
(16, 'department.department.edit', 1, '', 'set'),
(17, 'department.department.delete', 1, '', 'set'),
(18, 'department.user.add', 1, '', 'set'),
(19, 'department.user.edit', 1, '', 'set'),
(20, 'department.user.read', 1, '', 'set'),
(21, 'department.user.delete', 1, '', 'set'),
(28, 'department.authrule.read', 1, '', 'set'),
(63, 'department.department.read', 1, '', 'set'),
(78, 'home.config.read', 1, '', 'set'),
(79, 'home.config.add', 1, '', 'set'),
(80, 'home.config.edit', 1, '', 'set'),
(81, 'home.config.delete', 1, '', 'set'),
(94, 'home.clearcache.read', 1, '', 'set'),
(110, 'home.types.read', 1, '', 'basedata'),
(111, 'home.types.add', 1, '', 'basedata'),
(112, 'home.types.edit', 1, '', 'basedata'),
(113, 'home.types.delete', 1, '', 'basedata'),
(162, 'department.authgrouprule.read', 1, '', 'department'),
(163, 'department.authgrouprule.edit', 1, '', 'department'),
(192, 'services.databackup.read', 1, '', 'set'),
(202, 'dashboard.userdesktop.add', 1, '', 'basedata'),
(203, 'dashboard.userdesktop.edit', 1, '', 'basedata'),
(204, 'dashboard.userdesktop.delete', 1, '', 'basedata'),
(207, 'services.systemupdate.read', 1, '', 'set'),
(208, 'department.authgroup.add', 1, '', 'department'),
(209, 'department.authgroup.edit', 1, '', 'department'),
(210, 'department.authgroup.delete', 1, '', 'department'),
(211, 'home.apps.read', 1, '', 'basedata'),
(212, 'home.apps.add', 1, '', 'basedata'),
(213, 'home.apps.edit', 1, '', 'basedata'),
(214, 'home.apps.delete', 1, '', 'basedata');


CREATE TABLE IF NOT EXISTS `[PREFIX]config` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `app_alias` varchar(50) DEFAULT NULL,
  `alias` varchar(100) NOT NULL,
  `name` varchar(30) NOT NULL,
  `value` varchar(50) NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  `deleted` smallint(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  UNIQUE KEY `alias_2` (`alias`),
  UNIQUE KEY `name_2` (`name`),
  KEY `name` (`name`,`value`),
  KEY `alias` (`alias`),
  KEY `deleted` (`deleted`),
  KEY `app_id` (`app_alias`)
) ENGINE=MyISAM  DEFAULT CHARSET=utf8 AUTO_INCREMENT=46 ;


INSERT INTO `[PREFIX]config` (`id`, `app_alias`, `alias`, `name`, `value`, `description`, `deleted`) VALUES
(1, NULL, 'company_name', '公司名称', '诸城某某服装公司', NULL, 0),
(2, NULL, 'company_address', '公司地址', '山东省诸城市人民东路', NULL, 0),
(3, NULL, 'company_phone', '联系电话', '0536-6086084', NULL, 0),
(8, NULL, 'debt_limit', '欠款额度', '0', '超过此额度会有提醒，0为不提醒', 0),
(9, NULL, 'allow_negative_store', '允许负库存', '1', '是否允许负库存，允许写1 不允许写0', 0),
(10, NULL, 'backup.sendto.email', '备份文件发送邮箱', '335454250@qq.com', '备份发送至邮箱', 0),
(11, NULL, 'backup.days', '定期备份', '1', '以天位单位。', 0),
(12, NULL, 'remote.service.uri', '远程服务地址', 'http://service.ng-erp.com/index.php?s=/', '包括程序更新、帮助信息等', 0),
(15, NULL, 'system.version', '当前系统版本', '0.1', '请勿手动修改', 0),
(38, NULL, 'test', 'test', 'test', '123', 1),
(39, NULL, 'goods.unique.template', '商品唯一编码生成模板', 'factory_code,standard,version', '以逗号分隔，第一个默认为goods表factory_code字段，后面为数据模型字段的alias', 0),
(40, NULL, 'goods.unique.separator', '商品唯一字段分隔符', '-', '开始使用之后请勿修改', 0),
(41, NULL, 'mail.address', '服务邮箱地址', 'ones_robot@163.com', '', 0),
(42, NULL, 'mail.smtp', '邮箱SMTP服务器', 'smtp.163.com', '', 0),
(43, NULL, 'mail.login', '邮箱登录账号', 'ones_robot@163.com', '', 0),
(44, NULL, 'mail.password', '邮箱密码', 'thisisones', '', 0),
(45, NULL, 'mail.fromname', '发件人名称', 'ONES Robots', '', 0);


CREATE TABLE IF NOT EXISTS `[PREFIX]department` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `pid` int(5) NOT NULL DEFAULT '0',
  `name` varchar(50) NOT NULL,
  `lft` smallint(5) NOT NULL,
  `rgt` smallint(5) NOT NULL,
  `listorder` smallint(5) NOT NULL DEFAULT '99',
  PRIMARY KEY (`id`),
  KEY `lft` (`lft`,`rgt`,`listorder`),
  KEY `parentid` (`pid`)
) ENGINE=InnoDB  DEFAULT CHARSET=utf8 AUTO_INCREMENT=3 ;



INSERT INTO `[PREFIX]department` (`id`, `pid`, `name`, `lft`, `rgt`, `listorder`) VALUES
(1, 0, '某公司', 1, 4, 99),
(2, 1, '总经办', 2, 3, 99);



CREATE TABLE IF NOT EXISTS `[PREFIX]my_desktop` (
  `uid` int(11) NOT NULL,
  `desk_id` smallint(3) NOT NULL,
  `listorder` smallint(3) NOT NULL DEFAULT '99',
  KEY `uid` (`uid`,`listorder`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8;



INSERT INTO `[PREFIX]my_desktop` (`uid`, `desk_id`, `listorder`) VALUES
(13, 1, 99),
(13, 2, 99),
(13, 3, 99),
(13, 5, 99);



CREATE TABLE IF NOT EXISTS `[PREFIX]session` (
  `session_id` varchar(255) NOT NULL,
  `session_expire` int(11) NOT NULL,
  `session_data` blob,
  UNIQUE KEY `session_id` (`session_id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8;



CREATE TABLE IF NOT EXISTS `[PREFIX]types` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `type` varchar(20) NOT NULL,
  `alias` varchar(20) DEFAULT NULL,
  `name` varchar(20) NOT NULL,
  `listorder` smallint(3) NOT NULL,
  `status` tinyint(1) NOT NULL DEFAULT '1',
  `deleted` smallint(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `type` (`type`,`listorder`),
  KEY `alias` (`alias`),
  KEY `deleted` (`deleted`)
) ENGINE=MyISAM  DEFAULT CHARSET=utf8 AUTO_INCREMENT=1 ;



CREATE TABLE IF NOT EXISTS `[PREFIX]user` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `email` varchar(50) NOT NULL,
  `truename` varchar(30) NOT NULL,
  `username` varchar(50) NOT NULL,
  `password` varchar(50) NOT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `status` smallint(1) NOT NULL,
  `department_id` int(11) NOT NULL,
  `qq` varchar(20) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email_2` (`email`),
  UNIQUE KEY `username` (`username`),
  KEY `email` (`email`,`username`),
  KEY `department_id` (`department_id`),
  KEY `truename` (`truename`)
) ENGINE=MyISAM  DEFAULT CHARSET=utf8 AUTO_INCREMENT=1 ;



CREATE TABLE IF NOT EXISTS `[PREFIX]user_desktop` (
  `id` smallint(3) NOT NULL AUTO_INCREMENT,
  `name` varchar(50) NOT NULL,
  `template` varchar(255) NOT NULL,
  `width` smallint(2) NOT NULL DEFAULT '6',
  `listorder` smallint(3) NOT NULL DEFAULT '99',
  PRIMARY KEY (`id`),
  KEY `listorder` (`listorder`)
) ENGINE=MyISAM  DEFAULT CHARSET=utf8 AUTO_INCREMENT=6 ;



INSERT INTO `[PREFIX]user_desktop` (`id`, `name`, `template`, `width`, `listorder`) VALUES
(1, '最近入库', 'latestStockin.html', 6, 99),
(2, '最近出库', 'latestStockout.html', 6, 99),
(3, '出库待处理', 'needStockout.html', 6, 99),
(5, '在产产品', 'producePlanDetail.html', 6, 99);