<?php

/**
 * @filename navs.php 
 * @encoding UTF-8 
 * @author nemo.xiaolan <a href="mailto:335454250@qq.com">335454250@qq.com</a>
 * @link <a href="http://www.sep-v.com">http://www.sep-v.com</a>
 * @license http://www.sep-v.com/code-license
 * @datetime 2013-12-6 16:14:57
 * @description
 * 
 */

return array(
    "dashboard" => array(
        "childs" => array(),
        "icon" => "home",
        "action" => "HOME/Index/dashboard"
    ),
    "stock" => array(
        "childs" => array(
            "stock_list" => "JXC/StockProductList",
            "stockin_paper" => "JXC/Stockin",
            "stockout_paper" => "JXC/Stockout",
            "shipment_paper" => "JXC/Shipment",
            "stock_transfer" => "JXC/StockTransfer"
        ),
        "icon" => "th-large",
        "action"=> "#nogo"
    ),
    "purchase" => array(
        "childs" => array(
            "add_new_purchase" => "JXC/Purchase/add",
            "purchase_list" => "JXC/Purchase"
        ),
        "icon" => "shopping-cart"
    ),
    "sale" => array(
        "childs" => array(
            "orders" => "JXC/Orders",
            "returns"=> "JXC/Returns",
        ),
        "icon" => "pencil",
        "action" => "#nogo"
    ),
//    "produce" => array(
//        "childs" => array(
//            "produce_and_install" => "Produce/ProduceInstall"
//        ),
//        "icon" => "retweet",
//    ),
    "rel_company" => array(
        "childs" => array(
            "list" => "CRM/RelationshipCompany",
            "add_new" => "CRM/RelationshipCompany/add"
        ),
        "icon" => "link"
    ),
    "finance" => array(
        "icon" => "money",
        "childs" => array(
//            "accounting_voucher" => "Accounting/AccountingVoucher",
            "finance_account" => "Finance/FinanceAccount",
            "finance_record" => "Finance/FinanceRecord",
            "finance_receive_plan" => "Finance/FinanceReceivePlan",
            "finance_pay_plan" => "Finance/FinancePayPlan",
        )
    ),
    "statistics" => array(
        "childs" => array(
            "sale_statistics" => "Statistics/Sale",
            "stock_warning"  => "JXC/Stock/warning",
            "statistics_overview" => "Statistics/Overview",
            "statistics_product_overview" => "Statistics/ProductView"
        ),
        "icon" => "bar-chart"
    ),
    "settings" => array(
        "childs" => array(
            "field_set" => "HOME/Config",
            "base_data_set" => "JXC/Goods",
            "organization_set" => "HOME/User",
            "workflow" => "HOME/Workflow",
            "clear_cache" => "HOME/Settings/clearCache"
        ),
        "icon" => "cog"
    )
);
