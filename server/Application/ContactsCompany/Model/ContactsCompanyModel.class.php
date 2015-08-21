<?php
/**
 * Created by PhpStorm.
 * User: nemo
 * Date: 5/22/15
 * Time: 10:25
 */

namespace ContactsCompany\Model;
use Common\Model\CommonViewModel;


class ContactsCompanyModel extends CommonViewModel {

    protected $viewFields = array(
        "ContactsCompany" => array("*", '_type'=>'left'),
        "ContactsCompanyRole" => array('name'=>'role_name', '_on'=>'ContactsCompany.contacts_company_role_id=ContactsCompanyRole.id', '_type'=>'left')
    );

}