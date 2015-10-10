<?php
/**
 * Created by PhpStorm.
 * User: nemo <335454250@qq.com>
 * Date: 10/8/15
 * Time: 20:49
 */

namespace Printer\Service\Parser;


class Formater {

    /*
     * sprintf
     * 模板格式为：%(variable)s
     * */
    static public function spf($template, $data) {
        preg_match_all('/%\(([a-zA-Z\-\_\.]+)\)s/i', $template, $matches);
        $variables = [];
        $search = $matches[0];

        foreach($matches[1] as $k=>$var) {
            $value = $data;
            foreach(explode('.', $var) as $var_k_item) {
                $value = $value[$var_k_item];
            }
            $variables[$k] = $value;
        }

        return str_replace($search, $variables, $template);
    }

    static public function number($data) {
        return $data;
    }

    static public function money($data) {
        return $data;
    }

    static public function rmb_big($data) {
        return $data;
    }

    static public function datetime($data) {
        return date('Y-m-d H:i:s', strtotime($data));
    }

    static public function date($data) {
        return date('Y-m-d', strtotime($data));
    }

}