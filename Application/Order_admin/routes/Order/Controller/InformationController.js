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


var InformationController = {
    noticeInfoPage: function (req, res) {
        /* Base.multiDataRequest(req, res, [
         {url: '/api/materials/attributes/'+id, method: 'GET', resConfig: {keyName: 'materialInfo', is_must: true}},
         {url: '/api/assist/material/units', method: 'GET', resConfig: {keyName: 'units', is_must: true}},
         {url: '/api/assist/package/types', method: 'GET', resConfig: {keyName: 'getPackageTypes', is_must: true}},
         ], function (req, res, resultList) {
         var returnData = Base.mergeData(helper.mergeObject({
         title: ' ',
         },resultList));
         res.render('order/material/material_create_second',returnData);
         });*/
        res.render('order/information/notice_info');
    },
    noticeDoCreate: function (req, res) {
        console.log('公告信息创建'+ JSON.stringify(req.body));
        request(Base.mergeRequestOptions({
            method: 'post',
            url: '/api/materials',
            form:req.body,
        }, req, res), function (error, response, body) {
            if (!error && response.statusCode == 201) {
                res.sendStatus(200);
            } else {
                Base.handlerError(res, req, error, response, body);
            }
        })
    },
    noticeDoModify: function (req, res) {
        console.log('物料修改'+ JSON.stringify(req.body));
        var mid = req.body.id;
        request(Base.mergeRequestOptions({
            method: 'put',
            url: '/api/materials/'+mid+"?"+queryString.stringify(req.body),
            form:req.body,
        }, req, res), function (error, response, body) {
            if (!error && response.statusCode == 201) {
                res.redirect("/materialManage");
            } else {
                Base.handlerError(res, req, error, response, body);
            }
        })
    },
    noticeDoDelete: function (req, res) {
        var id = req.params.nid;
        request(Base.mergeRequestOptions({
            method: 'delete',
            url: '/api/'+type+'/departments/'+id,
        }, req, res), function (error, response, body) {
            if (!error && response.statusCode == 204) {
                res.sendStatus(200)
            } else {
                Base.handlerError(res, req, error, response, body);
            }
        })
    },

    fileInfoPage: function (req, res) {
        /* var id = req.params.id;
         console.log(id);
         Base.multiDataRequest(req, res, [
         {url: '/api/materials/attributes/'+id, method: 'GET', resConfig: {keyName: 'materialInfo', is_must: true}},
         {url: '/api/assist/material/units', method: 'GET', resConfig: {keyName: 'units', is_must: true}},
         {url: '/api/assist/package/types', method: 'GET', resConfig: {keyName: 'getPackageTypes', is_must: true}},
         ], function (req, res, resultList) {
         var returnData = Base.mergeData(helper.mergeObject({
         title: ' ',
         id:id,
         },resultList));
         res.render('order/material/material_create_second',returnData);
         });*/
        res.render('order/information/file_info');
    },
};

module.exports = InformationController;

