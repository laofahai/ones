<?php
/**
 * Created by PhpStorm.
 * User: nemo <335454250@qq.com>
 * Date: 10/8/15
 * Time: 23:19
 */

namespace Printer\Service\Parser\Layout;

use Printer\Service\Parser\AbstractLayout;
use Printer\Service\Parser\InterfaceLayout;

class Table extends AbstractLayout implements InterfaceLayout {

    protected $table_templates = [
        "table" => '<table style="%(style)s" class="%(class)s">%(content)s</table>',
        "th" => '<th style="%(style)s" class="%(class)s">%(content)s</th>',
        "tr" => '<tr style="%(style)s" class="%(class)s">%(content)s</tr>',
        "td" => '<td style="%(style)s" class="%(class)s">%(content)s</td>'
    ];

    public function compile_to_html($template_config, $data) {}

}