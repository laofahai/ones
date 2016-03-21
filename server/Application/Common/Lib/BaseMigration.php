<?php

namespace Common\Lib;

use Phinx\Db\Adapter\AdapterFactory;
use Phinx\Db\Adapter\MysqlAdapter;
use Phinx\Migration\AbstractMigration;
use Symfony\Component\Yaml\Yaml;

error_reporting(E_ALL^E_NOTICE);

define('__ROOT__', dirname(dirname(dirname(__DIR__))));
define('__APPLICATION__', __ROOT__.'/Application/');

/*
 * 遍历Schema目录获得yml文件
 * **/
if(!class_exists('RecursiveFileFilterIterator')) {
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
}

if(!class_exists('RecursiveFolderFilterIterator')) {
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
}


class BaseMigration extends AbstractMigration{
    
    protected $app;

    private $all_meta_info = [];

    private $adapter_name = 'mysql';

    public function init() {
        !defined('ENTRY_PATH') && define('ENTRY_PATH', __ROOT__);
        !defined('DB_ENVIRONMENT') && define('DB_ENVIRONMENT', 'development');
        $config = Yaml::parse(file_get_contents(ENTRY_PATH.'/phinx.yml'));
        $config = $config['environments'][DB_ENVIRONMENT];

        $this->adapter_name = $config['adapter'];

        $adapter = AdapterFactory::instance()->getAdapter($config['adapter'], $config);

        $this->setAdapter($adapter);
    }

    /*
     * 通过schema.yml文件配置数据库
     * 1、验证table是否存在 hasTable
     * 2、不存在完全创建 create()
     * 3、存在遍历字段查看是否存在 table.hasColumn
     * 4、字段存在 table.changeColumn
     * 5、不存在则创建 table.addColumn
     * 6、保存 exists ? save() : create()
     *
     * @todo 添加外键在析构函数或回调执行，保证所有字段已添加
     * **/
    public function fromYaml($app) {

        if($app === '*') {
            $ignore_dir = ['.', '..', '__MACOS', '.DS_Store'];
            $fh = opendir(__APPLICATION__);
            while($dir = readdir($fh)) {
                if(is_dir(__APPLICATION__.$dir) && !in_array($dir, $ignore_dir)) {
                    $this->fromYaml($dir);
                }
            }
            closedir($fh);
            return;
        }
        
        list($app, $file) = explode('/', $app);
        
        $this->app = $app;
        
        $schemaPath = sprintf('%s%s/Schema/', __APPLICATION__, $app);
        
        $schemas = array();
        if($file) {
            $schemas[] = Yaml::parse(file_get_contents($schemaPath.$file));
        } else {
            if(!is_dir($schemaPath)) {
                return true;
            }
            foreach (new RecursiveFileFilterIterator($schemaPath, '', 'yml') as $item) {
                if(!is_file($item)) {
                    continue;
                }
                $schemas[] = Yaml::parse(file_get_contents($item));
            }
        }
        
        if(!$schemas) {
            return sprintf("Failed to parse schema in: %s\n", $schemaPath);
        }

        foreach($schemas as $schema) {
            if(!$schema) {
                continue;
            }
            foreach($schema as $tableName=>$fields) {
                if(!$tableName or !$fields) {
                    continue;
                }
                
                if($this->hasTable($tableName)) {
                    $this->_updateTableForYaml($tableName, $fields);
                } else {
                    $this->_createTableForYaml($tableName, $fields);
                }
                $this->all_meta_info[$tableName] = array_merge((array)$this->all_meta_info[$tableName], (array)$fields['$meta']);
            }
        }
        
    }

    /*
     * 应用$meta
     * */
    public function apply_meta() {
        if(!$this->all_meta_info) {
            return;
        }
        foreach($this->all_meta_info as $tableName=>$meta) {
            $this->_applyMeta($tableName, $meta);
        }
    }
    
    /*
     * 创建数据表
     * **/
    private function _createTableForYaml($tableName, $fields) {
        
        if(!$fields) {
            return;
        }

        echo "Creating table: ".$tableName . "\n";

        $table = $this->table($tableName);
        
        foreach($fields as $column=>$options) {
            if(!$column) {
                continue;
            }
            
            # 私有属性
            if(substr($column, 0, 1) == "$") {
                continue;
            }
            printf("Add field %s to table %s\n", $column, $tableName);
            $parsed_options = $this->_parseColumnOptions((array)$options);
            $type = $parsed_options['type'] ? $parsed_options['type'] : 'string';
            unset($parsed_options['type']);
            $table = $table->addColumn(
                $column,
                $type,
                $parsed_options
            );
            
        }
        
        
//        $table = $this->_applyMeta($table, $fields['$meta']);
        
        $table->save();
        
//        $this->_applyMeta($tableName, $fields['$meta']);
        
        /*
         * 生成ThinkPHP Model文件
         * $this->app
         * **/
    }
    
