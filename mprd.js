function readData(url="http://prodhpcts01:8090/getFile/".replace(":8090",":"+spa.port[1]), type, id, path) {
    return new Promise((resolve, reject) => {
        url = url + type + '?id='+id + '&path='+path
        $.ajax({
            type: "get",
            url: url,
            error: function (returnval) {
                reject(returnval)
            },
            success: function (returnval) {
                resolve(returnval)
            }
        })
    })
}
async function dbMPDR(){                    // get generator list               
    $("#msg").css("background-color","lightgreen")
    $('#msg').html(new Date().toLocaleTimeString() + ' --- waiting asset list of Aurora database [' + db + ']<br>' + $('#msg').html())
    var url0 = "http://prodhpcts01:8090/mpdrdb/"
    try {        //async & await
        var d = await readData(url0)
        mpdrdb= d.mpdrdb
        $('#msg').html(new Date().toLocaleTimeString() + ' --- MPDR DB returned' + '<br>' + $('#msg').html())
    } catch (err) {
        $('#msg').html(new Date().toLocaleTimeString() + '!!! Error !!! for getting MPDR DB: ' + '<br>' + $('#msg').html())
    }
    $("#msg").css("background-color","white")
}

