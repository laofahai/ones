<?php

/**
 * @filename UserModel.class.php 
 * @encoding UTF-8 
 * @author nemo.xiaolan <a href="mailto:335454250@qq.com">335454250@qq.com</a>
 * @link <a href="http://www.sep-v.com">http://www.sep-v.com</a>
 * @license http://www.sep-v.com/code-license
 * @datetime 2013-11-18  13:35:50
 * @Description
 * 
 */
class UserModel extends CommonModel {
    
    protected $_auto = array(
        array("status", 1),
        array("password", "getPwd", 3, "function"),
    );
    
}

?>
