<?php
/**
 * Created by PhpStorm.
 * User: nemo
 * Date: 6/16/14
 * Time: 14:47
 */


class ProductViewAction extends CommonAction{

    /*
     * @todo filter
     * 销售，采购，生产
     * */
    public function index() {

        $dateStart = strtotime(date("Y-m"));
        $dateEnd   = CTS;

        if($_GET["_filter_dateline_start"]) {
            $dateStart = $_GET["_filter_dateline_start"] / 1000;
        }
        if($_GET["_filter_dateline_end"]) {
            $dateEnd = $_GET["_filter_dateline_end"] / 1000;
        }

        $limit = $this->beforeLimit();

        //库存信息
        $storeModel = D("StockProductList");
        $tmp = $storeModel
            ->table(C("DB_PREFIX")."stock_product_list StockProductList")
            ->field("SUM(StockProductList.num) as total_num, goods_id, factory_code_all, goods.name as goods_name")
            ->join(C("DB_PREFIX")."goods Goods ON Goods.id=StockProductList.goods_id")
            ->group("factory_code_all")
            ->order("total_num DESC")
            ->limit($limit)->select();

        $dataModel = D("DataModelDataView");
        $tmp = $dataModel->assignModelData($tmp);

        $storeInfo = array();
        foreach($tmp as $v) {
            $storeInfo[$v["factory_code_all"]] = $v;
            $factoryCodes[] = $v["factory_code_all"];
        }

        //销售
        $orderMap = array(
            "OrdersDetail.factory_code_all" => array("IN", implode(",", $factoryCodes)),
            "Orders.dateline" => array("BETWEEN", array($dateStart, $dateEnd)),
            "Orders.status" => array("GT", 0),
            "Orders.deleted" => 0
        );
        $orderModel = D("OrdersDetailView");
        $tmp = $orderModel->field(
            "factory_code_all, SUM(OrdersDetail.amount) AS total_amount, SUM(OrdersDetail.num) as total_num"
        )->where($orderMap)->group("OrdersDetail.factory_code_all")->select();
        $ordersInfo = array();
        foreach($tmp as $v) {
            $ordersInfo[$v["factory_code_all"]] = $v;
        }
        //生产
        //采购

        foreach($storeInfo as $k=>$v) {
            $storeInfo[$k]["sale_num"] = $ordersInfo[$k]["total_num"];
            $storeInfo[$k]["sale_amount"] = $ordersInfo[$k]["total_amount"];
        }

        print_r($storeInfo);exit;

    }

} 