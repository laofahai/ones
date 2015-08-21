<?php
namespace Common\Behaviors;

class AutoRouteBehavior extends \Think\Behavior {

    /*
     * 自动路由
     * **/
    public function run(&$params) {

        $rules = C("URL_ROUTE_RULES");

        $allowMethods = explode(",", strtolower(SUPPORTED_METHOD));

        $s = explode('/', $_GET['s']);
        array_shift($s);

        $module = ucfirst($s[0]);

        switch(count($s)) {
            case 0:
                return;
            case 1: // /product
                $controller = "Index";
                break;
            case 2: // /product/productCategory
                $controller = ucfirst($s[1]);
                break;
            case 3:
                $controller = ucfirst($s[1]);
                $id = $s[2];
                if(intval($id) <= 0 && false === strpos($id, ',')) {
                    return;
                }
                break;
            default:
                break;
        }

        define('__EXT__', 'json');

        $route = sprintf('%s', lcfirst($controller));

        $id_route = sprintf('%s/:id', $route);

        // post
        array_push($rules, array(
                $route, $route.'/on_post','',array('ext'=>'json','method'=>'POST'))
        );

        // put
        array_push($rules, array(
                $id_route, $route.'/on_put','',array('ext'=>'json','method'=>'PUT'))
        );

        // delete
        array_push($rules, array(
                $id_route, $route.'/on_delete','',array('ext'=>'json','method'=>'DELETE'))
        );
        array_push($rules, array(
                $id_route, $route.'/on_delete','',array('ext'=>'json','method'=>'REMOVE'))
        );

        // get
        array_push($rules, array(
                $id_route, $route.'/on_read','',array('ext'=>'json','method'=>'GET'))
        );
        array_push($rules, array(
                $id_route, $route.'/on_event_read','',array('ext'=>'json','method'=>'EVENT_GET'))
        );

        // list
        array_push($rules, array(
                $route, $route.'/on_list','',array('ext'=>'json','method'=>'GET'))
        );
        array_push($rules, array(
                $route, $route.'/on_event_list','',array('ext'=>'json','method'=>'EVENT'))
        );


        C("URL_ROUTE_RULES", $rules);

    }
    
}