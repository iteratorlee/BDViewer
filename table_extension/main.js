define([
    'jquery',
    'base/js/namespace',
    'base/js/utils',
    'base/js/events',
    'tree/js/notebooklist',
    'tree/js/sessionlist',
    'services/config'
], function(
    $,
    Jupyter,
    utils,
    events,
    notebooklist,
    sessionlist,
    Configmod
) {
    'use strict';

    $.ajaxSetup({
        async : true
    });

    var base_url = utils.get_body_data('baseUrl');
    var selected = [];

    var config = new Configmod.ConfigSection('tree', {base_url : base_url});
    config.loaded.then(function(){
        add_button();
    });

    function add_button() {
        var dynamic_buttons = $('.dynamic-buttons');
        var button = $('<button title="SmartOpen selected" aria-label="SmartOpen selected" class="smartopen-button btn btn-default btn-xs">Smart Open</button>')
            .css('display', 'none')
        $('.edit-button').after(button);
        $('#notebook_list').delegate('.list_item.row', 'click', csv_selection_changed);
        $('.smartopen-button').click(function() {
            selected.forEach(function(item) {
                var table_path = item.path;
                var table_req_url = utils.url_path_join(base_url, "table_view", table_path);
                window.open(table_req_url, Jupyter._target);
            });
        });
    }

    function csv_selection_changed() {
        selected = [];
        var checked = 0;
        var has_running_notebook = false;
        var has_directory = false;
        var has_file = false;

        $('.list_item :checked').each(function(index, item) {
            var parent = $(item).parent().parent();

            // If the item doesn't have an upload button, isn't the
            // breadcrumbs and isn't the parent folder '..', then it can be selected.
            // Breadcrumbs path == ''.
            if (parent.find('.upload_button').length === 0 && parent.data('path') !== '') {
                checked++;
                selected.push({
                    name: parent.data('name'),
                    path: parent.data('path'),
                    type: parent.data('type')
                });

                // Set flags according to what is selected.  Flags are later
                // used to decide which action buttons are visible.
                //has_running_notebook = has_running_notebook ||
                    //(parent.data('type') === 'notebook' && that.sessions[parent.data('path')] !== undefined);
                has_file = has_file || (parent.data('type') === 'file');
                has_directory = has_directory || (parent.data('type') === 'directory');
            }
        });

        if (selected.length == 1 && !has_running_notebook && selected[0]['name'].indexOf('.csv') > 0) {
            $('.smartopen-button').css('display', 'inline-block');
        } else {
            $('.smartopen-button').css('display', 'none');
        }

		if (checked > 0) {
            $('.dynamic-instructions').hide();
        } else {
            $('.dynamic-instructions').show();
            $('.smartopen-button').css('display', 'none');
        }
    }

    /**
     * Display file size and modified date on notebook tree page
     */
    function add_file_meta(){
        var row = $("div.list_item");
        var item = $("div.col-md-12");
        var cnt = 0;
        item.each(function(){
            $("<span/>")
                .addClass("item_size")
                .addClass("pull-right")
                .width("40")
                .appendTo(this);
        });

        var path = $(".item_name");

        /**
         * Modify file size display
         */
        var filesize = new Array();
        var item_size = $(".item_size");
        
        for(var i = 0; i < path.length; ++i){
            var request_url = utils.url_path_join(base_url, "filesize", path[i].innerHTML);
            $.get(request_url, function(data, status, dataType="text"){
                filesize[i] = data;
            });
        }

        for(var i = 0; i < item_size.length; ++i){
            item_size[i].innerHTML = filesize[i];
        }

        /**
         * Modify file time display
         */
        var filetime = new Array();
        var item_time = $(".item_modified");

        for(var i = 0; i < path.length; ++i){
            var request_url = utils.url_path_join(base_url, "filedate", path[i].innerHTML);
            $.get(request_url, function(data, status, dateType="text"){
                filetime[i] = data;
            });
        }

        for(var i = 0; i < item_time.length; ++i){
            console.log(filetime[i]);
            item_time[i].innerHTML = filetime[i];
        }
    }

    /**
     * When a file is a csv file, bind a table page to its open action.
     */
    function bind_table_page(){
        var links = $(".item_link");
        var names = $(".item_name");

        for(var i = 0; i < links.length; ++i){
            if(names[i].innerHTML.indexOf(".csv") > 0){
                var tmp_arr = links[i].href.split('/');
                //var table_path = utils.url_path_join(base_url, "table_view", names[i].innerHTML);
                var index = -1;
                for(var j = 0; j < tmp_arr.length; ++j){
                    if(tmp_arr[j] == "edit" || tmp_arr[j] == "view"){
                        index = j + 1;
                        break;
                    }
                }
                var table_path = "/";
                for(var j = index; j < tmp_arr.length; ++j){
                    table_path += tmp_arr[j];
                    if(j != tmp_arr.length - 1){
                        table_path += "/";
                    }
                }
                table_path = utils.url_path_join(base_url, "table_view", table_path);
                links[i].setAttribute("href", table_path);
            }
        }
    }

    function load_ipython_extension() {
        config.load();
    }

    return {
        load_ipython_extension: load_ipython_extension
    };
});
