<?php
/**
 * Created by PhpStorm.
 * User: nemo
 * Date: 14/12/8
 * Time: 09:24
 */

class ONESDashboardBeforeCheckPermissionBehavior extends Behavior {

    public function run(&$param) {

        $dontNeed = C("AUTH_CONFIG.AUTH_DONT_NEED");

        array_push($dontNeed, "dashboard.userPreference.read");

        C("AUTH_CONFIG.AUTH_DONT_NEED", $dontNeed);

    }

} 