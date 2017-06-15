//请求代理控制器
var Base = require('./BaseController');

var Pagination = require('pagination');

var queryString = require('qs');

var helper = require('../config/helper');

var request = require('request');
//引入权限
var Permissions = require('../config/permission');

var FactoryController = {
    listPage: function (req, res) {
        var paramObject = helper.genPaginationQuery(req);
        Base.multiDataRequest(req, res, [
            {url: '/api/whse/factory?' + (queryString.stringify(req.query)), method: 'GET', resConfig: {keyName: 'factoryList', is_must: true}},
        ], function (req, res, resultList) {

            var paginationInfo = resultList.factoryList;

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

            res.render('order/factory/factory', returnData);

        });
    },
    createPage: function (req, res) {
        Base.multiDataRequest(req, res, [
            {url: '/api/organizations/factory', method: 'GET', resConfig: {keyName: 'factoryList', is_must: true}},
        ], function (req, res, resultList) {
            var returnData = Base.mergeData(helper.mergeObject({
                title: ' ',
            }, resultList));
            res.render('order/factory/factory_create', returnData);
        });
    },
    ifHaved: function (req, res) {
        var id =  req.params.id;
        request(Base.mergeRequestOptions({
            method: 'get',
            url: '/api/whse/factory/exist?ftyId='+id,
        }, req, res), function (error, response, body) {
            if (!error && response.statusCode == 200) {
                res.status(200).json(body);
            }
        })
    },
    doCreate: function (req, res) {
        request(Base.mergeRequestOptions({
            method: 'post',
            url: '/api/whse/factory',
            form:req.body,
        }, req, res), function (error, response, body) {
            if (!error && response.statusCode == 201) {
                Base.handlerSuccess(res, req);
                // res.redirect("/factory");
                res.redirect(req.session.backPath?req.session.backPath:"/factory");
            } else {
                Base.handlerError(res, req, error, response, body);
            }
        })
    },
    detailPage: function (req, res) {
        var ftyId =  req.params.ftyId;
        Base.multiDataRequest(req, res, [
            {url: '/api/whse/factory/'+ftyId, method: 'GET', resConfig: {keyName: 'factoryInfo', is_must: true}},
            {url: '/api/organizations/factory', method: 'GET', resConfig: {keyName: 'factoryList', is_must: true}},
        ], function (req, res, resultList) {
            var returnData = Base.mergeData(helper.mergeObject({
                title: ' ',
            }, resultList));
            res.render('order/factory/factory_detail', returnData);
        });
    },

    modifyPage: function (req, res) {
        var ftyId =  req.params.ftyId;
        Base.multiDataRequest(req, res, [
            {url: '/api/whse/factory/'+ftyId, method: 'GET', resConfig: {keyName: 'factoryInfo', is_must: true}},
            {url: '/api/organizations/factory', method: 'GET', resConfig: {keyName: 'factoryList', is_must: true}},
        ], function (req, res, resultList) {

            var returnData = Base.mergeData(helper.mergeObject({
                title: ' ',
                ftyId:ftyId,
            }, resultList));
            res.render('order/factory/factory_modify', returnData);
        });
    },
    doModify: function (req, res) {
        var ftyId = req.body.ftyId;
        request(Base.mergeRequestOptions({
            method: 'put',
            url: '/api/whse/factory/update?'+queryString.stringify(req.body),
        }, req, res), function (error, response, body) {
            if (!error && response.statusCode == 201) {
                Base.handlerSuccess(res, req);
                // var lid = JSON.parse(body).lid;
                res.redirect("/factory/detail/"+ftyId);

            } else {
                Base.handlerError(res, req, error, response, body);
            }
        })

    },

    doClose: function (req, res) {
        var ftyId = req.params.ftyId;
        request(Base.mergeRequestOptions({
            method: 'delete',
            url: '/api/whse/factory/'+ftyId,
        }, req, res), function (error, response, body) {
            if (!error && response.statusCode == 204) {

                res.sendStatus(200);
            } else {
                Base.handlerError(res, req, error, response, body);
            }
        })

    },
    doOpen: function (req, res) {
        var ftyId = req.params.ftyId;
        request(Base.mergeRequestOptions({
            method: 'put',
            url: '/api/whse/factory/enable/'+ftyId,
        }, req, res), function (error, response, body) {
            if (!error && response.statusCode == 201) {

                res.sendStatus(200);
            } else {
                Base.handlerError(res, req, error, response, body);
            }
        })

    },

    listWarehousePage: function (req, res) {
        var ftyId = req.query.ftyId;
        var paramObject = helper.genPaginationQuery(req);
        Base.multiDataRequest(req, res, [
            {url: '/api/whse/warehouse?ftyId='+ftyId+'&'+ queryString.stringify(req.query), method: 'GET', resConfig: {keyName: 'warehouseList', is_must: true}},
            // {url: '/api/assist/warehouse/types', method: 'GET', resConfig: {keyName: 'warehouseTypes', is_must: true}},
            {url: '/api/whse/factory/list', method: 'GET', resConfig: {keyName: 'factoryList', is_must: true}},
        ], function (req, res, resultList) {

            var paginationInfo = resultList.warehouseList;

            var boostrapPaginator = new Pagination.TemplatePaginator(helper.genPageInfo({
                prelink: paramObject.withoutPageNo,
                current: paginationInfo.page,
                rowsPerPage: paginationInfo.pageSize,
                totalResult: paginationInfo.totalItems
            }));

            var returnData = Base.mergeData(helper.mergeObject({
                title: '',
                ftyId:ftyId,
                pagination: boostrapPaginator.render(),
                Permission :Permissions,
            }, resultList));

            res.render('order/factory/warehouse', returnData);

        });

    },
    createWarehousePage: function (req, res) {
        var bid = req.session.user.bid;
        var ftyId = req.params.ftyId;
        Base.multiDataRequest(req, res, [
            {url: '/api/whse/factory/list', method: 'GET', resConfig: {keyName: 'factoryList', is_must: true}},
            // {url: '/api/assist/warehouse/types', method: 'GET', resConfig: {keyName: 'warehouseTypes', is_must: true}},
            {url: '/api/roles/current/'+bid, method: 'GET', resConfig: {keyName: 'roleList', is_must: true}},
        ], function (req, res, resultList) {
            var returnData = Base.mergeData(helper.mergeObject({
                title: ' ',
                ftyId:ftyId,
            }, resultList));
            res.render('order/factory/warehouse_create', returnData);
        });
    },
    doWarehouseCreate: function (req, res) {
        var ftyId = req.body.ftyId;
        request(Base.mergeRequestOptions({
            method: 'post',
            url: '/api/whse/warehouse',
            form:req.body,
        }, req, res), function (error, response, body) {
            if (!error && response.statusCode == 201) {
                Base.handlerSuccess(res, req);
                res.redirect("/warehouse?ftyId="+ftyId);
            } else {
                Base.handlerError(res, req, error, response, body);
            }
        })
    },

    modifyWarehousePage: function (req, res) {
        var bid = req.session.user.bid;
        var whseId =  req.params.whseId;
        Base.multiDataRequest(req, res, [
            {url: '/api/whse/warehouse/'+whseId, method: 'GET', resConfig: {keyName: 'warehouseInfo', is_must: true}},
            {url: '/api/whse/factory/list', method: 'GET', resConfig: {keyName: 'factoryList', is_must: true}},
            // {url: '/api/assist/warehouse/types', method: 'GET', resConfig: {keyName: 'warehouseTypes', is_must: true}},
            {url: '/api/roles/current/'+bid, method: 'GET', resConfig: {keyName: 'roleList', is_must: true}},
        ], function (req, res, resultList) {

            var returnData = Base.mergeData(helper.mergeObject({
                title: ' ',
            }, resultList));
            res.render('order/factory/warehouse_modify', returnData);
        });
    },
    doModifyWarehouse: function (req, res) {
        var ftyId = req.body.ftyId;
        request(Base.mergeRequestOptions({
            method: 'put',
            url: '/api/whse/warehouse/update?'+queryString.stringify(req.body),
        }, req, res), function (error, response, body) {
            if (!error && response.statusCode == 201) {
                Base.handlerSuccess(res, req);
                res.redirect("/warehouse?ftyId="+ftyId);

            } else {
                Base.handlerError(res, req, error, response, body);
            }
        })

    },

    doCloseWarehouse: function (req, res) {
        var whseId = req.params.whseId;
        request(Base.mergeRequestOptions({
            method: 'delete',
            url: '/api/whse/warehouse/'+whseId,
        }, req, res), function (error, response, body) {
            if (!error && response.statusCode == 204) {

                res.sendStatus(200);
            } else {
                Base.handlerError(res, req, error, response, body);
            }
        })

    },
    doOpenWarehouse: function (req, res) {
        var whseId = req.params.whseId;
        request(Base.mergeRequestOptions({
            method: 'put',
            url: '/api/whse/warehouse/enable/'+whseId,
        }, req, res), function (error, response, body) {
            if (!error && response.statusCode == 201) {

                res.sendStatus(200);
            } else {
                Base.handlerError(res, req, error, response, body);
            }
        })

    },

    listRegionPage: function (req, res) {
        var ftyId = req.query.ftyId;
        var whseId = req.query.whseId;
        var paramObject = helper.genPaginationQuery(req);
        Base.multiDataRequest(req, res, [
            {url: '/api/whse/region?whseId='+whseId+'&'+ queryString.stringify(req.query), method: 'GET', resConfig: {keyName: 'regionList', is_must: true}},
            {url: '/api/assist/warehouse/types', method: 'GET', resConfig: {keyName: 'warehouseTypes', is_must: true}},
            {url: '/api/whse/factory/list', method: 'GET', resConfig: {keyName: 'factoryList', is_must: true}},
            {url: '/api/whse/warehouse/list/'+ftyId, method: 'GET', resConfig: {keyName: 'warehouseList', is_must: true}},
        ], function (req, res, resultList) {

            var paginationInfo = resultList.regionList;

            var boostrapPaginator = new Pagination.TemplatePaginator(helper.genPageInfo({
                prelink: paramObject.withoutPageNo,
                current: paginationInfo.page,
                rowsPerPage: paginationInfo.pageSize,
                totalResult: paginationInfo.totalItems
            }));

            var returnData = Base.mergeData(helper.mergeObject({
                title: '',
                ftyId:ftyId,
                whseId:whseId,
                pagination: boostrapPaginator.render(),
                Permission :Permissions,
            }, resultList));

            res.render('order/factory/region', returnData);

        });

    },
    createRegionPage: function (req, res) {
        var bid = req.session.user.bid;
        var ftyId = req.params.ftyId;
        var whseId = req.params.whseId;
        Base.multiDataRequest(req, res, [
            {url: '/api/whse/factory/list', method: 'GET', resConfig: {keyName: 'factoryList', is_must: true}},
            {url: '/api/whse/warehouse/list/'+ftyId, method: 'GET', resConfig: {keyName: 'warehouseList', is_must: true}},
            {url: '/api/categories/list?parentId=0', method: 'GET', resConfig: {keyName: 'stairCategory', is_must: true}},
            {url: '/api/orders/package/packagetype', method: 'GET', resConfig: {keyName: 'assistantWarehouseType', is_must: true}},
            {url: '/api/roles/current/'+bid, method: 'GET', resConfig: {keyName: 'roleList', is_must: true}},
        ], function (req, res, resultList) {
            var returnData = Base.mergeData(helper.mergeObject({
                title: ' ',
                ftyId: ftyId,
                whseId:whseId,
            }, resultList));
            res.render('order/factory/region_create', returnData);
        });
    },
    doRegionCreate: function (req, res) {
        var ftyId = req.body.ftyId;
        var whseId = req.body.whseId;
        var cargoType = req.body.cargoType;
        if(cargoType == 1){
            var stairCategory = req.body.stairCategory;
            var secondaryCategory = req.body.secondaryCategory;
            var thirdlyCategory = req.body.thirdlyCategory;
            if(thirdlyCategory){
                req.body.regionType = thirdlyCategory;
            }else if(secondaryCategory){
                req.body.regionType = secondaryCategory;
            }else{
                req.body.regionType = stairCategory;
            }
        }else{
            req.body.regionType = req.body.packgeCode;
        }
        request(Base.mergeRequestOptions({
            method: 'post',
            url: '/api/whse/region',
            form:req.body,
        }, req, res), function (error, response, body) {
            if (!error && response.statusCode == 201) {
                Base.handlerSuccess(res, req);
                res.redirect("/region?ftyId="+ftyId+"&whseId="+whseId);
            } else {
                Base.handlerError(res, req, error, response, body);
            }
        })
    },
    modifyRegionPage: function (req, res) {
        var bid = req.session.user.bid;
        var regionId =  req.params.regionId;
        var ftyId=req.query.ftyId;
        var whseId =  req.params.whseId;
        Base.multiDataRequest(req, res, [
            {url: '/api/whse/region/'+regionId, method: 'GET', resConfig: {keyName: 'regionInfo', is_must: true}},
            {url: '/api/categories/list?parentId=0', method: 'GET', resConfig: {keyName: 'stairCategory', is_must: true}},
            {url: '/api/orders/package/packagetype', method: 'GET', resConfig: {keyName: 'assistantWarehouseType', is_must: true}},
            {url: '/api/roles/current/'+bid, method: 'GET', resConfig: {keyName: 'roleList', is_must: true}},
        ], function (req, res, resultList) {

            var returnData = Base.mergeData(helper.mergeObject({
                title: ' ',
                ftyId:ftyId,
                whseId:whseId,
            }, resultList));
            res.render('order/factory/region_modify', returnData);
        });
    },
    doModifyRegion: function (req, res) {
        var ftyId = req.body.ftyId;
        var whseId = req.body.whseId;
        var cargoType = req.body.cargoType;
        if(cargoType == 1){
            var stairCategory = req.body.stairCategory;
            var secondaryCategory = req.body.secondaryCategory;
            var thirdlyCategory = req.body.thirdlyCategory;
            if(thirdlyCategory){
                req.body.regionType = thirdlyCategory;
            }else if(secondaryCategory){
                req.body.regionType = secondaryCategory;
            }else{
                req.body.regionType = stairCategory;
            }
        }else{
            req.body.regionType = req.body.packgeCode;
        }
        request(Base.mergeRequestOptions({
            method: 'put',
            url: '/api/whse/region/update?'+queryString.stringify(req.body),
        }, req, res), function (error, response, body) {
            if (!error && response.statusCode == 201) {
                Base.handlerSuccess(res, req);
                res.redirect("/region?ftyId="+ftyId+"&whseId="+whseId);

            } else {
                Base.handlerError(res, req, error, response, body);
            }
        })

    },

    doCloseRegion: function (req, res) {
        var regionId = req.params.regionId;
        request(Base.mergeRequestOptions({
            method: 'delete',
            url: '/api/whse/region/'+regionId,
        }, req, res), function (error, response, body) {
            if (!error && response.statusCode == 204) {

                res.sendStatus(200);
            } else {
                Base.handlerError(res, req, error, response, body);
            }
        })

    },
    doOpenRegion: function (req, res) {
        var regionId = req.params.regionId;
        request(Base.mergeRequestOptions({
            method: 'put',
            url: '/api/whse/region/enable/'+regionId,
        }, req, res), function (error, response, body) {
            if (!error && response.statusCode == 201) {

                res.sendStatus(200);
            } else {
                Base.handlerError(res, req, error, response, body);
            }
        })

    },
};

module.exports = FactoryController;