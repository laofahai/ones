<?php
/**
 * Created by PhpStorm.
 * User: nemo <335454250@qq.com>
 * Date: 6/8/15
 * Time: 11:46
 */

namespace ContactsCompany\Model;


use Common\Model\CommonViewModel;

class ContactsCompanyLinkmanModel extends CommonViewModel {

    protected $viewFields = array(
        'ContactsCompanyLinkman' => array('*', '_type'=>'left'),
        'ContactsCompany' => array('name'=>'company_name', '_on'=>'ContactsCompany.id=ContactsCompanyLinkman.contacts_company_id', '_type'=>'left')
    );

}