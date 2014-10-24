#!/usr/bin/python
#-*- coding: utf8 -*-

import ConfigParser, os, ftplib, socket

class appPublish:

    def __init__(self):
        self.cfg = self.parseINI()
        self.appsPath = os.getcwd().replace("/utils", "/apps")

    def parseINI(self):
        cfg = ConfigParser.RawConfigParser()
        with open("server.ini") as fileObj:
            cfg.readfp(fileObj)

        return cfg

    def inputAppName(self, appNames):
        if appNames:
            appNames = appNames.split(",")
        else:
            ignoreList = ['.DS_Store', 'com.', 'dashboard','dataModel','department','install','multiSearch','services','workflow']
            appNames = []
            files = os.listdir(self.appsPath)
            for f in files:
                if f in ignoreList or f[:4] in ignoreList:
                    continue
                appNames.append(f)

        return appNames

    def doUpload(self, appNames):

        os.chdir(self.appsPath)
        zips = os.listdir(self.appsPath)

        timeout = 60
        bufsize = 1024

        socket.setdefaulttimeout(timeout)

        ftp = ftplib.FTP()

        try:
            ftp.set_pasv(True)
            ftp.connect(self.cfg.get("ftp","host"), self.cfg.get("ftp","port"))
            ftp.login(self.cfg.get("ftp","user"), self.cfg.get("ftp","pass"))
        except ftplib.error_perm:
            print "connect to ftp failed"
            ftp.quit()
            return False

        if not self.remotePath:
            self.remotePath = '/wwwroot/ones_service/Data/apps'

        try:
            ftp.cwd(self.remotePath)
        except ftplib.error_perm:
            print "switch to path failed"
            ftp.quit()
            return false

        uploaded = []
        failed = []
        for app in appNames:
            ziped = app+".zip"

            print "zipping %s..." % app
            os.popen("zip -r %s.zip %s" % (app,app))

            print "zip %s success, uploading..." % ziped

            try:
                file_handler = open(self.appsPath+'/'+ziped,'rb')
                ftp.storbinary('STOR %s' % ziped, file_handler, bufsize)
                uploaded.append(app)
                file_handler.close()
                print "upload success: %s" % ziped
            except ftplib.error_perm:
                print "upload failed: %s" % ziped
                failed.append(app)

            os.remove(ziped)

        ftp.quit()

        print "upload %d items: %s " % (len(uploaded), ",".join(uploaded))
        print "%d items failed: %s" % (len(failed), ",".join(failed))

    def doPublish(self, inp):

        appNames = self.inputAppName(inp)

        if len(appNames) < 1:
            print "nothing"
            return

        self.doUpload(appNames)


if __name__ == "__main__":

    apps = raw_input("app name(explode by `,` and default to all;) : ")
    remotePath = raw_input("remote path(default is `/wwwroot/ones_service/Data/apps`):")

    p = appPublish()
    p.remotePath = remotePath
    p.doPublish(apps)