    /*
     * 更新表结构
     * @todo 删除无用字段
     * **/
    private function _updateTableForYaml($tableName, $fields) {
        
        if(!$fields) {
            return;
        }
        
        $table = $this->table($tableName);
        foreach($fields as $column=>$options) {
            
            # 私有属性
            if(substr($column, 0, 1) == "$") {
                continue;
            }
            
            $method = $table->hasColumn($column) ? "changeColumn" : "addColumn";
            $parsed_options = $this->_parseColumnOptions((array)$options);
            $type = $parsed_options['type'] ? $parsed_options['type'] : 'string';
            unset($parsed_options['type']);
            $table = $table->$method(
                $column,
                $type,
                $parsed_options
            );
        }
        
        //$table = $this->_applyMeta($table, $fields['$meta']);
        
        $table->save();
        
        //$this->_applyMeta($tableName, $fields['$meta']);
    }
    
    /*
     * Meta 信息
     * indexes
     * **/
    private function _applyMeta($tableName, $meta) {
        
        $table = $this->table($tableName);

        if(!$meta) {
            return $table;
        }
        
        # 清除数据
        if($meta['truncate_when_migrate']) {
            $this->execute("DELETE FROM ".$tableName);
        }


        # 外键
        if($meta['foreign']) {
            foreach($meta['foreign'] as $foreignTable=>$options) {
                // 兼容省略约束等配置的写法
                if(is_numeric($foreignTable) || !is_array($options)) {
                    $foreignTable = $options;
                    $options = [
                        'restrict' => [
                            "delete" => "CASCADE"
                        ]
                    ];
                }

                $relatedColumn = $options['related_column'] ? $options['related_column'] : "id";
                $foreignTable = $options['foreign_table'] ? $options['foreign_table'] : $foreignTable;
                $column = $options['foreign_key'] ? $options['foreign_key'] : $foreignTable."_id";
                // 不存在字段或索引先创建
                if(!$table->hasColumn($column)) {
                    printf("Column not found: %s.%s\n", $tableName, $column);
                    $options["options"]["limit"] = 11;
//                    print_r($options);exit;
                    $table->addColumn($column, 'integer', $this->_parseColumnOptions((array)$options["options"]))->save();
                    #$this->_add_index($tableName, $column, $meta);
                    $table = $this->table($tableName);
                }


                if(!$table->hasIndex($column)) {
                    printf("Index not found: %s.%s\n", $tableName, $column);
                    $this->_add_index($tableName, $column);
                    $table = $this->table($tableName);
                }

                if($table->hasForeignKey($column)) {
                    try {
                        $table->dropForeignKey($column);
                    } catch(\PDOException $e) {
                        continue;
                    }

                }
                echo sprintf('Add foreign key: %s.%s => %s.%s'."\n",
                    $tableName,
                    $column,
                    $foreignTable,
                    $relatedColumn
                );

                try {
                    $table
                        ->addForeignKey(
                            $column,
                            $foreignTable,
                            $relatedColumn,
                            (array)$options['restrict']
                        );
                } catch(\PDOException $e) {
                    continue;
                }
            }
            
            $table->save();
        }

        # 索引
        if($meta['indexes']) {
            foreach($meta['indexes'] as $index=>$option) {
                $option = $option ? $option : array();

                $table = $this->_add_index($tableName, $index, array(), $option);
            }
        }

        # 是否支持回收站
        if($meta['enable_trash'] && !$table->hasColumn('trashed')) {
            $table = $table->addColumn(
                "trashed",
                "enum",
                array(
                    "values"=> array(0,1),
                    "default"=> '0'
                )
            )
                ->addIndex('trashed')
                ->save();
        }



        return $table;
    }

    private function _add_foreign_key() {}

