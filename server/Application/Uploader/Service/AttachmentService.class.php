<?php

namespace Uploader\Service;
use Common\Model\CommonModel;

class AttachmentService extends CommonModel {

    protected $_auto = [
        array("user_info_id", "get_current_user_id", 1, "function"),
        array("company_id", "get_current_company_id", 1, "function")
    ];

    protected $save_path;

    public function __construct($name='',$tablePrefix='',$connection='') {
        parent::__construct($name,$tablePrefix,$connection);
        $this->save_path = ENTRY_PATH.'/uploads';
    }

    /*
     * 单条上传
     * @param array $data => angular_base64_upload 原始数据
     *  + model
     *  + source_id
     *
     * */
    public function upload($data) {

        $ids = [];

        $company_id = get_current_company_id();
        $user_id = get_current_user_id();

        foreach($data['files'] as $file) {

            // 已存在文件
            if($file['id']) {
                $ids[] = $file['id'];
                continue;
            }

            // 保存文件
            $real_url = $this->save_to_hard($file);
            if(false === $real_url) {
                continue;
            }

            $id = $this->add(array(
                'real_url' => $real_url,
                'source_name' => $file['filename'],
                'file_size' => $file['filesize'],
                'file_mime' => $file['filetype'],
                'source_model' => $data['source_model'],
                'source_id' => $data['source_id'],
                'company_id' => $company_id,
                'user_info_id' => $user_id
            ));
            if(!$id) {
                continue;
            }

            $ids[] = $id;

            if(!$data['multiple']) {
                break;
            }
        }

        return $ids;
    }

    /*
     * 保存文件至物理硬盘
     * @params array $file angular_base64_upload 原始数据
     * */
    private function save_to_hard($file) {
        $ignore = array(
            'exe', 'php', 'js', 'css', 'asp', 'aspx', 'pl', 'py', 'sh'
        );
        $ext = strtolower(end(explode('.', $file['filename'])));

        if(in_array($ext, $ignore)) {
            return false;
        }

        $save_name = md5(CTS.rand(1,1000)).'.'.$ext;

        $save_path = sprintf('/%s/', date('Y/m_d'));
        $full_save_path = ENTRY_PATH.'/uploads'.$save_path;

        @mkdir($full_save_path, 0777, true);

        if(!is_dir($full_save_path) || !is_writeable($full_save_path)) {
            return false;
        }

        $ifp = fopen($full_save_path.$save_name, 'w');
        if(!$ifp) {
            return false;
        }
        fwrite($ifp, base64_decode($file['base64']));
        fclose($ifp);

        return $save_path.$save_name;
    }

    /*
     * 删除文件
     * */
    public function do_delete($ids) {
        if(!$ids) {
            return;
        }

        $map = array(
            'id' => array('IN', $ids),
            'company_id' => get_current_company_id()
        );

        $files = $this->where($map)->select();

        foreach($files as $file) {
            if(substr($file['real_url'], 0, 1) === '/') {
                $local_path = $this->get_local_path($file['real_url']);
                is_file($local_path) && @unlink($local_path);
            }
        }

        $this->where($map)->delete();

    }

    /*
     * 返回文件在本地硬盘路径
     * */
    public function get_local_path($real_url) {
        return $this->save_path.$real_url;
    }

}