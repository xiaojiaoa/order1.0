//请求代理控制器
var Base = require('./BaseController');

var Pagination = require('pagination');

var queryString = require('qs');

var helper = require('../config/helper');

var request = require('request');


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
                pagination: boostrapPaginator.render()
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
        var areaNum = req.body.areaNum;
        // var areafor = req.body.areafor;
        // var area = '';
        // if(areafor){
        //     for (var i=0;i<areaNum;i++)
        //     {
        //         area += areafor[i] +","
        //     }
        //     area = area.substring(0,area.length-1);
        //     req.body.area = area;
        // }
        console.log('whse6666'+ JSON.stringify(req.body))
        request(Base.mergeRequestOptions({
            method: 'post',
            url: '/api/whse/factory',
            form:req.body,
        }, req, res), function (error, response, body) {
            if (!error && response.statusCode == 201) {
                res.redirect("/factory");

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
console.log('555',JSON.stringify(req.body))
        request(Base.mergeRequestOptions({
            method: 'put',
            url: '/api/whse/factory/update?'+queryString.stringify(req.body),
            // form:req.body,
        }, req, res), function (error, response, body) {
            if (!error && response.statusCode == 201) {
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
// console.log('warehouse','/api/whse/warehouse?ftyId='+ftyId+'&'+ queryString.stringify(req.query))
        var paramObject = helper.genPaginationQuery(req);
        Base.multiDataRequest(req, res, [
            {url: '/api/whse/warehouse?ftyId='+ftyId+'&'+ queryString.stringify(req.query), method: 'GET', resConfig: {keyName: 'warehouseList', is_must: true}},
            {url: '/api/assist/warehouse/types', method: 'GET', resConfig: {keyName: 'warehouseTypes', is_must: true}},
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
                pagination: boostrapPaginator.render()
            }, resultList));

            res.render('order/factory/warehouse', returnData);

        });

    },
    createWarehousePage: function (req, res) {
        var ftyId = req.params.ftyId;
        Base.multiDataRequest(req, res, [
            {url: '/api/whse/factory/list', method: 'GET', resConfig: {keyName: 'factoryList', is_must: true}},
            {url: '/api/assist/warehouse/types', method: 'GET', resConfig: {keyName: 'warehouseTypes', is_must: true}},
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
                res.redirect("/warehouse?ftyId="+ftyId);
            } else {
                Base.handlerError(res, req, error, response, body);
            }
        })
    },

    modifyWarehousePage: function (req, res) {
        var whseId =  req.params.whseId;
        Base.multiDataRequest(req, res, [
            {url: '/api/whse/warehouse/'+whseId, method: 'GET', resConfig: {keyName: 'warehouseInfo', is_must: true}},
            {url: '/api/whse/factory/list', method: 'GET', resConfig: {keyName: 'factoryList', is_must: true}},
            {url: '/api/assist/warehouse/types', method: 'GET', resConfig: {keyName: 'warehouseTypes', is_must: true}},
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
                pagination: boostrapPaginator.render()
            }, resultList));

            res.render('order/factory/region', returnData);

        });

    },
    createRegionPage: function (req, res) {
        var ftyId = req.params.ftyId;
        var whseId = req.params.whseId;
        Base.multiDataRequest(req, res, [
            {url: '/api/whse/factory/list', method: 'GET', resConfig: {keyName: 'factoryList', is_must: true}},
            {url: '/api/whse/warehouse/list/'+ftyId, method: 'GET', resConfig: {keyName: 'warehouseList', is_must: true}},
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
        request(Base.mergeRequestOptions({
            method: 'post',
            url: '/api/whse/region',
            form:req.body,
        }, req, res), function (error, response, body) {
            if (!error && response.statusCode == 201) {
                res.redirect("/region?ftyId="+ftyId+"&whseId=1110"+whseId);
            } else {
                Base.handlerError(res, req, error, response, body);
            }
        })
    },
    modifyRegionPage: function (req, res) {
        var regionId =  req.params.regionId;
        Base.multiDataRequest(req, res, [
            {url: '/api/whse/region/'+regionId, method: 'GET', resConfig: {keyName: 'regionInfo', is_must: true}},
        ], function (req, res, resultList) {

            var returnData = Base.mergeData(helper.mergeObject({
                title: ' ',
            }, resultList));
            res.render('order/factory/region_modify', returnData);
        });
    },
    doModifyRegion: function (req, res) {
        var ftyId = req.body.ftyId;
        var whseId = req.body.whseId;
        request(Base.mergeRequestOptions({
            method: 'put',
            url: '/api/whse/region/update?'+queryString.stringify(req.body),
        }, req, res), function (error, response, body) {
            if (!error && response.statusCode == 201) {
                res.redirect("/region/"+ftyId+'/'+whseId);

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