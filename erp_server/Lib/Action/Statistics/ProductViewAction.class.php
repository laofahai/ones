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

        $storeModel = D("StockProductList");
        $storeModel->group("")->limit($limit)->select();


        $baseMap = array(
            "dateline" => array("BETWEEN", array($dateStart, $dateEnd)),
            "status"   => array("GT", 1)
        );

        $orderModel = D("Orders");
        $theOrders = $orderModel->field("total_num, total_amount_real")
            ->where($baseMap)->select();
        foreach($theOrders as $o) {
            $voList["orders_num"] += $o["total_num"];
            $voList["orders_amount"] += $o["total_amount_real"];
        }

        $purchaseModel = D("Purchase");
        $thePurchases = $purchaseModel->field("quantity,total_price_real")->where($baseMap)->select();
        foreach($thePurchases as $p) {
            $voList["purchase_num"] += $p["total_num"];
            $voList["purchase_"] += $p["total_amount_real"];
        }
    }

} 