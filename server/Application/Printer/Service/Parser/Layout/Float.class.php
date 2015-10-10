<?php
/**
 * Created by PhpStorm.
 * User: nemo <335454250@qq.com>
 * Date: 10/9/15
 * Time: 22:25
 */

namespace Printer\Service\Parser\Layout;


use Printer\Service\Parser\AbstractLayout;
use Printer\Service\Parser\Formater;
use Printer\Service\Parser\InterfaceLayout;

class Float extends AbstractLayout implements InterfaceLayout{

    public function compile_to_html($template_config, $data) {

        $this->template = '<div style="%(style)s" class="float %(class)s">%(content)s</div>';

        $htmls = [];

        foreach($template_config['items'] as $item) {

            $content = $item['content'];
            if(is_string($item['content'])) {
                $content = Formater::spf($item['content'], $data);
            }
            array_push($htmls, $this->compile([
                'style' => $item['style'],
                'class' => $item['class'],
                'content' => $content
            ]));
        }

        return sprintf("<div>%s<div class=\"clearfix\"></div></div>", implode("", $htmls));
    }

}