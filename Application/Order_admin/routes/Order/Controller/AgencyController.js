//请求代理控制器
var Base = require('./BaseController');

var Pagination = require('pagination');

var queryString = require('qs');

var helper = require('../config/helper');

var request = require('request');
var Permissions = require('../config/permission');

var AgencyController = {
    listPage: function (req, res) {

        var paramObject = helper.genPaginationQuery(req);
        Base.multiDataRequest(req, res, [
            {url: '/api/organizations/page?'+ queryString.stringify(req.query), method: 'GET', resConfig: {keyName: 'organizationsList', is_must: true}},
            {url: '/api/assist/organ/types', method: 'GET', resConfig: {keyName: 'organTypes', is_must: true}},
            // {url: '/api/assist/store/addrTypes', method: 'GET', resConfig: {keyName: 'addrTypesList', is_must: true}},
        ], function (req, res, resultList) {

            var paginationInfo =  resultList.organizationsList;

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
            res.render('order/manages/agency', returnData);
        });
    },
    detailPage: function (req, res) {
        var cid =  req.params.cid;
        Base.multiDataRequest(req, res, [
            {url: '/api/organizations/'+cid, method: 'GET', resConfig: {keyName: 'organizationsInfo', is_must: true}},
            {url: '/api/assist/organ/types', method: 'GET', resConfig: {keyName: 'organTypes', is_must: true}},
        ], function (req, res, resultList) {

            var returnData = Base.mergeData(helper.mergeObject({
                title: ' ',
            },resultList));
            res.render('order/manages/agency_detail', returnData);
        });
    },
    createPage: function (req, res) {
        Base.multiDataRequest(req, res, [
            {url: '/api/assist/organ/types', method: 'GET', resConfig: {keyName: 'organTypes', is_must: true}},
        ], function (req, res, resultList) {

            var returnData = Base.mergeData(helper.mergeObject({
                title: ' ',
            },resultList));
            res.render('order/manages/agency_create', returnData);
        });
    },
    modifyPage: function (req, res) {
        var cid =  req.params.cid;
        Base.multiDataRequest(req, res, [
            {url: '/api/organizations/'+cid, method: 'GET', resConfig: {keyName: 'organizationsInfo', is_must: true}},
            {url: '/api/assist/organ/types', method: 'GET', resConfig: {keyName: 'organTypes', is_must: true}},
        ], function (req, res, resultList) {

            var returnData = Base.mergeData(helper.mergeObject({
                title: ' ',
                cid:cid,
            },resultList));
            res.render('order/manages/agency_modify', returnData);
        });
    },
    doCreate: function (req, res) {
        // console.log('999'+ JSON.stringify(req.body))
        request(Base.mergeRequestOptions({
            method: 'post',
            url: '/api/organizations',
            form: req.body,
        }, req, res), function (error, response, body) {
            if (!error && response.statusCode == 201) {
                Base.handlerSuccess(res, req);
                res.redirect("/agency");
            } else {
                Base.handlerError(res, req, error, response, body);
            }
        })


    },
    doModify: function (req, res) {
        var cid = req.body.cid;
        request(Base.mergeRequestOptions({
            method: 'put',
            url: '/api/organizations/' + cid + "?" + queryString.stringify(req.body),
        }, req, res), function (error, response, body) {
            if (!error && response.statusCode == 201) {
                Base.handlerSuccess(res, req);
                res.redirect("/agency");
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
            url: '/api/organizations/stcode/'+cid+'?stcode='+type,
        }, req, res), function (error, response, body) {
            if (!error && response.statusCode == 201) {
                // Base.handlerSuccess(res, req);
                res.sendStatus(200);
            } else {
                Base.handlerError(res, req, error, response, body);
            }
        })

    },

};

module.exports = AgencyController;