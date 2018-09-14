from notebook.utils import url_path_join
from notebook.base.handlers import IPythonHandler
import tornado.escape
import os
import time
import jextension.log as log
import jextension.utils as utils
from jextension.utils import formatSize

logger = log.getLogger(app_name='jextension', filename='/var/log/BDViewer/jextension.log', level=log.DEBUG)

class FileSizeHandler(IPythonHandler):
    def get(self, _filepath):
        file_path = _filepath
        logger.debug('filepath: %s' % _filepath)
        if not os.path.exists(file_path):
            self.write("File does not exist")
            return
        size = os.path.getsize(file_path)
        format_size = formatSize(size)
        self.write(format_size)

class FileDateHandler(IPythonHandler):
    def get(self, _filepath):
        file_path = _filepath
        logger.debug('filepath: %s' % _filepath)
        if not os.path.exists(file_path):
            self.write("File does not exist")
            return
        statinfo = os.stat(file_path)
        st_mtime = statinfo.st_mtime
        format_date = time.strftime("%Y-%m-%d %H:%M %p", time.localtime(st_mtime))
        self.write(format_date)

class ViewTableHandler(IPythonHandler):
    def get(self, _filepath):
        file_path = _filepath
        logger.debug('filepath: %s' % _filepath)
        if not os.path.exists(file_path):
            self.write("File %s does not exist" % file_path)
            return
        self.write(self.render_template('table.html'))

class FileContentHandler(IPythonHandler):
    def get(self, _filepath):
        arr = _filepath.split('/')
        beg, end = int(arr[-2]), int(arr[-1])
        _filepath = '/'.join(arr[:-2])
        logger.debug('filepath: %s' % _filepath)
        beg = int(beg)
        end = int(end)
        if not os.path.exists(_filepath):
            self.write("File does not exist")
            return
        lines = utils.get_lines_skip_rows(_filepath, beg, end)
        self.write(lines)

class FileLineNumberHandler(IPythonHandler):
    def get(self, _filepath):
        _filepath = str(_filepath)
        logger.debug('filepath: %s' % _filepath)
        if not os.path.exists(_filepath):
            self.write("File does not exist")
            return
        line_num = str(utils.get_line_num(_filepath))
        print("file %s with %s lines" % (_filepath, line_num))
        self.write(line_num)

def _jupyter_server_extension_paths():
    return [{
        "module": "jextension.jextension"
    }]

def load_jupyter_server_extension(nb_server_app):
    """
    Called when the extension is loaded.

    Args:
        nb_server_app (NotebookWebApplication): handle to the Notebook webserver instance.
    """
    web_app = nb_server_app.web_app
    host_pattern = '.*$'

    #route patterns
    file_size_pattern = url_path_join(web_app.settings['base_url'], '/filesize/(.+$)')
    file_date_pattern = url_path_join(web_app.settings['base_url'], '/filedate/(.+$)')
    view_table_pattern = url_path_join(web_app.settings['base_url'], '/table_view/(.+$)')
    file_content_pattern = url_path_join(web_app.settings['base_url'], '/file_content/(.+$)')
    line_number_pattern = url_path_join(web_app.settings['base_url'], '/line_num/(.+$)')
    web_app.add_handlers(host_pattern, [
                (file_size_pattern, FileSizeHandler),
                (file_date_pattern, FileDateHandler),
                (view_table_pattern, ViewTableHandler),
                (file_content_pattern, FileContentHandler),
                (line_number_pattern, FileLineNumberHandler)
    ])
