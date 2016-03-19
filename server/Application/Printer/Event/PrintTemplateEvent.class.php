<?php

/*
 * @app Printer
 * @package Printer.event.PrintTemplate
 * @author laofahai@TEam Swift
 * @link https://ng-erp.com
 * */
namespace Printer\Event;
use Common\Event\BaseRestEvent;
use Printer\Service\PrintTemplateService;

class PrintTemplateEvent extends BaseRestEvent {

    protected function _before_list_response_($list) {
        if(!I('get._parse_config')) {
            return $list;
        }

        foreach($list as $k=>$v) {
            $list[$k]['config'] = PrintTemplateService::parse_config($v['config']);
        }

        return $list;
    }

}