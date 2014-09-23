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
) ENGINE=MyISAM  DEFAULT CHARSET=utf8 AUTO_INCREMENT=7 ;



INSERT INTO `[PREFIX]apps` (`id`, `alias`, `abbreviation`, `version`, `dateline`, `status`) VALUES
  (1, 'department', 'DP', '0.1', 1406906639, 1),
  (2, 'dashboard', 'DBD', '0.1', 1406906639, 1),
  (3, 'services', 'SVS', '0.1', 1406906639, 1),
  (4, 'dataModel', '', '0.1', 1409042540, 1),
  (5, 'workflow', '', '0.1', 1409042547, 1),
  (6, 'multiSearch', 'MTSC', '0.1', 1406906639, 1);


CREATE TABLE IF NOT EXISTS `[PREFIX]auth_group` (
  `id` mediumint(8) unsigned NOT NULL AUTO_INCREMENT,
  `title` char(100) NOT NULL DEFAULT '',
  `status` tinyint(1) NOT NULL DEFAULT '1',
  PRIMARY KEY (`id`)
) ENGINE=MyISAM  DEFAULT CHARSET=utf8 AUTO_INCREMENT=2 ;


INSERT INTO `[PREFIX]auth_group` (`id`, `title`, `status`) VALUES
  (1, '超级管理员', 1);


