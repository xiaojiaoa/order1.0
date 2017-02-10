var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

//for session
var session = require('express-session');
var RedisStore = require('connect-redis')(session);
var orderSessionConfig = require('./routes/Order/config/session');

// /* BEGIN 增加模板继承支持 */
// var hbs = require('hbs');
// var blocks = {};
//
// hbs.registerHelper('extend', function (name, context) {
//     var block = blocks[name];
//     if (!block) {
//         block = blocks[name] = [];
//     }
//
//     block.push(context.fn(this)); // for older versions of handlebars, use block.push(context(this));
// });
//
// hbs.registerHelper('block', function (name) {
//     var val = (blocks[name] || []).join('\n');
//
//     // clear the block
//     blocks[name] = [];
//     return val;
// });
//
// /* END 增加模板继承支持 */

var app = express();

//
app.use(session({
    order: new RedisStore(orderSessionConfig.order),
    name: orderSessionConfig.name,
    resave: orderSessionConfig.resave,
    saveUninitialized: orderSessionConfig.saveUninitialized,
    secret: orderSessionConfig.secret,
    cookie: {maxAge: 1800000}
}));

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

var home = require('./routes/Order/home');
var passport = require('./routes/Order/passport');


//把USER信息加入到全局
app.use(function(req, res, next) {
    //登录用户信息
    res.locals.user = req.session.user;
    //菜单信息
    res.locals.menu = req.session.menu;
    //权限信息
    res.locals.permission = req.session.permission;
    //请求本身
    res.locals.DWYRequest = req;
    next();
});

//错误或者正确信息处理
app.use(function (req, res, next) {
    if (req.session.DWY_message) {
        res.locals.DWY_message = req.session.DWY_message;
        req.session.DWY_message = '';
    } else {
        res.locals.DWY_message = '';
    }
    next();
});

//取回上一次错误提交时的请求参数
app.use(function (req, res, next) {
    console.log(req.session.DWY_last_request_param)
    if (req.session.DWY_last_request_param) {
        res.locals.DWY_last_request_param = req.session.DWY_last_request_param;
        req.session.DWY_last_request_param = '';
    } else {
        res.locals.DWY_last_request_param = '';
    }
    next();
});


app.use('/', home);

app.use('/', passport);

var DWY_GLOBAL = require('./routes/Order/config/global');

//大王椰全局变量
app.locals.DWY_GLOBAL = {
    Static: DWY_GLOBAL.server.Static.remote_server()
}

app.locals.DWY_Helper = {

    //增加时间格式化工具
    getLocalDate: function (timestamp) {
        if (timestamp) {
            var time = parseInt(timestamp);
            return new Date(time).format('yyyy-MM-dd hh:mm:ss');
        }
        return null;
    },

    getLocalDateYMD: function (timestamp) {
        if (timestamp) {
            var time = parseInt(timestamp);
            return new Date(time).format('yyyy-MM-dd');
        }
        return null;
    },

    //字典翻译
    getAssistVal: function (code, list) {
        if (list && code) {
            for (var i = 0; i < list.length; i++) {
                var element = list[i]
                if (element && element.id == code) {
                    return element.name;
                }
            }
        }
        return code;
    },

    //字典拼接
    getAssistStr: function (code, list) {
        var assistStr = "";
        if (list && code) {
            var codes = code.split(",");
            for (var i = 0; i < codes.length; i++) {
                for (var j = 0; j < list.length; j++) {
                    var element = list[j]
                    if (element && element.id == codes[i]) {
                        assistStr = assistStr + "  " + element.name;
                    }
                }
            }
        }
        return assistStr;
    },

    //字典翻译
    getResupply: function (code) {
        if (code) {
            code = code.replace(/\s+/g, "");
            if (code == "B") {
                return "补单"
            } else {
                return "增单"
            }
        }
        return code;
    },

    //字典翻译
    getChildrenGender: function (code) {
        if (code) {
            if (code == "0") {
                return ""
            }
            if (code == "1") {
                return "男孩"
            }
            if (code == "2") {
                return "女孩"
            } else {
                return "男孩女孩都有"
            }
        }
        return code;
    },

    //判断是否已婚
    getMarryStatus: function (code) {
        if (code) {
            if (code == "1") {
                return "已婚"
            }
            if (code == "2") {
                return "未婚"
            } else {
                return "保密"
            }
        }
        return code;
    },

    //判断订单文件类型
    getFileType: function (code) {
        if (code) {
            if (code == "1") {
                return "普通订单"
            }
            if (code == "2") {
                return "补单"
            } else {
                return "增单"
            }
        }
        return code;
    },

    //checkbox 状态判断  code为[{},{}]
    checkboxStatus: function (code, option) {
        if (option && code) {
            for(var i = 0; i < code.length; i++) {
                var element = code[i];
                if (element && element.id == option) {
                    return 'checked';
                }
            }
        }
        return code;
    },

    //checkbox 状态判断  code为 ,分隔的字符串
    checkboxStatusStr: function (code, option) {
        if (option && code) {
            var codeArry = code.split(",");
            for(var i = 0; i < codeArry.length; i++) {
                var element = codeArry[i];
                if (element && element == option) {
                    return 'checked';
                }
            }
        }
        return code;
    },


    renderSize: function (value) {
        if (null == value || value == '') {
            return "0 Bytes";
        }
        var unitArr = new Array("Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB");
        var index = 0;
        var srcsize = parseFloat(value);
        index = Math.floor(Math.log(srcsize) / Math.log(1024));
        var size = srcsize / Math.pow(1024, index);
        size = size.toFixed(2);//保留的小数位数
        return size + unitArr[index];
    },

    //判断是否有权限
    hasPermission: function (code, permission) {
        if (permission && code) {
            var i = permission.length;
            while (i--) {
                if (permission[i].fucId == code) {
                    return true;
                }
            }
            return false;
        }
        return false;
    },

}




module.exports = app;
