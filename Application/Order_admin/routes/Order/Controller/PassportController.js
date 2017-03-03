var Base = require('./BaseController');

var helper = require('../config/helper');

var request = require('request');


var PassportController = {
    //显示登录页面
    loginPage: function (req, res, next) {

        res.render('passport/login', Base.mergeData(helper.mergeObject({title: '订单登录系统'}, {})));
    },

    //登录
    doLogin: function (req, res) {

        request(Base.mergeRequestOptions({
            method: 'POST',
            url: '/api/token',
            form: req.body
        }, req, res), function (error, response, body) {
            if (!error && response.statusCode == 200) {
                // Show the HTML for the Google homepage.
                let $data = JSON.parse(body);
                //TOKEN 存入session
                var user_session = req.session;
                user_session.auth = {
                    access_token: $data.userTokenString,
                    refresh_token: $data.refreshTokenString,
                    time: new Date().getTime(),
                };

                //获取并刷新扥估用户信息到session

                request(Base.mergeRequestOptions({
                    method: 'GET',
                    url: '/api/employees/current',
                }, req, res), function (error, response, body) {
                    if (!error && response.statusCode == 200) {
                        user_session.user = JSON.parse(body);
                        if(req.session.preventPath){
                             $data.preventPath = req.session.preventPath;
                        }else{
                            $data.preventPath = "/";
                        }
                       
                        res.send($data);
                    } else {
                        Base.handlerError(res, req, error, response, body);
                    }
                });
            } else {
                Base.handlerError(res, req, error, response, body);
            }
        })
    },

    //获取登录验证信息
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
    }
};


module.exports = PassportController;