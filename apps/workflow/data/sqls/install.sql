CREATE TABLE IF NOT EXISTS `__PREFIX__workflow` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `alias` varchar(30) NOT NULL,
  `name` varchar(50) NOT NULL,
  `workflow_file` varchar(255) DEFAULT NULL COMMENT '工作流辅助文件',
  `memo` varchar(255) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `alias` (`alias`)
) ENGINE=MyISAM  DEFAULT CHARSET=utf8 AUTO_INCREMENT=1 ;

-- separator

CREATE TABLE IF NOT EXISTS `__PREFIX__workflow_node` (
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
  `max_times` smallint(5) NOT NULL DEFAULT '9999',
  `status_text` varchar(50) NOT NULL,
  `memo` varchar(255) DEFAULT NULL,
  `btn_class` varchar(20) NOT NULL,
  `status_class` varchar(20) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `workflow_id` (`workflow_id`,`prev_node_id`,`next_node_id`,`remind`),
  KEY `listorder` (`listorder`),
  KEY `default` (`is_default`)
) ENGINE=MyISAM  DEFAULT CHARSET=utf8 AUTO_INCREMENT=1 ;


-- separator

CREATE TABLE IF NOT EXISTS `__PREFIX__workflow_process` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `workflow_id` int(11) NOT NULL,
  `node_id` int(11) NOT NULL,
  `mainrow_id` int(11) NOT NULL,
  `context` text NOT NULL,
  `start_time` varchar(12) NOT NULL,
  `end_time` varchar(12) NOT NULL,
  `status` smallint(1) NOT NULL,
  `user_id` int(11) NOT NULL,
  `memo` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `workflow_id` (`workflow_id`,`node_id`,`start_time`,`end_time`,`status`,`user_id`),
  KEY `mainrow_id` (`mainrow_id`)
) ENGINE=MyISAM  DEFAULT CHARSET=utf8 AUTO_INCREMENT=1 ;