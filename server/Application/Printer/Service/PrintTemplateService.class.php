<?php

/*
 * @app Printer
 * @package Printer.service.PrintTemplate
 * @author laofahai@TEam Swift
 * @link https://ng-erp.com
 * */
namespace Printer\Service;
use Common\Model\CommonModel;
use Symfony\Component\Yaml\Yaml;

class PrintTemplateService extends CommonModel {

    protected $_auto = [
        ["company_id", "get_current_company_id", 1, "function"]
    ];

    static public function parse_config($config_string) {
        if(!$config_string) {
            return [];
        }

        $config_string = explode("\n", $config_string);

        $cleared_config = [];
        foreach($config_string as $line) {
            $line = explode(':', $line);

            $k = array_shift($line);
            $v = implode(":", $line);

            switch($k) {
                case "bill_row_fields":
                    $v = explode(',', $v);
                    break;
            }

            $cleared_config[$k] = $v;
        }

        return $cleared_config;

    }
}