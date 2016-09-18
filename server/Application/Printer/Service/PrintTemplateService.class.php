<?php

/*
 * @app Printer
 * @package Printer.service.PrintTemplate
 * @author laofahai@TEam Swift
 * @link http://ng-erp.com
 * */
namespace Printer\Service;
use Common\Model\CommonModel;
use Symfony\Component\Yaml\Yaml;

class PrintTemplateService extends CommonModel {

    protected $_auto = [
        ["company_id", "get_current_company_id", 1, "function"]
    ];

    /*
     * 解析模板配置
     * */
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

    /*
     * 解析模板内容
     * */
    static public function parse_content($content) {
        if(substr($content, 0, 5) === 'apps/') { // 路径模式
            return $content;
        } else {
            return base64_decode($content);
        }
    }

}