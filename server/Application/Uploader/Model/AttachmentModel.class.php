<?php

namespace Uploader\Model;
use Common\Model\CommonViewModel;

class AttachmentModel extends CommonViewModel {

    protected $viewFields = array(
        "Attachment" => array('*', '_type'=>'left')
    );

}