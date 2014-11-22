<?php
/**
 * Created by PhpStorm.
 * User: nemo
 * Date: 14/11/17
 * Time: 19:22
 */


class ONESFirstTimeWizardBeforeCheckPermissionBehavior extends Behavior {

    public function run(&$param) {

        $dontNeed = C("AUTH_CONFIG.AUTH_DONT_NEED");

        array_push($dontNeed, "firstTimeWizard.firstTimeWizard.read");
        array_push($dontNeed, "firstTimeWizard.firstTimeWizard.add");

        C("AUTH_CONFIG.AUTH_DONT_NEED", $dontNeed);

    }

} 