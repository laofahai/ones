DELETE FROM `[PREFIX]types` WHERE type = 'express';
-- separator
DELETE FROM `[PREFIX]auth_rule` WHERE name LIKE 'shipment.express.%';
-- separator

DROP TABLE `[PREFIX]express`;