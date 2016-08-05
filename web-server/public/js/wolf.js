var pomelo = window.pomelo;
var username;
var users;
var rid;
var base = 1000;
var increase = 25;
var reg = /^[a-zA-Z0-9_\u4e00-\u9fa5]+$/;
var LOGIN_ERROR = "There is no server to log in, please wait.";
var LENGTH_ERROR = "Name/Channel is too long or too short. 20 character max.";
var NAME_ERROR = "Bad character in Name/Channel. Can only have letters, numbers, Chinese characters, and '_'";
var DUPLICATE_ERROR = "Please change your name to login.";

// query connector
function queryEntry(uid, callback) {
    var route = 'gate.gateHandler.queryEntry';
    pomelo.init({
        host: window.location.hostname,
        port: 3014,
        log: true
    }, function() {
        pomelo.request(route, {
            uid: uid
        }, function(data) {
            pomelo.disconnect();
            if (data.code === 500) {
                showError(LOGIN_ERROR);
                return;
            }
            console.log(data)
            callback(data.host, data.port);
        });
    });
};




//加载
$(document).ready(function() {
    //when first time into chat room.
    $("#login-layer").show()

    // //wait message from the server.
    // pomelo.on('onChat', function(data) {
    //  addMessage(data.from, data.target, data.msg);
    //  $("#chatHistory").show();
    //  if(data.from !== username)
    //      tip('message', data.from);
    // });

    //update user list
    pomelo.on('onAdd', function(data) {
        var user = data.user;
        tip('online', user);
        addUser(user);
    });

    //update user list
    pomelo.on('onLeave', function(data) {
        var user = data.user;
        tip('offline', user);
        removeUser(user);
    });


    //handle disconect message, occours when the client is disconnect with servers
    pomelo.on('disconnect', function(reason) {
        // showLogin();
        console.log("disconnect")
    });

    //deal with login button click.
    $("#login-layer>div>button").click(function() {
        username = $("#login-username").val();
        rid = $('#login-room').val();

        // if (username.length > 20 || username.length == 0 || rid.length > 20 || rid.length == 0) {
        //     showError(LENGTH_ERROR);
        //     return false;
        // }

        // if (!reg.test(username) || !reg.test(rid)) {
        //     showError(NAME_ERROR);
        //     return false;
        // }

        //query entry of connection
        queryEntry(username, function(host, port) {
            pomelo.init({
                host: host,
                port: port,
                log: true
            }, function() {
                var route = "connector.entryHandler.enter";
                pomelo.request(route, {
                    username: username,
                    rid: rid
                }, function(data) {
                    if (data.error) {
                        showError(DUPLICATE_ERROR);
                        return;
                    }
                    console.log(data)
                        // setName();
                        // setRoom();
                        // showChat();
                        // initUserList(data);
                });
            });
        });
    });

    // //deal with chat mode.
    // $("#entry").keypress(function(e) {
    //     var route = "chat.chatHandler.send";
    //     var target = $("#usersList").val();
    //     if (e.keyCode != 13 /* Return */ ) return;
    //     var msg = $("#entry").attr("value").replace("\n", "");
    //     if (!util.isBlank(msg)) {
    //         pomelo.request(route, {
    //             rid: rid,
    //             content: msg,
    //             from: username,
    //             target: target
    //         }, function(data) {
    //             $("#entry").attr("value", ""); // clear the entry field.
    //             if (target != '*' && target != username) {
    //                 addMessage(username, target, msg);
    //                 $("#chatHistory").show();
    //             }
    //         });
    //     }
    // });
});
