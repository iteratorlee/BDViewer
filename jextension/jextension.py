from notebook.utils import url_path_join
from notebook.base.handlers import IPythonHandler
import tornado.escape
import os
import time
import jextension.utils as utils
from jextension.utils import formatSize

class FileSizeHandler(IPythonHandler):
    def get(self, _filepath):
        file_path = _filepath
        if not os.path.exists(file_path):
            self.write("File does not exist")
            return
        size = os.path.getsize(file_path)
        format_size = formatSize(size)
        self.write(format_size)

class FileDateHandler(IPythonHandler):
    def get(self, _filepath):
        file_path = _filepath
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
        if not os.path.exists(file_path):
            self.write("File does not exist")
            return
        self.write(self.render_template('table/table.html'))

class FileContentHandler(IPythonHandler):
    def get(self, _filepath, beg, end):
        beg = int(beg)
        end = int(end)
        if not os.path.exists(_filepath):
            self.write("File does not exist")
            return
        lines = utils.get_lines_skip_rows(_filepath, beg, end)
        self.write(lines)

class DrawChatHandler(IPythonHandler):
    def get(self, _filepath, chat_type, r1, c1, r2, c2):
        if not os.path.exists(_filepath):
            self.write("File does not exist")
            return
        r1 = int(r1)
        c1 = int(c1)
        r2 = int(r2)
        c2 = int(c2)

        if int(chat_type) == 0:
            #draw a line chat
            utils.draw_line_chat(_filepath, r1, c1, r2, c2)
        elif int(chat_type) == 1:
            #draw a bar chat
            utils.draw_bar_chat(_filepath, r1, c1, r2, c2)
        elif int(chat_type) == 2:
            #draw a pie chat
            utils.draw_pie_chat(_filepath, r1, c1, r2, c2)
        else:
            self.write("No such kind of chat")

class SortContentHandler(IPythonHandler):
    def get(self, _filepath, col):
        if not os.path.exists(_filepath):
            self.write("File does not exist")
            return
        col = int(col)
        
        lines = utils.get_lines_after_sort(_filepath, col)
        self.write(lines)

class DataFeatureHandler(IPythonHandler):
    def get(self, _filepath, feature, dim, index):
        if not os.path.exists(_filepath):
            self.write("File does not exist")
            return
        feature = int(feature)
        dim = int(dim)
        index = int(index)

        ret = str(utils.get_data_feature(_filepath, feature, dim, index))
        print(ret)
        self.write(ret)

class FileLineNumberHandler(IPythonHandler):
    def get(self, _filepath):
        _filepath = str(_filepath)
        if not os.path.exists(_filepath):
            self.write("File does not exist")
            return
        line_num = str(utils.get_line_num(_filepath))
        print("file %s with %s lines" % (_filepath, line_num))
        self.write(line_num)

class FileFeatureHandler(IPythonHandler):
    def get(self, _filepath, col):
        _filepath = str(_filepath)
        col = int(col)
        if not os.path.exists(_filepath):
            self.write("File does not exist")
            return
        ret = utils.cal_freq(_filepath, col)
        print("file %s request for global feature of column %s" % (_filepath, str(col)))
        ret_json = tornado.escape.json_encode(ret)
        self.write(ret_json)

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
    file_content_pattern = url_path_join(web_app.settings['base_url'], '/file_content/([^/]+)/(-?[0-9]+)/(-?[0-9]+$)')
    draw_chat_pattern = url_path_join(web_app.settings['base_url'], '/draw_chat/([^/]+)/([0-2])/([0-9]+)/([0-9]+)/([0-9]+)/([0-9]+$)')
    sort_content_pattern = url_path_join(web_app.settings['base_url'], '/sort_content/([^/]+)/([0-9]+$)')
    data_feature_pattern = url_path_join(web_app.settings['base_url'], '/data_feature/([^/]+)/([0-9])/([0-1])/([0-9]+$)')
    line_number_pattern = url_path_join(web_app.settings['base_url'], '/line_num/(.+$)')
    file_feature_pattern = url_path_join(web_app.settings['base_url'], '/file_feature/([^/]+)/([0-9]+$)')
    web_app.add_handlers(host_pattern, [
                (file_size_pattern, FileSizeHandler),
                (file_date_pattern, FileDateHandler),
                (view_table_pattern, ViewTableHandler),
                (file_content_pattern, FileContentHandler),
                (draw_chat_pattern, DrawChatHandler),
                (sort_content_pattern, SortContentHandler),
                (data_feature_pattern, DataFeatureHandler),
                (line_number_pattern, FileLineNumberHandler),
                (file_feature_pattern, FileFeatureHandler)
    ])
