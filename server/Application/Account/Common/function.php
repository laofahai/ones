<?php

function generate_password($source, $rand_hash=false) {
    $rand_hash = $rand_hash ? $rand_hash : random_string(6);
    $password = sha1(md5($source.$rand_hash));
    return [$password, $rand_hash];
}

/*
 * 返回所有权限节点
 * */
function get_auth_nodes() {

    $cache_key = 'all_auth_node';
    $cached = F($cache_key);
    if(!DEBUG && $cached) {
        return $cached;
    }

    $model = D('Account/AuthNode', "Service");

    $data = $model->select();
    $all_nodes = array();

    foreach($data as $node) {
        $all_nodes[$node['id']] = $node;
    }

    F($cache_key, $all_nodes);

    return $all_nodes;
}