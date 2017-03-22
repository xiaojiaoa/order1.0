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


var SystemController = {
    indexPage: function (req, res) {
        //res.render('order/system/index');
         Base.multiDataRequest(req, res, [
               {url: '/api/assist', method: 'GET', resConfig: {keyName: 'basicDataList', is_must: true}},
          ],
            function (req, res, resultList) {
          var returnData = Base.mergeData(helper.mergeObject({
                title: '个人中心',
                 Permission :Permissions,
               }, resultList));

                res.render('order/system/index', returnData);
             });

    },
    keyFirstPage: function (req, res) {
        var key = req.params.key;
        request(Base.mergeRequestOptions({
            method: 'GET',
            url: '/api/assist/list?key='+key,
        }, req, res), function (error, response, body) {
            if (!error && response.statusCode == 200) {
                res.status(200).json(body)
            } else {
                Base.handlerError(res, req, error, response, body);
            }
        })
    },
    doCreate: function (req, res) {
        request(Base.mergeRequestOptions({
            method: 'post',
            url: '/api/assist',
            form:req.body,
        }, req, res), function (error, response, body) {
            if (!error && response.statusCode == 201) {
                res.redirect("/system");
            } else {
                Base.handlerError(res, req, error, response, body);
            }
        })
    },
    doModify: function (req, res) {
        var id=req.params.id;
        request(Base.mergeRequestOptions({
            method: 'put',
            url: '/api/assist/'+id+"?"+queryString.stringify(req.body)
        }, req, res), function (error, response, body) {
            if (!error && response.statusCode == 201) {
                res.redirect("/system");
            } else {
                Base.handlerError(res, req, error, response, body);
            }
        })
    },
    timeSetPage: function (req, res) {
        res.render('order/system/time')
    },
    doSetTime: function (req, res) {
        request(Base.mergeRequestOptions({
            method: 'put',
            url: '/api/employees/password?'+queryString.stringify(req.body),
        }, req, res), function (error, response, body) {
            if (!error && response.statusCode == 201) {
                res.setStatus(200);
            } else {
                Base.handlerError(res, req, error, response, body);
            }
        })
    },
};

module.exports = SystemController;

