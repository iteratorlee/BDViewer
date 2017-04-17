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
    
    var req_url = get_base_url(curr_url) + "file_content/" + filename + "/0/1000";
    $.get(req_url, function(data, status, datatype="text"){
        var container = document.getElementById("table_content");
        var temp_arr = data.split('\n');
        var table_data = new Array();
        
        for(var i = 0; i < temp_arr.length; ++i){
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
        
        var editor = function(){
            this.table = table;
            this.loadlines = 1000;
            this.tabledata = data;
        }


        Handsontable.hooks.add('afterScrollVertically', function(){
            //auto loading need to be added
        }, table);
    });
});
