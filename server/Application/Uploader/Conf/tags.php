<?php

return array(
    // 插入/更新主数据之前，将文件上传，并返回ids
    "before_item_insert" => array(
        "Uploader\\Behaviors\\ProcessUploadedBehavior",
    ),
    "before_item_update" => array(
        "Uploader\\Behaviors\\ProcessUploadedBehavior",
    ),

    // 插入完成之后，将主数据记录ID更新至附件表
    "after_item_insert" => array(
        "Uploader\\Behaviors\\UpdateAttachSourceBehavior",
    ),
    "after_item_update" => array(
        "Uploader\\Behaviors\\UpdateAttachSourceBehavior",
    ),

    // 删除记录时同步删除附件
    "after_item_delete" => array(
        "Uploader\\Behaviors\\ProcessAttachDeletedBehavior",
    )
);