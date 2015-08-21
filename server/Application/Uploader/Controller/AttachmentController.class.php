<?php

namespace Uploader\Controller;
use Common\Controller\BaseRestController;

class AttachmentController extends BaseRestController {

    protected function _filter(&$map) {}

    /*
     * 读取附件，发送MIME
     * @todo 文件是否公开
     * @todo 远程附件
     * */
    public function on_read() {

        list($id, $hash) = explode('_', I('get.hash'));
        if($hash) {
            session(
                array(
                    'id' => $hash,
                    'expire' => 600,
                )
            );
            session('[start]');
        }

        $file = D('Attachment')->where(array(
            'company_id' => get_current_company_id(),
            'id' => $id
        ))->find();

        if(!$file) {
            return $this->httpError(404);
        }

        // 完整带协议地址（远程附件）
        if(substr($file['real_url'], 0, 1) !== '/') {

        } else {
            $real_path = ENTRY_PATH.'/uploads'.$file['real_url'];
            if(is_file($real_path)) {
                $desc = substr($file['file_mime'], 0, 5) === 'image' ? '' : 'attachment';
                header('Content-Type:'. $file['file_mime']);
                header("Accept-Ranges: bytes");
                header("Accept-Length: " . $file['file_size']);
                header("Content-Disposition: $desc; filename=".$file['source_name']);
                readfile($real_path);
            } else {
                $this->httpError(404);
            }
        }

    }

}