<?php
/**
 * Created by PhpStorm.
 * User: nemo
 * Date: 6/18/14
 * Time: 13:51
 */

class SaleAction extends CommonAction {

    /*
     * 根据日期查看
     * 支持：当日，当月，当年，日期开始-》结束
     * **/
    public function index() {

        $quick = $_GET["_filter_timeStep"];
        switch($quick) {
            case "year":
                $starttime = strtotime((date("Y", CTS)-5)."-00-00");
                $endtime = strtotime((date("Y", CTS)+1)."-01-02");
                $step = 24*3600*365;
                $format = "Y";
                break;
            case "month":
                $starttime = strtotime(date("Y-01-01", CTS));
                $endtime = strtotime(date("Y-12-31", CTS));
                $step = 24*3600*31;
                $format = "Y-m";
                break;
            default:
                $starttime = strtotime(date("Y-m", CTS));
                $endtime = strtotime(date("Y-m-d"));
                $step = 24*3600;
                $format = "m-d";
                break;
        }
        $starttime = strtotime($_GET["_filter_start_dateline"]);
        $endtime = strtotime($_GET["_filter_end_dateline"]);

        switch($_GET["type"]) {
            case "customer":
            case "saler":
                $model = "OrdersView";
                break;
            default:
                $model = "Orders";
        }

        $map = array(
            "status" => array("EGT", 1),
            "dateline" => array("BETWEEN", array($starttime, $endtime))
        );

        $orderModel = D($model);
        $orderSourceData = $orderModel->where($map)->select();
//        echo $orderModel->getLastSql();exit;

//        print_r($orderSourceData);exit;

//        $this->response($orderSourceData);
        switch($_GET["type"]) {
            case "customer":
                $this->ForCustomerRange($orderSourceData);
                break;
            case "saler":
                $this->ForSalerRange($orderSourceData);
                break;
            default:
                $data = $this->ForSaleTotal($orderSourceData, $starttime, $endtime, $step, $format);
        }

//        print_r($category);exit;
        $this->response($data);
//
//        $this->makeFilter();
//        $this->assign("chartTitle", $title);
//        $this->display();
    }

    /**
     * 客户排行
     */
    public function CustomerRank() {
        $time = $_GET["time"];
//        $time = "quarter";
        $end = CTS;

        switch($time) {
            case "year":
                $format = "Y";
                $start = CTS-365*24*3600; //三年
                $step = 24*3600*365;
                $name = "年度";
                break;
            case "quarter":
                $format = "Y-n";
                $start = CTS-31*24*3600*3;
                $step = 31*24*3600*3;
                $name = "3月";
                break;
            default:
                $format = "Y-m";
                $start = CTS-10*31*24*3600;
                $step = 31*24*3600;
                $name = "31天";
        }
//        $step = abs(intval($days/31));

        $dateRange = makeDateRange($start, $end, $step, $format);

        $order = D("OrdersView");
        $map = array(
            "status" => array("GT", 1),
            "dateline" => array("BETWEEN", array($start, $end))
        );
        $tmp = $order->where($map)->order("id asc")->select();

        foreach($tmp as $v) {
            $orders[$v["customer_id"]][] = $v;
            $cusData[$v["customer_id"]]["name"] = $v["rel_company_name"];
            $cusData[$v["customer_id"]]["data"] += $v["total_price_real"];
        }

        $i = 0;
        foreach($cusData as $k=>$v) {
            $category[] = $v["name"];
            $data[] = array(
                "y" => $v["data"],
                "color" => $i
            );
            $i++;
        }

        $this->assign("title", L("customer_rank")."-".$name);
        $this->assign("chartName", $name);
        $this->assign("categories", json_encode($category));
        $this->assign("data", str_replace('"', '', json_encode($data)));

        $this->display();
    }

    /*
     * 销售，柱状图
     * **/
    protected function ForSaleTotal($data, $start, $end, $step, $format="m-d") {
        $dateRange = makeDateRange($start, $end, $step, $format);
//        print_r($dateRange);exit;
        foreach($dateRange as $dr) {
            $tmp[$dr]["displayName"] = "销售金额";
            $tmp[$dr]["value"] = 0;
            $tmp[$dr]["label"] = $dr;
            foreach($data as $v) {
                $key = date($format, $v["dateline"]);
                if($dr == $key) {
                    $tmp[$dr]["value"] += $v["total_amount_real"];
                }
            }
        }
        foreach($tmp as $k=>$v) {
            $tmp[$k]["value"] = $v["value"];
        }
        return reIndex($tmp);
    }

} 