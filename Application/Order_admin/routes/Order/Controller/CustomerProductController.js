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


var CustomerProductController = {
    customerProPage: function (req, res) {
        Base.multiDataRequest(req, res, [
            {url: '/api/orders/getRegionTypeByGid', method: 'GET', resConfig: {keyName: 'TypesList', is_must: true}},
        ], function (req, res, resultList) {
            var returnData = Base.mergeData(helper.mergeObject({
                title: ' ',
            }, resultList));
            res.render('order/product/index_unselect', returnData);
        });
    },
    customerProListPage: function (req, res) {
        // console.log("查询路径是什么", '/api/orders/completeSet?'+queryString.stringify(req.query));
        req.query.regionTypes=req.query.regionTypes?req.query.regionTypes.toString(','):'';
        Base.multiDataRequest(req, res, [
            {url: '/api/orders/completeSet?'+queryString.stringify(req.query), method: 'GET', resConfig: {keyName: 'completeSetList', is_must: true}},
            {url: '/api/orders/getRegionTypeByGid', method: 'GET', resConfig: {keyName: 'TypesList', is_must: true}},
        ], function (req, res, resultList) {

            // console.log(5555,resultList.completeSetList);
            var returnData = Base.mergeData(helper.mergeObject({
                title: '',
                Permission :Permissions,
            }, resultList));

            res.render('order/product/index', returnData);

        });
    },
    unshelfPage: function (req, res) {
        var paramObject = helper.genPaginationQuery(req);
        Base.multiDataRequest(req, res, [
            {url: '/api/whse/cargospace/page/shelves/space?'+ queryString.stringify(req.query), method: 'GET', resConfig: {keyName: 'cargospaceList', is_must: true}},
        ], function (req, res, resultList) {

            var paginationInfo = resultList.cargospaceList;

            var boostrapPaginator = new Pagination.TemplatePaginator(helper.genPageInfo({
                prelink: paramObject.withoutPageNo,
                current: paginationInfo.page,
                rowsPerPage: paginationInfo.pageSize,
                totalResult: paginationInfo.totalItems
            }));

            var returnData = Base.mergeData(helper.mergeObject({
                title: '',
                pagination: boostrapPaginator.render(),
                Permission :Permissions,
            }, resultList));

            res.render('order/product/unshelf', returnData);

        });

    },

    unshelfExport: function (req, res) {
        request(Base.mergeRequestOptions({
            method: 'get',
            url: '/api/orders/completeSet/export?'+ queryString.stringify(req.query),
        }, req, res), function (error, response, body) {
            if (!error && response.statusCode == 200) {
                request(Base.mergeRequestOptions({
                    method: 'get',
                    url: '/api/orders/completeSet/export?'+ queryString.stringify(req.query),
                }, req, res)).pipe(res)
            } else {
                Base.handlerError(res, req, error, response, body);
            }
        })
    },

};

module.exports = CustomerProductController;

