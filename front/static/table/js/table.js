require([
    "handsontable.full"
], function(handson){
    var data = [
        ["", "Rose", "Paker", "Duncan", "Jordan"],
        ["2017", 18.0, 15,5, 0, 0],
        ["2011", 25.5, 18.2, 13.6, 0],
        ["1996", 0, 0, 0, 31.1]
    ];
    var container = document.getElementById("table_content");
    var table = new Handsontable(container, {
        data: data,
        rowHeaders: true,
        colHeaders: true,
        dropdownMenu: true
    });
});
