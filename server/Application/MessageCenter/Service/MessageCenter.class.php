<?php
/**
 * Created by PhpStorm.
 * User: nemo <335454250@qq.com>
 * Date: 10/23/15
 * Time: 21:16
 */

namespace MessageCenter\Service;

/**
    消息中心 后端中转处理，可注册插件至此。
    某模块数据变动 -> 发送至MessageCenter -> MessageCenter 通过$type参数，调用相应钩子
    -> 相应钩子上挂载的插件做其他的操作
 */
class MessageCenter {

    /*
     * 对其他模块提供冒泡消息的接口，其他接口可使用此接口将消息传至Message Center，
     * 并由Message Center根据$type参数广播至挂载至此的钩子。
     *
     * @param array $type = [
     *      add, edit, read, delete, // 基本CURD
     *      stock_change, // 其他为插件定义，如库存变动等
     * ]
     * @param array $data = [
     *  user_id: // 操作者ID
     *  created: // 操作发生时间,
     *  subject: // 操作主题
     *  related_contacts_companies: [ //相关往来单位ID ]
     *  related_users: [ //影响的用户ID ],
     *  related_departments: [ //影响的部门ID ],
     *  related_orders: [ //影响的订单 ]
     *  ... etc.
     * ]
     * @eg
     *   MessageCenter::broadcast('add', [
     *      module: sale.orders
     *      subject: XX销售订单
     *      link: sale/orders/view/1
     *      user_id: 1
     *      created: 2015-10-10 10:10:10
     *  ]);
     *
     * */
    final static public function broadcast($types, Array $data) {
        $types = is_array($types) ? $types : [$types];

        foreach($types as $type) {
            tag("on_message_center_get_".$type, $data);
        }

        $data["types"] = $types;
        tag("on_message_center_get_all", $data);

    }


}