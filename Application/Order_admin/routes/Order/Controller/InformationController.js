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
         Base.multiDataRequest(req, res, [
             {url: '/api/notices/page', method: 'GET', resConfig: {keyName: 'noticeInfoList', is_must: true}},
             {url: '/api/assist/notice/types', method: 'GET', resConfig: {keyName: 'noticeType', is_must: true}},
             {url: '/api/assist/store/types', method: 'GET', resConfig: {keyName: 'storeType', is_must: true}},
             {url: '/api/assist/store/addrTypes', method: 'GET', resConfig: {keyName: 'storeAttrType', is_must: true}},
         ], function (req, res, resultList) {
         var returnData = Base.mergeData(helper.mergeObject({
         title: ' ',
         },resultList));
         res.render('order/information/notice_info',returnData);
         });
        //res.render('order/information/notice_info');
    },
    noticeDoCreate: function (req, res) {
        console.log('公告信息创建'+ JSON.stringify(req.body));
        request(Base.mergeRequestOptions({
            method: 'post',
            url: '/api/notices',
            form:req.body,
        }, req, res), function (error, response, body) {
            if (!error && response.statusCode == 201) {
                res.redirect("/noticeInfo");
            } else {
                Base.handlerError(res, req, error, response, body);
            }
        })
    },
    noticeDoModify: function (req, res) {
        console.log('公告信息修改'+ JSON.stringify(req.body));
        request(Base.mergeRequestOptions({
            method: 'put',
            url: '/api/notices?'+queryString.stringify(req.body),
        }, req, res), function (error, response, body) {
            if (!error && response.statusCode == 201) {
                res.redirect("/noticeInfo");
            } else {
                Base.handlerError(res, req, error, response, body);
            }
        })
    },
    noticeDoDelete: function (req, res) {
        var id = req.params.nid;
        console.log(req.params);
        request(Base.mergeRequestOptions({
            method: 'put',
            url: '/api/notices/'+id,
        }, req, res), function (error, response, body) {
            if (!error && response.statusCode == 201) {
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

