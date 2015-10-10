<?php
/**
 * Created by PhpStorm.
 * User: nemo <335454250@qq.com>
 * Date: 10/8/15
 * Time: 22:54
 */

namespace Printer\Service\Parser;


interface InterfaceLayout {

    /*
     * @param array $template_config 模板配置
     * @param array $data 所有数据
     * */
    public function compile_to_html($template_config, $data);
    
}