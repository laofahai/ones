<?php
/**
 * Created by PhpStorm.
 * User: nemo <335454250@qq.com>
 * Date: 10/8/15
 * Time: 22:54
 */

namespace Printer\Service\Parser;


abstract class AbstractLayout {

    protected $template;

    public function set_config($k, $v) {
        $this->$k = $v;
    }

    /*
     * 具体编译方法
     * @param string $template
     * @param array $variables 具体需替换的数据， k=>v数组
     * */
    final protected function compile($variables, $template=null) {
        $search = [];
        $replace= [];
        foreach($variables as $k=>$v) {
            if(!$k) {
                continue;
            }
            array_push($search, "%({$k})s");
            array_push($replace, $v ? $v : "");
        }


        return str_replace($search, $replace, $template ? $template : $this->template);
    }

}