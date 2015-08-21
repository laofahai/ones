<?php
namespace Common\Lib;

/*
 * 遍历目录，并获取所有目录
 * **/
class RecursiveFolderFilterIterator extends \FilterIterator {
    
    public function __construct($path) {
        parent::__construct(new \RecursiveIteratorIterator(new \RecursiveDirectoryIterator($path)));
    }
    
    public function accept() {
        
        $item = $this->getInnerIterator();
        if ($item->isDir()) {
            return true;
        }
        return false;
    }
}