<?php
/**
 * Created by PhpStorm.
 * User: nemo <335454250@qq.com>
 * Date: 6/24/15
 * Time: 20:23
 */

namespace Uploader\Behaviors;

use DataModel\Service\DataModelFieldService;
use Think\Behavior;

/*
 * 检测上传的文件，保存，并将数据模型中的数据改为id,id2,id3格式
 * */
class ProcessUploadedBehavior extends Behavior {

    public function run(&$params) {

        $source_data = $_POST;

        $service = D('Uploader/Attachment');

        /*
         * 数据来源
         * */
        $data = array(
            'source_model' => lcfirst(MODULE_NAME).'.'.lcfirst(CONTROLLER_NAME),
            'source_id' => $params['source_id']
        );

        foreach($source_data as $field=>$value) {
            // 判断当前数据是否是上传字段
            if(is_array($value)
                && $value[0]['filetype']
                && $value[0]['filename']
                && $value[0]['filesize']) {

                $data['files'] = $value;
                // @todo 判断多项上传
//                $data['multiple']
                $ids = $service->upload($data);
                $source_data[$field] = implode(',', $ids);
            }
        }

//        print_r($source_data);exit;


        $_POST = $source_data;

        $params['attachment_ids'] = $ids;

    }

}