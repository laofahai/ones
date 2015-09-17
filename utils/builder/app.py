#!/usr/bin/python
# -*- coding: utf-8 -*-

import sys, getopt
import os

sys.path.append(os.path.dirname(sys.path[0]))

from lib.utils import get_template, write_by_template, get_current_dir

def build_app_path(alias, root_path, author='', link='', requirements=''):

    # make backend dirs
    server_path = root_path + '/server/Application/' + alias[0].upper() + alias[1:]

    print 'Making backend application directory: ' + server_path
    try:
        os.mkdir(server_path)
    except OSError:
        print 'Server Application Path Exists'

    backend_dirs = [
        'Controller',
        'Event',
        'Locale',
        'Schema',
        'Service',
        'Model'
    ]
    for dir in backend_dirs:
        tmp_dir = server_path + '/' + dir + '/'
        print 'Making backend sub directory: ' + tmp_dir
        try:
            os.mkdir(tmp_dir)
        except OSError:
            print 'Target exists'

    # config.yml
    config_yml_content = get_template(root_path, 'config.yml', alias)
    config_yml_content = config_yml_content.replace('*author*', author)
    config_yml_content = config_yml_content.replace('*link*', link)
    config_yml_content = config_yml_content.replace('*requirements*', requirements)

    print 'Writing config.yml'
    write_by_template(server_path + '/config.yml', config_yml_content)

    # front-end
    front_path = root_path + '/ones/apps/' + alias
    print 'Making front-end directory: ' + front_path
    try:
        os.mkdir(front_path)
    except OSError:
        print 'Front-end Path Exists'

    print 'Making front-end scripts ...'

    main_script = get_template(root_path, 'main.js', alias)
    model_script = get_template(root_path, 'model.js', alias)

    write_by_template(front_path + '/main.js', main_script)
    write_by_template(front_path + '/model.js', model_script)

    print 'Adding to GIT...'

    os.chdir(server_path)
    os.system('git add *')

    os.chdir(front_path)
    os.system('git add *')

    print 'finished'



def usage():
    print '''
usage:
python utils/builder/app.py -n appAlias

-h show this message

-n app alias
-a app author
-l app link
-r app requirements
'''

if __name__ == '__main__':

    opts, args = getopt.getopt(sys.argv[1:], "hn:a:l:r:")

    app_alias = None
    author = ''
    link = ''
    requirements = ''

    for op, value in opts:
        if op == "-n":
            app_alias = value
        elif op == "-a":
            author = value
        elif op == "-l":
            link = value
        elif op == "-r":
            requirements = value
        elif op == "-h":
            usage()
            sys.exit()

    if not app_alias:
        usage()
        sys.exit()

    root_path = os.path.dirname(os.path.dirname(get_current_dir()))
    build_app_path(app_alias, root_path, author, link, requirements);
