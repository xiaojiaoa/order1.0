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
            {url: '/api/suppliers?'+(queryString.stringify(req.query)), method: 'GET', resConfig: {keyName: 'suppliersList', is_must: true}},
            {url: '/api/organizations//list?'+(queryString.stringify(req.query)), method: 'GET', resConfig: {keyName: 'organizationsList', is_must: true}},
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
        var bid = req.query.bid? req.query.bid: req.session.user.bid;
        Base.multiDataRequest(req, res, [
                {url: '/api/suppliers/'+tid, method: 'GET', resConfig: {keyName: 'suppliersDetail', is_must: true}},
            ],
            function (req, res, resultList) {
                var returnData = Base.mergeData(helper.mergeObject({
                    title: ' ',
                    tid:tid,
                    Permission :Permissions,
                    bid:bid,
                }, resultList));
                res.render('order/supplier/detail', returnData);
            });
    },
    //供应商新增页面
    supplierCreatPage: function (req, res) {
        Base.multiDataRequest(req, res, [
            {url: '/api/suppliers/categories/list?parentId=0', method: 'GET', resConfig: {keyName: 'supplierParentSort', is_must: true}},
        ], function (req, res, resultList) {
            var returnData = Base.mergeData(helper.mergeObject({
                title: ' ',
            },resultList));
            res.render('order/supplier/creat', returnData);
        });
    },
    //供应商新增
    supplierDoCreate: function (req, res) {
        request(Base.mergeRequestOptions({
            method: 'post',
            url: '/api/suppliers',
            form:req.body,
        }, req, res), function (error, response, body) {
            if (!error && response.statusCode == 201) {
                res.redirect("/supplier");
            } else {
                Base.handlerError(res, req, error, response, body);
            }
        })
    },
    //供应商修改页面
    supplierModifyPage: function (req, res) {
        var tid = req.params.tid;
        Base.multiDataRequest(req, res, [
            {url: '/api/suppliers/'+tid, method: 'GET', resConfig: {keyName: 'supplierModify', is_must: true}},
        ], function (req, res, resultList) {
            var returnData = Base.mergeData(helper.mergeObject({
                title: ' ',
            },resultList));
            res.render('order/supplier/modify', returnData);
        });
    },
    //供应商修改
    supplierDoModify: function (req, res) {
        var tid = req.body.tid;
        request(Base.mergeRequestOptions({
            method: 'put',
            url: '/api/suppliers/'+tid+'?'+queryString.stringify(req.body)
        }, req, res), function (error, response, body) {
            if (!error && response.statusCode == 201) {
                res.redirect("/supplier");
            } else {
                Base.handlerError(res, req, error, response, body);
            }
        })
    },
    //供应商启用+禁用
    supplierdoDelete: function (req, res) {
        var tid = req.params.tid;
        var type = req.params.type;
        request(Base.mergeRequestOptions({
            method: 'put',
            url: '/api/suppliers/isDeleted/'+tid+'?isDeleted='+type,
        }, req, res), function (error, response, body) {
            if (!error && response.statusCode == 201) {
                res.redirect("/supplier/sort");
            } else {
                Base.handlerError(res, req, error, response, body);
            }
        })
    },
    //供应商物料关联
    supplierOfferProductPage: function (req, res) {
        var paramObject = helper.genPaginationQuery(req);
        var tid=req.params.tid;
        req.body.suppId=tid;
        Base.multiDataRequest(req, res, [
            {url: '/api/categories/list?parentId=0', method: 'GET', resConfig: {keyName: 'suppliersMaterialList', is_must: true}},
            {url: '/api/materials/suppliers?'+(queryString.stringify(req.body)), method: 'GET', resConfig: {keyName: 'supMaterialList', is_must: true}},
            {url: '/api/suppliers/'+tid, method: 'GET', resConfig: {keyName: 'suppliersDetail', is_must: true}},
        ], function (req, res, resultList) {
            var paginationInfo =  resultList.supMaterialList;
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
            res.render('order/supplier/offer_product', returnData);
        });
    },
    //新增供应商物料关联
    createMaterialSupplier: function (req, res) {
        var tid=req.params.tid;
        var bid=req.params.bid;
        var date=req.params.date;
        request(Base.mergeRequestOptions({
            method: 'post',
            url: '/api/suppliers/materials',
            form: {
                suppId:tid,
                mateId:bid,
                expiryDate:date,
            },
        }, req, res), function (error, response, body) {
            if (!error && response.statusCode == 201) {
                res.sendStatus(200)
            }else{
                Base.handlerError(res, req, error, response, body);
            }
        })
    },
    //修改供应商物料关联有效期
    updateDate:function(req,res){
        var sid = req.body.suppId;
        var mid = req.body.mateId;
        var date = req.body.expiryDate;
        request(Base.mergeRequestOptions({
            method: 'put',
            url: '/api/suppliers/materials?'+queryString.stringify(req.body)
        }, req, res), function (error, response, body) {
            if (!error && response.statusCode == 201) {
                res.redirect("/supplier/detail/"+sid);
            } else {
                Base.handlerError(res, req, error, response, body);
            }
        })
    },
    //解除供应商物料关联
    deleteRelate:function(req,res){
        var sid=req.params.sid;
        var mid=req.params.mid;
        console.log(sid)
        console.log(mid)
        request(Base.mergeRequestOptions({
            method: 'delete',
            url: '/api/suppliers/materials?suppId='+sid+'&mateId='+mid,
        }, req, res), function (error, response, body) {
            if (!error && response.statusCode == 204) {
                res.sendStatus(200);
            } else {
                Base.handlerError(res, req, error, response, body);
            }
        })
    },


    //根据父类id获取供应商分类
    supSortParentId: function (req, res) {
        var tid=req.params.tid;
        request(Base.mergeRequestOptions({
            method: 'GET',
            url: '/api/suppliers/categories/list?parentId='+tid,
        }, req, res), function (error, response, body) {
            if (!error && response.statusCode == 200) {
                res.status(200).json(body)
            } else {
                Base.handlerError(res, req, error, response, body);
            }
        })
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

    // supplierSortModifyPage: function (req, res) {
    //     res.render('order/supplier/sort_modify');
    // },
};
module.exports = SupplierController;