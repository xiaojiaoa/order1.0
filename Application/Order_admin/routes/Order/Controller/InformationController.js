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
    noticeListPage: function (req, res) {
        // console.log("测试路径", '/api/notices/page'+queryString.stringify(req.query));
        var paramObject = helper.genPaginationQuery(req);
        Base.multiDataRequest(req, res, [
            {url: '/api/notices/page?'+queryString.stringify(req.query), method: 'GET', resConfig: {keyName: 'noticeInfoList', is_must: true}},
            {url: '/api/assist/notice/types', method: 'GET', resConfig: {keyName: 'noticeType', is_must: true}},
            {url: '/api/assist/store/types', method: 'GET', resConfig: {keyName: 'storeType', is_must: true}},
            {url: '/api/assist/store/addrTypes', method: 'GET', resConfig: {keyName: 'storeAttrType', is_must: true}},
            {url: '/api/notices/scopes', method: 'GET', resConfig: {keyName: 'scopesList', is_must: true}},
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
            res.render('order/information/notice_index',returnData);
        });
    },
    noticeDetailPage: function (req, res) {
        var id =req.params.id;
        Base.multiDataRequest(req, res, [
            {url:'/api/notices/'+id, method: 'GET', resConfig: {keyName: 'noticeInfo', is_must: true}},
        ], function (req, res, resultList) {
            // console.log(2525,resultList);
            var returnData = Base.mergeData(helper.mergeObject({
                title: ' ',
                id:id,
                Permission :Permissions,
            },resultList));
            res.render('order/information/notice_detail', returnData);
        });
    },
    noticeCreatePage: function (req, res) {
        Base.multiDataRequest(req, res, [
            {url: '/api/assist/notice/types', method: 'GET', resConfig: {keyName: 'noticeType', is_must: true}},
            {url: '/api/assist/store/types', method: 'GET', resConfig: {keyName: 'storeType', is_must: true}},
            {url: '/api/assist/store/addrTypes', method: 'GET', resConfig: {keyName: 'storeAttrType', is_must: true}},
        ], function (req, res, resultList) {
            var returnData = Base.mergeData(helper.mergeObject({
                title: ' ',
            },resultList));
            res.render('order/information/notice_create',returnData);
        });
    },
    noticeModifyPage: function (req, res) {
        var id =req.params.id;
        Base.multiDataRequest(req, res, [
            {url: '/api/notices/'+id, method: 'GET', resConfig: {keyName: 'noticeInfo', is_must: true}},
            {url: '/api/assist/notice/types', method: 'GET', resConfig: {keyName: 'noticeType', is_must: true}},
            {url: '/api/assist/store/types', method: 'GET', resConfig: {keyName: 'storeType', is_must: true}},
            {url: '/api/assist/store/addrTypes', method: 'GET', resConfig: {keyName: 'storeAttrType', is_must: true}},
            {url: '/api/notices/scopes', method: 'GET', resConfig: {keyName: 'scopesList', is_must: true}},
        ], function (req, res, resultList) {
            var returnData = Base.mergeData(helper.mergeObject({
                title: ' ',
                id:id,
            },resultList));
            res.render('order/information/notice_modify',returnData);
        });
    },
    noticeDoCreate: function (req, res) {
        req.body.noticeScopes=JSON.parse(req.body.noticeScopes);
        if( req.body.dataShares =="") {
            delete  req.body.dataShares
        }
        else{
            req.body.dataShares = (JSON.parse(req.body.dataShares)).filter(function(item,index){
                return item !="";
            });
            if((req.body.dataShares).length==0){
                delete  req.body.dataShares;
            }
        }
           // console.log('创建公告信息'+ JSON.stringify(req.body));
        request(Base.mergeRequestOptions({
            method: 'post',
            url: '/api/notices',
            headers:{'Content-type':'application/json'},
            body:JSON.stringify(req.body),
        }, req, res), function (error, response, body) {
            if (!error && response.statusCode == 201) {
                Base.handlerSuccess(res,req);
                res.redirect(req.session.backPath?req.session.backPath:"/noticeInfo");
            } else {
                Base.handlerError(res, req, error, response, body);
            }
        })
    },
    noticeDoModify: function (req, res) {
        var id=req.body.id;
        req.body.noticeScopes=JSON.parse(req.body.noticeScopes);

        if( req.body.dataShares =="") {
            delete  req.body.dataShares
        }
        else{
            req.body.dataShares = (JSON.parse(req.body.dataShares)).filter(function(item,index){
                return item !="";
            });
            if((req.body.dataShares).length==0){
                delete  req.body.dataShares;
            }
        }

         // console.log('公告信息修改'+ JSON.stringify(req.body));
        request(Base.mergeRequestOptions({
            method: 'post',
            url: '/api/notices/update',
            headers:{'Content-type':'application/json'},
            body:JSON.stringify(req.body),
        }, req, res), function (error, response, body) {
            if (!error && response.statusCode == 201) {
                Base.handlerSuccess(res,req);
                res.redirect("/noticeInfo/detail/"+id);
            } else {
                Base.handlerError(res, req, error, response, body);
            }
        })
    },
    noticeDoDelete: function (req, res) {
        var id = req.params.nid;
        // console.log(req.params);
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
        // console.log( '文件列表','/api/share/page?'+queryString.stringify(req.query));
        Base.multiDataRequest(req, res, [
            {url: '/api/share/page?'+queryString.stringify(req.query), method: 'GET', resConfig: {keyName: 'fileInfoList', is_must: true}},
            {url: '/api/assist/store/types', method: 'GET', resConfig: {keyName: 'storeType', is_must: true}},
            {url: '/api/assist/store/addrTypes', method: 'GET', resConfig: {keyName: 'storeAttrType', is_must: true}},
            {url: '/api/notices/scopes', method: 'GET', resConfig: {keyName: 'scopesList', is_must: true}},
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
    },
    fileDoCreate: function (req, res) {
         req.body.shareScopes=JSON.parse(req.body.shareScopes);
        // console.log('上传文件'+ JSON.stringify(req.body));
        request(Base.mergeRequestOptions({
            method: 'post',
            url: '/api/share',
            headers:{'Content-type':'application/json'},
            body:JSON.stringify(req.body),
        }, req, res), function (error, response, body) {
            if (!error && response.statusCode == 201) {
                Base.handlerSuccess(res,req);
                res.redirect(req.session.backPath?req.session.backPath:"/fileInfo");
            } else {
                Base.handlerError(res, req, error, response, body);
            }
        })
    },
    fileDoDelete: function (req, res) {
        var id = req.params.fid;
        // console.log(req.params);
        request(Base.mergeRequestOptions({
            method: 'put',
            url: '/api/share/'+id,
        }, req, res), function (error, response, body) {
            if (!error && response.statusCode == 201) {

                res.sendStatus(200)
            } else {
                Base.handlerError(res, req, error, response, body);
            }
        })
    },
};

module.exports = InformationController;

