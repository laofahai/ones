<?php

//require_once dirname(dirname(__FILE__))."/Application/Common/Lib/BaseMigration.class.php";

use Common\Lib\BaseMigration;
class Install extends BaseMigration
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
        $apps = [];
        $ignore = [
            'Common',
            'Dashboard'
        ];
        foreach (new \Common\Lib\RecursiveFileFilterIterator(__APPLICATION__, "config.yml") as $item) {
            $app = basename(dirname($item));
            if(in_array($app, $ignore)) {
                continue;
            }
            array_push($apps, $app);
        }

        foreach($apps as $app) {
            $this->fromYaml($app);
        }

        // index, foreign key
        $this->apply_meta();

        //同步权限节点
        $this->add_auth_node();
    }

    /**
     * Migrate Down.
     */
    public function down()
    {
        

    }

}