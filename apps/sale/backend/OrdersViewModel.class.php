<?php

/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */

/**
 * Description of OrdersViewModel
 *
 * @author 志鹏
 */
class OrdersViewModel extends CommonViewModel {
    
    protected $workflowAlias = "orders";
    
    protected $viewFields = array(
        "Orders" => array("*", "_type"=>"left"),
        "User" => array("truename" => "sponsor", "_on" => "Orders.saler_id=User.id", "_type"=>"left"),
        "RelationshipCompany" => array("name"=>"customer", "address", "_on"=>"RelationshipCompany.id=Orders.customer_id", "_type"=>"left"),
        "Types" => array("name"=>"sale_type_label", "_on"=>"Types.id=Orders.sale_type", "_type"=>"left")
    );

    public $searchFields = array(
        "Types.name", "bill_id", "RelationshipCompany.name","User.truename"
    );
    
    /**
     * 订单状态
     * 0: 刚创建，未提交   新订单
     * 1: 已保存，未提交审核   已保存
     * 2: 已提交给财务审核，订单不能在修改  待财务审核
     * 3: 财务已审核，等待销售请求出库   财务已审核
     * 4: 销售生成出库单，请求出库，    待库管确认出库
     * 5: 库管确认出库，等待发货       已出库，待发货
     * 6: 库管发货，订单结束          已发货
     * 7: 订单完成                  已完成
     */
    
}

?>
