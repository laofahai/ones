<?php
/**
 * Created by PhpStorm.
 * User: nemo <335454250@qq.com>
 * Date: 6/21/15
 * Time: 18:11
 */

namespace Common\Lib;


class CommonFilter {

    /*
     * 通过用户过滤
     * */
    static public function by_user($map) {
        $uid = get_current_user_id();
        switch($map['by_user']) {
            case "i_created":
                $map['user_info_id'] = $uid;
                break;
            case "i_headed":
                $map['head_id'] = $uid;
                break;
            case "sub_created":
                $subs = D('Account/UserInfo')->get_all_subordinates();
                $map['user_info_id'] = ['IN', get_array_by_field($subs, 'id')];
                break;
            case "sub_headed":
                $subs = D('Account/UserInfo')->get_all_subordinates();
                $map['head_id'] = ['IN', get_array_by_field($subs, 'id')];
                break;
        }

        unset($map['by_user']);
        return $map;
    }

    /*
     * 时间段
     *
     * 参数eg:
     *  w20  => 20 days without contact
     *  nd => today need contact
     *  nw => this week need contact
     *  nm => this month need contact
     * */
    static public function by_date_range($map){
        $range_type = $map['date_range'][0];
        $limit = substr($map['date_range'], 1, strlen($map["date_range"]));

        switch($range_type) {
            case "w": //n days without contact
                $map['last_contact_time'] = array(
                    array('ELT', strtotime("-$limit days")),
                    array('EXP', 'IS NULL'),
                    'OR'
                );
                break;
            case "n":
                switch($limit) {
                    case "d": // today
                        $map['next_contact_time'] = array(
                            'BETWEEN', array(
                                date('Y-m-d 00:00:00', CURRENT_TIMESTAMP),
                                date('Y-m-d 23:59:59', CURRENT_TIMESTAMP)
                            )
                        );
                        break;
                    case "w": // this week
                        $map['next_contact_time'] = array(
                            'BETWEEN', array(
                                date('Y-m-d 00:00:00', strtotime('this week')),
                                date('Y-m-d 23:59:59', strtotime('this week +6 days'))
                            )
                        );
                        break;
                    case "m": // thismonth
                        $map['next_contact_time'] = array(
                            'BETWEEN', array(
                                date('Y-m-01 00:00:00', strtotime('this month')),
                                date(sprintf('Y-m-%d 23:59:59', date('t')), strtotime('this month'))
                            )
                        );
                        break;
                }
                break;
        }

        unset($map['date_range']);
        return $map;
    }

}