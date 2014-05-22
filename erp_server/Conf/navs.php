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
            "stock_list" => "JXC/list/stockProductList",
            "stockin_paper" => "JXC/list/stockin",
            "stockout_paper" => "JXC/list/stockout",
            "shipment_paper" => "JXC/list/shipment",
            "stock_transfer" => "JXC/list/stockTransfer"
        ),
        "icon" => "th-large",
    ),
    "purchase" => array(
        "childs" => array(
            "add_new_purchase" => "JXC/addBill/purchase",
            "purchase_list" => "JXC/list/purchase",
            "purchase_return" => "JXC/list/purchase_return"
        ),
        "icon" => "shopping-cart"
    ),
    "sale" => array(
        "childs" => array(
            "add_new_orders" => "JXC/addBill/orders",
            "orders" => "JXC/list/orders",
            "returns"=> "JXC/list/returns",
        ),
        "icon" => "pencil",
    ),
    "produce" => array(
        "childs" => array(
            "produce_plan" => "Produce/list/producePlan",
            "produce_plan_detail" => "Produce/list/producePlanDetail",
            "outside_bill" => "Produce/list/outside"
        ),
        "icon" => "retweet",
    ),
    "rel_company" => array(
        "childs" => array(
            "relCompanyRecord" => "CRM/list/relCompany",
            "relCompanyGroup" => "CRM/list/relCompanyGroup",
        ),
        "icon" => "link"
    ),
    "finance" => array(
        "icon" => "money",
        "childs" => array(
//            "accounting_voucher" => "Accounting/AccountingVoucher",
            "finance_record" => "Finance/list/financeRecord",
            "finance_receive_plan" => "Finance/list/financeReceivePlan",
            "finance_pay_plan" => "Finance/list/financePayPlan",
            "finance_account" => "Finance/list/financeAccount",
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
            "field_set" => "HOME/list/config",
            "base_data_set" => array(
                "goods_setting" => "JXC/list/goods",
                "goods_tpl"     => "JXC/list/productTpl",
                "goods_category"=> "JXC/list/GoodsCategory",
                "stock_manage"  => "JXC/list/stock",
                "data_model"   => "HOME/list/dataModel",
                "types_manage"  => "HOME/list/types",
                "craft_manage"  => "Produce/list/craft",
            ),
            "organization_set" => array(
                "user_setting" => "Passport/list/user",
                "auth_rule_node" => "Passport/list/authRule",
                "user_group"   => "Passport/list/authGroup",
                "department"   => "Passport/list/department"
            ),
            "workflow" => "HOME/list/workflow",
            "clear_cache" => "HOME/Settings/clearCache"
        ),
        "icon" => "cog"
    )
);
