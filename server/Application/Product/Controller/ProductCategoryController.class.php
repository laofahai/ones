<?php
/**
 * Created by PhpStorm.
 * User: nemo
 * Date: 5/19/15
 * Time: 20:29
 */

namespace Product\Controller;
use Common\Controller\BaseRestController;


class ProductCategoryController extends BaseRestController {

    /*
     * 获取列表
     * */
    public function on_list() {
        $model = D('Product/ProductCategory', "Service");
        $tree = $model->get_tree();

        $this->response($tree);
    }

    /*
     * 新增
     * */
    public function on_post() {

        $model = D('Product/ProductCategory', 'Service');

        $pid = I('post.pid');

        if(!$pid || !$model->find($pid)) {
            return $this->error(__('product.Parent Category Not Found'));
        }

        $data = array(
            'name' => I('post.name'),
            'remark' => I('post.remark')
        );


        if(!$model->add_child($pid, $data, 'product_category')) {
            return $this->error(__('product.Add category Failed').':'.$model->getError());
        }

        $this->success(__('common.Operation Success'));
    }

    public function on_delete() {
        $model = D('Product/ProductCategory', 'Service');
        $model->delete_node(I('get.id'));
    }

}