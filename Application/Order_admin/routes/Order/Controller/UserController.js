//模板 供复制用
var Base = require('./BaseController');

//分页
var Pagination = require('pagination');

//生成请求query
var queryString = require('qs');

//自定义帮助函数
var helper = require('../config/helper');

//请求模块
var request = require('request');

//引入权限
var Permissions = require('../config/permission');


var UserController = {
    indexPage: function (req, res) {

        var returnData = Base.mergeData(helper.mergeObject(
            {
                title: '个人中心',
                Permission :Permissions,
            },
            //Customize Data
            {}
        ));

        res.render('order/user/index', returnData);

    },
    passwordPage: function (req, res) {
        res.render('order/user/set-password')
    },
    doPassword: function (req, res) {

        request(Base.mergeRequestOptions({
            method: 'put',
            url: '/api/employees/password?'+queryString.stringify(req.body),
        }, req, res), function (error, response, body) {
            if (!error && response.statusCode == 201) {
                res.redirect("/login");
            } else {
                Base.handlerError(res, req, error, response, body);
            }
        })
    },
};

module.exports = UserController;

