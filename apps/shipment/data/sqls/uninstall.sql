DELETE FROM `[PREFIX]types` WHERE type = 'express';
DELETE FROM `[PREFIX]auth_rule` WHERE name LIKE 'shipment.express.%';

DROP TABLE `[PREFIX]express`;