<?php

namespace Uploader\Event;
use Common\Event\BaseRestEvent;

class AttachmentEvent extends BaseRestEvent {

    protected function _filter(&$map) {
        if(I('get.ids')) {
            $map['id'] = array('IN', explode(',', I('get.ids')));
        }
    }

}