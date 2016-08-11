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

util = {
    urlRE: /https?:\/\/([-\w\.]+)+(:\d+)?(\/([^\s]*(\?\S+)?)?)?/g,
    //  html sanitizer
    toStaticHTML: function(inputHtml) {
        inputHtml = inputHtml.toString();
        return inputHtml.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    },
    //pads n with zeros on the left,
    //digits is minimum length of output
    //zeroPad(3, 5); returns "005"
    //zeroPad(2, 500); returns "500"
    zeroPad: function(digits, n) {
        n = n.toString();
        while (n.length < digits)
            n = '0' + n;
        return n;
    },
    //it is almost 8 o'clock PM here
    //timeString(new Date); returns "19:49"
    timeString: function(date) {
        var minutes = date.getMinutes().toString();
        var hours = date.getHours().toString();
        return this.zeroPad(2, hours) + ":" + this.zeroPad(2, minutes);
    },

    //does the argument only contain whitespace?
    isBlank: function(text) {
        var blank = /^\s*$/;
        return (text.match(blank) !== null);
    }
};

// add user in user list
function addPlayer(player) {
    var slElement = $(document.createElement("option"));
    slElement.attr("value", player);
    slElement.text(player);
    $("#usersList").append(slElement);
};


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
            callback(data.host, data.port);
        });
    });
};
//
function playerSit(player, position, leave) {
    var p_box = "p" + position;
    var leave_box = "p" + leave;
    $("#" + p_box).find(".player-number").text(p_box + ":" + player);
    $("#" + p_box).removeClass("player-empty");
    $("#" + p_box).addClass("player-ready");
    $("#" + p_box).addClass("player-ready-false");
    $("#" + p_box + ">a").remove();
    $("#" + p_box).off("click");
    $("#" + leave_box).find(".player-number").text(leave_box);
    $("#" + leave_box).removeClass("player-ready");
    $("#" + leave_box).addClass("player-empty");
    $("#" + leave_box).removeClass("player-ready-false");
    $("#" + leave_box).removeClass("player-ready-true");
    console.log("sitremove")
    var a = document.createElement("a");
    a.innerHTML = "点击坐下";
    $("#" + leave_box).append(a);
    $("#" + leave_box).on("click", function() {
        var route = "connector.entryHandler.sit";
        var position = leave;
        pomelo.request(route, {
            username: username,
            rid: rid,
            position: position
        }, function(data) {
            resetBtnReady();
            var p_box = "p" + data;
            var arrow = document.createElement("div");
            $(".player-current-arrow").remove();
            arrow.setAttribute("class", "player-current-arrow")
            $("#" + p_box).append(arrow);

        })
    })

}
//
function resetBtnReady() {
    $(".btn-ready").remove();
    var btnReady = document.createElement("div");
    btnReady.innerHTML = "准备";
    btnReady.setAttribute("class", "btn btn-ready btn-ready-false");
    var append = document.getElementById("center-center").appendChild(btnReady);
    $(".btn-ready").on("click", function() {
        var route = "connector.entryHandler.ready";
        pomelo.request(route, {
            username: username,
            rid: rid
        }, function(data) {
            console.log(data)
            if ($(".btn-ready").hasClass("btn-ready-true")) {
                $(".btn-ready").addClass("btn-ready-false").removeClass("btn-ready-true");
                $(".btn-ready").html("准备");
            } else if ($(".btn-ready").hasClass("btn-ready-false")) {
                $(".btn-ready").addClass("btn-ready-true").removeClass("btn-ready-false");
                $(".btn-ready").html("取消准备");
            }
        })

    })
}




function load() {
    // 点击坐下
    var a = document.createElement("a");
    a.innerHTML = "点击坐下";
    $(".player").append(a);
    // 号码
    for (var i = 0; i < 12; i++) {
        var num = document.createElement("div")
        num.setAttribute("class", "player-number");
        var getId = document.getElementsByClassName("player")[i].getAttribute("id");
        num.innerHTML = getId;
        num.setAttribute("id", getId + "-num")
        var flag = document.getElementsByClassName("player")[i].appendChild(num);
    }
}


//加载
$(document).ready(function() {
    //when first time into chat room.
    $("#login-layer").show()
    load();
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
        // console.log(data)
        addUser(user);
    });

    //update user list
    pomelo.on('onLeave', function(data) {
        var user = data.user;
        console.log(data)
        playerSit(user.split('*')[0], null, user.split('*')[1])
    });

    //when sit
    pomelo.on('onSit', function(data) {
        var user = data.user;
        var position = data.position;
        var leave = data.leave;
        playerSit(user, position, leave);
    });
    pomelo.on('onReady', function(data) {
        var user = data.user;
        $("#p" + user.split('*')[1]).addClass("player-ready-" + data.ready).removeClass("player-ready-" + !data.ready);
    })

    pomelo.on('onStart', function(data) {
        console.log(data)
        var position=data.position;
        var role=data.role;
        $(".btn-ready").remove();
        $("#center-center").css("background","url(../image/player-"+role+".jpg) no-repeat center center /350px")
    });


    //handle disconect message, occours when the client is disconnect with servers
    pomelo.on('disconnect', function(reason) {
        // showLogin();
        console.log("disconnect")
    });
    $(".player-empty").on("click", function() {
        var route = "connector.entryHandler.sit";
        var position = $(this)[0].id.replace("p", "");
        pomelo.request(route, {
            username: username,
            rid: rid,
            position: position
        }, function(data) {
            resetBtnReady();
            var p_box = "p" + data;
            var arrow = document.createElement("div");
            $(".player-current-arrow").remove();
            arrow.setAttribute("class", "player-current-arrow")
            $("#" + p_box).append(arrow);

        })
    })

    //deal with login button click.
    $("#login-layer>div>button").click(function() {
        username = $("#login-username").val();
        rid = $("#login-room").val();

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
                    $("#login-layer").hide()
                    for (var i = 0; i < data.users.length; i++) {
                        playerSit(data.users[i].split('*')[0], data.users[i].split('*')[1], null);
                        var user = data.users[i];
                        $("#p" + user.split('*')[1]).addClass("player-ready-" + user.split('*')[2]).removeClass("player-ready-" + !(user.split('*')[2] == 'true'));
                    }
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
