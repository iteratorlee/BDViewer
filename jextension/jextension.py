from notebook.utils import url_path_join
from notebook.base.handlers import IPythonHandler
import os
import time

def formatSize(bytes):
    try:
        bytes = float(bytes)
        kb = bytes / 1024
    except:
        print("Bad format")
        return "Error"

    if kb >= 1024:
        M = kb / 1024
        if M >= 1024:
            G = M / 1024
            return "%fG" % (G)
        else:
            return "%fM" % (M)
    else:
        return "%fkb" % (kb)

class HelloWorldHandler(IPythonHandler):
    def get(self):
        self.finish('Hello, world!')

class FileSizeHandler(IPythonHandler):
    def get(self, input):
        file_path = input
        size = os.path.getsize(file_path)
        format_size = formatSize(size)
        self.write(format_size)

class FileDateHandler(IPythonHandler):
    def get(self, input):
        file_path = input
        statinfo = os.stat(file_path)
        st_mtime = statinfo.st_mtime
        format_date = time.localtime(st_mtime)
        self.write(format_date)

def load_jupyter_server_extension(nb_server_app):
    """
    Called when the extension is loaded.

    Args:
        nb_server_app (NotebookWebApplication): handle to the Notebook webserver instance.
    """
    web_app = nb_server_app.web_app
    host_pattern = '.*$'
    route_pattern = url_path_join(web_app.settings['base_url'], '/hello')
    file_size_pattern = url_path_join(web_app.settings['base_url'], '/filesize/%s')
    file_date_pattern = url_path_join(web_app.settings['base_url'], '/filedate/%s')
    web_app.add_handlers(host_pattern, [
                (route_pattern, HelloWorldHandler),
                (file_size_pattern, FileSizeHandler),
                (file_date_pattern, FileDateHandler)
                ])
