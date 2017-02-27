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


var NetworkBookController = {
    indexPage: function (req, res) {
        // var paramObject = helper.genPaginationQuery(req);
        Base.multiDataRequest(req, res, [
            {url: '/api/ebis/measure', method: 'GET', resConfig: {keyName: 'measureList', is_must: true}},
            {url: '/api/stores/list', method: 'GET', resConfig: {keyName: 'storesList', is_must: true}},
        ], function (req, res, resultList) {

            // var paginationInfo = resultList.measureList;
            //
            // var boostrapPaginator = new Pagination.TemplatePaginator(helper.genPageInfo({
            //     prelink: paramObject.withoutPageNo,
            //     current: paginationInfo.page,
            //     rowsPerPage: paginationInfo.pageSize,
            //     totalResult: paginationInfo.totalItems
            // }));

            var returnData = Base.mergeData(helper.mergeObject({
                title: '预约列表',
                // pagination: boostrapPaginator.render()
            }, resultList));

            res.render('order/networkBook/index', returnData);

        });
    },
    measurePage: function (req, res) {
        var mobile = req.params.mobile;
        request(Base.mergeRequestOptions({
            method: 'GET',
            url: '/api/customers/mobile?mobile='+mobile,
        }, req, res), function (error, response, body) {
            if (!error && response.statusCode == 200) {
                res.status(200).json(body)
            } else {
                Base.handlerError(res, req, error, response, body);
            }
        })
    },
    doMeasure: function (req, res) {
        request(Base.mergeRequestOptions({
            method: 'post',
            url: '/api/ebis/measure',
            form:req.body,
        }, req, res), function (error, response, body) {
            if (!error && response.statusCode == 201) {
                // var lid = JSON.parse(body).lid;
                console.log('success!!!')
                res.redirect("/networkBook");

            } else {
                Base.handlerError(res, req, error, response, body);
            }
        })
    },
    doClose: function (req, res) {
        var measureId = req.params.measureId;
        request(Base.mergeRequestOptions({
            method: 'put',
            url: '/api/ebis/measure/'+measureId,
        }, req, res), function (error, response, body) {
            if (!error && response.statusCode == 201) {
                res.sendStatus(200);
            } else {
                Base.handlerError(res, req, error, response, body);
            }
        })

    },

};

module.exports = NetworkBookController;

