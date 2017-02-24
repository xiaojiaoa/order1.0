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


var SupplierController = {
    //供应商列表
    supplierPage: function (req, res) {
        var paramObject = helper.genPaginationQuery(req);
        Base.multiDataRequest(req, res, [
            {url: '/api/suppliers', method: 'GET', resConfig: {keyName: 'suppliersList', is_must: true}},
        ], function (req, res, resultList) {
            var paginationInfo =  resultList.suppliersList;
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
            res.render('order/supplier/index', returnData);
        });
    },
    //供应商详情
    supplierDetailPage: function (req, res) {
        var tid = req.params.tid;
        Base.multiDataRequest(req, res, [
                {url: '/api/suppliers/'+tid, method: 'GET', resConfig: {keyName: 'suppliersDetail', is_must: true}},
            ],
            function (req, res, resultList) {
                var returnData = Base.mergeData(helper.mergeObject({
                    title: ' ',
                    tid:tid,
                    Permission :Permissions,
                }, resultList));
                res.render('order/supplier/detail', returnData);
            });
    },
    supplierSortPage: function (req, res) {
        res.render('order/supplier/sort');
    },
    supplierCreatPage: function (req, res) {
        res.render('order/supplier/creat');
    },
    supplierModifyPage: function (req, res) {
        res.render('order/supplier/modify');
    },
    supplierSortCreatPage: function (req, res) {
        res.render('order/supplier/sort_creat');
    },
    supplierOfferProductPage: function (req, res) {
        res.render('order/supplier/offer_product');
    },
    supplierSortModifyPage: function (req, res) {
        res.render('order/supplier/sort_modify');
    },
};

module.exports = SupplierController;