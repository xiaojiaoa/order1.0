var Base = require('./BaseController');

var helper = require('../config/helper');

var request = require('request');


var PassportController = {
    // 显示登录页面
    loginPage: function (req, res, next) {

        res.render('passport/login', Base.mergeData(helper.mergeObject({title: '布兰莎订单数据系统'}, {})));
    },

    // 登录
    doLogin: function (req, res) {

        request(Base.mergeRequestOptions({
            method: 'POST',
            url: '/api/token',
            form: req.body
        }, req, res), function (error, response, body) {
            if (!error && response.statusCode == 200) {
                let $data = JSON.parse(body);
                // TOKEN 存入session
                var user_session = req.session;
                user_session.auth = {
                    access_token: $data.userTokenString,
                    refresh_token: $data.refreshTokenString,
                    time: new Date().getTime(),
                };

                Base.multiDataRequest(req, res, [
                    {url: '/api/employees/current', method: 'GET', resConfig: {keyName: 'user', is_must: false}},
                    {url: '/api/permissions/menus/currentuser', method: 'GET', resConfig: {keyName: 'menu', is_must: true}},
                    {url: '/api/permissions/currentuser', method: 'GET', resConfig: {keyName: 'permission', is_must: false}}
                ], function (req, res, resultList) {
                    user_session.user = resultList['user'];
                    user_session.menu = resultList['menu'];
                    user_session.permission = resultList['permission'];
                    if(req.session.preventPath){
                        $data.preventPath = req.session.preventPath;
                    }else{
                        $data.preventPath = "/";
                    }
                    res.send($data);
                });
            } else {
                Base.handlerError(res, req, error, response, body);
            }
        })
    },

    // 获取登录验证信息
    getLoginValidate: function (req, res, next) {
        request(Base.mergeRequestOptions({
            url: '/api/captcha'
        }, req, res), function (error, response, body) {
            if (!error && response.statusCode == 200) {
                // Show the HTML for the Google homepage.
                var $data = JSON.parse(body);
                res.send($data);
            } else {
                Base.handlerError(res, req, error, response, body);
            }
        });
    },

    // 退出登陆
    doLogout:function(req,res,next){
        req.session.auth = null;
        res.redirect('/')
    }
};


module.exports = PassportController;