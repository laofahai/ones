<?php
/**
 * Created by PhpStorm.
 * User: nemo
 * Date: 14-10-16
 * Time: 12:32
 */


class ONESRemindHTMLBehavior extends Behavior {

    public function run(&$params) {
        echo <<<EOF
        <li ng-controller="NavRemindCtl">
            <a data-toggle="dropdown" class="dropdown-toggle">
                <i class="icon icon-bell" ng-class="{'icon-animated-bell': reminds.length>0}"></i>
                <span class="badge badge-important" ng-bind="reminds.length" ng-show="reminds.length>0"></span>
            </a>

            <ul class="pull-right dropdown-navbar dropdown-menu dropdown-caret dropdown-close header-reminds-list">
                <li ng-repeat="rem in reminds">
                    <span class="pull-left" template="rem.content" data-id="{{rem.id}}" compile-data></span>
                    <label class="pull-right badge badge-info">+{{rem.num}}</label>
                </li>
                <li ng-bind="'lang.messages.no_unread_notification'|lang" ng-show="reminds.length<=0"></li>
            </ul>
        </li>
EOF;

    }
}