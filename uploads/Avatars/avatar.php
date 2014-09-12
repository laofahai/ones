<?php
    error_reporting("E_ERROR");
    $localPath = './'.md5(strtolower(trim($email))).'.jpg';
    
    $timeLimit = 1209600; //本地缓存时间
    
    $url = sprintf("http://www.gravatar.com/avatar/%s?s=%s&d=%s&r=%s", 
            md5(strtolower(trim($_GET["email"]))),
            $_GET["s"] ? $_GET["s"] : "100",
            $_GET["d"] ? $_GET["d"] : "mm",
            $_GET["r"] ? $_GET["r"] : "g"
    );

    if (!is_file($localPath) || (time() - filemtime($localPath)) > $timeLimit) {
        @copy($url, $localPath);
    }
    header("Content-Type: image/jpeg");
    echo file_get_contents($localPath);