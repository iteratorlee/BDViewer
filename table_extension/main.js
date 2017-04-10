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
    var base_url = utils.get_body_data('baseUrl');

    var config = new Configmod.ConfigSection('tree', {base_url : base_url});
    config.loaded.then(function(){
      add_file_meta();
    });

    function add_file_meta(){
        alert("hahahahsb");
        var row = $("div.list_item");
        var item = $("div.col-md-12");
        item.each(function(){
          $("<span/>")
            .addClass("item_size")
            .addClass("pull-right")
            .width("80")
            .appendTo(this);
        });
        //alert(item.length);

        var path = $(".item_link").attr("href");
        //alert(path.length);

        var filesize = new Array();
        for(var i = 0; i < path.length; ++i){
          filesize[i] = $.get(utils.url_path_join(base_url, "filesize", path[i]));
        }

        var item_size = $(".item_size");
        for(var i = 0; i < item_size_array.length; ++i){
          item_size[i].text(filesize[i]);
        }
    }

    function load_ipython_extension() {
        alert("sbsbsbsbsbsbsbsb");
        events.on("notebook_loaded.Notebook", add_file_meta);
        events.on("app_initialized.DashboardApp", add_file_meta);
        //config.load();
	add_file_meta();
    }

    return {
        load_ipython_extension: load_ipython_extension
    };
});
