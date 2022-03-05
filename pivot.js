
spa = {
    column: { category: ['YEAR', 'MONTH', 'DAY','HOUR','REPORT_YEAR','REPORT_MONTH','REPORT_DAY','REPORT_HOUR','Dispatch_Segment','TIME'] }
}
$(function(){
    var renderers = $.extend(
        $.pivotUtilities.renderers,
        $.pivotUtilities.plotly_renderers,
        $.pivotUtilities.d3_renderers,
        $.pivotUtilities.export_renderers
        );

    var parseAndPivot = function(f) {
        $("#output").html("<p align='center' style='color:grey;'>(processing...)</p>")
        Papa.parse(f, {
            skipEmptyLines: true,
            error: function(e){ alert(e) },
            complete: function(parsed){
                spa.data = parsed.data
                if (document.getElementById('unpivot_vCol').checked) {
                    parsed.data = unpivotValue(parsed.data)
                }  
                $("#output").pivotUI(parsed.data, { renderers: renderers }, true);
            }
        });
    };

    $("#csv").bind("change", function(event){
        parseAndPivot(event.target.files[0]);
    });

    $("#textarea").bind("input change", function(){
        parseAndPivot($("#textarea").val());
    });

    var dragging = function(evt) {
        evt.stopPropagation();
        evt.preventDefault();
        evt.originalEvent.dataTransfer.dropEffect = 'copy';
        $("body").removeClass("whiteborder").addClass("greyborder");
    };

    var endDrag = function(evt) {
        evt.stopPropagation();
        evt.preventDefault();
        evt.originalEvent.dataTransfer.dropEffect = 'copy';
        $("body").removeClass("greyborder").addClass("whiteborder");
    };

    var dropped = function(evt) {
        evt.stopPropagation();
        evt.preventDefault();
        $("body").removeClass("greyborder").addClass("whiteborder");
        parseAndPivot(evt.originalEvent.dataTransfer.files[0]);
    };

    $("html")
        .on("dragover", dragging)
        .on("dragend", endDrag)
        .on("dragexit", endDrag)
        .on("dragleave", endDrag)
        .on("drop", dropped);
// to get csv on DFS 
    var getUrlVars = function () {
        var vars = {};
        var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function (m, key, value) {
            vars[key] = value;
        });
        return vars;
    }
    var path = getUrlVars()["path"];
    if (path == undefined) {
        path = "";
    } else {
        path = path + '/';
        path = path.replace(/%22/g, '')
        path = path.replace(/%27/g, '')
    }
    var csv = getUrlVars()["csv"];    // data csv file
    var sql = getUrlVars()["sql"];    // sql text file
    var parseAndPivot_url = function (url, dataReady = false) {
        $("#output").html("<p align='center' style='color:grey;'>(processing...)</p>")
        if (dataReady) {
            if (document.getElementById('unpivot_vCol').checked) {
                $("#output").pivotUI(unpivotValue(spa.data), { renderers: renderers }, true);  
            }  else {
                $("#output").pivotUI(spa.data, { renderers: renderers }, true);            
            }
        }
        if (url.match(/txt$/i)) {
            d3.text(url,function(error,data)
            {
              if(error)
                return console.error(error);
              console.log(data)
              document.getElementById('sqlText').value = data
            });
        } else if (url.match(/csv$/i)) {
            Papa.parse(url, {
                download: true,
                skipEmptyLines: true,
                error: function (e) { alert(e) },
                complete: function (parsed) {
                    spa.data = parsed.data
                    if (document.getElementById('unpivot_vCol').checked) {
                        $("#output").pivotUI(unpivotValue(spa.data), { renderers: renderers }, true);
                    }  else {
                        $("#output").pivotUI(spa.data, { renderers: renderers }, true);
                    }                
                }
            });
        }

    };
    if (csv) {
        spa.csv_file = 'http://prodhpcts01/pc/csv/' + path + csv;
        parseAndPivot_url(spa.csv_file)
    }
    if (sql) {
        spa.csv_file = 'http://prodhpcts01/pc/csv/' + path + sql;
        parseAndPivot_url(spa.csv_file)
    }    
    $("#unpivot_vCol").change(function() {
        parseAndPivot_url(spa.csv_file, true)
    })
 });             

 function unpivotValue(data) {
    var pureDataColumn = data[0].filter((v,i) => !Number.isNaN(+data[1][i]) && !spa.column.category.map(v=> v.toUpperCase()).includes(v.toUpperCase()))
    var prmtColumn = data[0].filter(v => !pureDataColumn.includes(v))
    var data_unpvt = [[... prmtColumn, 'item', 'value']]
    data.slice(1).forEach(row => {
        var row_ = []
        prmtColumn.forEach(colP => {
            row_.push(row[data[0].indexOf(colP)])
        })
        pureDataColumn.forEach(colD => {
            var _row = [...row_, colD, row[data[0].indexOf(colD)]]
            data_unpvt.push(Object.values(_row))
        })
    })  
    return data_unpvt     
}