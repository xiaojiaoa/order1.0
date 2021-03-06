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

        Base.multiDataRequest(req, res, [
                {url: '/api/notices/page?pageSize=6', method: 'GET', resConfig: {keyName: 'noticeInfo', is_canBePass: true}},
                {url: '/api/share/page?pageSize=6', method: 'GET', resConfig: {keyName: 'fileInfo', is_canBePass: true}},
                {url: '/api/orders/list?pageSize=5', method: 'GET', resConfig: {keyName: 'taskMeasureInfo', is_canBePass: true}},
                {url: '/api/assist/order/stcodes', method: 'GET', resConfig: {keyName: 'statusInfo', is_canBePass: true}},
            ],
            function (req, res, resultList) {
                 //console.log(1111,resultList);
                var returnData = Base.mergeData(helper.mergeObject({
                    title: '个人中心',
                    Permission :Permissions,
                    codeN:resultList.noticeInfo.code,
                    codeF:resultList.fileInfo.code,
                    codeT:resultList.taskMeasureInfo.code
                }, resultList));

                res.render('order/user/index', returnData);
            });

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
                Base.handlerSuccess(res, req);
                res.redirect("/login");
            } else {
                Base.handlerError(res, req, error, response, body);
            }
        })
    },
};

module.exports = UserController;

