<?php



/*
 * 返回所有权限节点
 * */
function get_auth_nodes() {

    $cache_key = 'auth/nodes/all';
    $cached = S($cache_key);
    if(!DEBUG && $cached) {
        return $cached;
    }

    $model = D('Account/AuthNode', "Service");

    $data = $model->select();
    $all_nodes = array();

    foreach($data as $node) {
        $all_nodes[$node['id']] = $node;
    }

    S($cache_key, $all_nodes);

    return $all_nodes;
}