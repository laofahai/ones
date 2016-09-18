<?php
/**
 * Created by PhpStorm.
 * User: laofahai <335454250@qq.com>
 * Date: 9/18/16
 * Time: 11:06
 */

namespace Region\Migration;


use Common\Lib\BaseMigration;

class RegionMigration extends BaseMigration {

    public function up() {
        $sql_path = ENTRY_PATH.'/Application/Region/Schema/data.sql';
        if(!is_file($sql_path)) {
            return;
        }
        $sql_content = file_get_contents($sql_path);
        $sql_content = explode("\n", $sql_content);

        foreach($sql_content as $sql) {
            $sql = trim($sql);
            if(!$sql) {
                continue;
            }
            $this->execute($sql);
        }

    }
}