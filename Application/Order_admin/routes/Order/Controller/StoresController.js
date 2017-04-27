//请求代理控制器
var Base = require('./BaseController');

var Pagination = require('pagination');

var queryString = require('qs');

var helper = require('../config/helper');

var request = require('request');
//引入权限
var Permissions = require('../config/permission');

var StoresController = {
    listPage: function (req, res) {
        var paramObject = helper.genPaginationQuery(req);
        Base.multiDataRequest(req, res, [
            {url: '/api/stores?'+ queryString.stringify(req.query), method: 'GET', resConfig: {keyName: 'storeList', is_must: true}},
            {url: '/api/assist/store/types', method: 'GET', resConfig: {keyName: 'storeTypes', is_must: true}},
            {url: '/api/assist/store/addrTypes', method: 'GET', resConfig: {keyName: 'addrTypesList', is_must: true}},
            {url: '/api/assist/region/types', method: 'GET', resConfig: {keyName: 'TypesList', is_must: true}},

        ], function (req, res, resultList) {

            var paginationInfo =  resultList.storeList;

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
            // console.log('/api/stores?'+ queryString.stringify(req.query))
            res.render('order/manages/store', returnData);
        });

    },
    detailPage: function (req, res) {
        var cid =  req.params.cid;
        var paramObject = helper.genPaginationQuery(req);
        Base.multiDataRequest(req, res, [
            {url: '/api/stores/'+cid, method: 'GET', resConfig: {keyName: 'storeInfo', is_must: true}},
            {url: '/api/assist/store/types', method: 'GET', resConfig: {keyName: 'storeTypes', is_must: true}},
            {url: '/api/assist/store/addrTypes', method: 'GET', resConfig: {keyName: 'addrTypesList', is_must: true}},
            {url: '/api/stores/money/page/'+cid+'?'+queryString.stringify(req.query), method: 'GET', resConfig: {keyName: 'moneyList', is_must: true}},
            {url: '/api/stores/money/'+cid, method: 'GET', resConfig: {keyName: 'moneyInfo', is_must: true}},
        ], function (req, res, resultList) {
            var paginationInfo =  resultList.moneyList;

            var boostrapPaginator = new Pagination.TemplatePaginator(helper.genPageInfo({
                prelink: paramObject.withoutPageNo,
                current: paginationInfo.page,
                rowsPerPage: paginationInfo.pageSize,
                totalResult: paginationInfo.totalItems
            }));
            var returnData = Base.mergeData(helper.mergeObject({
                title: ' ',
                pagination: boostrapPaginator.render(),
            },resultList));
            res.render('order/manages/store_detail', returnData);
        });
    },
    createPage: function (req, res) {
        Base.multiDataRequest(req, res, [
            {url: '/api/assist/store/types', method: 'GET', resConfig: {keyName: 'storeTypes', is_must: true}},
            {url: '/api/assist/store/addrTypes', method: 'GET', resConfig: {keyName: 'addrTypesList', is_must: true}},
            {url: '/api/assist/region/types', method: 'GET', resConfig: {keyName: 'TypesList', is_must: true}},
        ], function (req, res, resultList) {

            var returnData = Base.mergeData(helper.mergeObject({
                title: ' ',
                Permission :Permissions,
            },resultList));
            res.render('order/manages/store_create', returnData);
        });
    },
    modifyPage: function (req, res) {
        var cid = req.params.cid;
        Base.multiDataRequest(req, res, [
            {url: '/api/stores/'+cid, method: 'GET', resConfig: {keyName: 'storeInfo', is_must: true}},
            {url: '/api/assist/store/types', method: 'GET', resConfig: {keyName: 'storeTypes', is_must: true}},
            {url: '/api/assist/store/addrTypes', method: 'GET', resConfig: {keyName: 'addrTypesList', is_must: true}},
          {url: '/api/assist/region/types', method: 'GET', resConfig: {keyName: 'TypesList', is_must: true}},

        ], function (req, res, resultList) {

            var returnData = Base.mergeData(helper.mergeObject({
                title: ' ',
                cid:cid,
            },resultList));
            res.render('order/manages/store_modify', returnData);
        });
    },
    doCreate: function (req, res) {
        // console.log('999'+ JSON.stringify(req.body))
        request(Base.mergeRequestOptions({
            method: 'post',
            url: '/api/stores',
            form: req.body,
        }, req, res), function (error, response, body) {
            if (!error && response.statusCode == 201) {
                Base.handlerSuccess(res, req);
                res.redirect("/storesManage");
            } else {
                Base.handlerError(res, req, error, response, body);
            }
        })


    },
    doModify: function (req, res) {

        var cid = req.body.storeId;
        request(Base.mergeRequestOptions({
            method: 'put',
            url: '/api/stores/' + cid + "?" + queryString.stringify(req.body),
        }, req, res), function (error, response, body) {
            if (!error && response.statusCode == 201) {
                Base.handlerSuccess(res, req);
                res.redirect("/storesManage");
            } else {
                Base.handlerError(res, req, error, response, body);
            }
        })

    },
    doRecharge: function (req, res) {
        var cid = req.body.bid
        request(Base.mergeRequestOptions({
            method: 'post',
            url: '/api/stores/money',
            form: req.body,
        }, req, res), function (error, response, body) {
            if (!error && response.statusCode == 201) {
                Base.handlerSuccess(res, req);
                res.redirect("/storesManage/detail/"+cid);
            } else {
                Base.handlerError(res, req, error, response, body);
            }
        })


    },


    setStatus: function (req, res) {
        var cid = req.params.cid;
        var type = req.params.type;
        request(Base.mergeRequestOptions({
            method: 'put',
            url: '/api/stores/stcode/'+cid+'?stcode='+type,
        }, req, res), function (error, response, body) {
            if (!error && response.statusCode == 201) {

                res.sendStatus(200);
            } else {
                Base.handlerError(res, req, error, response, body);
            }
        })

    },

};

module.exports = StoresController;