-- phpMyAdmin SQL Dump
-- version 4.1.9
-- http://www.phpmyadmin.net
--
-- Host: 127.0.0.1
-- Generation Time: 2014-09-16 22:07:21
-- 服务器版本： 5.1.73
-- PHP Version: 5.4.24

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;

--
-- Database: `ones`
--

-- --------------------------------------------------------

--
-- 表的结构 `x_apps`
--

CREATE TABLE IF NOT EXISTS `x_apps` (
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
) ENGINE=MyISAM  DEFAULT CHARSET=utf8 AUTO_INCREMENT=15 ;

--
-- 转存表中的数据 `x_apps`
--

INSERT INTO `x_apps` (`id`, `alias`, `abbreviation`, `version`, `dateline`, `status`) VALUES
(1, 'department', 'DP', '0.1', 1406906639, 1),
(2, 'dashboard', 'DBD', '0.1', 1406906639, 1),
(3, 'services', 'SVS', '0.1', 1406906639, 1),
(4, 'goods', '', '0.1', 1409042529, 1),
(5, 'dataModel', '', '0.1', 1409042540, 1),
(6, 'workflow', '', '0.1', 1409042547, 1),
(7, 'store', '', '0.1', 1409042556, 1),
(8, 'crm', '', '0.1', 1409042736, 1),
(9, 'sale', '', '0.1', 1409042743, 1),
(10, 'purchase', '', '0.1', 1409042754, 1),
(11, 'finance', '', '0.1', 1409042764, 1),
(12, 'shipment', '', '0.4', 1409042774, 1),
(13, 'produce', '', '0.1', 1409042786, 1),
(14, 'statistics', '', '0.1', 1409042796, 1);

-- --------------------------------------------------------

--
-- 表的结构 `x_auth_group`
--

CREATE TABLE IF NOT EXISTS `x_auth_group` (
  `id` mediumint(8) unsigned NOT NULL AUTO_INCREMENT,
  `title` char(100) NOT NULL DEFAULT '',
  `status` tinyint(1) NOT NULL DEFAULT '1',
  PRIMARY KEY (`id`)
) ENGINE=MyISAM  DEFAULT CHARSET=utf8 AUTO_INCREMENT=4 ;

--
-- 转存表中的数据 `x_auth_group`
--

INSERT INTO `x_auth_group` (`id`, `title`, `status`) VALUES
(1, '超级管理员', 1),
(2, '库管', 1),
(3, '财务', 1);

-- --------------------------------------------------------

--
-- 表的结构 `x_auth_group_access`
--

