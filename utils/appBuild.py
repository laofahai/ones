#!/usr/bin/python
#-*- coding: utf8 -*-

class onesAppBuild():
    
    def byInput(self):
        appName = raw_input("your app name:")
        version = raw_input("you app start version (default is 0.1):")
        requirements = raw_input("you app dependences (can be null):")
    
    
if __name__ == "__main__":
    build = onesAppBuild()
    build.byInput()