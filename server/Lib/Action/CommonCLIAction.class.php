<?php
/**
 * Created by PhpStorm.
 * User: nemo
 * Date: 10/3/14
 * Time: 12:52
 */

class CommonCLIAction extends Action {

    public function response($data) {

        if(is_array($data)) {
            $data = implode("\n", $data);
        }
        echo $data;
        echo "\n";
    }

} 