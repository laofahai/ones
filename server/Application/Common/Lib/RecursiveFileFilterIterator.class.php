<?php
namespace Common\Lib;

/*
 * 遍历目录，并获取所有文件
 * **/
class RecursiveFileFilterIterator extends \FilterIterator {
    
    protected $_name;
    protected $_ext;
    
    public function __construct($path, $name=null, $ext=null) {
        if($name) {
            $this->_name = $name;
            $this->_ext = null;
        }
        
        if($ext) {
            $this->_ext = $ext;
            $this->_name = null;
        }

        if(!is_dir($path)) {
            return [];
        }
        
        parent::__construct(new \RecursiveIteratorIterator(new \RecursiveDirectoryIterator($path)));
    }
    
    public function accept() {
        if(!$this->_name && !$this->_ext) {
            return false;
        }
        
        $item = $this->getInnerIterator();
        if ($item->isFile()) {
            
            if($this->_ext && pathinfo($item->getFilename(), PATHINFO_EXTENSION) == $this->_ext) {
                return true;
            }
            
            if($this->_name && pathinfo($item->getFilename(), PATHINFO_BASENAME) == $this->_name) {
                return true;
            }
            
            return false;
        }
    }
}