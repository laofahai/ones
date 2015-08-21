<?php
/**
 * Created by PhpStorm.
 * User: nemo <335454250@qq.com>
 * Date: 6/25/15
 * Time: 11:09
 */

namespace Uploader\Behaviors;


use Think\Behavior;

class ProcessAttachDeletedBehavior extends Behavior {

    /*
     * 数据被删除时同步删除相关附件
     * @param = array(
     *  deleted,
     *  app,
     *  module
     * )
     * */
    public function run(&$param) {

        $ids = is_array($param['deleted']) ? $param['deleted'] : explode(',', $param['deleted']);
        $map = array(
            'source_model' => sprintf('%s.%s', lcfirst(MODULE_NAME), lcfirst(CONTROLLER_NAME)),
            'source_id' => array('IN', $ids)
        );

        $data = D('Uploader/Attachment', 'Model')->where($map)->select();

        $attach_ids = get_array_to_kv($data, 'id', 'id');
        $service = D('Uploader/Attachment', 'Service');
        $service->do_delete($attach_ids);

    }

}