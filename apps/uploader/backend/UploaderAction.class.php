<?php
/**
 * Created by PhpStorm.
 * User: nemo
 * Date: 8/20/14
 * Time: 16:11
 */


class UploaderAction extends CommonAction {

    public function insert() {

        if(!$_POST["files"]) {
            return;
        }

        $relativePath = 'uploads/'.date("Y/m/", CTS);
        $savePath = ROOT_PATH."/".$relativePath;
        $returnPath = array();

        mkdir($savePath, 0777, true);

        foreach($_POST["files"] as $file) {
            $filename = uniqid().".".end(explode(".", $file["name"]));

            $rs = file_put_contents($savePath.$filename, base64_decode($file["fileData"]));
            if(!$rs) {
                $this->error($file["name"]);
                return;
            }

            $returnPath[] = $relativePath.$filename;
        }

        $this->response(array(
            "uploaded" => implode(",", $returnPath)
        ));

//
//
//        echo 123;exit;
//
//        import('ORG.Net.UploadFile');
//        $upload = new UploadFile();// 实例化上传类
//        $upload->autoSub = true;
//        $upload->subType = "date";
//        $upload->dateFormat = "m_d";
//        $upload->savePath =  'uploads/'.date("Y/m/", CTS);// 设置附件上传目录
////        echo $upload->savePath;exit;
//        if(!$upload->upload()) {// 上传错误提示错误信息
//            $this->error($upload->getErrorMsg());
//            return;
//        }else{// 上传成功 获取上传文件信息
//            $info =  $upload->getUploadFileInfo();
//        }
//
//        $this->response(array(
//            "error" => 0,
//            "uploadPath" => $info[0]["savepath"].$info[0]["savename"]
//        ));

    }
}