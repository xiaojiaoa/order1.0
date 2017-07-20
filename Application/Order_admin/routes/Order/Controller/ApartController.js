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
        var paramObjectOne = helper.genPaginationQuery(req, 'pageNoGid');
        var paramObjectTwo = helper.genPaginationQuery(req, 'pageNoNext');
        var paramObjectThr = helper.genPaginationQuery(req);

        var pageNoGid = req.query.pageNoGid?req.query.pageNoGid:'1';
        delete req.query.pageNoGid
        var pageNoNext = req.query.pageNoNext?req.query.pageNoNext:'1';
        delete req.query.pageNoNext

        Base.multiDataRequest(req, res, [
            {url: '/api/orders/apart/gid?pageNo='+pageNoGid, method: 'GET', resConfig: {keyName: 'apartingList', is_must: true}},
            {url: '/api/orders/apart/waitReview/gid?pageNo='+pageNoNext, method: 'GET', resConfig: {keyName: 'waitReviewList', is_must: true}},
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
                prelink: paramObjectOne.withoutPageNo,
                current: paginationInfoOne.page,
                rowsPerPage: paginationInfoOne.pageSize,
                totalResult: paginationInfoOne.totalItems,
                pageNoName: paramObjectOne.pageNoName
            }));
            var boostrapPaginatorTwo = new Pagination.TemplatePaginator(helper.genPageInfo({
                prelink: paramObjectTwo.withoutPageNo,
                current: paginationInfTwo.page,
                rowsPerPage: paginationInfTwo.pageSize,
                totalResult: paginationInfTwo.totalItems,
                pageNoName: paramObjectTwo.pageNoName
            }));
            var boostrapPaginatorThr = new Pagination.TemplatePaginator(helper.genPageInfo({
                prelink: paramObjectThr.withoutPageNo,
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
        req.body.causeStr =  req.body.causeStr.toString(',');

        request(Base.mergeRequestOptions({
            method: 'put',
            url: '/api/orders/apart/notPass?'+queryString.stringify(req.body),
        }, req, res), function (error, response, body) {
            if (!error && response.statusCode == 201) {
                Base.handlerSuccess(res, req);
                //  res.redirect("/apartPage/getOrder");
                res.redirect(req.session.backPath?req.session.backPath:"/apartPage/getOrder");
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
                if(req.body.orderType == 'order'){
                  //  res.redirect("/apartPage/getOrder");
                    res.redirect(req.session.backPath?req.session.backPath:"/apartPage/getOrder");
                }else{
                   // res.redirect("/orders/resupplys/apart");
                    res.redirect(req.session.backPath?req.session.backPath:"/orders/resupplys/apart");
                }

            } else {
                Base.handlerError(res, req, error, response, body);
            }
        })

    },
    checkPage: function (req, res) {
        var type = req.params.type;
        var paramObject = helper.genPaginationQuery(req);
        var paramObjectOne = helper.genPaginationQuery(req, 'pageNoGid');
        var paramObjectTwo = helper.genPaginationQuery(req, 'pageNoNext');

        var pageNoGid = req.query.pageNoGid?req.query.pageNoGid:'1';
        delete req.query.pageNoGid
        var pageNoNext = req.query.pageNoNext?req.query.pageNoNext:'1';
        delete req.query.pageNoNext


        Base.multiDataRequest(req, res, [
            {url: '/api/orders/apartReview/gid?pageNo='+pageNoGid, method: 'GET', resConfig: {keyName: 'doingList', is_must: true}},
            {url: '/api/orders/apartReview/waitApartReview/gid?pageNo='+pageNoNext, method: 'GET', resConfig: {keyName: 'waitApartReview', is_must: true}},
            {url: '/api/orders/apartReview?'+ (queryString.stringify(req.query)), method: 'GET', resConfig: {keyName: 'apartReviewList', is_must: true}},
            {url: '/api/assist/brandinfo', method: 'GET', resConfig: {keyName: 'brandinfoList', is_must: true}},
            {url: '/api/assist/deco/color', method: 'GET', resConfig: {keyName: 'colorList', is_must: true}},
            {url: '/api/assist/space/prod', method: 'GET', resConfig: {keyName: 'prodList', is_must: true}},
            {url: '/api/assist/order/difficulty', method: 'GET', resConfig: {keyName: 'difficultyList', is_must: true}},
            {url: '/api/orders/apartReview/apartReviewNumber', method: 'GET', resConfig: {keyName: 'apartReviewNumber', is_must: true}},

        ], function (req, res, resultList) {

            var paginationInfoOne =  resultList.doingList;
            var paginationInfTwo =  resultList.waitApartReview;
            var paginationInf =  resultList.apartReviewList;

            var boostrapPaginatorOne = new Pagination.TemplatePaginator(helper.genPageInfo({
                prelink: paramObjectOne.withoutPageNo,
                current: paginationInfoOne.page,
                rowsPerPage: paginationInfoOne.pageSize,
                totalResult: paginationInfoOne.totalItems,
                pageNoName: paramObjectOne.pageNoName
            }));
            var boostrapPaginatorTwo = new Pagination.TemplatePaginator(helper.genPageInfo({
                prelink: paramObjectTwo.withoutPageNo,
                current: paginationInfTwo.page,
                rowsPerPage: paginationInfTwo.pageSize,
                totalResult: paginationInfTwo.totalItems,
                pageNoName: paramObjectTwo.pageNoName
            }));
            var boostrapPaginator = new Pagination.TemplatePaginator(helper.genPageInfo({
                prelink: paramObject.withoutPageNo,
                current: paginationInf.page,
                rowsPerPage: paginationInf.pageSize,
                totalResult: paginationInf.totalItems
            }));


            var returnData = Base.mergeData(helper.mergeObject({
                title: '拆单审核 ',
                type :type,
                paginationOne: boostrapPaginatorOne.render(),
                paginationTwo: boostrapPaginatorTwo.render(),
                pagination: boostrapPaginator.render(),
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
        req.body.causeStr =  req.body.causeStr.toString(',');

        request(Base.mergeRequestOptions({
            method: 'put',
            url: '/api/orders/apartReview/notPass?'+queryString.stringify(req.body),
        }, req, res), function (error, response, body) {
            if (!error && response.statusCode == 201) {
                Base.handlerSuccess(res, req);
               // res.redirect("/apartCheckPage/getOrder");
                res.redirect(req.session.backPath?req.session.backPath:"/apartCheckPage/getOrder");
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