    private function _add_index($tableName, $column, $meta=array(), $options=array()) {
        if($meta && !$options) {
            foreach($meta['indexes'] as $k=>$o) {
                $define_index = $o['fields'] ? $o['fields'] : $k;
                echo $column.":";
                print_r($define_index);
                echo "\n";
                if($define_index == $column || in_array($column, (array)$define_index)) {
                    $this->_add_index($tableName, $define_index, array(), $o);
                }
            }
        } else {
            $table = $this->table($tableName);

            $column = $options['fields'] ? $options['fields'] : $column;

            unset($options['fields']);

            if($table->hasIndex($column)) {
                try {
                    $table->removeIndex($column);
                } catch(\PDOException $e) {}

            }

            printf("Add index on: %s.[%s]\n", $tableName, implode(',', (array)$column));

            $table->addIndex($column, $options)->save();

            return $table;
        }
    }
    
    /*
     * 解析字段配置到phinx支持格式
     * 
     *  'limit',
        'default',
        'null',
        'identity',
        'precision',
        'scale',
        'after',
        'update',
        'comment',
        'signed',
        'timezone',
        'properties',
        'values',
    @todo 不同数据库类型处理
     * **/
    private function _parseColumnOptions(array $options) {
        
        $available = array(
            'limit',
            'default',
            'null',
            'identity',
            'precision',
            'scale',
            'after',
            'update',
            'comment',
            'signed',
            'timezone',
            'properties',
            'values',
            'type'
        );
        
     
        # 长度
        if(!$options['length'] && !$options['limit']) {
            switch($options['type']) {
                case "tinytext":
                    $options['type'] = 'text';
                    if($this->adapter_name === 'mysql') {
                        $options['limit'] = MysqlAdapter::TEXT_TINY;
                    }

                    break;
                case 'text':
                    if($this->adapter_name === 'mysql') {
                        $options['limit'] = MysqlAdapter::TEXT_REGULAR;
                    }
                    break;
                case 'money':
                    $options['type'] = 'decimal';
                    $options['precision'] = 14;
                    $options['scale'] = 4;
                    break;
                default:
                    $options['limit'] = 255;
                    break;
            }
        } else {
            if(in_array($options['type'], ['text', 'tinytext'])) {
                if($this->adapter_name === 'pgsql') {
                    unset($options['limit']);
                    unset($options['length']);
                }
            }
        }
        
        if(isset($options['blank'])) {
            $options['null'] = $options['blank'];
        }
        
        foreach($options as $k=>$v) {
            if(!in_array($k, $available)) {
                unset($options[$k]);
            }
        }
        
        
        return $options;
        
    }

    // 处理权限节点
    protected function add_auth_node() {
        $supported_action = array('get','post','put','delete');
        $nodes = array();
        $all_nodes = array();

        // 所有需插入节点
        foreach (new RecursiveFileFilterIterator(__APPLICATION__, "config.yml") as $item) {
            $config = Yaml::parse(file_get_contents($item));
            if(!$config['auth_nodes']) {
                continue;
            }

            foreach($config['auth_nodes'] as $node) {
                list($app, $module, $action) = explode('.', $node);
                list($action, $flagable) = explode('|', $action);
                $action = $action == "*" ? $supported_action : explode(',', $action);
                foreach($action as $act) {
                    $node = sprintf('%s.%s.%s', $app, $module, $act);
                    $nodes[] = array($app, $flagable?1:0, $node);
                    $all_nodes[] = $node;
                }

            }
        }

        $tmp = $this->fetchAll('SELECT * FROM auth_node');
        $exists_nodes = array();
        $exists_nodes_ids = array();
        foreach($tmp as $node) {
            $exists_nodes[$node['id']] = $node['node'];
        }

        /*
         * 需删除
         * */
        $need_insert = array();
        $need_delete = array();
        foreach($exists_nodes as $k=>$node) {
            if(in_array($node, $all_nodes)) {
                continue;
            }
            $need_delete[] = $k;
        }

        foreach($all_nodes as $k=> $node) {
            if(in_array($node, $exists_nodes)) {
                continue;
            }
            $need_insert[] = $nodes[$k];
        }

        if($need_delete) {
            $sql = 'DELETE FROM auth_node WHERE id IN(%s)';
            $this->execute(sprintf($sql, implode(',', $need_delete)));

            echo $sql."\n";
        }

        if($need_insert) {
            $sql = 'INSERT INTO auth_node(app,flagable,node)VALUES ';
            $values = [];
            foreach($need_insert as $node) {
                $values[] = sprintf("('%s', %d, '%s')", $node[0], $node[1], $node[2]);
            }

            $sql.= implode(',', $values);

            echo $sql."\n";

            $this->execute($sql);
        }


    }

    public function __destruct() {
//        parent::__destruct();

//        $this->execute('TRUNCATE TABLE phinxlog');
    }

}