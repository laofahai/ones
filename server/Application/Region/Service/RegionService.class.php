<?php

/*
 * @app Region
 * @package Region.service.Region
 * @author laofahai@TEam Swift
 * @link https://ng-erp.com
 * */
namespace Region\Service;
use Common\Model\CommonModel;

class RegionService extends CommonModel {

    protected $_auto = [];

    /*
     * 根据region id获取其所有信息
     * */
    public function get_full_info($id) {
        $current_node = $last_node = $this->where(['id'=>$id])->find();
        $this_line_nodes = [];

        for($i=$last_node['type']-1;$i>=0;$i--) {
            $current_node = $this_line_nodes['type_' + $i] = $this->where(['id'=>$current_node['parent_id']])->find();
        }

        array_unshift($this_line_nodes, $last_node);

        $this_line_nodes = array_reverse($this_line_nodes);

        $response = [
            'full_name' => '',
            'selected_region_item_ids' => [],
            'selected_region_item' => []
        ];
        foreach($this_line_nodes as $p) {
            if(DBC('region_ignore_country') > 0 && $p['type'] == 0) {
            } else {
                array_push($response['selected_region_item_ids'], (int)$p['id']);
                array_push($response['selected_region_item'], [
                    'id' => (int)$p['id'],
                    'type' => (int)$p['type'],
                    'name' => $p['name']
                ]);
                $response['full_name'] .= $p['name'];
            }
        }

        return $response;

    }

}