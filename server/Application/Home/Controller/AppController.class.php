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

    private $filter_only_active_status = false;

    protected function _filter(&$map) {
        if(isset($map['is_active'])) {
            $this->filter_only_active_status = (int)$map['is_active'] > 0 ? 1 : 0;
            unset($map['is_active']);
        }

        if($map['type'] == 'null') {
            $map['type'] = ['EXP', 'IS NULL'];
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

        $cleared_list = [];
        $i=0;
        foreach($data[1] as $k=>$v) {
            // 根据是否启用状态过滤
            if(false !== $this->filter_only_active_status) {
                if($this->filter_only_active_status > 0 && !in_array($v['id'], $actives)) {
                    continue;
                }
                if($this->filter_only_active_status < 1 && in_array($v['id'], $actives)) {
                    continue;
                }
            }

            $cleared_list[$i] = $v;
            if(in_array($v['id'], $actives)) {
                $cleared_list[$i]['is_active'] = true;
            } else {
                $cleared_list[$i]['is_active'] = false;
            }
            $i++;
        }

        $data[1] = $cleared_list;
        $this->response($data, 'app', true);
    }

    public function get_loaded() {
        $this->response(array_merge(
            AppService::$activeApps,
            AppService::$baseApps
        ));
    }

}