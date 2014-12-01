<?php
/**
 * Created by PhpStorm.
 * User: nemo
 * Date: 14/12/1
 * Time: 16:58
 */

class StockLogModel extends CommonModel {


    /*
     * $options = array(
     *  type => 1进2出
     *  source_id => 原始单据ID
     *  factory_code_all => 编码
     *  user_id => 操作员ID
     *  repository_id => 仓库ID
     *  dateline => 时间
     * );
     * **/
    public function record($options) {
        $needed = array(
            "type", "source_id", "factory_code_all", "repository_id", "num"
        );

        foreach($needed as $need) {
            if(!array_key_exists($need, $options)) {
                return false;
            }
        }

        $options["user_id"] = $options["user_id"] ? $options["user_id"] : getCurrentUid();
        $options["dateline"] = $options["dateline"] ? $options["dateline"] : CTS;

        if(false === $this->switchModel("")->add($options)) {
            Log::write($this->getLastSql(), Log::SQL);
        }

    }

} 