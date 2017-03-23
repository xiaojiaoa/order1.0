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
        var paramObject = helper.genPaginationQuery(req);
        Base.multiDataRequest(req, res, [
            {url: '/api/notices/page?pageSize=5&'+(queryString.stringify(req.query)), method: 'GET', resConfig: {keyName: 'noticeInfoList', is_must: true}},
            {url: '/api/assist/notice/types', method: 'GET', resConfig: {keyName: 'noticeType', is_must: true}},
            {url: '/api/assist/store/types', method: 'GET', resConfig: {keyName: 'storeType', is_must: true}},
            {url: '/api/assist/store/addrTypes', method: 'GET', resConfig: {keyName: 'storeAttrType', is_must: true}},
        ], function (req, res, resultList) {

            var paginationInfo =  resultList.noticeInfoList;

            var boostrapPaginator = new Pagination.TemplatePaginator(helper.genPageInfo({
                prelink: paramObject.withoutPageNo,
                current: paginationInfo.page,
                rowsPerPage: paginationInfo.pageSize,
                totalResult: paginationInfo.totalItems
            }));

            var returnData = Base.mergeData(helper.mergeObject({
                title: ' ',
                pagination: boostrapPaginator.render(),
                Permission :Permissions,
            },resultList));
            res.render('order/information/notice_info',returnData);
        });
        // res.render('order/information/notice_info');
    },
    noticeDoCreate: function (req, res) {
        // var num = req.body.num0;
         console.log('公告信息创建',JSON.stringify(req.body));
        request(Base.mergeRequestOptions({
            method: 'post',
            url: '/api/notices',
            headers:{'Content-type':'application/json'},
            body:JSON.stringify(req.body),
        }, req, res), function (error, response, body) {
            if (!error && response.statusCode == 201) {
                // res.redirect('/enterMaterial')
                res.sendStatus(200);
            } else {
                Base.handlerError(res, req, error, response, body);
            }
        })
    },
    noticeDoModify: function (req, res) {
        // console.log('公告信息修改'+ JSON.stringify(req.body));
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

        var paramObject = helper.genPaginationQuery(req);
        Base.multiDataRequest(req, res, [
            {url: '/api/share/page?'+(queryString.stringify(req.query)), method: 'GET', resConfig: {keyName: 'fileInfoList', is_must: true}},
            {url: '/api/assist/store/types', method: 'GET', resConfig: {keyName: 'storeType', is_must: true}},
            {url: '/api/assist/store/addrTypes', method: 'GET', resConfig: {keyName: 'storeAttrType', is_must: true}},
        ], function (req, res, resultList) {

            var paginationInfo =  resultList.fileInfoList;

            var boostrapPaginator = new Pagination.TemplatePaginator(helper.genPageInfo({
                prelink: paramObject.withoutPageNo,
                current: paginationInfo.page,
                rowsPerPage: paginationInfo.pageSize,
                totalResult: paginationInfo.totalItems
            }));

            var returnData = Base.mergeData(helper.mergeObject({
                title: ' ',
                pagination: boostrapPaginator.render(),
                Permission :Permissions,
            },resultList));
            res.render('order/information/file_info',returnData);
        });
        // res.render('order/information/file_info');
    },
    fileDoCreate: function (req, res) {
        //console.log(req.body);
        request(Base.mergeRequestOptions({
            method: 'post',
            url: '/api/share',
            headers:{'Content-type':'application/json'},
            body:JSON.stringify(req.body),
        }, req, res), function (error, response, body) {
            if (!error && response.statusCode == 201) {
                res.sendStatus(200);
            } else {
                Base.handlerError(res, req, error, response, body);
            }
        })
    },
};

module.exports = InformationController;

