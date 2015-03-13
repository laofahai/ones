<?php
    error_reporting("E_ERROR");
    
    
    $timeLimit = 1209600; //本地缓存时间
    
    $url = sprintf("%s?s=%s&d=%s&r=%s",
            md5(strtolower(trim($_GET["email"]))),
            $_GET["s"] ? $_GET["s"] : "100",
            $_GET["d"] ? $_GET["d"] : "mm",
            $_GET["r"] ? $_GET["r"] : "g"
    );
    
    $localPath = './'.md5($url).'.jpg';

    $url = "http://linode.tokyo.sep-v.com/avatar.php?s=".base64_encode($url);

    if (!is_file($localPath) || (time() - filemtime($localPath)) > $timeLimit) {
        @copy($url, $localPath);
    }
    header("Content-Type: image/jpeg");
    echo file_get_contents($localPath);