<?php
/**
 * Created by PhpStorm.
 * User: nemo <335454250@qq.com>
 * Date: 6/25/15
 * Time: 19:09
 */

namespace Uploader\Behaviors;


use Think\Behavior;

class UpdateAttachSourceBehavior extends Behavior {

    public function run(&$params) {

        $source_id = $params['insert_id'] ? $params['insert_id'] : $params['update_id'];
        $attach_ids = $params['attachment_ids'];

        if(!$source_id or !$attach_ids) {
            return;
        }

        D('Uploader/Attachment')->where(array(
            'id' => array("IN", $attach_ids)
        ))->save(array(
            'source_id' => $source_id
        ));

    }

}