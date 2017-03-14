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


var app = express();

//
app.use(session({
    store: process.env.SESSION_DRIVER ? new RedisStore(orderSessionConfig.redis) : '',
    name: orderSessionConfig.name,
    resave: orderSessionConfig.resave,
    saveUninitialized: orderSessionConfig.saveUninitialized,
    secret: orderSessionConfig.secret,
    cookie: {maxAge: parseInt(process.env.SESSION_TIME || 1800000)}
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
app.use(function (req, res, next) {
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

//添加时间格式化函数
Date.prototype.format = function (fmt) {
    var o = {
        "M+": this.getMonth() + 1, //月份
        "d+": this.getDate(), //日
        "h+": this.getHours() % 12 == 0 ? 12 : this.getHours() % 12, //小时
        "H+": this.getHours(), //小时
        "m+": this.getMinutes(), //分
        "s+": this.getSeconds(), //秒
        "q+": Math.floor((this.getMonth() + 3) / 3), //季度
        "S": this.getMilliseconds() //毫秒
    };
    var week = {
        "0": "/u65e5",
        "1": "/u4e00",
        "2": "/u4e8c",
        "3": "/u4e09",
        "4": "/u56db",
        "5": "/u4e94",
        "6": "/u516d"
    };
    if (/(y+)/.test(fmt)) {
        fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
    }
    if (/(E+)/.test(fmt)) {
        fmt = fmt.replace(RegExp.$1, ((RegExp.$1.length > 1) ? (RegExp.$1.length > 2 ? "/u661f/u671f" : "/u5468") : "") + week[this.getDay() + ""]);
    }
    for (var k in o) {
        if (new RegExp("(" + k + ")").test(fmt)) {
            fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
        }
    }
    return fmt;
};

app.locals.DWY_Helper = {

    // 判断是否可以循环,即判断是否是数组
    isCanLoop:function(value){

        if(typeof value == 'object' && value instanceof Array ){
            return value.length>0 ? true : false;
        }else{
            return false;
        }

    },
    
    //增加时间格式化工具
    getLocalDate: function (timestamp) {
        if (timestamp) {
            var time = parseInt(timestamp);
            return new Date(time).format('yyyy-MM-dd HH:mm:ss');
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

    //字典翻译
    getAssistValByCode: function (code, list) {
        if (list && code) {
            for (var i = 0; i < list.length; i++) {
                var element = list[i]
                if (element && element.code == code) {
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

//字典翻译-门店类型
    getStoreType: function (code) {
        switch (code){
            case '0':
                return "";
                break;
            case '1':
                return "路边店";
                break;
            case '2':
                return "商超店";
                break;
            case '3':
                return "卖场店";
                break;
            case '4':
                return "仓储店";
                break;
        }
        return code;
    },

    //字典翻译-是否
    getWhether: function (code) {
        switch (code){
            case 1:
                return "是";
                break;
            default:
                return "否";
        }
        return code;
    },

     //字典翻译-入库类型
    getEnterType: function (code) {
        switch (code){
            case 1:
                return "物料";
                break;
            default:
                return "成品";
        }
        return code;
    },
    geOutStatus: function (code) {
        switch (code){
            case 2:
                return "待审核";
                break;
            case 4:
                return "已审核";
                break;

        }
        return code;
    },
    geDeliveryStatus: function (code) {
        switch (code){
            case '2':
                return "未审核";
                break;
            case '4':
                return "已审核";
                break;
            case '6':
                return "已备货";
                break;
            case '8':
                return "已发货";
                break;

        }
        return code;
    },
    //字典翻译-工厂类型
    getFactoryType: function (code) {
        switch (code){
            case 1:
                return "工厂";
                break;
            case 2:
                return "仓储中心";
                break;

        }
        return code;
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

    //柜员状态
    getEmployeeStatus: function (code) {
        if(code == 0){ return "锁定"}
        if (code) {

            if (code == "1") {
                return "开启"
            }
            if (code == "2") {
                return "关闭"
            }
        }
        return code;
    },

    //checkbox 状态判断  code为[{},{}]
    checkboxStatus: function (code, option) {
        if (option && code) {
            for (var i = 0; i < code.length; i++) {
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
            for (var i = 0; i < codeArry.length; i++) {
                var element = codeArry[i];
                if (element && element == option) {
                    return 'checked';
                }
            }
        }
        return code;
    },

    //字典翻译-ftyId
    getAssistValFtyId: function (code, list) {
        if (list && code) {
            for (var i = 0; i < list.length; i++) {
                var element = list[i]
                if (element && element.ftyId == code) {
                    return element.name;
                }
            }
        }
        return code;
    },
//字典翻译-whseId
    getAssistValWhseId: function (code, list) {
        if (list && code) {
            for (var i = 0; i < list.length; i++) {
                var element = list[i]
                if (element && element.whseId == code) {
                    return element.name;
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
    //判断物料分类级别
    judgeMateType:function(number) {
        var string = number.toString();
        var j = 0;
        var a;
        for (var i = string.length - 1; i > 0; i--) {
            if (parseInt(string[i]) == 0) {
                j++;
            }
            else {
                break;
            }
        }
        if (j >= 6) {
            a = "一级"
        }
        else if (j < 6 && j >= 4) {
            a = "二级"
        } else {
            a = "三级"
        }
        return a;
    },
    //合计，表格对象，对哪一列进行合计--使用方法 calcTotal(document.getElementById('table'),2,2);
    calcTotal:function(table,column,start){
        var trs=table.getElementsByTagName('tr');
        var start=start//确定从第几行开始求和
        end=trs.length-1;//忽略最后合计的一行
        var total=0;
        for(var i=start;i<end;i++){
            var td=trs[i].getElementsByTagName('td')[column];
            var t=parseFloat(td.innerHTML);
            if(t)total+=t;
        }
        trs[end].getElementsByTagName('td')[column].innerHTML=total;
    },
}


module.exports = app;
