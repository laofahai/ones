<?php

//require_once dirname(dirname(__FILE__))."/Application/Common/Lib/BaseMigration.class.php";

use Common\Lib\BaseMigration;
class Init extends BaseMigration
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
//
//        $this->fromYaml("Home");
//        $this->fromYaml("Account");
//        $this->fromYaml("Product");
//        $this->fromYaml("ContactsCompany");
//        $this->fromYaml('DataModel');
//        $this->fromYaml('Crm');
//        $this->fromYaml('Calendar');
//        $this->fromYaml('Marketing');
//        $this->fromYaml('Uploader');

//        $this->fromYaml('Storage');

//        $this->fromYaml('Bpm');
//        $this->fromYaml('ProductAttribute');

//        $this->fromYaml('Sale');
//        $this->fromYaml('Region');

        $this->fromYaml('Supplier');
        $this->fromYaml('Purchase');
//         同步权限节点
//        $this->add_auth_node();
        exit;

//        $this->execute("INSERT INTO home_apps(alias)VALUES('goods')");
//        $this->execute("INSERT INTO home_apps(alias, requirements)VALUES('store', 'goods')");
        
        //$this->execute("INSERT INTO account_company(name, sign_id)VALUES('Team Swift', '".rand(1000, 9999)."')");
    }

    /**
     * Migrate Down.
     */
    public function down()
    {
        
        
        if($this->hasTable('phinxlog')) {
            $this->dropTable('phinxlog');
        }
        
//        exit;
    }

}