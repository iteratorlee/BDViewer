require([
    "jquery",
    "handsontable.full",
    "bootstrap.min",
    "heatmap",
    "echarts.min"
], function($, handson, bs, hm, echarts){
    
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

    var req_url = curr_url.replace(/(.*)table_view/, '$1file_content') + "/0/999";
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
            rowHeaders: function(index){
                return index + parseInt($("#line_beg").val());
            },
            colHeaders: true,
            dropdownMenu: true,
            width: $(document).width(),
            height: $(document).height(),
            afterSelection: function(r, c, r2, c2, preventScrolling){
                $("#r1").val("" + r);
                $("#c1").val("" + c);
                $("#r2").val("" + r2);
                $("#c2").val("" + c2);
                //preventScrolling.value = true;
            }
        });

        //get line number
        var _tmp_url = document.URL;
        var _tmp_url_arr = _tmp_url.split('/')
        var _tmp_name = _tmp_url_arr[_tmp_url_arr.length-1];
        var lnreq_url = _tmp_url.replace(/(.*)table_view/, '$1line_num');
        console.log(lnreq_url);
        $.get(lnreq_url, function(_data, _status, datatype="text"){
            //display line_num on the page
            console.log(_data);
            document.getElementById("line_num").innerHTML = _data + " lines totally";
        });
        
        var editor = new Object();
        editor.table = table;
        editor.loadlines = 1000;
        editor.tabledata = table_data;


        Handsontable.hooks.add('afterScrollVertically', function(){
            if(parseInt($("#line_beg").val()) >= 0){
                var x = editor.table.rowOffset();
                console.log(x);
                if(x > editor.loadlines - 100){
                    editor.loadlines += 100;
                    var _curr_url = document.URL;
                    var _curr_url_arr = _curr_url.split('/');
                    var _filename = _curr_url_arr[_curr_url_arr.length-1];
                
                    var line_beg = parseInt($("#line_beg").val());
                    var dreq_url = curr_url.replace(/(.*)table_view/, '$1file_content') + "/" + (editor.loadlines+line_beg-99) + "/" + (editor.loadlines+line_beg);

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
            }
        }, table);

        $("#confirm_skip").click(function(){
            console.log("confirm entered");
            var starts = parseInt($("#line_beg").val());
            var ends = starts + 999;
            editor.loadlines = ends - starts + 1;
            if(starts < 0){
                starts = -1;
                ends = -1;
                $("#line_beg").val("-999");
            }
            var _curr_url = document.URL;
            var _curr_url_arr = _curr_url.split('/')
            var _filename = _curr_url_arr[_curr_url_arr.length-1];

            var dreq_url = _curr_url.replace(/(.*)table_view/, '$1file_content') + "/" + starts + "/" + ends;

            $.get(dreq_url, function(_data, _status, datatype="text"){
                console.log(_data);
                var _temp_arr = _data.split('\n');
                var _table_data = new Array();

                for(var i = 0; i < _temp_arr.length; ++i){
                    if(_temp_arr[i] != "")
                        _table_data[i] = _temp_arr[i].split(',');
                }

                editor.table.loadData(_table_data);
                editor.tabledata = _table_data;
                editor.table.save_enabled = true;
            });

            $("#myModal").modal('hide');
        });
        
        $(".chat_sort").click(function(){
            console.log("sort entered");
            var r1 = parseInt($("#r1").val());
            var c1 = parseInt($("#c1").val());
            var r2 = parseInt($("#r2").val());
            var c2 = parseInt($("#c2").val());
            var _curr_url = document.URL;
            var _curr_url_arr = _curr_url.split('/')
            var _filename = _curr_url_arr[_curr_url_arr.length-1];

            if((c1 == c2) && (Math.abs(r1-r2) == 1000)){
                //send a post request to server(sort by col)
                //get the largest 1000 line
                //alert("Section you selected: " + r1 + " " + c1 + " " + r2 + " " + c2);
                var sreq_url = get_base_url(document.URL) + "sort_content/" + _filename + "/" + c1;
                $.get(sreq_url, function(_data, _status, datatype="text"){
                    var _temp_arr = _data.split('\n');

                    var _table_data = editor.tabledata;
                    for(var i = 0; i < _temp_arr.length; ++i){
                        if(_temp_arr[i] != "")
                            _table_data[i][c1] = _temp_arr[i];
                    }
                    editor.table.loadData(_table_data);
                    editor.tabledata = _table_data;
                    editor.table.save_enable = true;
                    editor.loadlines = 1000;
                    $("#line_beg").val("0");

                });
            }else
                alert("not a single column");
        });

        $(".chat_sum").click(function(){
            console.log("sum entered");
            var r1 = parseInt($("#r1").val());
            var c1 = parseInt($("#c1").val());
            var r2 = parseInt($("#r2").val());
            var c2 = parseInt($("#c2").val());
            var featured = parseInt($("#featured").val());
            var _curr_url = document.URL;
            var _curr_url_arr = _curr_url.split('/')
            var _filename = _curr_url_arr[_curr_url_arr.length-1];
            // /data_feature/filename/feature/dim/index
            var sum_req_url = get_base_url(document.URL) + "data_feature/" + _filename + "/0";

            if(c1 > -1 && c2 > -1 && r1 > -1 && r2 > -1){
                if(c1 == c2 || r1 == r2){
                    if(c1 == c2){
                        //dim = 0, feature = 0
                        if(featured % 2 != 0) {
                            featured *= 2;
                            $("#featured").val(featured + "");
                            sum_req_url += ("/0/" + c1);
                            $.get(sum_req_url, function(_data, _status, datatype="text"){
                                _table_data = editor.tabledata;
                                var last_line = []
                                for(var i = 0; i < _table_data[0].length; ++i){
                                    if(i == c1)
                                        last_line[i] = _data;
                                    else
                                        last_line[i] = " ";
                                }
                                console.log(last_line);

                                _table_data = [last_line].concat(_table_data);
                                editor.tabledata = _table_data;
                                editor.table.loadData(_table_data);
                                console.log(_table_data);
                            });
                        }else{
                            sum_req_url += ("/0/" + c1);
                            $.get(sum_req_url, function(_data, _status, datatype="text"){
                                _table_data = editor.tabledata;
                                _table_data[0][c1] = _data;
                                editor.tabledata = _table_data;
                                editor.table.loadData(_table_data);
                            });
                        }
                    }else if(r1 == r2){
                        //dim = 1, feature = 0
                        if(featured % 3 != 0) {
                            featured *= 3;
                            $("#featured").val(featured + "");
                            sum_req_url += ("/1/" + r1);
                            $.get(sum_req_url, function(_data, _status, datatype="text"){
                                _table_data = editor.tabledata;
                                for(var i = 0; i < _table_data.length; ++i){
                                    tmp_arr = _table_data[i];
                                    if(i == r1)
                                        tmp_arr = tmp_arr.concat(_data);
                                    else 
                                        tmp_arr = tmp_arr.concat(" ");
                                    _table_data[i] = tmp_arr;
                                }
                                editor.tabledata = _table_data;
                                editor.table.loadData(_table_data);
                                console.log(_table_data);
                            });
                        }else{
                            sum_req_url += ("/1/" + r1);
                            $.get(sum_req_url, function(_data, _status, datatype="text"){
                                _table_data = editor.tabledata;
                                _table_data[r1][_table_data[r1].length-1] = _data;
                                editor.tabledata = _table_data;
                                editor.table.loadData(_table_data);
                            });
                        }
                    }
                }
            }else
                alert("not a single column or a single row " + r1 + " " + c1 + " " + r2 + " " + c2);
        });

        $(".chat_ave").click(function(){
            console.log("ave entered");
            var r1 = parseInt($("#r1").val());
            var c1 = parseInt($("#c1").val());
            var r2 = parseInt($("#r2").val());
            var c2 = parseInt($("#c2").val());
            var featured = parseInt($("#featured").val());
            var _curr_url = document.URL;
            var _curr_url_arr = _curr_url.split('/')
            var _filename = _curr_url_arr[_curr_url_arr.length-1];
            // /data_feature/filename/feature/dim/index
            var ave_req_url = get_base_url(document.URL) + "data_feature/" + _filename + "/1";

            if(c1 > -1 && c2 > -1 && r1 > -1 && r2 > -1){
                if(c1 == c2 || r1 == r2){
                    if(c1 == c2){
                        //dim = 0, feature = 0
                        if(featured % 2 != 0) {
                            featured *= 2;
                            $("#featured").val(featured + "");
                            ave_req_url += ("/0/" + c1);
                            $.get(ave_req_url, function(_data, _status, datatype="text"){
                                _table_data = editor.tabledata;
                                var last_line = []
                                for(var i = 0; i < _table_data[0].length; ++i){
                                    if(i == c1)
                                        last_line[i] = _data;
                                    else
                                        last_line[i] = " ";
                                }
                                console.log(last_line);

                                _table_data = [last_line].concat(_table_data);
                                editor.tabledata = _table_data;
                                editor.table.loadData(_table_data);
                                console.log(_table_data);
                            });
                        }else{
                            ave_req_url += ("/0/" + c1);
                            $.get(ave_req_url, function(_data, _status, datatype="text"){
                                _table_data = editor.tabledata;
                                _table_data[0][c1] = _data;
                                editor.tabledata = _table_data;
                                editor.table.loadData(_table_data);
                            });
                        }
                    }else if(r1 == r2){
                        //dim = 1, feature = 0
                        if(featured % 3 != 0) {
                            featured *= 3;
                            $("#featured").val(featured + "");
                            ave_req_url += ("/1/" + r1);
                            $.get(ave_req_url, function(_data, _status, datatype="text"){
                                _table_data = editor.tabledata;
                                for(var i = 0; i < _table_data.length; ++i){
                                    tmp_arr = _table_data[i];
                                    if(i == r1)
                                        tmp_arr = tmp_arr.concat(_data);
                                    else 
                                        tmp_arr = tmp_arr.concat(" ");
                                    _table_data[i] = tmp_arr;
                                }
                                editor.tabledata = _table_data;
                                editor.table.loadData(_table_data);
                                console.log(_table_data);
                            });
                        }else{
                            ave_req_url += ("/1/" + r1);
                            $.get(ave_req_url, function(_data, _status, datatype="text"){
                                _table_data = editor.tabledata;
                                _table_data[r1][_table_data[r1].length-1] = _data;
                                editor.tabledata = _table_data;
                                editor.table.loadData(_table_data);
                            });
                        }
                    }
                }
            }else
                alert("not a single column or a single row " + r1 + " " + c1 + " " + r2 + " " + c2);
        });

        $(".chat_line").click(function(){
            console.log("line chat entered");
            var r1 = parseInt($("#r1").val());
            var c1 = parseInt($("#c1").val());
            var r2 = parseInt($("#r2").val());
            var c2 = parseInt($("#c2").val());
            alert('developping');

            if(c1 > -1 && c2 > -1 && r1 > -1 && r2 > -1 && ((c1 == c2) || (r1 == r2))){
                var lineChat = echarts.init(document.getElementById('Chart_body'));
                var option = {
                };

            }else
                alert("not a single column or a single row " + r1 + " " + c1 + " " + r2 + " " + c2);
        });

        $(".chat_bar").click(function(){
            console.log("bar chat entered");
        });

        $(".chat_pie").click(function(){
            console.log("pie chat entered");
        });

        $(".chat_feature").click(function(){
            var r1 = parseInt($("#r1").val());
            var c1 = parseInt($("#c1").val());
            var r2 = parseInt($("#r2").val());
            var c2 = parseInt($("#c2").val());
            var _curr_url = document.URL;
            var _curr_url_arr = _curr_url.split('/')
            var _filename = _curr_url_arr[_curr_url_arr.length-1];

            if((c1 == c2) && (Math.abs(r1-r2) == 1000)){
                var freq_url = get_base_url(document.URL) + "file_feature/" + _filename + "/" + c1; 
                $.get(freq_url, function(_data, _status, datatype="json"){
                    //draw heatmap
                    var json_data = eval('(' + _data + ')');
                    var freq_arr = [];
                    for(var i = 0; i < 100; ++i){
                        var temp_key = i + "";
                        var temp_val = json_data[temp_key];
                        if(temp_val == undefined) temp_val = 0;
                        else temp_val = parseInt(temp_val);
                        freq_arr[i] = temp_val;
                    }

                    var heatmapInstance = hm.create({
                        container : document.querySelector("#heatmap_body"),
                    });

                    var points = []
                    var max_val = 0;
                    var width = 600;
                    var height = 100;
                    var len = 100;
                    
                    for(var i = 0; i < len; ++i){
                        var val = freq_arr[i];
                        max_val = Math.max(val, max_val);
                        var point = {
                            x : i*6,
                            y : 50,
                            value : val
                        };
                        points.push(point);
                    }
                    
                    var data = {
                        max : max_val,
                        data : points
                    };
                    heatmapInstance.setData(data);
                });
            }else
                alert("Please select a whole column by clicking its top");
        });
    });
})
