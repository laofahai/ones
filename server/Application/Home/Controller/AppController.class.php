<?php
/**
 * Created by PhpStorm.
 * User: nemo <335454250@qq.com>
 * Date: 6/5/15
 * Time: 08:31
 */

namespace Home\Controller;


use Common\Controller\BaseRestController;
use Home\Service\AppService;

class AppController extends BaseRestController {

    protected function _filter(&$map) {
        if(I('get._mf') == 'is_active') {
            $map['is_active'] = (int)I('get._mv') > 0 ? array('EGT', 1) : array('EXP', 'IS NULL');
        }

    }

    /*
     * 启用/禁用应用
     * @override
     * */
    public function on_put() {
        $alias = I('post.aliases');

        $method = I('post.act');

        $service = D('Home/App');

        if(!method_exists($service, $method)) {
            return $this->error(__('common.Params Error'));
        }

        if($service->$method($alias)) {
            $this->success(__('common.Operation Success') . $service->getError());
        } else {
            $this->error($service->getError());
        }
    }

    /*
     * 包含启用状态
     * @override
     * */
    public function on_list() {
        $data = parent::on_list(true);
        $actives = D('Home/CompanyActiveApps')->where(['company_id'=>get_current_company_id()])->select();
        $actives = get_array_by_field($actives, 'app_id');
        foreach($data[1] as $k=>$v) {
            if(in_array($v['id'], $actives)) {
                $data[1][$k]['is_active'] = true;
            } else {
                $data[1][$k]['is_active'] = false;
            }
        }
        $this->response($data, 'app', true);
    }

    public function get_loaded() {
        $this->response(array_merge(
            AppService::$activeApps,
            AppService::$baseApps
        ));
    }

}