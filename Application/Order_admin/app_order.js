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

/* BEGIN 增加模板继承支持 */
var hbs = require('hbs');
var blocks = {};

hbs.registerHelper('extend', function (name, context) {
    var block = blocks[name];
    if (!block) {
        block = blocks[name] = [];
    }

    block.push(context.fn(this)); // for older versions of handlebars, use block.push(context(this));
});

hbs.registerHelper('block', function (name) {
    var val = (blocks[name] || []).join('\n');

    // clear the block
    blocks[name] = [];
    return val;
});

/* END 增加模板继承支持 */

var app = express();

//
app.use(session({
    order: new RedisStore(orderSessionConfig.order),
    name: orderSessionConfig.name,
    resave: orderSessionConfig.resave,
    saveUninitialized: orderSessionConfig.saveUninitialized,
    secret: orderSessionConfig.secret
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
    res.locals.user = req.session.user;
    res.locals.DWYRequest = req;
    next();
});


app.use('/', home);

app.use('/', passport);


//添加自定义函数
app.locals.genPagination = function () {
    return this;
};

app.locals.functionName = function () {
    return 'aaaaa';
};

//添加时间格式化函数
app.locals.getLocalDate = function (timestamp) {
    if(timestamp ){
        var time = parseInt(timestamp);
        return new Date(time).toLocaleString();
    }
    return null;
};

//字典翻译
app.locals.getAssistVal = function (code,list) {
    if(list&&code){
        for(var i =0;i<list.length;i++){
           var element = list[i]
           if(element&&element.id == code){
               return element.name;
           }
        }
    }
    return code;
};


module.exports = app;
