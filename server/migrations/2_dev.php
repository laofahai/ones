<?php

//require_once dirname(dirname(__FILE__))."/Application/Common/Lib/BaseMigration.class.php";

use Common\Lib\BaseMigration;
class Dev extends BaseMigration
{

    /*
     * 是否清除数据
     */
    protected $clear = false;

    /**
     * Change Method.
     *
     * More information on this method is available here:
     * http://docs.phinx.org/en/latest/migrations.html#the-change-method
     *
     * Uncomment this method if you would like to use it.
     *
    public function change() {

    }
     *
     */


    /**
     * Migrate Up.
     */
    public function up()
    {

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

    /**
     * Migrate Down.
     */
    public function down()
    {


    }

}