<?php
/**
 * Created by PhpStorm.
 * User: nemo <335454250@qq.com>
 * Date: 8/1/15
 * Time: 22:57
 */

namespace Common\Controller;


/*
 * 单据父控制器
 * */
class CommonBillController extends BaseRestController {

    protected $main_model;

    protected $detail_model_alias;

    protected function _filter(&$map) {
        // 工作流状态过滤
//        if($map['workflow_node_status_label']) {
//
//            $progress_map = [
//                'workflow_node_id' => $map['workflow_node_status_label']
//            ];
//            $source_ids = D('Bpm/WorkflowProgress')->field('source_id')->where($progress_map)->select();
//            unset($map['workflow_node_status_label']);
//            $source_ids = get_array_by_field($source_ids, 'source_id');
//            $map[end(explode('/', $this->main_model)).'.id'] = ['IN', $source_ids];
//        }
    }

    /*
     * @override
     * 插入方法
     * */
    public function on_post() {
        $model = D($this->main_model);
        if(false === $model->add_bill(I('post.meta'), I('post.rows'))) {
            return $this->error($model->getError());
        }
    }

    /*
     * @override
     * 更新方法
     * */
    public function on_put() {
        $model = D($this->main_model);
        if(false === $model->edit_bill(I('get.id'), I('post.meta'), I('post.rows'))) {
            return $this->error($model->getError());
        }
    }

    /*
     * @override
     * 当请求中包含 _ir 参数时，返回所有信息
     * */
    public function on_read() {
        if(!I('get._ir')) {
            return parent::on_read();
        }

        $service = D($this->main_model);
        $data = $service->get_full_data(I('get.id'));

        if(!$data) {
            return $this->httpError(404);
        }

        $this->response($data);
    }

    /*
     * @override
     * 返回数据中包含工作流状态
     * */
    public function on_list() {
        $data = parent::on_list(true);
        $list = $data[1];

        $progress_model = D('Bpm/WorkflowProgress');
        $data[1] = $progress_model->assign_last_progress_to_list($list);

        $this->response($data, D($this->main_model));

    }

    /*
     * @extra
     * 删除数据时同步删除产品属性Map
     * */
    public function _after_delete($ids) {
        $map = [
            'source_model' => $this->detail_model_alias,
            'source_id'    => ['IN', $ids]
        ];
        return D('ProductAttributeMap')->where($map)->delete();
    }
    
}