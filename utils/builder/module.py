#!/usr/bin/python
# -*- coding: utf-8 -*-

import sys, getopt
import os

sys.path.append(os.path.dirname(sys.path[0]))

from lib.utils import get_template, write_by_template, get_current_dir

def usage():
    print '''
usage:
python utils/builder/app.py -n appAlias

-h show this message

-a app alias
-m module name. eg: Product
'''

def build_module(alias, module):
    root_path = os.path.dirname(os.path.dirname(get_current_dir()))
    app_path = root_path + '/server/Application/' + alias[0].upper() + alias[1:]

    #module = module[0].upper() + module[1:]

    need_to_write = ['Controller', 'Event', 'Model', 'Service']

    for ntw in need_to_write:

        print 'Creating %s %s...' % (module, ntw)

        tmp_path = '%s/%s/%s%s.class.php' % (
            app_path, ntw, module, ntw
        )
        content = get_template(root_path, ntw + '_php', alias[0].upper() + alias[1:])
        content = content.replace('*module*', module)

        write_by_template(tmp_path, content)

    print 'Adding to GIT...'

    os.chdir(app_path)
    os.system('git add */*')


    print 'finished'

if __name__ == '__main__':

    opts, args = getopt.getopt(sys.argv[1:], "ha:m:")

    module_name = None
    app_alias = None

    for op, value in opts:
        if op == "-m":
            module_name = value
        elif op == "-a":
            app_alias = value
        elif op == "-h":
            usage()
            sys.exit()

    if not app_alias or not module_name:
        usage()
        sys.exit()

    build_module(app_alias, module_name);
