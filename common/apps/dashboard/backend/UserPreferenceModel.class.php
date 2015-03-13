<?php
/**
 * Created by PhpStorm.
 * User: nemo
 * Date: 14/11/30
 * Time: 15:15
 */

class UserPreferenceModel extends Model {

    public function get($uid=0, $reIndex=true) {
        $uid = $uid ? $uid : getCurrentUid();
        $data = $this->where("uid=".$uid)->getField("data");
        $data = json_decode($data, true);

        if(!$data){
            return array();
        }

        if($reIndex) {
        	$data["blocks"] = reIndex($data["blocks"]);        	
        }
        
        $data["btns"] = multi_array_sort($data["btns"], "listorder", SORT_ASC);

        return $data;

    }

    public function update($post) {
        $old = $this->get(0,false);
        $btns = array();
        $blocks = array();
        
        foreach($post["blocks"] as $k=>$v) {
        	$blocksNames[] = $v["name"];
        	$postBlocks[$v["name"]] = $v;
        }
        
        $blockConfigureKey = array("col", "row", "width", "height", "config");
        foreach($postBlocks as $name=>$block) {
        	if(!I("post.customize") && !$block["selected"]) {
        		continue;
        	}
        	foreach($blockConfigureKey as $key) {
        		$block[$key] = (isset($block[$key]) && !is_null($block[$key])) ? $block[$key] : $old["blocks"][$name][$key];
        	}
        	$blocks[$name] = $block;
        }
        
        
        
        foreach($post["btns"] as $btn) {
        	
        	if(!$btn["selected"]) {
        		continue;
        	}
        	$btns[] = array(
        		"name" => $btn["name"],
        		"listorder"=> $btn["listorder"]
        	);
        }

        $old["btns"] = $btns;
        $old["blocks"] = $blocks;

        $this->add(array(
            "uid" => getCurrentUid(),
            "data"=> json_encode($old)
        ), null, true);
    }

} 