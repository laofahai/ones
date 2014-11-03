<?php
/**
 * Created by PhpStorm.
 * User: nemo
 * Date: 14/10/31
 * Time: 11:13
 */

class OrdersMakeOutsourcing extends WorkflowAbstract {

    public function run() {
        if(!isAppLoaded("outsourcing")) {
            $this->error(sprintf(lang("messages.unfoundApp"), "outsourcing"));
            return;
        }
    }

} 