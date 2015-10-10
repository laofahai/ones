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

    static protected $tpls = [
        'container' => '%s'
    ];

    /*
     * 将模板解析为HTML
     * */
    static public function compile_by_template($template, $data) {

        $html = [];
        $template = Yaml::parse($template);
        foreach($template as $template_config) {
            $template_config['layout'] = $template_config['layout'] ? $template_config['layout'] : "common";
            $layout_parser_name = sprintf('Printer\Service\Parser\Layout\%s', ucfirst($template_config['layout']));

            if(!class_exists($layout_parser_name)) {
                $layout_parser_name = 'Printer\Service\Parser\Layout\Common';
            }

            try {
                $parser = new $layout_parser_name();
                if($template_config['template']) {
                    $parser->set_config("template", $template_config['template']);
                }
                array_push($html, $parser->compile_to_html($template_config, $data));

            } finally {}

        }

        return ['html' => sprintf(self::$tpls['container'], implode('', $html))];
    }

    public function compile_by_template_id($id, $data) {
        $template = $this->where()->find($id);
        if(!$template || !$template['content']) {
            return '';
        }
        return self::compile_by_template($template['content'], $data);
    }

}