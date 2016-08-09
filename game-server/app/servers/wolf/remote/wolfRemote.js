var fs = require('fs'),
    path = require('path');

module.exports = function(app) {
    return new WolfRemote(app);
};

var WolfRemote = function(app) {
    this.app = app;
    this.channelService = app.get('channelService');
};

/**
 * Add user into Wolf channel.
 *
 * @param {String} uid unique id for user
 * @param {String} sid server id
 * @param {String} name channel name
 * @param {boolean} flag channel parameter
 *
 */
WolfRemote.prototype.add = function(uid, sid, name, flag, cb) {
    var self = this;
    var channel = this.channelService.getChannel(name, flag);
    var username = uid.split('*')[0];
    var param = {
        route: 'onAdd',
        user: username
    };
    channel.pushMessage(param);
    fs.readFile(path.normalize(__dirname + '../../../../../config/wolfData/wolfData.json'), { encoding: 'utf8' }, function(e, r) {
        // r = JSON.stringify(r);
        r = JSON.parse(r);
        if (!!r[name]) {
            if (!!r[name][username]) {
                console.log("cao")
            } else {
                r[name][username] = { position: null }
            }
        } else {
            r[name] = {};
            r[name][username] = { position: null }
        }
        r = JSON.stringify(r);
        fs.writeFile(path.normalize(__dirname + '../../../../../config/wolfData/wolfData.json'), r, { encoding: 'utf8' }, function(e, r) {
            if (e) {
                console.log(e)
            } else {
                console.log("write complete")
            }
            if (!!channel) {
                channel.add(uid, sid);
            }

            cb(self.get(name, flag));
        })
    })
};

/**
 * Get user from Wolf channel.
 *
 * @param {Object} opts parameters for request
 * @param {String} name channel name
 * @param {boolean} flag channel parameter
 * @return {Array} users uids in channel
 *
 */
WolfRemote.prototype.get = function(name, flag) {
    var users = [];
    var channel = this.channelService.getChannel(name, flag);
    if (!!channel) {
        users = channel.getMembers();
    }
    var r;
    r = fs.readFileSync(path.normalize(__dirname + '../../../../../config/wolfData/wolfData.json'), 'utf-8')
    r = JSON.parse(r);
    for (var i = 0; i < users.length; i++) {
        users[i] = users[i].split('*')[0];
        var username = users[i];
        if (!!r[name][username]) {
            users[i] = users[i] + '*' + (r[name][username]["position"]);
        }
    }
    return users;
    console.log(users)

};

/**
 * Kick user out Wolf channel.
 *
 * @param {String} uid unique id for user
 * @param {String} sid server id
 * @param {String} name channel name
 *
 */
WolfRemote.prototype.kick = function(uid, sid, name) {
    var channel = this.channelService.getChannel(name, false);
    // leave channel
    if (!!channel) {
        channel.leave(uid, sid);
    }
    var username = uid.split('*')[0];
    var param = {
        route: 'onLeave',
        user: username
    };
    r = fs.readFileSync(path.normalize(__dirname + '../../../../../config/wolfData/wolfData.json'), 'utf-8')
    r = JSON.parse(r);
    if (!!r[name][username]) {
        param.user = param.user + "*" + r[name][username]["position"]
        delete r[name][username];
        console.log(r)
    }
    fs.writeFileSync(path.normalize(__dirname + '../../../../../config/wolfData/wolfData.json'), JSON.stringify(r));
    channel.pushMessage(param);
};



WolfRemote.prototype.sit = function(uid, sid, name, flag, position, cb) {
    var channel = this.channelService.getChannel(name, flag);
    var username = uid.split('*')[0];
    var leave = null;
    var r;
    r = fs.readFileSync(path.normalize(__dirname + '../../../../../config/wolfData/wolfData.json'), 'utf-8')
    r = JSON.parse(r);
    if (!!r[name][username]) { leave = r[name][username]["position"] }
    r[name][username]["position"] = position;
    fs.writeFileSync(path.normalize(__dirname + '../../../../../config/wolfData/wolfData.json'), JSON.stringify(r));
    var param = {
        route: 'onSit',
        user: username,
        position: position,
        leave: leave
    };
    console.log(param)
    channel.pushMessage(param);
    cb();
}
