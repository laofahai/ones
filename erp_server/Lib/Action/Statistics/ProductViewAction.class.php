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
            ->field("SUM(StockProductList.num) as store_num, goods_id, factory_code_all, Goods.name as goods_name, Goods.measure")
            ->join(C("DB_PREFIX")."goods Goods ON Goods.id=StockProductList.goods_id")
            ->group("factory_code_all")
            ->order("store_num DESC")
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
        $produceMap = array(
            "ProducePlan.end_time" => array("BETWEEN", array($dateStart, $dateEnd)),
            "ProducePlan.status" => array("EGT", 4),
            "ProducePlanDetail.factory_code_all" => array("IN", implode(",", $factoryCodes))
        );
        $produceModel = D("ProducePlanDetailView");
        $tmp = $produceModel
            ->field("factory_code_all, SUM(ProducePlanDetail.num) as total_num")
            ->where($produceMap)->select();
        foreach($tmp as $v) {
            $produceInfo[$v["factory_code_all"]] = $v["total_num"];
        }
        //采购
        $purchaseModel = D("PurchaseDetailView");
        $purchaseMap = array(
            "Purchase.dateline" => array("BETWEEN", array($dateStart, $dateEnd)),
            "Purchase.status" => array("EGT", 1),
            "PurchaseDetail.factory_code_all" => array("IN", implode(",", $factoryCodes))
        );
        $tmp = $purchaseModel
            ->field("factory_code_all, SUM(PurchaseDetail.num) as total_num, SUM(PurchaseDetail.price) AS total_amount")
            ->where($purchaseMap)->select();
        foreach($tmp as $v) {
            $purchaseInfo[$v["factory_code_all"]] = $v["total_num"];
        }

        foreach($storeInfo as $k=>$v) {
            $storeInfo[$k]["sale_num"] = $ordersInfo[$k]["total_num"];
            $storeInfo[$k]["sale_amount"] = $ordersInfo[$k]["total_amount"];
            $storeInfo[$k]["produce_num"] = $produceInfo[$k];
            $storeInfo[$k]["purchase_num"] = $purchaseInfo[$k]["total_num"];
            $storeInfo[$k]["purchase_amount"] = $purchaseInfo[$k]["total_amount"];
        }

//        print_r($storeInfo);exit;

        $this->response(reIndex($storeInfo));

    }

} 