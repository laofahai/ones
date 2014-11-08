#!/usr/bin/python
#-*- coding: utf8 -*-

import sys
import os
from os import path
from hashlib import md5

class UpgradePackageMaker:


    def __init__(self):
        self.ignoreDir = ['.', '..', '__MACOS', '.DS_Store', 'nbproject', '.project', '.git',
        '.idea', '.settings', 'upgrade', 'uploads','Runtime','.buildpath', 'server.ini', 'install.lock','config.php',
        '.gitignore', '.gitattributes', 'Data'
        ]

    def compareSQL(self):
        pass

    def compareDir(self, oldPath, newPath, basePath):

        if os.path.isdir(oldPath) != True:
            os.makedirs(oldPath)

        if os.path.isdir(oldPath) != True:
            os.makedirs(oldPath)

        oldFiles = os.listdir(oldPath)
        newFiles = os.listdir(newPath)

        if oldPath[-1:] != "/":
            oldPath = oldPath + '/'
        if newPath[-1:] != "/":
            newPath = newPath + '/'
        if basePath[-1:] != "/":
            basePath = basePath + "/"

        for f in newFiles:
            if f in self.ignoreDir:
                continue

            #目录递归处理
            if os.path.isdir(newPath+f) == True:

                if os.path.isdir(oldPath+f) != True and os.path.isdir(basePath+f) != True:
                    os.makedirs(basePath+f)
                else:
                    self.compareDir(oldPath+f, newPath+f, basePath+f)
            #文件判断MD5
            else:
                if os.path.isfile(oldPath+f) != True or self.md5File(newPath+f) != self.md5File(oldPath+f):
                    if os.path.isdir(basePath) != True:
                        os.makedirs(basePath)

                    open(basePath+f, "wb").write(open(newPath+f, "rb").read())


    def md5File(self, name):
        m = md5()
        a_file = open(name, 'rb')
        m.update(a_file.read())
        a_file.close()
        return m.hexdigest()


if __name__ == "__main__":

    upm = UpgradePackageMaker()
    oldPath = raw_input("input the old version abs path: ")
    newPath = raw_input("input the new version abs path: ")
    newPath = raw_input("input the upgrade abs path: ")
    oldPath = "/Users/nemo/wwwroot/ones_0.1.6"
    newPath = "/Users/nemo/wwwroot/ones"
    basePath = "/Users/nemo/wwwroot/ones_upgrade"
    upm.compareDir(oldPath, newPath, basePath)