CREATE TABLE IF NOT EXISTS `x_auth_group_access` (
  `uid` mediumint(8) unsigned NOT NULL,
  `group_id` mediumint(8) unsigned NOT NULL,
  UNIQUE KEY `uid_group_id` (`uid`,`group_id`),
  KEY `uid` (`uid`),
  KEY `group_id` (`group_id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8;

--
-- 转存表中的数据 `x_auth_group_access`
--

INSERT INTO `x_auth_group_access` (`uid`, `group_id`) VALUES
(1, 1),
(1, 2),
(2, 2),
(2, 3);

-- --------------------------------------------------------

--
-- 表的结构 `x_auth_group_rule`
--

CREATE TABLE IF NOT EXISTS `x_auth_group_rule` (
  `group_id` smallint(5) NOT NULL,
  `rule_id` int(11) NOT NULL,
  `flag` tinyint(1) NOT NULL DEFAULT '1',
  KEY `group_id` (`group_id`,`rule_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- 转存表中的数据 `x_auth_group_rule`
--

INSERT INTO `x_auth_group_rule` (`group_id`, `rule_id`, `flag`) VALUES
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
(1, 110, 0),
(1, 111, 0),
(1, 112, 0),
(1, 113, 0),
(1, 162, 0),
(1, 163, 0),
(1, 192, 0),
(1, 202, 0),
(1, 203, 0),
(1, 204, 0),
(1, 207, 0),
(1, 208, 0),
(1, 209, 0),
(1, 210, 0),
(1, 211, 0),
(1, 212, 0),
(1, 213, 0),
(1, 214, 0),
(1, 215, 0),
(1, 216, 0),
(1, 217, 0),
(1, 218, 0),
(1, 219, 0),
(1, 220, 0),
(1, 221, 0),
(1, 222, 0),
(1, 223, 0),
(1, 224, 0),
(1, 225, 0),
(1, 226, 0),
(1, 227, 0),
(1, 228, 0),
(1, 229, 0),
(1, 230, 0),
(1, 231, 0),
(1, 232, 0),
(1, 233, 0),
(1, 234, 0),
(1, 235, 0),
(1, 236, 0),
(1, 237, 0),
(1, 238, 0),
(1, 239, 0),
(1, 240, 0),
(1, 241, 0),
(1, 242, 0),
(1, 243, 0),
(1, 244, 0),
(1, 245, 0),
(1, 246, 0),
(1, 247, 0),
(1, 248, 0),
(1, 249, 0),
(1, 250, 0),
(1, 251, 0),
(1, 252, 0),
(1, 253, 0),
(1, 254, 0),
(1, 255, 0),
(1, 256, 0),
(1, 257, 0),
(1, 258, 0),
(1, 259, 0),
(1, 260, 0),
(1, 261, 0),
(1, 262, 0),
(1, 263, 0),
(1, 264, 0),
(1, 265, 0),
(1, 266, 0),
(1, 267, 0),
(1, 268, 0),
(1, 269, 0),
(1, 270, 0),
(1, 271, 0),
(1, 272, 0),
(1, 273, 0),
(1, 274, 0),
(1, 275, 0),
(1, 276, 0),
(1, 277, 0),
(1, 278, 0),
(1, 279, 0),
(1, 280, 0),
(1, 281, 0),
(1, 282, 0),
(1, 283, 0),
(1, 284, 0),
(1, 285, 0),
(1, 286, 0),
(1, 287, 0),
(1, 288, 0),
(1, 289, 0),
(1, 290, 0),
(1, 291, 0),
(1, 292, 0),
(1, 293, 0),
(1, 294, 0),
(1, 295, 0),
(1, 296, 0),
(1, 297, 0),
(1, 298, 0),
(1, 299, 0),
(1, 300, 0),
(1, 305, 0),
(1, 306, 0),
(1, 307, 0),
(1, 308, 0),
(1, 309, 0),
(1, 310, 0),
(1, 311, 0),
(1, 312, 0),
(1, 313, 0),
(1, 314, 0),
(1, 315, 0),
(1, 316, 0),
(1, 317, 0),
(1, 318, 0),
(1, 319, 0),
(1, 320, 0),
(1, 321, 0),
(1, 322, 0),
(1, 323, 0),
(1, 324, 0),
(1, 325, 0),
(1, 326, 0),
(1, 327, 0),
(1, 328, 0),
(1, 329, 0),
(1, 330, 0),
(1, 331, 0),
(1, 332, 0),
(1, 333, 0),
(1, 301, 0),
(1, 302, 0),
(1, 303, 0),
(1, 304, 0);

-- --------------------------------------------------------

--
-- 表的结构 `x_auth_rule`
--

CREATE TABLE IF NOT EXISTS `x_auth_rule` (
  `id` mediumint(8) unsigned NOT NULL AUTO_INCREMENT,
  `name` char(80) NOT NULL DEFAULT '',
  `status` tinyint(1) NOT NULL DEFAULT '1',
  `cond` char(100) NOT NULL DEFAULT '',
  `category` varchar(20) NOT NULL DEFAULT 'all',
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`),
  KEY `category` (`category`)
) ENGINE=MyISAM  DEFAULT CHARSET=utf8 AUTO_INCREMENT=334 ;

--
-- 转存表中的数据 `x_auth_rule`
--

INSERT INTO `x_auth_rule` (`id`, `name`, `status`, `cond`, `category`) VALUES
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
(215, 'goods.goods.read', 1, '', 'goods'),
(216, 'goods.goods.add', 1, '', 'goods'),
(217, 'goods.goods.edit', 1, '', 'goods'),
(218, 'goods.goods.delete', 1, '', 'goods'),
(219, 'goods.goodscategory.read', 1, '', 'goods'),
(220, 'goods.goodscategory.add', 1, '', 'goods'),
(221, 'goods.goodscategory.edit', 1, '', 'goods'),
(222, 'goods.goodscategory.delete', 1, '', 'goods'),
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
(243, 'workflow.workflownode.delete', 1, '', 'workflow'),
(244, 'store.stockwarning.read', 1, '', 'store'),
(245, 'store.stock.read', 1, '', 'store'),
(246, 'store.stock.add', 1, '', 'store'),
(247, 'store.stock.edit', 1, '', 'store'),
(248, 'store.stock.delete', 1, '', 'store'),
(249, 'store.stockin.read', 1, '', 'store'),
(250, 'store.stockin.add', 1, '', 'store'),
(251, 'store.stockin.edit', 1, '', 'store'),
(252, 'store.stockin.delete', 1, '', 'store'),
(253, 'store.stockout.read', 1, '', 'store'),
(254, 'store.stockout.add', 1, '', 'store'),
(255, 'store.stockout.edit', 1, '', 'store'),
(256, 'store.stockout.delete', 1, '', 'store'),
(257, 'store.stockproductlist.read', 1, '', 'store'),
(258, 'store.stockproductlist.add', 1, '', 'store'),
(259, 'store.stockproductlist.edit', 1, '', 'store'),
(260, 'store.stockproductlist.delete', 1, '', 'store'),
(261, 'crm.relationshipcompanylinkman.read', 1, '', 'crm'),
(262, 'crm.relationshipcompanylinkman.add', 1, '', 'crm'),
(263, 'crm.relationshipcompanylinkman.edit', 1, '', 'crm'),
(264, 'crm.relationshipcompanylinkman.delete', 1, '', 'crm'),
(265, 'crm.relationshipcompany.read', 1, '', 'crm'),
(266, 'crm.relationshipcompany.add', 1, '', 'crm'),
(267, 'crm.relationshipcompany.edit', 1, '', 'crm'),
(268, 'crm.relationshipcompany.delete', 1, '', 'crm'),
(269, 'crm.relationshipcompanygroup.read', 1, '', 'crm'),
(270, 'crm.relationshipcompanygroup.add', 1, '', 'crm'),
(271, 'crm.relationshipcompanygroup.edit', 1, '', 'crm'),
(272, 'crm.relationshipcompanygroup.delete', 1, '', 'crm'),
(273, 'sale.orders.read', 1, '', 'sale'),
(274, 'sale.orders.add', 1, '', 'sale'),
(275, 'sale.orders.edit', 1, '', 'sale'),
(276, 'sale.orders.delete', 1, '', 'sale'),
(277, 'sale.returns.read', 1, '', 'sale'),
(278, 'sale.returns.add', 1, '', 'sale'),
(279, 'sale.returns.edit', 1, '', 'sale'),
(280, 'sale.returns.delete', 1, '', 'sale'),
(281, 'purchase.purchase.read', 1, '', 'purchase'),
(282, 'purchase.purchase.add', 1, '', 'purchase'),
(283, 'purchase.purchase.edit', 1, '', 'purchase'),
(284, 'purchase.purchase.delete', 1, '', 'purchase'),
(285, 'finance.financeaccount.read', 1, '', 'finance'),
(286, 'finance.financeaccount.add', 1, '', 'finance'),
(287, 'finance.financeaccount.edit', 1, '', 'finance'),
(288, 'finance.financeaccount.delete', 1, '', 'finance'),
(289, 'finance.financepayplan.read', 1, '', 'finance'),
(290, 'finance.financepayplan.add', 1, '', 'finance'),
(291, 'finance.financepayplan.edit', 1, '', 'finance'),
(292, 'finance.financepayplan.delete', 1, '', 'finance'),
(293, 'finance.financereceiveplan.read', 1, '', 'finance'),
(294, 'finance.financereceiveplan.add', 1, '', 'finance'),
(295, 'finance.financereceiveplan.edit', 1, '', 'finance'),
(296, 'finance.financereceiveplan.delete', 1, '', 'finance'),
(297, 'finance.financerecord.read', 1, '', 'finance'),
(298, 'finance.financerecord.add', 1, '', 'finance'),
(299, 'finance.financerecord.edit', 1, '', 'finance'),
(300, 'finance.financerecord.delete', 1, '', 'finance'),
(301, 'shipment.shipment.read', 1, '', 'shipment'),
(302, 'shipment.shipment.add', 1, '', 'shipment'),
(303, 'shipment.shipment.edit', 1, '', 'shipment'),
(304, 'shipment.shipment.delete', 1, '', 'shipment'),
(305, 'produce.docraft.read', 1, '', 'produce'),
(306, 'produce.produceplandetail.read', 1, '', 'produce'),
(307, 'produce.craft.read', 1, '', 'produce'),
(308, 'produce.craft.add', 1, '', 'produce'),
(309, 'produce.craft.edit', 1, '', 'produce'),
(310, 'produce.craft.delete', 1, '', 'produce'),
(311, 'produce.goodscraft.read', 1, '', 'produce'),
(312, 'produce.goodscraft.add', 1, '', 'produce'),
(313, 'produce.goodscraft.edit', 1, '', 'produce'),
(314, 'produce.goodscraft.delete', 1, '', 'produce'),
(315, 'produce.produceboms.read', 1, '', 'produce'),
(316, 'produce.produceboms.add', 1, '', 'produce'),
(317, 'produce.produceboms.edit', 1, '', 'produce'),
(318, 'produce.produceboms.delete', 1, '', 'produce'),
(319, 'produce.produceplan.read', 1, '', 'produce'),
(320, 'produce.produceplan.add', 1, '', 'produce'),
(321, 'produce.produceplan.edit', 1, '', 'produce'),
(322, 'produce.produceplan.delete', 1, '', 'produce'),
(323, 'produce.producttpl.read', 1, '', 'produce'),
(324, 'produce.producttpl.add', 1, '', 'produce'),
(325, 'produce.producttpl.edit', 1, '', 'produce'),
(326, 'produce.producttpl.delete', 1, '', 'produce'),
(327, 'produce.producttpldetail.read', 1, '', 'produce'),
(328, 'produce.producttpldetail.add', 1, '', 'produce'),
(329, 'produce.producttpldetail.edit', 1, '', 'produce'),
(330, 'produce.producttpldetail.delete', 1, '', 'produce'),
(331, 'statistics.sale.read', 1, '', 'statistics'),
(332, 'statistics.overview.read', 1, '', 'statistics'),
(333, 'statistics.productview.read', 1, '', 'statistics');

-- --------------------------------------------------------

--
-- 表的结构 `x_config`
--

CREATE TABLE IF NOT EXISTS `x_config` (
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

--
-- 转存表中的数据 `x_config`
--

INSERT INTO `x_config` (`id`, `app_alias`, `alias`, `name`, `value`, `description`, `protected`, `deleted`) VALUES
(1, NULL, 'company_name', '公司名称', '某某公司名称', NULL, 0, 0),
(2, NULL, 'company_address', '公司地址', '某某公司地址', NULL, 0, 0),
(3, NULL, 'company_phone', '联系电话', '0536-88888888', NULL, 0, 0),
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

-- --------------------------------------------------------

--
-- 表的结构 `x_craft`
--

CREATE TABLE IF NOT EXISTS `x_craft` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(50) NOT NULL,
  `listorder` smallint(3) NOT NULL DEFAULT '99',
  `memo` varchar(255) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `listorder` (`listorder`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8 AUTO_INCREMENT=1 ;

-- --------------------------------------------------------

--
-- 表的结构 `x_data_model`
--

CREATE TABLE IF NOT EXISTS `x_data_model` (
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

--
-- 转存表中的数据 `x_data_model`
--

INSERT INTO `x_data_model` (`id`, `name`, `alias`, `type`, `listable`, `deleted`) VALUES
(1, '产品基础信息模型', 'goodsBaseInfo', 'product', 1, 0),
(2, '产品扩展属性模型', 'product', 'product', 1, 0),
(3, '往来单位基本信息扩展模型', 'crmBaseInfo', 'crm', 1, 0),
(4, '往来单位联系人信息扩展', 'crmContact', 'crm', 1, 0);

-- --------------------------------------------------------

--
-- 表的结构 `x_data_model_data`
--

CREATE TABLE IF NOT EXISTS `x_data_model_data` (
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
) ENGINE=MyISAM  DEFAULT CHARSET=utf8 AUTO_INCREMENT=3 ;

--
-- 转存表中的数据 `x_data_model_data`
--

INSERT INTO `x_data_model_data` (`id`, `source_id`, `model_id`, `field_id`, `data`, `pinyin`, `deleted`) VALUES
(1, 10, 2, 1, '通用', 'TY', 0),
(2, 10, 2, 4, '120瓦', '120W', 0);

-- --------------------------------------------------------

--
-- 表的结构 `x_data_model_fields`
--

CREATE TABLE IF NOT EXISTS `x_data_model_fields` (
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
) ENGINE=MyISAM  DEFAULT CHARSET=utf8 AUTO_INCREMENT=5 ;

--
-- 转存表中的数据 `x_data_model_fields`
--

INSERT INTO `x_data_model_fields` (`id`, `model_id`, `display_name`, `field_name`, `input_type`, `extra_data`, `listorder`, `deleted`) VALUES
(1, 2, '规格', 'color', 'select3', 'required::false\neditAbleRequire::''goods_id''\nautoQuery::true\nbindToLabel::true\ndynamicAddAble::true\ndynamicAddOpts::{model:''DataModelDataModel'',postWithExtraData:[''goods_id''],postParams:{modelAlias:''product''}}', 99, 0),
(2, 3, '传真', 'fax', 'text', 'bindToLabel::true', 99, 0),
(3, 4, '生日', 'birthday', 'text', '', 99, 0),
(4, 2, '型号', 'size', 'select3', 'required::false\neditAbleRequire::''goods_id''\nautoQuery::true\nbindToLabel::true\ndynamicAddAble::true\ndynamicAddOpts::{model:''DataModelDataModel'',postWithExtraData:[''goods_id''],postParams:{modelAlias:''product''}}', 99, 0);

-- --------------------------------------------------------

--
-- 表的结构 `x_department`
--

CREATE TABLE IF NOT EXISTS `x_department` (
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

--
-- 转存表中的数据 `x_department`
--

INSERT INTO `x_department` (`id`, `pid`, `name`, `lft`, `rgt`, `listorder`) VALUES
(1, 0, '某公司', 1, 4, 99),
(2, 1, '总经办', 2, 3, 99);

-- --------------------------------------------------------

--
-- 表的结构 `x_finance_account`
--

CREATE TABLE IF NOT EXISTS `x_finance_account` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(50) NOT NULL,
  `listorder` smallint(3) NOT NULL DEFAULT '99',
  `balance` float(10,2) NOT NULL DEFAULT '0.00',
  PRIMARY KEY (`id`),
  KEY `listorder` (`listorder`)
) ENGINE=InnoDB  DEFAULT CHARSET=utf8 AUTO_INCREMENT=2 ;

--
-- 转存表中的数据 `x_finance_account`
--

INSERT INTO `x_finance_account` (`id`, `name`, `listorder`, `balance`) VALUES
(1, '123', 99, 123.00);

-- --------------------------------------------------------

--
-- 表的结构 `x_finance_pay_plan`
--

CREATE TABLE IF NOT EXISTS `x_finance_pay_plan` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `subject` varchar(50) NOT NULL,
  `type_id` smallint(5) NOT NULL,
  `user_id` int(11) NOT NULL,
  `financer_id` int(11) NOT NULL DEFAULT '0',
  `account_id` int(11) NOT NULL DEFAULT '0',
  `supplier_id` int(11) NOT NULL,
  `source_model` varchar(50) DEFAULT NULL,
  `source_id` int(11) NOT NULL,
  `amount` float(10,2) NOT NULL,
  `create_dateline` varchar(12) NOT NULL,
  `pay_dateline` varchar(12) NOT NULL,
  `memo` varchar(255) NOT NULL,
  `status` smallint(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`,`supplier_id`,`source_model`,`source_id`,`status`),
  KEY `create_dateline` (`create_dateline`),
  KEY `pay_dateline` (`pay_dateline`),
  KEY `account_id` (`account_id`),
  KEY `financer_id` (`financer_id`),
  KEY `type_id` (`type_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 AUTO_INCREMENT=1 ;

-- --------------------------------------------------------

--
-- 表的结构 `x_finance_receive_plan`
--

CREATE TABLE IF NOT EXISTS `x_finance_receive_plan` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `subject` varchar(50) NOT NULL,
  `type_id` smallint(5) NOT NULL,
  `user_id` int(11) NOT NULL,
  `financer_id` int(11) NOT NULL DEFAULT '0',
  `account_id` int(11) NOT NULL DEFAULT '0',
  `customer_id` int(11) NOT NULL,
  `source_model` varchar(50) DEFAULT NULL,
  `source_id` int(11) NOT NULL,
  `amount` float(10,2) NOT NULL,
  `create_dateline` varchar(12) NOT NULL,
  `pay_dateline` varchar(12) NOT NULL,
  `memo` varchar(255) NOT NULL,
  `status` smallint(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`,`customer_id`,`source_model`,`source_id`,`status`),
  KEY `create_dateline` (`create_dateline`),
  KEY `pay_dateline` (`pay_dateline`),
  KEY `account_id` (`account_id`),
  KEY `financer_id` (`financer_id`),
  KEY `type_id` (`type_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 AUTO_INCREMENT=1 ;

-- --------------------------------------------------------

--
-- 表的结构 `x_finance_record`
--

CREATE TABLE IF NOT EXISTS `x_finance_record` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `type_id` smallint(5) NOT NULL,
  `account_id` smallint(3) NOT NULL,
  `user_id` int(11) NOT NULL,
  `financer_id` int(11) DEFAULT NULL,
  `amount` float(10,2) NOT NULL,
  `type` smallint(1) NOT NULL DEFAULT '1' COMMENT '1进2出',
  `status` smallint(1) NOT NULL DEFAULT '0',
  `dateline` varchar(12) NOT NULL,
  `memo` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `account_id` (`account_id`),
  KEY `type` (`type`,`status`),
  KEY `dateline` (`dateline`),
  KEY `user_id` (`user_id`),
  KEY `financer_id` (`financer_id`),
  KEY `type_id` (`type_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 AUTO_INCREMENT=1 ;

-- --------------------------------------------------------

--
-- 表的结构 `x_goods`
--

CREATE TABLE IF NOT EXISTS `x_goods` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `goods_category_id` int(11) NOT NULL,
  `name` varchar(20) NOT NULL,
  `pinyin` varchar(20) NOT NULL,
  `measure` varchar(5) NOT NULL DEFAULT '件',
  `price` decimal(10,2) NOT NULL,
  `cost` decimal(10,2) NOT NULL,
  `factory_code` varchar(10) NOT NULL,
  `store_min` decimal(10,2) NOT NULL DEFAULT '-1.00',
  `store_max` decimal(10,2) NOT NULL DEFAULT '0.00',
  `deleted` smallint(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  UNIQUE KEY `factory_code_2` (`factory_code`),
  KEY `goods_category_id` (`goods_category_id`),
  KEY `factory_code` (`factory_code`),
  KEY `store_max` (`store_max`),
  KEY `pinyin` (`pinyin`),
  KEY `deleted` (`deleted`)
) ENGINE=MyISAM  DEFAULT CHARSET=utf8 AUTO_INCREMENT=4 ;

--
-- 转存表中的数据 `x_goods`
--

INSERT INTO `x_goods` (`id`, `goods_category_id`, `name`, `pinyin`, `measure`, `price`, `cost`, `factory_code`, `store_min`, `store_max`, `deleted`) VALUES
(1, 10, '风机', 'FJ', '台', '300.00', '200.00', 'FJ001', '10.00', '30.00', 0),
(2, 14, '锅炉', 'GL', '台', '5980.00', '1.00', 'gl', '1.00', '10.00', 0),
(3, 10, '产品1', 'CP1', '件', '100.00', '1.00', '001', '1.00', '1.00', 1);

-- --------------------------------------------------------

--
-- 表的结构 `x_goods_category`
--

CREATE TABLE IF NOT EXISTS `x_goods_category` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `pid` int(5) NOT NULL DEFAULT '0',
  `name` varchar(50) NOT NULL,
  `bind_model` smallint(5) NOT NULL,
  `pinyin` varchar(15) DEFAULT NULL,
  `lft` smallint(5) NOT NULL,
  `rgt` smallint(5) NOT NULL,
  `listorder` smallint(5) NOT NULL DEFAULT '99',
  `deleted` smallint(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `lft` (`lft`,`rgt`,`listorder`),
  KEY `parentid` (`pid`),
  KEY `pinyin` (`pinyin`),
  KEY `bind_model` (`bind_model`),
  KEY `deleted` (`deleted`)
) ENGINE=InnoDB  DEFAULT CHARSET=utf8 AUTO_INCREMENT=17 ;

--
-- 转存表中的数据 `x_goods_category`
--

INSERT INTO `x_goods_category` (`id`, `pid`, `name`, `bind_model`, `pinyin`, `lft`, `rgt`, `listorder`, `deleted`) VALUES
(1, 0, 'ROOT', 0, NULL, 1, 16, 0, 0),
(10, 1, '电气配件', 0, 'DQPJ', 2, 7, 99, 0),
(11, 1, '焊接耗材', 0, 'HJHC', 8, 11, 99, 0),
(12, 11, '123', 0, '123', 5, 6, 99, 1),
(13, 1, '装机配件', 0, 'ZJPJ', 12, 13, 99, 0),
(14, 1, '成品锅炉', 0, 'CPGL', 14, 15, 99, 0),
(15, 10, '123', 0, '123', 3, 4, 99, 1),
(16, 10, '12', 0, '12', 5, 6, 99, 0);

-- --------------------------------------------------------

--
-- 表的结构 `x_goods_craft`
--

CREATE TABLE IF NOT EXISTS `x_goods_craft` (
  `goods_id` int(11) NOT NULL AUTO_INCREMENT,
  `craft_id` smallint(5) NOT NULL,
  `listorder` smallint(3) NOT NULL DEFAULT '99',
  KEY `goods_id` (`goods_id`,`craft_id`,`listorder`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8 AUTO_INCREMENT=1 ;

-- --------------------------------------------------------

--
-- 表的结构 `x_my_desktop`
--

CREATE TABLE IF NOT EXISTS `x_my_desktop` (
  `uid` int(11) NOT NULL,
  `desk_id` smallint(3) NOT NULL,
  `listorder` smallint(3) NOT NULL DEFAULT '99',
  KEY `uid` (`uid`,`listorder`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8;

--
-- 转存表中的数据 `x_my_desktop`
--

INSERT INTO `x_my_desktop` (`uid`, `desk_id`, `listorder`) VALUES
(13, 1, 99),
(13, 2, 99),
(13, 3, 99),
(13, 5, 99),
(1, 5, 99),
(1, 3, 99),
(1, 2, 99),
(1, 1, 99);

-- --------------------------------------------------------

--
-- 表的结构 `x_orders`
--

CREATE TABLE IF NOT EXISTS `x_orders` (
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8 AUTO_INCREMENT=1 ;

-- --------------------------------------------------------

--
-- 表的结构 `x_orders_detail`
--

CREATE TABLE IF NOT EXISTS `x_orders_detail` (
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8 AUTO_INCREMENT=1 ;

-- --------------------------------------------------------

--
-- 表的结构 `x_produce_boms`
--

CREATE TABLE IF NOT EXISTS `x_produce_boms` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `plan_id` int(11) NOT NULL,
  `plan_detail_id` int(11) NOT NULL,
  `goods_id` int(11) NOT NULL,
  `factory_code_all` varchar(40) NOT NULL,
  `num` decimal(10,2) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `plan_id` (`plan_id`,`plan_detail_id`,`goods_id`,`factory_code_all`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 AUTO_INCREMENT=1 ;

-- --------------------------------------------------------

--
-- 表的结构 `x_produce_plan`
--

CREATE TABLE IF NOT EXISTS `x_produce_plan` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `type` smallint(4) DEFAULT NULL,
  `total_num` decimal(10,2) NOT NULL,
  `start_time` varchar(12) NOT NULL,
  `end_time` varchar(12) NOT NULL,
  `create_time` varchar(12) NOT NULL,
  `status` smallint(1) NOT NULL DEFAULT '0',
  `memo` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `type` (`type`,`start_time`,`end_time`,`create_time`,`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 AUTO_INCREMENT=1 ;

-- --------------------------------------------------------

--
-- 表的结构 `x_produce_plan_detail`
--

CREATE TABLE IF NOT EXISTS `x_produce_plan_detail` (
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8 AUTO_INCREMENT=1 ;

-- --------------------------------------------------------

--
-- 表的结构 `x_produce_process`
--

CREATE TABLE IF NOT EXISTS `x_produce_process` (
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8 AUTO_INCREMENT=1 ;

-- --------------------------------------------------------

--
-- 表的结构 `x_product_tpl`
--

CREATE TABLE IF NOT EXISTS `x_product_tpl` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `goods_id` int(11) NOT NULL,
  `factory_code_all` varchar(50) NOT NULL,
  `memo` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `goods_id` (`goods_id`,`factory_code_all`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8 AUTO_INCREMENT=1 ;

-- --------------------------------------------------------

--
-- 表的结构 `x_product_tpl_detail`
--

CREATE TABLE IF NOT EXISTS `x_product_tpl_detail` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `tpl_id` smallint(5) NOT NULL,
  `goods_id` int(11) NOT NULL,
  `factory_code_all` varchar(50) NOT NULL,
  `num` int(11) NOT NULL,
  `memo` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `tpl_id` (`tpl_id`,`goods_id`,`factory_code_all`),
  KEY `goods_id` (`goods_id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8 AUTO_INCREMENT=1 ;

-- --------------------------------------------------------

--
-- 表的结构 `x_purchase`
--

CREATE TABLE IF NOT EXISTS `x_purchase` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `bill_id` varchar(20) NOT NULL,
  `purchase_type` smallint(3) NOT NULL,
  `user_id` int(11) NOT NULL,
  `supplier_id` int(11) NOT NULL,
  `total_num` decimal(10,2) NOT NULL DEFAULT '0.00',
  `total_amount` decimal(10,2) NOT NULL DEFAULT '0.00',
  `total_amount_real` decimal(10,2) NOT NULL DEFAULT '0.00',
  `dateline` varchar(12) NOT NULL,
  `status` smallint(1) NOT NULL DEFAULT '0',
  `memo` varchar(255) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `subject` (`supplier_id`,`dateline`,`status`),
  KEY `sale_type` (`purchase_type`),
  KEY `user_id` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 AUTO_INCREMENT=1 ;

-- --------------------------------------------------------

--
-- 表的结构 `x_purchase_detail`
--

CREATE TABLE IF NOT EXISTS `x_purchase_detail` (
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8 ROW_FORMAT=DYNAMIC AUTO_INCREMENT=1 ;

-- --------------------------------------------------------

--
-- 表的结构 `x_relationship_company`
--

CREATE TABLE IF NOT EXISTS `x_relationship_company` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(50) NOT NULL,
  `pinyin` varchar(50) NOT NULL,
  `address` varchar(255) DEFAULT NULL,
  `discount` smallint(2) NOT NULL DEFAULT '100',
  `user_id` int(11) NOT NULL,
  `group_id` smallint(5) NOT NULL,
  `dateline` varchar(12) NOT NULL,
  `status` int(11) NOT NULL,
  `memo` text,
  `deleted` smallint(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `name` (`name`,`user_id`),
  KEY `dateline` (`dateline`,`status`),
  KEY `group_id` (`group_id`),
  KEY `pinyin` (`pinyin`),
  KEY `delete` (`deleted`)
) ENGINE=MyISAM  DEFAULT CHARSET=utf8 AUTO_INCREMENT=10 ;

--
-- 转存表中的数据 `x_relationship_company`
--

INSERT INTO `x_relationship_company` (`id`, `name`, `pinyin`, `address`, `discount`, `user_id`, `group_id`, `dateline`, `status`, `memo`, `deleted`) VALUES
(1, '123', '123', '123', 90, 1, 1, '1409056398', 0, '123', 1),
(2, '客户名称', 'KHMC', '东北什么什么地方 280号', 100, 1, 1, '1409324813', 0, 'asdfafd', 1),
(3, '测试客户名称', 'CSKHMC', '333', 100, 1, 3, '1409324889', 0, '123123213', 1),
(4, '测试客户名称123', 'CSKHMC123', '333', 100, 1, 3, '1409324935', 0, '123123213', 1),
(5, '测试客户名称', 'CSKHMC', '333', 100, 1, 3, '1409324952', 0, '123123213', 1),
(6, '测试客户名称', 'CSKHMC', '333', 100, 1, 3, '1409325099', 0, '123123213', 1),
(7, 'tessss', 'tessss', '232', 100, 1, 1, '1409651062', 0, '', 1),
(8, '峰鑫炉业', 'FLY', '山东诸城哪哪哪', 90, 2, 1, '1409747399', 0, '', 0),
(9, '台州风机', 'TZFJ', '台州市', 100, 2, 2, '1410577754', 0, '', 0);

-- --------------------------------------------------------

--
-- 表的结构 `x_relationship_company_group`
--

CREATE TABLE IF NOT EXISTS `x_relationship_company_group` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(30) NOT NULL,
  `discount` smallint(2) NOT NULL DEFAULT '1',
  PRIMARY KEY (`id`)
) ENGINE=MyISAM  DEFAULT CHARSET=utf8 AUTO_INCREMENT=5 ;

--
-- 转存表中的数据 `x_relationship_company_group`
--

INSERT INTO `x_relationship_company_group` (`id`, `name`, `discount`) VALUES
(1, '客户', 100),
(2, '供应商', 100),
(3, '加工商', 100),
(4, 'VIP客户', 90);

-- --------------------------------------------------------

--
-- 表的结构 `x_relationship_company_linkman`
--

CREATE TABLE IF NOT EXISTS `x_relationship_company_linkman` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `relationship_company_id` int(11) NOT NULL,
  `contact` varchar(20) NOT NULL,
  `mobile` varchar(50) NOT NULL,
  `tel` varchar(50) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `qq` varchar(20) DEFAULT NULL,
  `extra` text,
  `dateline` varchar(12) NOT NULL,
  `is_primary` smallint(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `customer_id` (`relationship_company_id`,`dateline`),
  KEY `is_primary` (`is_primary`)
) ENGINE=MyISAM  DEFAULT CHARSET=utf8 AUTO_INCREMENT=24 ;

--
-- 转存表中的数据 `x_relationship_company_linkman`
--

INSERT INTO `x_relationship_company_linkman` (`id`, `relationship_company_id`, `contact`, `mobile`, `tel`, `email`, `qq`, `extra`, `dateline`, `is_primary`) VALUES
(23, 9, '张三', '193289182389', NULL, NULL, NULL, NULL, '', 1),
(22, 8, '老面', '方法反反复复', '444', NULL, NULL, NULL, '', 1);

-- --------------------------------------------------------

--
-- 表的结构 `x_returns`
--

CREATE TABLE IF NOT EXISTS `x_returns` (
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8 AUTO_INCREMENT=1 ;

-- --------------------------------------------------------

--
-- 表的结构 `x_returns_detail`
--

CREATE TABLE IF NOT EXISTS `x_returns_detail` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `returns_id` int(11) NOT NULL,
  `goods_id` int(11) NOT NULL,
  `num` int(11) NOT NULL,
  `factory_code_all` varchar(50) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `order_id` (`returns_id`,`goods_id`,`num`),
  KEY `factory_code_all` (`factory_code_all`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 AUTO_INCREMENT=1 ;

-- --------------------------------------------------------

--
-- 表的结构 `x_session`
--

CREATE TABLE IF NOT EXISTS `x_session` (
  `session_id` varchar(255) NOT NULL,
  `session_expire` int(11) NOT NULL,
  `session_data` blob,
  UNIQUE KEY `session_id` (`session_id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8;

--
-- 转存表中的数据 `x_session`
--

INSERT INTO `x_session` (`session_id`, `session_expire`, `session_data`) VALUES
('7adv0evsdodbjho7vmvr199946', 1410838968, 0x757365727c613a31333a7b733a323a226964223b733a313a2231223b733a353a22656d61696c223b733a31373a2261646d696e65406e672d6572702e636f6d223b733a383a22747275656e616d65223b733a393a22e7aea1e79086e59198223b733a383a22757365726e616d65223b733a31333a2261646d696e6973747261746f72223b733a353a2270686f6e65223b733a31313a223133333333333333333333223b733a363a22737461747573223b733a313a2231223b733a31333a226465706172746d656e745f6964223b733a313a2232223b733a323a227171223b4e3b733a363a2267726f757073223b613a323a7b693a303b613a333a7b733a323a226964223b733a313a2231223b733a353a227469746c65223b733a31353a22e8b685e7baa7e7aea1e79086e59198223b733a363a22737461747573223b733a313a2231223b7d693a313b613a333a7b733a323a226964223b733a313a2232223b733a353a227469746c65223b733a363a22e5ba93e7aea1223b733a363a22737461747573223b733a313a2231223b7d7d733a31303a224465706172746d656e74223b613a373a7b733a323a226964223b733a313a2232223b733a333a22706964223b733a313a2231223b733a343a226e616d65223b733a393a22e680bbe7bb8fe58a9e223b733a333a226c6674223b733a313a2232223b733a333a22726774223b733a313a2233223b733a393a226c6973746f72646572223b733a323a223939223b733a343a2270617468223b733a32313a22e69f90e585ace58fb8203e20e680bbe7bb8fe58a9e223b7d733a393a227573657267726f7570223b733a333a22312c32223b733a393a2267726f75705f696473223b613a323a7b693a303b733a313a2231223b693a313b733a313a2232223b7d733a31323a2267726f75705f6c6162656c73223b613a323a7b693a303b733a31353a22e8b685e7baa7e7aea1e79086e59198223b693a313b733a363a22e5ba93e7aea1223b7d7d);

-- --------------------------------------------------------

--
-- 表的结构 `x_shipment`
--

CREATE TABLE IF NOT EXISTS `x_shipment` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `stockout_id` int(11) DEFAULT '0',
  `shipment_type` smallint(4) NOT NULL,
  `from_name` varchar(50) NOT NULL,
  `from_company` varchar(100) NOT NULL,
  `from_address` varchar(255) NOT NULL,
  `from_phone` varchar(50) NOT NULL,
  `to_name` varchar(50) NOT NULL,
  `to_company` varchar(100) NOT NULL,
  `to_address` varchar(255) NOT NULL,
  `to_phone` varchar(50) NOT NULL,
  `freight_type` smallint(5) NOT NULL DEFAULT '10',
  `freight` float(5,2) NOT NULL,
  `weight` varchar(20) NOT NULL,
  `total_num` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `stockout_id` (`stockout_id`),
  KEY `shipment_type` (`shipment_type`),
  KEY `freight_type` (`freight_type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 AUTO_INCREMENT=1 ;

-- --------------------------------------------------------

--
-- 表的结构 `x_stock`
--

CREATE TABLE IF NOT EXISTS `x_stock` (
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

--
-- 转存表中的数据 `x_stock`
--

INSERT INTO `x_stock` (`id`, `managers`, `name`, `pinyin`, `deleted`) VALUES
(1, '2,1', '总库', '', 0);

-- --------------------------------------------------------

--
-- 表的结构 `x_stockin`
--

CREATE TABLE IF NOT EXISTS `x_stockin` (
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
  `deleted` smallint(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  UNIQUE KEY `bill_id` (`bill_id`),
  KEY `type_id` (`type_id`,`dateline`,`user_id`,`stock_manager`,`source_model`,`source_id`),
  KEY `status` (`status`),
  KEY `deleted` (`deleted`)
) ENGINE=InnoDB  DEFAULT CHARSET=utf8 AUTO_INCREMENT=5 ;

--
-- 转存表中的数据 `x_stockin`
--

INSERT INTO `x_stockin` (`id`, `bill_id`, `type_id`, `subject`, `dateline`, `total_num`, `user_id`, `stock_manager`, `status`, `source_model`, `source_id`, `memo`, `deleted`) VALUES
(1, '1409160927345', NULL, NULL, '1410830834', '10.00', 1, 0, 0, NULL, NULL, NULL, 0),
(3, '1409161042070', NULL, NULL, '1410835299', '2.00', 1, 0, 0, NULL, NULL, NULL, 0),
(4, '1409161042363', NULL, NULL, '1410835343', '1.00', 1, 0, 0, NULL, NULL, NULL, 0);

-- --------------------------------------------------------

--
-- 表的结构 `x_stockin_detail`
--

CREATE TABLE IF NOT EXISTS `x_stockin_detail` (
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
) ENGINE=InnoDB  DEFAULT CHARSET=utf8 AUTO_INCREMENT=4 ;

--
-- 转存表中的数据 `x_stockin_detail`
--

INSERT INTO `x_stockin_detail` (`id`, `stockin_id`, `goods_id`, `num`, `factory_code_all`, `stock_id`, `memo`) VALUES
(1, 1, 1, '10.00', 'FJ001-1-2', 1, NULL),
(2, 3, 1, '2.00', 'FJ001-1-2', 1, NULL),
(3, 4, 1, '1.00', 'FJ001-1-2', 1, NULL);

-- --------------------------------------------------------

--
-- 表的结构 `x_stockout`
--

CREATE TABLE IF NOT EXISTS `x_stockout` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `bill_id` varchar(50) NOT NULL,
  `source_id` int(11) DEFAULT NULL,
  `source_model` varchar(20) DEFAULT NULL,
  `dateline` varchar(12) NOT NULL,
  `outtime` varchar(12) DEFAULT NULL,
  `total_num` decimal(10,2) NOT NULL,
  `outed_num` decimal(10,2) NOT NULL DEFAULT '0.00',
  `stock_manager` int(11) NOT NULL DEFAULT '0',
  `status` smallint(1) NOT NULL,
  `memo` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `source_id` (`source_id`,`dateline`,`outtime`,`stock_manager`),
  KEY `status` (`status`),
  KEY `source_model` (`source_model`)
) ENGINE=InnoDB  DEFAULT CHARSET=utf8 AUTO_INCREMENT=2 ;

--
-- 转存表中的数据 `x_stockout`
--

INSERT INTO `x_stockout` (`id`, `bill_id`, `source_id`, `source_model`, `dateline`, `outtime`, `total_num`, `outed_num`, `stock_manager`, `status`, `memo`) VALUES
(1, 'CK1409160946522', 0, '', '1410832002', NULL, '1.00', '0.00', 1, 0, NULL);

-- --------------------------------------------------------

--
-- 表的结构 `x_stockout_detail`
--

CREATE TABLE IF NOT EXISTS `x_stockout_detail` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `stockout_id` int(11) NOT NULL,
  `factory_code_all` varchar(50) NOT NULL,
  `goods_id` int(11) NOT NULL,
  `stock_id` smallint(5) NOT NULL,
  `num` decimal(10,2) NOT NULL,
  `outed` decimal(10,2) NOT NULL DEFAULT '0.00',
  `memo` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `stockout_id` (`stockout_id`),
  KEY `factory_code_all` (`factory_code_all`,`goods_id`,`stock_id`)
) ENGINE=InnoDB  DEFAULT CHARSET=utf8 AUTO_INCREMENT=2 ;

--
-- 转存表中的数据 `x_stockout_detail`
--

INSERT INTO `x_stockout_detail` (`id`, `stockout_id`, `factory_code_all`, `goods_id`, `stock_id`, `num`, `outed`, `memo`) VALUES
(1, 1, 'FJ001-1-2', 1, 1, '1.00', '0.00', NULL);

-- --------------------------------------------------------

--
-- 表的结构 `x_stock_product_list`
--

CREATE TABLE IF NOT EXISTS `x_stock_product_list` (
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8 AUTO_INCREMENT=1 ;

-- --------------------------------------------------------

--
-- 表的结构 `x_types`
--

CREATE TABLE IF NOT EXISTS `x_types` (
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
) ENGINE=MyISAM  DEFAULT CHARSET=utf8 AUTO_INCREMENT=6 ;

--
-- 转存表中的数据 `x_types`
--

INSERT INTO `x_types` (`id`, `type`, `alias`, `name`, `listorder`, `status`, `deleted`) VALUES
(1, 'produce', 'first', '计划类型1', 99, 1, 0),
(2, 'shipment', 'shunfeng', '顺丰', 99, 1, 0),
(3, 'shipment', 'yuantong', '圆通', 99, 1, 0),
(4, 'freight', 'payed', '已付', 99, 1, 0),
(5, 'purchase', '', '供应商采购', 99, 1, 0);

-- --------------------------------------------------------

--
-- 表的结构 `x_user`
--

CREATE TABLE IF NOT EXISTS `x_user` (
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
) ENGINE=MyISAM  DEFAULT CHARSET=utf8 AUTO_INCREMENT=3 ;

--
-- 转存表中的数据 `x_user`
--

INSERT INTO `x_user` (`id`, `email`, `truename`, `username`, `password`, `phone`, `status`, `department_id`, `qq`) VALUES
(1, 'admine@ng-erp.com', '管理员', 'administrator', '4297f44b13955235245b2497399d7a93', '13333333333', 1, 2, NULL),
(2, 'admin@admin.com', '第二个管理员', 'admin', '4297f44b13955235245b2497399d7a93', '123', 1, 2, NULL);

-- --------------------------------------------------------

--
-- 表的结构 `x_user_desktop`
--

CREATE TABLE IF NOT EXISTS `x_user_desktop` (
  `id` smallint(3) NOT NULL AUTO_INCREMENT,
  `name` varchar(50) NOT NULL,
  `template` varchar(255) NOT NULL,
  `width` smallint(2) NOT NULL DEFAULT '6',
  `listorder` smallint(3) NOT NULL DEFAULT '99',
  PRIMARY KEY (`id`),
  KEY `listorder` (`listorder`)
) ENGINE=MyISAM  DEFAULT CHARSET=utf8 AUTO_INCREMENT=6 ;

--
-- 转存表中的数据 `x_user_desktop`
--

INSERT INTO `x_user_desktop` (`id`, `name`, `template`, `width`, `listorder`) VALUES
(1, '最近入库', 'latestStockin.html', 6, 99),
(2, '最近出库', 'latestStockout.html', 6, 99),
(3, '出库待处理', 'needStockout.html', 6, 99),
(5, '在产产品', 'producePlanDetail.html', 6, 99);

-- --------------------------------------------------------

--
-- 表的结构 `x_workflow`
--

CREATE TABLE IF NOT EXISTS `x_workflow` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `alias` varchar(30) NOT NULL,
  `name` varchar(50) NOT NULL,
  `workflow_file` varchar(255) DEFAULT NULL COMMENT '工作流辅助文件',
  `memo` varchar(255) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `alias` (`alias`)
) ENGINE=MyISAM  DEFAULT CHARSET=utf8 AUTO_INCREMENT=9 ;

--
-- 转存表中的数据 `x_workflow`
--

INSERT INTO `x_workflow` (`id`, `alias`, `name`, `workflow_file`, `memo`) VALUES
(1, 'stockin', '入库工作流', 'Stockin', ''),
(2, 'stockout', '出库工作流', 'Stockout', ''),
(3, 'orders', '订单工作流', 'Orders', ''),
(4, 'returns', '销售退货', 'Returns', ''),
(5, 'purchase', '采购工作流', 'Purchase', ''),
(6, 'financeReceive', '财务收款计划', 'FinanceReceive', ''),
(7, 'financePay', '财务付款计划', 'FinancePay', ''),
(8, 'produce', '生产计划工作流', 'Produce', '');

-- --------------------------------------------------------

--
-- 表的结构 `x_workflow_node`
--

CREATE TABLE IF NOT EXISTS `x_workflow_node` (
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
) ENGINE=MyISAM  DEFAULT CHARSET=utf8 AUTO_INCREMENT=33 ;

--
-- 转存表中的数据 `x_workflow_node`
--

INSERT INTO `x_workflow_node` (`id`, `workflow_id`, `name`, `type`, `execute_file`, `listorder`, `prev_node_id`, `next_node_id`, `executor`, `cond`, `is_default`, `execute_type`, `remind`, `max_time`, `status_text`, `memo`, `btn_class`, `status_class`) VALUES
(1, 1, '新建入库单', 1, 'StartProcess', 0, '', '2', '', NULL, 0, 0, 0, 0, '新入库单', NULL, '', ''),
(2, 1, '确认入库', 1, 'ConfirmStockin', 1, '1', '', 'g:1', NULL, -1, 0, 0, 0, '已入库', NULL, '', ''),
(3, 2, '新建出库单', 1, 'StartProcess', 0, '', '4,5', 'g:1', NULL, 0, 0, 0, 0, '新出库单', NULL, '', ''),
(4, 2, '确认出库', 7, 'ConfirmStockout', 1, '3', '4,6,7', 'g:1', NULL, 0, 0, 0, 0, '出库单已确认', NULL, '', ''),
(5, 2, '驳回出库', 7, 'RejectStockout', 1, '', '', '', NULL, 0, 0, 0, 0, '出库单已驳回', NULL, '', ''),
(6, 2, '生成发货单', 1, 'MakeShipment', 2, '4', '7', 'g:1', NULL, 0, 0, 0, 0, '待发货', NULL, '', ''),
(7, 2, '完成出库', 1, 'Complete', 3, '4', '', 'g:1', NULL, 0, 0, 0, 0, '已完成', NULL, '', ''),
(8, 3, '新建订单', 2, 'StartProcess', 0, '', '9', 'g:1', NULL, 0, 0, 0, 0, '新订单', NULL, '', ''),
(9, 3, '保存订单', 1, 'SaveOrder', 1, '8', '10', 'g:1', NULL, 0, 0, 0, 0, '订单已保存', NULL, '', ''),
(10, 3, '申请财务审核', 2, 'RequireFinanceVerify', 2, '9', '11', 'g:1', NULL, 0, 0, 0, 0, '已申请财务审核', NULL, '', ''),
(11, 3, '财务审核通过', 2, 'FinanceVerifySuccess', 3, '10', '13', 'g:1', NULL, 0, 0, 0, 0, '财务已审核', NULL, '', ''),
(12, 3, '财务审核不通过', 2, 'FinanceVerifyFailed', 3, '', '', '', NULL, 0, 0, 0, 0, '财务驳回', NULL, '', ''),
(13, 3, '生成出库单', 1, 'MakeStockoutPaper', 4, '11', '14', 'g:1', NULL, 0, 0, 0, 0, '正在出库', NULL, '', ''),
(14, 3, '完成订单', 1, 'Complete', 4, '', '', '', NULL, 0, 0, 0, 0, '已完成', NULL, '', ''),
(15, 4, '新退货单', 1, 'StartProcess', 0, '', '', '', NULL, 0, 0, 0, 0, '新退货单', NULL, '', ''),
(16, 4, '保存退货单', 1, 'SaveReturnsPaper', 1, '', '', '', NULL, 0, 0, 0, 0, '退货单已保存', NULL, '', ''),
(17, 4, '生成入库单', 1, 'MakeStockin', 2, '', '', '', NULL, 0, 0, 0, 0, '入库单已生成，等待入库', NULL, '', ''),
(18, 4, '完成退货', 1, 'CompleteProcess', 3, '', '', '', NULL, 0, 0, 0, 0, '已完成', NULL, '', ''),
(19, 5, '新建采购单', 1, 'StartProcess', 0, '', '20', 'g:1', NULL, 0, 0, 0, 0, '新采购单', NULL, '', ''),
(20, 5, '保存采购单', 1, 'SavePurchase', 1, '20', '21', 'g:1', NULL, 0, 0, 0, 0, '采购单已保存', NULL, '', ''),
(21, 5, '生成入库单', 1, 'MakeStockin', 2, '22', '20', 'g:1', NULL, 0, 0, 0, 0, '已生成入库单', NULL, '', ''),
(22, 5, '完成采购', 2, 'CompleteProcess', 3, '', '', '', NULL, 0, 0, 0, 0, '已完成', NULL, '', ''),
(23, 6, '新建收款计划', 1, 'StartProcess', 0, '', '', '', NULL, 0, 0, 0, 0, '新收款计划', NULL, '', ''),
(24, 6, '确认收款', 1, 'CompleteProcess', 1, '', '', '', NULL, 0, 0, 0, 0, '已收款', NULL, '', ''),
(25, 7, '新建付款计划', 1, 'StartProcess', 0, '', '', '', NULL, 0, 0, 0, 0, '新付款计划', NULL, '', ''),
(26, 7, '确认收款', 1, 'CompleteProcess', 1, '', '', '', NULL, 0, 0, 0, 0, '已收款', NULL, '', ''),
(27, 8, '新建生产计划', 1, 'StartProcess', 0, '', '28', 'g:1', NULL, 0, 0, 0, 0, '新生产计划', NULL, '', ''),
(28, 8, '生成物料清单', 1, 'MakeBoms', 1, '27', '29', 'g:1', NULL, 0, 0, 0, 0, '已生成物料清单', NULL, '', ''),
(29, 8, '生成出库单', 1, 'MakeStockout', 2, '28', '30', 'g:1', NULL, 0, 0, 0, 0, '已出库', NULL, '', ''),
(30, 8, '执行生产工艺', 1, 'DoCraft', 3, '29,30', '30,31', 'g:1', NULL, 0, 0, 0, 0, '正在生产', NULL, '', ''),
(31, 8, '完成计划', 1, 'MakeStockin', 4, '', '', '', NULL, 0, 0, 0, 0, '已入库', NULL, '', ''),
(32, 8, '完成计划', 2, 'CompleteProcess', 5, '', '', '', NULL, 0, 0, 0, 0, '已完成', NULL, '', '');

-- --------------------------------------------------------

--
-- 表的结构 `x_workflow_process`
--

CREATE TABLE IF NOT EXISTS `x_workflow_process` (
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
) ENGINE=MyISAM  DEFAULT CHARSET=utf8 AUTO_INCREMENT=5 ;

--
-- 转存表中的数据 `x_workflow_process`
--

INSERT INTO `x_workflow_process` (`id`, `workflow_id`, `node_id`, `mainrow_id`, `context`, `start_time`, `end_time`, `status`, `user_id`, `memo`) VALUES
(1, 1, 1, 1, 'a:0:{}', '1410830854', '', 0, 1, ''),
(2, 2, 3, 1, 'a:0:{}', '1410832012', '', 0, 1, ''),
(3, 1, 1, 3, 'a:0:{}', '1410835327', '', 0, 1, ''),
(4, 1, 1, 4, 'a:0:{}', '1410835356', '', 0, 1, '');

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
