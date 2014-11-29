DELETE FROM `__PREFIX__types` WHERE type = 'express';
-- separator
DELETE FROM `__PREFIX__auth_rule` WHERE name LIKE 'shipment.express.%';
-- separator

DROP TABLE `__PREFIX__express`;