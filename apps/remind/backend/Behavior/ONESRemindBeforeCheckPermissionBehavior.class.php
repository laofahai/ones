<?php
/**
 * Created by PhpStorm.
 * User: nemo
 * Date: 14/10/28
 * Time: 14:58
 */

class ONESRemindBeforeCheckPermissionBehavior extends Behavior {

    public function run(&$param) {

        $dontNeed = C("AUTH_CONFIG.AUTH_DONT_NEED");

        array_push($dontNeed, "remind.remind.read");

        C("AUTH_CONFIG.AUTH_DONT_NEED", $dontNeed);

    }

}