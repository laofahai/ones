DELETE FROM `x_types` WHERE type = 'shipment';
DELETE FROM `x_auth_rule` WHERE name LIKE 'shipment.Shipment.%';

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
) ENGINE=InnoDB  DEFAULT CHARSET=utf8 AUTO_INCREMENT=1;


INSERT INTO `x_types` (`id`, `type`, `alias`, `name`, `listorder`, `status`, `deleted`) VALUES
(null, 'shipment', 'yuantong', '圆通', 99, 1, 0),
(null, 'shipment', 'shunfeng', '顺风', 99, 1, 0);

INSERT INTO `x_auth_rule` (`id`, `name`, `title`, `status`, `cond`, `category`) VALUES
(null, 'shipment.Shipment.read', '发货单列表', 1, '', 'stock'),
(null, 'shipment.Shipment.add', '新建发货单', 1, '', 'stock'),
(null, 'shipment.Shipment.edit', '修改发货单', 1, '', 'stock'),
(null, 'shipment.Shipment.forverdelete', '删除发货单', 1, '', 'stock');