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
            url: '/api/assist/list/enabled?key='+key,
        }, req, res), function (error, response, body) {
            if (!error && response.statusCode == 200) {
                // Base.handlerSuccess(res, req);
                res.status(200).json(body)
            } else {
                Base.handlerError(res, req, error, response, body);
            }
        })
    },
    keyFirstALLPage: function (req, res) {
        var key = req.params.key;
        request(Base.mergeRequestOptions({
            method: 'GET',
            url: '/api/assist/list?key='+key,
        }, req, res), function (error, response, body) {
            if (!error && response.statusCode == 200) {
                // Base.handlerSuccess(res, req);
                res.status(200).json(body)
            } else {
                Base.handlerError(res, req, error, response, body);
            }
        })
    },
    doCreate: function (req, res) {
        console.log( "新建",req.body);
        request(Base.mergeRequestOptions({
            method: 'post',
            url: '/api/assist',
            form:req.body,
        }, req, res), function (error, response, body) {
            if (!error && response.statusCode == 201) {
                Base.handlerSuccess(res, req);
                res.redirect("/system");
            } else {
                Base.handlerError(res, req, error, response, body);
            }
        })
    },
    doModify: function (req, res) {
        console.log("修改",req.body);
        request(Base.mergeRequestOptions({
            method: 'put',
            url: '/api/assist/update'+"?"+queryString.stringify(req.body)
        }, req, res), function (error, response, body) {
            if (!error && response.statusCode == 201) {
                Base.handlerSuccess(res, req);
                res.redirect("/system");
            } else {
                Base.handlerError(res, req, error, response, body);
            }
        })
    },
    resupplyReasonPage: function (req, res) {
        var parentId = req.params.parentId;
        request(Base.mergeRequestOptions({
            method: 'GET',
            url: '/api/assist/resupplyReason/subclass?parentId='+parentId,
        }, req, res), function (error, response, body) {
            if (!error && response.statusCode == 200) {
                // Base.handlerSuccess(res, req);
                res.status(200).json(body)
            } else {
                Base.handlerError(res, req, error, response, body);
            }
        })
    },
    orderSpaceinfoPage: function (req, res) {
        var parentId = req.params.parentId;
        request(Base.mergeRequestOptions({
            method: 'GET',
            url: '/api/assist/orderSpaceinfo/subclass?parentId='+parentId,
        }, req, res), function (error, response, body) {
            if (!error && response.statusCode == 200) {
                // Base.handlerSuccess(res, req);
                res.status(200).json(body)
            } else {
                Base.handlerError(res, req, error, response, body);
            }
        })
    },
    orderSpaceinfoTwoPage: function (req, res) {
        var spaceId = req.params.spaceId;
        request(Base.mergeRequestOptions({
            method: 'GET',
            url: '/api/assist/space/prod?spaceId='+spaceId,
        }, req, res), function (error, response, body) {
            if (!error && response.statusCode == 200) {
                // Base.handlerSuccess(res, req);
                res.status(200).json(body)
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
                Base.handlerSuccess(res, req);
                res.setStatus(200);
            } else {
                Base.handlerError(res, req, error, response, body);
            }
        })
    },
};

module.exports = SystemController;

