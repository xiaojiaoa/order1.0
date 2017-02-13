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


var FileController = {

    createPage: function (req, res) {
        var lid = req.params.lid;
        var type = req.params.type;
        Base.multiDataRequest(req, res, [
                {url: '/api/assist/order/spaceinfo?pid=0', method: 'GET', resConfig: {keyName: 'spaceInfo', is_must: true}},
                {url: '/api/assist/file/type?type='+type, method: 'GET', resConfig: {keyName: 'fileTypeInfo', is_must: true}},
                {url: '/api/files/'+ lid, method: 'GET', resConfig: {keyName: 'fileInfo', is_must: false}},
                {url: '/api/assist/order/spaceinfo', method: 'GET', resConfig: {keyName: 'allSpaceInfo', is_must: true}},
                {url: '/api/assist/file/type', method: 'GET', resConfig: {keyName: 'allFileTypeInfo', is_must: true}}
            ],
            function (req, res, resultList) {
                var returnData = Base.mergeData(helper.mergeObject({
                    title: ' ',
                    lid:lid,
                }, resultList));
                res.render('order/file/create', returnData);
            });
    },
    createOrderFilePage: function (req, res) {
        var lid = req.params.lid;
        var ordType = req.params.type;
        var tid = req.params.tid;
        var stcode = req.params.stcode;
        Base.multiDataRequest(req, res, [
                {url: '/api/taskseqs/stcode/'+lid, method: 'GET', resConfig: {keyName: 'stcodeInfo', is_must: true}},
                {url: '/api/assist/file/type?type='+stcode, method: 'GET', resConfig: {keyName: 'fileTypeInfo', is_must: true}},
                {url: '/api/assist/order/spaceinfo?pid=0', method: 'GET', resConfig: {keyName: 'spaceInfo', is_must: true}},
                {url: '/api/order/file/'+ lid+"?ordType="+ordType+"&tid="+tid, method: 'GET', resConfig: {keyName: 'fileInfo', is_must: false}},
                {url: '/api/assist/order/spaceinfo', method: 'GET', resConfig: {keyName: 'allSpaceInfo', is_must: true}},
                {url: '/api/assist/file/type', method: 'GET', resConfig: {keyName: 'allFileTypeInfo', is_must: true}}
            ],
            function (req, res, resultList) {
                var returnData = Base.mergeData(helper.mergeObject({
                    title: ' ',
                    lid:lid,
                    tid:tid,
                    ordType:ordType,
                    stcode:stcode
                }, resultList));
                res.render('order/file/order_create', returnData);
            });
    },
    picPage: function (req, res) {
        var lid = req.params.lid;
        Base.multiDataRequest(req, res, [
                {url: '/api/files/pic?lid='+lid, method: 'GET', resConfig: {keyName: 'picInfo', is_must: true}}
            ],
            function (req, res, resultList) {
                var returnData = Base.mergeData(helper.mergeObject({
                    title: ' ',
                    lid:lid,
                }, resultList));
                res.render('order/file/pic', returnData);
            });
    },
    orderFileDetail: function (req, res) {
        var lid = req.params.lid;
        Base.multiDataRequest(req, res, [
                {url: '/api/order/file/'+ lid+"?ordType=1", method: 'GET', resConfig: {keyName: 'fileInfo', is_must: false}},
            ],
            function (req, res, resultList) {
                var returnData = Base.mergeData(helper.mergeObject({
                    title: ' ',
                    lid:lid,
                }, resultList));
                res.render('order/file/order_file_detail', returnData);
            });
    },
    doCreate: function (req, res) {
        var lid = req.body.lid;

        request(Base.mergeRequestOptions({
            method: 'post',
            url: '/api/files/measfile',
            form:req.body,
        }, req, res), function (error, response, body) {
            if (!error && response.statusCode == 201) {
                res.redirect("/taskseq/index/"+lid);
            } else {
                Base.handlerError(res, req, error, response, body);
            }
        })
    },
    doCreateOrderFile: function (req, res) {
        var lid = req.body.lid;
        var tid = req.body.tid;
        var ordType = req.body.ordType;
        var stcode = req.body.stcode;
        request(Base.mergeRequestOptions({
            method: 'post',
            url: '/api/order/file/measfile',
            form:req.body,
        }, req, res), function (error, response, body) {
            if (!error && response.statusCode == 201) {
                res.redirect("/file/order/create/"+lid+"/"+stcode+"/"+tid+"/"+ordType);
            } else {
                Base.handlerError(res, req, error, response, body);
            }
        })
    },
    doDelete: function (req, res) {
        var id = req.params.id;
        request(Base.mergeRequestOptions({
            method: 'delete',
            url: '/api/files?idList='+id,
            form:req.body,
        }, req, res), function (error, response, body) {
            if (!error && response.statusCode == 204) {
                res.sendStatus(200)
            } else {
                Base.handlerError(res, req, error, response, body);
            }
        })
    },
    doDeleteOrderFile: function (req, res) {
        var id = req.params.id;
        request(Base.mergeRequestOptions({
            method: 'delete',
            url: '/api/order/file/'+id,
            form:req.body,
        }, req, res), function (error, response, body) {
            if (!error && response.statusCode == 204) {
                res.sendStatus(200)
            } else {
                Base.handlerError(res, req, error, response, body);
            }
        })
    }
};

module.exports = FileController;

