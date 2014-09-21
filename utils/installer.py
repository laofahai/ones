#!/usr/bin/python
#-*- coding: utf8 -*-

import urllib, urllib2
import json
import os
import hashlib

installPath = raw_input("where ones will be installed(default is current directory):")

if not installPath:
    installPath = os.getcwd()

url = "http://127.0.0.1/vhosts/ones_service/index.php?s=/Installer/getLatest";
html = urllib2.urlopen(url)

installerInfo = json.loads(html.read());




print installPath
print installerInfo['version']
print installerInfo['file']
print installerInfo['md5']


