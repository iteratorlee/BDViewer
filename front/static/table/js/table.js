require([
    "jquery",
    "handsontable.full"
], function($, handson){
    
    var get_base_url = function(url){
        var temp_array = url.split('/');
        var len = temp_array.length;
        var ret = "/";
        for(var i = 3; i < len - 2; ++i){
            ret = ret + temp_array[i];
            ret = ret + '/';
        }
        return ret;
    };

    var curr_url = document.URL;
    var curr_url_arr = curr_url.split('/')
    var filename = curr_url_arr[curr_url_arr.length-1];

    console.log(filename);
    
    var req_url = get_base_url(curr_url) + "file_content/" + filename + "/1/1000";
    $.get(req_url, function(data, status, datatype="text"){
        var container = document.getElementById("table_content");
        var temp_arr = data.split('\n');
        var table_data = new Array();
        
        for(var i = 0; i < temp_arr.length; ++i){
            if(temp_arr[i] != "")
                table_data[i] = temp_arr[i].split(',');
        }

        var table = new Handsontable(container, {
            data: table_data,
            rowHeaders: true,
            colHeaders: true,
            dropdownMenu: true,
            width: $(document).width(),
            height: $(document).height()
        });
        
        var editor = new Object();
        editor.table = table;
        editor.loadlines = 1000;
        editor.tabledata = table_data;


        Handsontable.hooks.add('afterScrollVertically', function(){
            //auto loading need to be added
            var x = editor.table.rowOffset();
            console.log(x);
            if(x > editor.loadlines - 100){
                editor.loadlines += 100;
                var _curr_url = document.URL;
                var _curr_url_arr = _curr_url.split('/');
                var _filename = _curr_url_arr[_curr_url_arr.length-1];
                
                var dreq_url = get_base_url(document.URL) + "file_content/" + _filename + "/" + (editor.loadlines-100) + "/" + editor.loadlines;
                
                $.get(dreq_url, function(_data, _status, datatype="text"){
                    var _temp_arr = _data.split('\n');
                    var _table_data = new Array();

                    for(var i = 0; i < _temp_arr.length; ++i){
                        if(_temp_arr[i] != "")
                            _table_data[i] = _temp_arr[i].split(',');
                    }
                    
                    _table_data = editor.tabledata.concat(_table_data);
                    editor.table.loadData(_table_data);
                    editor.tabledata = _table_data;
                    editor.table.save_enabled = true;
                });
            }
        }, table);
    });
});
