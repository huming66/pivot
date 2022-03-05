var sqlExample = {
    pi: [
        "\n\n====== example sql ======",
        "SELECT time, value FROM [piarchive]..[piavg] WHERE tag = 'EMS:AIES.INST_SYS_LOAD@GEN!AVN' and timestep = '1h' AND time BETWEEN '2021-01-01' AND '2021-01-11'",
        "SELECT time, value FROM [piarchive]..[piinterp2] WHERE tag = 'EMS:AIES.INST_SYS_LOAD@GEN!AVN' and timestep = '1h' AND time BETWEEN '2021-01-01' AND '2021-01-11'",
        "SELECT time, value FROM [piarchive]..[picomp] WHERE tag = 'EMS:AIES.INST_SYS_LOAD@GEN!AVN' AND time BETWEEN '2021-01-01' AND '2021-01-01 1:00'",
        "SELECT tag,changedate,creationdate,exdesc,instrumenttag,engunits,shutdown FROM [pipoint].[classic] WHERE (tag like 'EMS:ASSET.%.MC.INUSE@GEN!AVN') and changedate >= '2020-01-01'"
    ],    
    aurora: [
        "\n\n====== example sql ======",
        "SELECT *  FROM [CA_EMMA201_output_2021LTO_Flex_CT_0830_6hfc_EoYLeapAdj].[dbo].[_Input_Resources1]",
        "SELECT *  FROM [CA_EMMA201_output_2021LTO_Flex_CT_0830_6hfc_EoYLeapAdj].[dbo].[ResourceGroupYear1]",
        "SELECT [Name],[Capability],[Capacity],[Nameplate_Capacity],[Full_Load_Heat_Rate],[Minimum_Capacity],[Output_MWH],[Report_Year],[Report_Month],[Report_Day],[Report_Hour],[Run_ID],[Risk_Iteration],[ID],[Rpt_AssetType],[Rpt_ASN],[Rpt_Inertia] FROM [CA_EMMA201_output_2021LTO_Flex_CT_0830_6hfc_EoYLeapAdj].[dbo].[ResourceHour1] where [Report_Year] = 2021 and [Rpt_AssetType] in ('CC') and [ID] like '%'",
        "EXEC SPA_mhu.dbo.emmo @db = 'CA_EMMA201_output_2021LTO_Flex_CT_0830_6hfc_EoYLeapAdj', @prd='2021_01_01%'"
    ]
}


function getData0(url) {
    return new Promise ((resolve, reject) => {
        $.ajax({
            type: "get",
            url: url,
            success: function (returnval) {
                resolve(returnval)
            },
            error: function(returnval) {
                reject(0)
            }
        })
    })
}

async function queryData(cbFun = null){
    var db = document.getElementById('database').value.toLowerCase() 
    if (db == '...') {
        document.getElementById('sqlText').value = ''
        return
    }
    var sql = document.getElementById('sqlText').value
    var renderers = $.extend(
        $.pivotUtilities.renderers,
        $.pivotUtilities.plotly_renderers,
        $.pivotUtilities.d3_renderers,
        $.pivotUtilities.export_renderers
        );
    if (sql.length <= 10) {
        if (db == "pi") sql = "SELECT time, value FROM [piarchive]..[piavg] WHERE tag = 'EMS:AIES.INST_SYS_LOAD@GEN!AVN' and timestep = '1h' AND time BETWEEN '2021-01-01' AND '2021-01-11'" + sqlExample.pi.join('\n')
        if (db == "aurora") sql = "SELECT *  FROM [CA_EMMA201_output_2021LTO_Flex_CT_0830_6hfc_EoYLeapAdj].[dbo].[ResourceGroupYear1]" + sqlExample.aurora.join('\n')
        document.getElementById('sqlText').value = sql
    } else {
        if (!sql.match(/^(select)|^(exec spa_mhu)/i)) {
            document.getElementById('sqlText').value = "please check you SQL & be nice :)"
            return
        }
    }
    $("#output").html("<p align='center' style='color:grey;'>(...querying...)</p>")
    var url0 = "http://prodhpcts01:8088/sql/?db="+db+"&sql="+sql.split('\n\n===')[0]
    try {        //async & await
        var d = await getData0(url0)
        spa.data = d.data
        $("#output").html("<p align='center' style='color:grey;'>(...data returned...)</p>")
        if (document.getElementById('unpivot_vCol').checked) {
            $("#output").pivotUI(unpivotValue(spa.data), { renderers: renderers }, true);  
        }  else {
            $("#output").pivotUI(spa.data, { renderers: renderers }, true);            
        }
    } catch (err) {
        $("#output").html("<p align='center' style='color:grey;'>(...data error...)</p>")
    }       
}   

function pivotUpdate(div = "#output", data = $.pivotUtilities.tipsData, rendererSize = {}
    , rows = [null], cols = [null], vals = [null], aggregatorName = 'Count',   //Average
    rendererName = "Table") {
    if (data.length==0) return  
    var renderers = $.extend(
        $.pivotUtilities.renderers,
        $.pivotUtilities.plotly_renderers,
        $.pivotUtilities.d3_renderers,
        $.pivotUtilities.export_renderers
        );
    $(div).pivotUI(
        data, {
        renderers: renderers,
        rows: rows,
        cols: cols,
        vals: vals,
        aggregatorName: aggregatorName,
        rendererName: rendererName,
        rendererOptions: rendererSize //{ plotly: {width: 600, height: 600} }
    });
}