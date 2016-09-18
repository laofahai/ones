<?php

/*
 * @app Printer
 * @package Printer.model.PrintTemplate
 * @author laofahai@TEam Swift
 * @link http://ng-erp.com
 * */
namespace Printer\Model;
use Common\Model\CommonViewModel;

class PrintTemplateModel extends CommonViewModel {

    protected $viewFields = [
        "PrintTemplate" => ['*', '_type'=>'left']
    ];

}