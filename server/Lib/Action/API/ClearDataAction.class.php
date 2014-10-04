<?php
/**
 * Created by PhpStorm.
 * User: nemo
 * Date: 10/4/14
 * Time: 10:07
 */

class ClearDataAction extends CommonCLIAction {

    public function index() {

        if(!APP_DEBUG) {
            exit("can't do it.\n");
        }

        DBBackup(array(
            "zip", "sendmail"
        ));

        $tables = array(
            "data_model_data",
            "express",
            "finance_receive_plan",
            "finance_record",
            "finance_pay_plan",
            "goods",
            "goods_craft",
            "orders",
            "orders_detail",
            "produce_boms",
            "produce_plan",
            "produce_plan_detail",
            "product_tpl",
            "product_tpl_detail",
            "purchase",
            "purchase_detail",
            "relationship_company",
            "relationship_company_linkman",
            "returns",
            "returns_detail",
            "session",
            "stockin",
            "stockin_detail",
            "stockout",
            "stockout_detail",
            "stock_product_list",
            "workflow_process"
        );

        $model = M();
        foreach($tables as $table) {
            $sql = sprintf("TRUNCATE TABLE %s%s", C("DB_PREFIX"), $table);
            $model->execute($sql);
        }

    }

} 