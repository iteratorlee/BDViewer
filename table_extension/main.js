define([
    'base/js/namespace',
    'base/js/utils',
    'services/config',
    'jqueryui'
], function(
    Jupyter,
    utils,
    configmod,
    $
) {
    'use strict';
    var base_url = utils.get_body_data('baseUrl');

    var config = new Configmod.ConfigSection('tree', {base_url : base_url});
    config.loaded.then(function(){
      add_file_meta();
    });

    function add_file_meta(){
        var row = $("div.list_item");
        var item = $("div.col-md-12");
        item.each(function(){
          $("<span/>")
            .addClass("item_size")
            .addClass("pull-right")
            .width("80")
            .appendTo(this);
        });

        var path = $(".item_link").attr("href");

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
        //config.load();
        var row = $("div.list_item");
        var item = $("div.col-md-12");
        item.each(function(){
          $("<span/>")
            .addClass("item_size")
            .addClass("pull-right")
            .width("80")
            .appendTo(this);
        });

        var path = $(".item_link").attr("href");

        var filesize = new Array();
        for(var i = 0; i < path.length; ++i){
          filesize[i] = $.get(utils.url_path_join(base_url, "filesize", path[i]));
        }

        var item_size = $(".item_size");
        for(var i = 0; i < item_size_array.length; ++i){
          item_size[i].text(filesize[i]);
        }
        /**
        var handler = function () {
            alert('this is an alert from my_extension!');
        };

        var action = {
            icon: 'fa-comment-o', // a font-awesome class used on buttons, etc
            help    : 'Show an alert',
            help_index : 'zz',
            handler : handler
        };
        var prefix = 'my_extension';
        var action_name = 'show-alert';

        var full_action_name = Jupyter.actions.register(action, action_name, prefix); // returns 'my_extension:show-alert'
        Jupyter.toolbar.add_buttons_group([full_action_name]);
        */
    }

    return {
        load_ipython_extension: load_ipython_extension
    };
});