CREATE TABLE IF NOT EXISTS `[PREFIX]auth_group_access` (
  `uid` mediumint(8) unsigned NOT NULL,
  `group_id` mediumint(8) unsigned NOT NULL,
  UNIQUE KEY `uid_group_id` (`uid`,`group_id`),
  KEY `uid` (`uid`),
  KEY `group_id` (`group_id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8;


INSERT INTO `[PREFIX]auth_group_access` (`uid`, `group_id`) VALUES
  (1, 1);


CREATE TABLE IF NOT EXISTS `[PREFIX]auth_group_rule` (
  `group_id` smallint(5) NOT NULL,
  `rule_id` int(11) NOT NULL,
  `flag` tinyint(1) NOT NULL DEFAULT '1',
  KEY `group_id` (`group_id`,`rule_id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8;



CREATE TABLE IF NOT EXISTS `[PREFIX]auth_rule` (
  `id` mediumint(8) unsigned NOT NULL AUTO_INCREMENT,
  `name` char(80) NOT NULL DEFAULT '',
  `status` tinyint(1) NOT NULL DEFAULT '1',
  `cond` char(100) NOT NULL DEFAULT '',
  `category` varchar(20) NOT NULL DEFAULT 'all',
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`),
  KEY `category` (`category`)
) ENGINE=MyISAM  DEFAULT CHARSET=utf8 AUTO_INCREMENT=244 ;



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
  (214, 'home.apps.delete', 1, '', 'basedata'),
  (223, 'datamodel.datamodel.read', 1, '', 'dataModel'),
  (224, 'datamodel.datamodel.add', 1, '', 'dataModel'),
  (225, 'datamodel.datamodel.edit', 1, '', 'dataModel'),
  (226, 'datamodel.datamodel.delete', 1, '', 'dataModel'),
  (227, 'datamodel.datamodelfields.read', 1, '', 'dataModel'),
  (228, 'datamodel.datamodelfields.add', 1, '', 'dataModel'),
  (229, 'datamodel.datamodelfields.edit', 1, '', 'dataModel'),
  (230, 'datamodel.datamodelfields.delete', 1, '', 'dataModel'),
  (231, 'datamodel.datamodeldata.read', 1, '', 'dataModel'),
  (232, 'datamodel.datamodeldata.add', 1, '', 'dataModel'),
  (233, 'datamodel.datamodeldata.edit', 1, '', 'dataModel'),
  (234, 'datamodel.datamodeldata.delete', 1, '', 'dataModel'),
  (235, 'workflow.workflowprocess.read', 1, '', 'workflow'),
  (236, 'workflow.workflow.read', 1, '', 'workflow'),
  (237, 'workflow.workflow.add', 1, '', 'workflow'),
  (238, 'workflow.workflow.edit', 1, '', 'workflow'),
  (239, 'workflow.workflow.delete', 1, '', 'workflow'),
  (240, 'workflow.workflownode.read', 1, '', 'workflow'),
  (241, 'workflow.workflownode.add', 1, '', 'workflow'),
  (242, 'workflow.workflownode.edit', 1, '', 'workflow'),
  (243, 'workflow.workflownode.delete', 1, '', 'workflow');



CREATE TABLE IF NOT EXISTS `[PREFIX]config` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `app_alias` varchar(50) DEFAULT NULL,
  `alias` varchar(100) NOT NULL,
  `name` varchar(30) NOT NULL,
  `value` varchar(50) NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  `protected` smallint(1) NOT NULL DEFAULT '0',
  `deleted` smallint(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  UNIQUE KEY `alias_2` (`alias`),
  UNIQUE KEY `name_2` (`name`),
  KEY `name` (`name`,`value`),
  KEY `alias` (`alias`),
  KEY `deleted` (`deleted`),
  KEY `app_id` (`app_alias`),
  KEY `protected` (`protected`)
) ENGINE=MyISAM  DEFAULT CHARSET=utf8 AUTO_INCREMENT=47 ;



INSERT INTO `[PREFIX]config` (`id`, `app_alias`, `alias`, `name`, `value`, `description`, `protected`, `deleted`) VALUES
  (1, NULL, 'company_name', '公司名称', '某某公司名称', NULL, 0, 0),
  (2, NULL, 'company_address', '公司地址', '某某公司地址', NULL, 0, 0),
  (3, NULL, 'company_phone', '联系电话', '0536-88888888', NULL, 0, 0),
  (4, NULL, 'dataModel.showOnlyBind', '数据模型查询选项', '0', '是否仅显示所绑定分类的数据模型项', 0, 0),
  (8, NULL, 'debt_limit', '欠款额度', '0', '超过此额度会有提醒，0为不提醒', 0, 0),
  (9, NULL, 'allow_negative_store', '允许负库存', '1', '是否允许负库存，允许写1 不允许写0', 0, 0),
  (10, NULL, 'backup.sendto.email', '备份文件发送邮箱', 'admin@domain.com', '备份发送至邮箱', 0, 0),
  (11, NULL, 'backup.days', '定期备份', '1', '以天位单位。', 0, 0),
  (12, NULL, 'remote.service.uri', '远程服务地址', 'http://service.ng-erp.com/index.php?s=/', '包括程序更新、帮助信息等', 0, 0),
  (15, NULL, 'system.version', '当前系统版本', '0.1.3', '请勿手动修改', 0, 0),
  (39, NULL, 'goods.unique.template', '商品唯一编码生成模板', 'factory_code,color,size', '以逗号分隔，第一个默认为goods表factory_code字段，后面为数据模型字段的alias', 0, 0),
  (40, NULL, 'goods.unique.separator', '商品唯一字段分隔符', '-', '开始使用之后请勿修改', 0, 0),
  (41, NULL, 'mail.address', '服务邮箱地址', 'ones_robot@163.com', '', 0, 0),
  (42, NULL, 'mail.smtp', '邮箱SMTP服务器', 'smtp.163.com', '', 0, 0),
  (43, NULL, 'mail.login', '邮箱登录账号', 'ones_robot@163.com', '', 0, 0),
  (44, NULL, 'mail.password', '邮箱密码', 'thisisones', '', 0, 0),
  (45, NULL, 'mail.fromname', '发件人名称', 'ONES Robots', '', 0, 0),
  (46, NULL, 'site.title', '站点标题', 'ONES ERP', '', 0, 0);


CREATE TABLE IF NOT EXISTS `[PREFIX]data_model` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(15) NOT NULL,
  `alias` varchar(50) NOT NULL,
  `type` varchar(20) NOT NULL,
  `listable` smallint(1) NOT NULL DEFAULT '1',
  `deleted` smallint(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `type` (`type`),
  KEY `deleted` (`deleted`),
  KEY `ailas` (`alias`)
) ENGINE=MyISAM  DEFAULT CHARSET=utf8 AUTO_INCREMENT=5 ;



INSERT INTO `[PREFIX]data_model` (`id`, `name`, `alias`, `type`, `listable`, `deleted`) VALUES
  (1, '产品基础信息模型', 'goodsBaseInfo', 'product', 1, 0),
  (2, '产品扩展属性模型', 'product', 'product', 1, 0),
  (3, '往来单位基本信息扩展模型', 'crmBaseInfo', 'crm', 1, 0),
  (4, '往来单位联系人信息扩展', 'crmContact', 'crm', 1, 0);



CREATE TABLE IF NOT EXISTS `[PREFIX]data_model_data` (
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



CREATE TABLE IF NOT EXISTS `[PREFIX]data_model_fields` (
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



CREATE TABLE IF NOT EXISTS `[PREFIX]department` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `pid` int(5) NOT NULL DEFAULT '0',
  `name` varchar(50) NOT NULL,
  `leader` varchar(50) NOT NULL,
  `lft` smallint(5) NOT NULL,
  `rgt` smallint(5) NOT NULL,
  `listorder` smallint(5) NOT NULL DEFAULT '99',
  PRIMARY KEY (`id`),
  KEY `lft` (`lft`,`rgt`,`listorder`),
  KEY `parentid` (`pid`)
) ENGINE=MyISAM  DEFAULT CHARSET=utf8 AUTO_INCREMENT=9 ;



INSERT INTO `[PREFIX]department` (`id`, `pid`, `name`, `leader`, `lft`, `rgt`, `listorder`) VALUES
  (1, 0, '某公司', '', 1, 4, 99),
  (2, 1, '总经办', '', 2, 3, 99);



CREATE TABLE IF NOT EXISTS `[PREFIX]my_desktop` (
  `uid` int(11) NOT NULL,
  `name` varchar(50) NOT NULL,
  `listorder` smallint(3) NOT NULL DEFAULT '99',
  KEY `uid` (`uid`,`listorder`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8;



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
  `phone` varchar(20) NOT NULL,
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


CREATE TABLE IF NOT EXISTS `[PREFIX]workflow` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `alias` varchar(30) NOT NULL,
  `name` varchar(50) NOT NULL,
  `workflow_file` varchar(255) DEFAULT NULL COMMENT '工作流辅助文件',
  `memo` varchar(255) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `alias` (`alias`)
) ENGINE=MyISAM  DEFAULT CHARSET=utf8 AUTO_INCREMENT=1 ;



CREATE TABLE IF NOT EXISTS `[PREFIX]workflow_node` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `workflow_id` int(11) NOT NULL,
  `name` varchar(50) NOT NULL,
  `type` smallint(1) NOT NULL COMMENT '1人为决策2自动处理3等待外部相应,4分支,5汇总6结束节点',
  `execute_file` varchar(50) NOT NULL,
  `listorder` smallint(5) NOT NULL,
  `prev_node_id` varchar(50) NOT NULL,
  `next_node_id` varchar(50) NOT NULL,
  `executor` varchar(255) NOT NULL,
  `cond` text COMMENT '可执行上下文条件',
  `is_default` smallint(1) NOT NULL DEFAULT '0' COMMENT '若有分支，默认执行',
  `execute_type` smallint(1) NOT NULL COMMENT '0一人执行,1所有人执行',
  `remind` int(11) NOT NULL COMMENT '是否提醒',
  `max_time` int(11) NOT NULL COMMENT '最大执行时间，超出失效，小时',
  `status_text` varchar(50) NOT NULL,
  `memo` varchar(255) DEFAULT NULL,
  `btn_class` varchar(20) NOT NULL,
  `status_class` varchar(20) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `workflow_id` (`workflow_id`,`prev_node_id`,`next_node_id`,`remind`),
  KEY `listorder` (`listorder`),
  KEY `default` (`is_default`)
) ENGINE=MyISAM  DEFAULT CHARSET=utf8 AUTO_INCREMENT=1 ;



CREATE TABLE IF NOT EXISTS `[PREFIX]workflow_process` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `workflow_id` int(11) NOT NULL,
  `node_id` int(11) NOT NULL,
  `mainrow_id` int(11) NOT NULL,
  `context` text NOT NULL,
  `start_time` varchar(12) NOT NULL,
  `end_time` varchar(12) NOT NULL,
  `status` smallint(1) NOT NULL,
  `user_id` int(11) NOT NULL,
  `memo` text,
  PRIMARY KEY (`id`),
  KEY `workflow_id` (`workflow_id`,`node_id`,`start_time`,`end_time`,`status`,`user_id`),
  KEY `mainrow_id` (`mainrow_id`)
) ENGINE=MyISAM  DEFAULT CHARSET=utf8 AUTO_INCREMENT=1 ;