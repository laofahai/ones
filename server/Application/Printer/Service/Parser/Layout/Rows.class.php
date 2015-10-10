<?php
/**
 * Created by PhpStorm.
 * User: nemo <335454250@qq.com>
 * Date: 10/8/15
 * Time: 23:19
 */

namespace Printer\Service\Parser\Layout;


use Printer\Service\Parser\Formater;

class Rows extends Table {

    /*
     * 单据明细行 table 展示
     * @param array $template_config
     * @param array $data 所有数据
     * */
    public function compile_to_html($template_config, $data) {
        $rows = $data[$template_config['content'] ? $template_config['content'] : 'rows'];
        $fields = $template_config['items'];

        $table_html = $this->table_template['table'];
        $trs_html = [];



        // 表头
        $tds_html = [];
        foreach($fields as $field_name => $field_config) {
            array_push($tds_html, $this->compile([
                'style' => $field_config['style'],
                'class' => $field_config['class'],
                'content' => $field_config['label'] ? $field_config['label'] : __(lcfirst(MODULE_NAME).'.'.$field_name)
            ], $this->table_templates['th']));
        }


        array_push($trs_html, $this->compile([
            "style" => $template_config['thead_style'],
            "class" => $template_config['thead_class'],
            "content" => implode("", $tds_html)
        ], $this->table_templates['tr']));


        foreach($rows as $k=>$row) {
            $tds_html = [];
            foreach($fields as $field_name => $field_config) {
                $content = $field_config['content'] ? Formater::spf($field_config['content'], $row) : $row[$field_name];

                if($field_config['format']) {
                    $method = $field_config['format'];
                    $content = Formater::$method($content);
                }

                array_push($tds_html, $this->compile([
                    'style' => $field_config['style'],
                    'class' => $field_config['class'],
                    'content' => $content
                ], $this->table_templates['td']));
            }

            array_push($trs_html, $this->compile([
                "style" => $template_config['tr_style'],
                "class" => $template_config['tr_class'],
                "content" => implode("", $tds_html)
            ], $this->table_templates['tr']));
        }

        return $this->compile([
            "style" => $template_config['style'],
            "class" => $template_config['class'],
            "content" => implode("", $trs_html)
        ], $this->table_templates['table']);
    }

}