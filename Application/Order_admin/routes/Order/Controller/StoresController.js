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
                // res.redirect("/storesManage");
                res.redirect(req.session.backPath?req.session.backPath:"/storesManage");
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
               // res.redirect("/storesManage");
                res.redirect(req.session.backPath?req.session.backPath:"/storesManage");
            } else {
                Base.handlerError(res, req, error, response, body);
            }
        })

    },
    doRecharge: function (req, res) {
        var cid = req.body.bid
        var urltype = req.body.urltype
        request(Base.mergeRequestOptions({
            method: 'post',
            url: '/api/stores/money',
            form: req.body,
        }, req, res), function (error, response, body) {
            if (!error && response.statusCode == 201) {
                Base.handlerSuccess(res, req);
                if(urltype == 'detail'){
                    res.redirect("/storesManage/detail/"+cid);
                }else{
                  //  res.redirect("/storesManage/all/money");
                    res.redirect(req.session.backPath?req.session.backPath:"/storesManage/all/money");
                }

            } else {
                Base.handlerError(res, req, error, response, body);
            }
        })


    },

    allMoneyPage: function (req, res) {
        var paramObject = helper.genPaginationQuery(req);
        Base.multiDataRequest(req, res, [
            {url: '/api/stores/money/store/page?'+ queryString.stringify(req.query), method: 'GET', resConfig: {keyName: 'storeMoneyList', is_must: true}},
            // {url: '/api/assist/store/types', method: 'GET', resConfig: {keyName: 'storeTypes', is_must: true}},
            // {url: '/api/assist/store/addrTypes', method: 'GET', resConfig: {keyName: 'addrTypesList', is_must: true}},
            // {url: '/api/assist/region/types', method: 'GET', resConfig: {keyName: 'TypesList', is_must: true}},

        ], function (req, res, resultList) {

            var paginationInfo =  resultList.storeMoneyList;

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
            res.render('order/manages/all_store_money', returnData);
        });

    },

    preRechargePage: function (req, res) {
        var bid = req.params.bid;
        var paramObject = helper.genPaginationQuery(req);
        Base.multiDataRequest(req, res, [
            {url: '/api/stores/money/recharge/page?bid='+bid+'&'+ queryString.stringify(req.query), method: 'GET', resConfig: {keyName: 'preRechargeList', is_must: true}},
        ], function (req, res, resultList) {
            var paginationInfo =  resultList.preRechargeList;
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
            res.render('order/manages/store_prerecharge', returnData);
        });
    },

    passPrerecharge:function(req,res){
        var tid = req.body.tid;
        var bidRecharge = req.body.bidRecharge;
        request(Base.mergeRequestOptions({
            method: 'post',
            url: '/api/stores/money/recharge/pass/' + tid+'?'+queryString.stringify(req.body),
        }, req, res), function (error, response, body) {
            if (!error && response.statusCode == 201) {
                Base.handlerSuccess(res, req);
                res.redirect("/storesManage/preRecharge/"+bidRecharge);
            } else {
                Base.handlerError(res, req, error, response, body);
            }
        })
    },

    backPrerecharge:function(req,res){
        var tid = req.body.tid;
        var bidRecharge = req.body.bidRecharge;
        request(Base.mergeRequestOptions({
            method: 'post',
            url: '/api/stores/money/recharge/back/' + tid+'?'+queryString.stringify(req.body),
        }, req, res), function (error, response, body) {
            if (!error && response.statusCode == 201) {
                Base.handlerSuccess(res, req);
                res.redirect("/storesManage/preRecharge/"+bidRecharge);
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