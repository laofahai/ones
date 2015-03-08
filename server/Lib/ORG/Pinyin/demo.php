<?php

include 'ChinesePinyin.class.php';

$Pinyin = new ChinesePinyin();

$words = '客戶名稱1';
echo '<h2>'.$words.'</h2>';



echo '<p>转成带有声调的汉语拼音<br/>';
$result = $Pinyin->TransformWithTone($words);
echo $result,'</p>';



echo '<p>转成带无声调的汉语拼音<br/>';
$result = $Pinyin->TransformWithoutTone($words,' ');
echo($result),'</p>';



echo '<p>這裡是<br/>';
$result = $Pinyin->TransformUcwords($words);
echo($result),'</p>';