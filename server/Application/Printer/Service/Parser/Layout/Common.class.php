<?php
/**
 * Created by PhpStorm.
 * User: nemo <335454250@qq.com>
 * Date: 10/8/15
 * Time: 20:52
 */

namespace Printer\Service\Parser\Layout;

use Printer\Service\Parser\AbstractLayout;
use Printer\Service\Parser\Formater;
use Printer\Service\Parser\InterfaceLayout;

class Common extends AbstractLayout implements InterfaceLayout {

    protected $template = '<div style="%(style)s" class="%(class)s">%(content)s</div>';

    public function compile_to_html($template_config, $data) {

        $content = $template_config['content'];

        if(is_string($template_config['content'])) {
            $content = Formater::spf($template_config['content'], $data);
        }

        return $this->compile([
            'style' => $template_config['style'],
            'class' => $template_config['class'],
            'content' => $content
        ]);

    }
    
}