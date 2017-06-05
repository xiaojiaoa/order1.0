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


var ApartController = {

    listPage: function (req, res) {
        var type = req.params.type;
        var paramObject = helper.genPaginationQuery(req);
        Base.multiDataRequest(req, res, [
            {url: '/api/orders/apart/gid', method: 'GET', resConfig: {keyName: 'apartingList', is_must: true}},
            {url: '/api/orders/apart/waitReview/gid', method: 'GET', resConfig: {keyName: 'waitReviewList', is_must: true}},
            {url: '/api/orders/apart?'+ (queryString.stringify(req.query)), method: 'GET', resConfig: {keyName: 'apartList', is_must: true}},
            {url: '/api/assist/brandinfo', method: 'GET', resConfig: {keyName: 'brandinfoList', is_must: true}},
            {url: '/api/assist/space/prod', method: 'GET', resConfig: {keyName: 'prodList', is_must: true}},
            {url: '/api/assist/order/difficulty', method: 'GET', resConfig: {keyName: 'difficultyList', is_must: true}},
            {url: '/api/orders/apart/apartNumber', method: 'GET', resConfig: {keyName: 'apartNumber', is_must: true}},

        ], function (req, res, resultList) {

            var paginationInfoOne =  resultList.apartingList;
            var paginationInfTwo =  resultList.waitReviewList;
            var paginationInfThr =  resultList.apartList;

            var boostrapPaginatorOne = new Pagination.TemplatePaginator(helper.genPageInfo({
                prelink: paramObject.withoutPageNo,
                current: paginationInfoOne.page,
                rowsPerPage: paginationInfoOne.pageSize,
                totalResult: paginationInfoOne.totalItems
            }));
            var boostrapPaginatorTwo = new Pagination.TemplatePaginator(helper.genPageInfo({
                prelink: paramObject.withoutPageNo,
                current: paginationInfTwo.page,
                rowsPerPage: paginationInfTwo.pageSize,
                totalResult: paginationInfTwo.totalItems
            }));
            var boostrapPaginatorThr = new Pagination.TemplatePaginator(helper.genPageInfo({
                prelink: paramObject.withoutPageNo,
                current: paginationInfThr.page,
                rowsPerPage: paginationInfThr.pageSize,
                totalResult: paginationInfThr.totalItems
            }));

            var returnData = Base.mergeData(helper.mergeObject({
                title: '订单拆单 ',
                type :type,
                paginationOne: boostrapPaginatorOne.render(),
                paginationTwo: boostrapPaginatorTwo.render(),
                paginationThr: boostrapPaginatorThr.render(),
                Permission :Permissions,
            },resultList));
            res.render('order/order/apart', returnData);
        });

    },
    getTask: function (req, res) {
        var tid = req.params.tid;
        request(Base.mergeRequestOptions({
            method: 'put',
            url: '/api/orders/apart/getTask/'+tid,
        }, req, res), function (error, response, body) {
            if (!error && response.statusCode == 201) {

                res.sendStatus(200);
                // res.redirect("/order/check/getOrder");
            } else {
                Base.handlerError(res, req, error, response, body);
            }
        })

    },
    doUnlock: function (req, res) {
        var tid = req.params.tid;
        request(Base.mergeRequestOptions({
            method: 'put',
            url: '/api/orders/apart/unlock/'+tid,
        }, req, res), function (error, response, body) {
            if (!error && response.statusCode == 201) {

                res.sendStatus(200);
            } else {
                Base.handlerError(res, req, error, response, body);
            }
        })

    },
    notPass: function (req, res) {
        var cause =  req.body.causeStr;
        var causeStr = '';
        if(cause && typeof cause == 'object'){
            for (var i=0;i<cause.length;i++)
            {
                causeStr += cause[i] +","
            }
            causeStr = causeStr.substring(0,causeStr.length-1);
            req.body.causeStr =  causeStr;
        }
        request(Base.mergeRequestOptions({
            method: 'put',
            url: '/api/orders/apart/notPass?'+queryString.stringify(req.body),
        }, req, res), function (error, response, body) {
            if (!error && response.statusCode == 201) {
                Base.handlerSuccess(res, req);
                res.redirect("/apartPage/getOrder");
            } else {
                Base.handlerError(res, req, error, response, body);
            }
        })

    },
    doPass: function (req, res) {
        var tid = req.params.tid;
        request(Base.mergeRequestOptions({
            method: 'put',
            url: '/api/orders/apart/pass?tid='+tid,
        }, req, res), function (error, response, body) {
            if (!error && response.statusCode == 201) {
                Base.handlerSuccess(res, req);
                res.sendStatus(200);
            } else {
                Base.handlerError(res, req, error, response, body);
            }
        })

    },
    doPassByMoney: function (req, res) {
        request(Base.mergeRequestOptions({
            method: 'put',
            url: '/api/orders/apart/pass?'+ queryString.stringify(req.body),
        }, req, res), function (error, response, body) {
            if (!error && response.statusCode == 201) {
                Base.handlerSuccess(res, req);
                res.redirect("/apartPage/getOrder");
            } else {
                Base.handlerError(res, req, error, response, body);
            }
        })

    },
    checkPage: function (req, res) {
        var type = req.params.type;
        var paramObject = helper.genPaginationQuery(req);
        Base.multiDataRequest(req, res, [
            {url: '/api/orders/apartReview/gid', method: 'GET', resConfig: {keyName: 'doingList', is_must: true}},
            {url: '/api/orders/apartReview/waitApartReview/gid', method: 'GET', resConfig: {keyName: 'waitApartReview', is_must: true}},
            {url: '/api/orders/apartReview?'+ (queryString.stringify(req.query)), method: 'GET', resConfig: {keyName: 'apartReviewList', is_must: true}},
            {url: '/api/assist/brandinfo', method: 'GET', resConfig: {keyName: 'brandinfoList', is_must: true}},
            {url: '/api/assist/deco/color', method: 'GET', resConfig: {keyName: 'colorList', is_must: true}},
            {url: '/api/assist/space/prod', method: 'GET', resConfig: {keyName: 'prodList', is_must: true}},
            {url: '/api/assist/order/difficulty', method: 'GET', resConfig: {keyName: 'difficultyList', is_must: true}},
            {url: '/api/orders/apartReview/apartReviewNumber', method: 'GET', resConfig: {keyName: 'apartReviewNumber', is_must: true}},

        ], function (req, res, resultList) {

            var paginationInfoOne =  resultList.doingList;
            var paginationInfTwo =  resultList.apartReviewList;

            var boostrapPaginatorOne = new Pagination.TemplatePaginator(helper.genPageInfo({
                prelink: paramObject.withoutPageNo,
                current: paginationInfoOne.page,
                rowsPerPage: paginationInfoOne.pageSize,
                totalResult: paginationInfoOne.totalItems
            }));
            var boostrapPaginatorTwo = new Pagination.TemplatePaginator(helper.genPageInfo({
                prelink: paramObject.withoutPageNo,
                current: paginationInfTwo.page,
                rowsPerPage: paginationInfTwo.pageSize,
                totalResult: paginationInfTwo.totalItems
            }));


            var returnData = Base.mergeData(helper.mergeObject({
                title: '拆单审核 ',
                type :type,
                paginationOne: boostrapPaginatorOne.render(),
                paginationTwo: boostrapPaginatorTwo.render(),
                Permission :Permissions,
            },resultList));
            res.render('order/order/apart_check', returnData);
        });
    },
    getTaskCheck: function (req, res) {
        var tid = req.params.tid;
        request(Base.mergeRequestOptions({
            method: 'put',
            url: '/api/orders/apartReview/getTask/'+tid,
        }, req, res), function (error, response, body) {
            if (!error && response.statusCode == 201) {

                res.sendStatus(200);
                // res.redirect("/order/check/getOrder");
            } else {
                Base.handlerError(res, req, error, response, body);
            }
        })

    },
    getTaskCheckAgain: function (req, res) {
        var tid = req.params.tid;
        request(Base.mergeRequestOptions({
            method: 'put',
            url: '/api/orders/apartReview/reSubmit/'+tid,
        }, req, res), function (error, response, body) {
            if (!error && response.statusCode == 201) {

                res.sendStatus(200);
                // res.redirect("/order/check/getOrder");
            } else {
                Base.handlerError(res, req, error, response, body);
            }
        })

    },
    doUnlockCheck: function (req, res) {
        var tid = req.params.tid;
        request(Base.mergeRequestOptions({
            method: 'put',
            url: '/api/orders/apartReview/unlock/'+tid,
        }, req, res), function (error, response, body) {
            if (!error && response.statusCode == 201) {

                res.sendStatus(200);
            } else {
                Base.handlerError(res, req, error, response, body);
            }
        })

    },
    notPassCheck: function (req, res) {
        var cause =  req.body.causeStr;
        var causeStr = '';
        if(cause && typeof cause == 'object'){
            for (var i=0;i<cause.length;i++)
            {
                causeStr += cause[i] +","
            }
            causeStr = causeStr.substring(0,causeStr.length-1);
            req.body.causeStr =  causeStr;
        }
        request(Base.mergeRequestOptions({
            method: 'put',
            url: '/api/orders/apartReview/notPass?'+queryString.stringify(req.body),
        }, req, res), function (error, response, body) {
            if (!error && response.statusCode == 201) {
                Base.handlerSuccess(res, req);
                res.redirect("/apartCheckPage/getOrder");
            } else {
                Base.handlerError(res, req, error, response, body);
            }
        })

    },
    doPassCheck: function (req, res) {
        var tid = req.params.tid;
        request(Base.mergeRequestOptions({
            method: 'put',
            url: '/api/orders/apartReview/pass?tid='+tid,
        }, req, res), function (error, response, body) {
            if (!error && response.statusCode == 201) {

                res.sendStatus(200);
            } else {
                Base.handlerError(res, req, error, response, body);
            }
        })

    },

};

module.exports = ApartController;

