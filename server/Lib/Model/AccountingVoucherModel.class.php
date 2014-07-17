<?php

/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

/**
 * Description of AccountingVoucherModel
 *
 * @author 志鹏
 */
class AccountingVoucherModel extends CommonModel {
    
    protected $_link = array(
        "AccountingVoucherDetail" => array(
            "mapping_type" => HAS_MANY,
            "foreign_key"  => "voucher_id",
        )
    );
    
}
