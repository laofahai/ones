<?php

namespace Home\Event;
use Common\Event\BaseRestEvent;


class NavEvent extends BaseRestEvent {

    protected $not_belongs_to_company = true;

    private $_authed_nodes = array();
    
    /*
     * 导航
     * **/
    public function on_list() {
        $this->_authed_nodes = get_array_to_kv(parent::$authed_nodes, 'node');

        $navs = $this->bootstrapConfigs['navs'];

        foreach($this->appConfigs as $app=>$config) {
            if(!$this->is_app_active($app)) {
                continue;
            }
            $navs = array_merge_recursive($navs, (array)$config["navs"]);
        }

        // 二维数组导航信息
        $flat_navs = array();
        $flat_cache_key = 'navs_all_flat';

        /*
         * 支持三级菜单
         * **/
        $result = array();
        foreach($navs as $n1alias => $n1st) {
            $n2children = array();

            foreach($n1st['children'] as $n2alias => $n2nd) {
                $n3children = array();

                foreach($n2nd['children'] as $n3alias => $n3rd) {
                    if(!$this->check_nav_permission($n3rd)) {
                        continue;
                    }
                    $n3rd['alias'] = $n3alias;
                    array_push($n3children, $n3rd);
                    unset($n3rd['children']);
                    array_push($flat_navs, $n3rd);
                }

                if(!$this->check_nav_permission($n2nd) ||
                    (!$n3children && !$n2nd['link'])) {
                    continue;
                }

                $n2nd['alias'] = $n2alias;
                $n2nd['children'] = $n3children;
                array_push($n2children, $n2nd);
                unset($n2nd['children']);
                array_push($flat_navs, $n2nd);

            }

            $n1st['children'] = $n2children;
            $n1st['alias'] = $n1alias;

            if(!$this->check_nav_permission($n1st) ||
                (!$n1st['children'] && !$n1st['link'])) {
                continue;
            }
            array_push($result, $n1st);
            unset($n1st['children']);
            array_push($flat_navs, $n1st);
        }

        tag("before_nav_response", $result);

        F($flat_cache_key, $flat_navs);
        
        $this->response($result);

    }

    /*
     * 检测导航权限
     * @todo 
     * **/
    private function check_nav_permission(array $nav) {
        if($this->is_super_user) {
            return true;
        }
        if(!$nav['link']) {
            return true;
        }
        $node = $nav['auth_node'];
        if(!$node) {
            $node = implode('.', array_slice(explode('/', $nav['link']), 0, 2));
            $node .= '.get';
        }

        return in_array($node, $this->_authed_nodes);
    }
    
}