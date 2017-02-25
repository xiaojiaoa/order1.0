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
    //供应商分类列表
    supplierSortPage: function (req, res) {
        var paramObject = helper.genPaginationQuery(req);
        Base.multiDataRequest(req, res, [
            {url: '/api/suppliers/categories?'+(queryString.stringify(req.query)), method: 'GET', resConfig: {keyName: 'suppliersCategoriesList', is_must: true}},
        ], function (req, res, resultList) {
            var paginationInfo =  resultList.suppliersCategoriesList;
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
            res.render('order/supplier/sort', returnData);
        });
    },
    //供应商分类新增
    doCreate: function (req, res) {
        request(Base.mergeRequestOptions({
            method: 'post',
            url: '/api/suppliers/categories',
            form:req.body,
        }, req, res), function (error, response, body) {
            if (!error && response.statusCode == 201) {
                res.redirect("/supplier/sort");
            } else {
                Base.handlerError(res, req, error, response, body);
            }
        })
    },
    //供应商分类禁用+启用
    doDelete: function (req, res) {
        var tid = req.params.tid;
        var type = req.params.type;
        request(Base.mergeRequestOptions({
            method: 'put',
            url: '/api/suppliers/categories/isDeleted/'+tid+'?isDeleted='+type,
        }, req, res), function (error, response, body) {
            if (!error && response.statusCode == 201) {
                res.redirect("/supplier/sort");
            } else {
                Base.handlerError(res, req, error, response, body);
            }
        })
    },
    //供应商分类修改
    doModify: function (req, res) {
        var tid = req.body.tid;
        request(Base.mergeRequestOptions({
            method: 'put',
            url: '/api/suppliers/categories/'+tid+'?'+queryString.stringify(req.body)
        }, req, res), function (error, response, body) {
            if (!error && response.statusCode == 201) {
                res.redirect("/supplier/sort");
            } else {
                Base.handlerError(res, req, error, response, body);
            }
        })
    },
    supplierCreatPage: function (req, res) {

        res.render('order/supplier/creat');
    },
    supplierModifyPage: function (req, res) {
        res.render('order/supplier/modify');
    },
    supplierOfferProductPage: function (req, res) {
        res.render('order/supplier/offer_product');
    },
    supplierSortModifyPage: function (req, res) {
        res.render('order/supplier/sort_modify');
    },
};
module.exports = SupplierController;