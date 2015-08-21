<?php
/**
 * Created by PhpStorm.
 * User: nemo
 * Date: 5/23/15
 * Time: 14:49
 */

namespace ContactsCompany\Controller;


use Common\Controller\BaseRestController;

class ContactsCompanyLinkmanController extends BaseRestController {

    protected function _filter(&$map) {
        if(I('get.contacts_company_id')) {
            $map['contacts_company_id'] = I('get.contacts_company_id');
        }
    }

}