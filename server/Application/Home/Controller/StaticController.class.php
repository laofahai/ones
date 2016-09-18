<?php
/**
 * Created by PhpStorm.
 * User: nemo <335454250@qq.com>
 * Date: 9/13/15
 * Time: 10:25
 */

namespace Home\Controller;


use Common\Lib\JSMin;
use Think\Controller;

class StaticController extends Controller
{

    /*
     * 返回静态文件列表
     * */
    public function on_list() {
        $method = sprintf('fetch_static_for_%s', I('get.t'));
        $files = explode(',', I('get.f'));
        foreach($files as $k=>$f) {
            if($f[0] === '/') {
                $files[$k] = 'apps' . $f;
            }
        }

        if(method_exists($this, $method)) {
            $this->$method($files);
        }
    }

    /*
     * 返回JS
     * */
    protected function fetch_static_for_js($files) {
        header('Content-Type: application/x-javascript');
        header('Charset: utf-8');

        $cache_key = "compiled/js";
        $content = F($cache_key);
        if(DEBUG || !$content) {
            $front_end_root = dirname(ENTRY_PATH).'/ones/';
            ob_start();
            foreach($files as $file) {
                $path = $front_end_root.$file.".js";
                if(is_file($path)) {
                    echo file_get_contents($path);
                }
            }
            $content = ob_get_contents();
            ob_end_clean();

            $content = trim(JSMin::minify($content));

            F($cache_key, $content);
        }

        // 保存至物理路径
        $save_path = '/runtime_compiled/'.md5(implode(',', $files));
        $this->save_to_file($save_path, $content);
        $this->save_to_file($save_path, $content);
        echo $content;
    }

    private function save_to_file($save_path, $content, $ext='js') {

        $paths = ['ones', 'dist'];
        foreach($paths as $path) {
            $the_path = dirname(ENTRY_PATH).'/'.$path.$save_path.'.'.$ext;
            $save_dir = dirname($the_path);

            if(!is_dir($save_dir)) {
                mkdir($save_dir, 0777, true);
            }
            if(!is_file($the_path)) {
                file_put_contents($the_path, $content);
            }
        }
    }
}