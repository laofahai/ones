CREATE TABLE IF NOT EXISTS `__PREFIX__remind` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `type` varchar(50) NOT NULL,
  `num` smallint(5) NOT NULL DEFAULT '0',
  `content` text NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `type` (`type`,`user_id`),
  KEY `num` (`num`),
  KEY `user_id` (`user_id`)
) ENGINE=MyISAM  DEFAULT CHARSET=utf8 AUTO_INCREMENT=1 ;