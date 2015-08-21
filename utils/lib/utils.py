import sys, os

def get_template(root_path, file, alias):
    template = open(root_path+'/utils/template/' + file, 'r')
    tpl_content = template.read()
    template.close()

    tpl_content = tpl_content.replace('*alias*', alias)
    return tpl_content

def write_by_template(file_path, content):
    the_file = open(file_path, 'w')
    the_file.write(content)
    the_file.close()

def get_current_dir():
    path = sys.path[0]
    if os.path.isdir(path):
        return path
    elif os.path.isfile(path):
        return os.path.dirname(path)