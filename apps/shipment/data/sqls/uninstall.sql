DELETE FROM `[PREFIX]types` WHERE type = 'shipment';
DELETE FROM `[PREFIX]auth_rule` WHERE name LIKE 'shipment.Shipment.%';

DROP TABLE `[PREFIX]shipment`;