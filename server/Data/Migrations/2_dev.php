<?php
/*
 * 开发过程中的数据库migrate
 * up() 方法中必须以exit; 结束
 * */

use Common\Lib\BaseMigration;
class Dev extends BaseMigration {

    public function up() {
        $apps = [
            'home'
        ];
        foreach($apps as $app) {
            $this->fromYaml($app);
        }

        // index, foreign key
        $this->apply_meta();

        exit;
    }

}