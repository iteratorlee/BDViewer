define([
    'base/js/namespace',
    'base/js/utils',
    'base/js/events',
    'services/config',
    'jqueryui'
], function(
    Jupyter,
    utils,
    events,
    Configmod,
    $
) {
    'use strict';
	
	$.ajaxSetup({  
    	async : false
	});  	

    var base_url = utils.get_body_data('baseUrl');

    var config = new Configmod.ConfigSection('tree', {base_url : base_url});
    config.loaded.then(function(){
    	add_file_meta();
    });

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
		alert(item_time.length);

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

    function load_ipython_extension() {
        config.load();
    }

    return {
        load_ipython_extension: load_ipython_extension
    };
});
