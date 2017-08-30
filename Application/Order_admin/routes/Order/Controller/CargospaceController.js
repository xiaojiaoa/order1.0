//请求代理控制器
var Base = require('./BaseController');

var Pagination = require('pagination');

var queryString = require('qs');

var helper = require('../config/helper');

var request = require('request');

//引入权限
var Permissions = require('../config/permission');

var CargospaceController = {
    unlistPage: function (req, res) {
        Base.multiDataRequest(req, res, [
            {url: '/api/whse/factory/list', method: 'GET', resConfig: {keyName: 'factoryList', is_must: true}},
        ], function (req, res, resultList) {
            var returnData = Base.mergeData(helper.mergeObject({
                title: '',
                Permission :Permissions,
            }, resultList));
            res.render('order/cargospace/index_unselect', returnData);
        });
    },
    getFactory: function (req, res) {
        request(Base.mergeRequestOptions({
            method: 'GET',
            url: '/api/whse/factory/list',
        }, req, res), function (error, response, body) {
            if (!error && response.statusCode == 200) {
                res.status(200).json(body)

            } else {
                Base.handlerError(res, req, error, response, body);
            }
        })

    },
    getWarehouse: function (req, res) {
        var ftyId = req.params.ftyId;

        request(Base.mergeRequestOptions({
            method: 'GET',
            url: '/api/whse/warehouse/list/'+ftyId,
        }, req, res), function (error, response, body) {
            if (!error && response.statusCode == 200) {
                // Base.handlerSuccess(res, req);
                // res.sendStatus(200);
                res.status(200).json(body)

            } else {
                Base.handlerError(res, req, error, response, body);
            }
        })

    },
    getWarehousePerm: function (req, res) {
        var ftyId = req.params.ftyId;

        request(Base.mergeRequestOptions({
            method: 'GET',
            url: '/api/whse/warehouse/list/perm/'+ftyId,
        }, req, res), function (error, response, body) {
            if (!error && response.statusCode == 200) {
                // Base.handlerSuccess(res, req);
                // res.sendStatus(200);
                res.status(200).json(body)

            } else {
                Base.handlerError(res, req, error, response, body);
            }
        })

    },
    getRegion: function (req, res) {
        var whseId = req.params.whseId;
        //console.log('/region/list','/api/whse/region/list/'+whseId+'?'+queryString.stringify(req.query))
        request(Base.mergeRequestOptions({
            method: 'GET',
            url: '/api/whse/region/list/'+whseId+'?'+queryString.stringify(req.query),
        }, req, res), function (error, response, body) {
            if (!error && response.statusCode == 200) {
                // Base.handlerSuccess(res, req);
                res.status(200).json(body)
            } else {
                Base.handlerError(res, req, error, response, body);
            }
        })

    },
    getRegionPerm: function (req, res) {
        var whseId = req.params.whseId;
        request(Base.mergeRequestOptions({
            method: 'GET',
            url: '/api/whse/region/list/perm/'+whseId+'?'+queryString.stringify(req.query),
        }, req, res), function (error, response, body) {
            if (!error && response.statusCode == 200) {
                // Base.handlerSuccess(res, req);
                res.status(200).json(body)
            } else {
                Base.handlerError(res, req, error, response, body);
            }
        })

    },
    listPage: function (req, res) {
        var ftyId = req.query.ftyId;
        var whseId = req.query.whseId;
        var regionId = req.query.regionId;
        var paramObject = helper.genPaginationQuery(req);
        //console.log('/api/whse/cargospace?'+ queryString.stringify(req.query))
        Base.multiDataRequest(req, res, [
            {url: '/api/whse/cargospace?'+ queryString.stringify(req.query), method: 'GET', resConfig: {keyName: 'cargospaceList', is_must: true}},
            {url: '/api/whse/factory/list', method: 'GET', resConfig: {keyName: 'factoryList', is_must: true}},
            {url: '/api/whse/warehouse/list/'+ftyId, method: 'GET', resConfig: {keyName: 'warehouseList', is_must: true}},
            {url: '/api/whse/region/list/'+whseId, method: 'GET', resConfig: {keyName: 'regionList', is_must: true}},
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
                ftyId:ftyId,
                whseId:whseId,
                regionId:regionId,
                pagination: boostrapPaginator.render(),
                Permission :Permissions,
            }, resultList));

            res.render('order/cargospace/index', returnData);

        });

    },
    createPage: function (req, res) {
        Base.multiDataRequest(req, res, [
            {url: '/api/whse/factory/list', method: 'GET', resConfig: {keyName: 'factoryList', is_must: true}},
        ], function (req, res, resultList) {
            var returnData = Base.mergeData(helper.mergeObject({
                title: ' ',
            }, resultList));
            res.render('order/cargospace/create_first', returnData);
        });
    },
    doNext: function (req, res) {
        var ftyId = req.body.ftyId;
        var whseId = req.body.whseId;
        var regionId = req.body.regionId;
        res.redirect("/cargospace/createNext/"+ftyId+"/"+whseId+"/"+regionId);
    },

    createNextPage: function (req, res) {
        var ftyId = req.params.ftyId;
        var whseId = req.params.whseId;
        var regionId = req.params.regionId;
        Base.multiDataRequest(req, res, [
            {url: '/api/whse/region/'+regionId, method: 'GET', resConfig: {keyName: 'regionInfo', is_must: true}},
        ], function (req, res, resultList) {
            var returnData = Base.mergeData(helper.mergeObject({
                title: ' ',
                ftyId: ftyId,
                whseId: whseId,
                regionId: regionId,
            }, resultList));
            res.render('order/cargospace/create-next', returnData);
        });
    },

    doCreate: function (req, res) {
        var ftyId = req.body.ftyId;
        var whseId = req.body.whseId;
        var regionId = req.body.regionId;
        var createType = req.body.create;
        //console.log('/api/whse/warehouse'+ JSON.stringify(req.body))
        request(Base.mergeRequestOptions({
            method: 'post',
            url: '/api/whse/cargospace',
            form:req.body,
        }, req, res), function (error, response, body) {
            if (!error && response.statusCode == 201) {
                Base.handlerSuccess(res, req);
                // var lid = JSON.parse(body).lid;
                if(createType == 2){
                    res.redirect("/cargospace/createNext/"+ftyId+"/"+whseId+"/"+regionId);

                }else{
                    res.redirect("/cargospace?isAll=1&ftyId="+ftyId+"&whseId="+whseId+"&regionId="+regionId);
                }

            } else {
                Base.handlerError(res, req, error, response, body);
            }
        })
    },
    detailPage: function (req, res) {
        var spaceId =  req.params.spaceId;
        var type =  req.params.type;

        var paramObject = helper.genPaginationQuery(req);
        Base.multiDataRequest(req, res, [
            {url: '/api/whse/cargospace/'+spaceId, method: 'GET', resConfig: {keyName: 'cargospaceInfo', is_must: true}},
            {url: '/api/whse/cargospace/page/index/'+spaceId, method: 'GET', resConfig: {keyName: 'cargospaceList', is_must: true}},
        ], function (req, res, resultList) {
            var paginationInfo = resultList.cargospaceList;

            var boostrapPaginator = new Pagination.TemplatePaginator(helper.genPageInfo({
                prelink: paramObject.withoutPageNo,
                current: paginationInfo.page,
                rowsPerPage: paginationInfo.pageSize,
                totalResult: paginationInfo.totalItems
            }));


            var returnData = Base.mergeData(helper.mergeObject({
                title: ' ',
                type: type,
                pagination: boostrapPaginator.render(),
            }, resultList));
            res.render('order/cargospace/detail', returnData);
        });
    },


    modifyPage: function (req, res) {
        var spaceId =  req.params.spaceId;
        Base.multiDataRequest(req, res, [
            {url: '/api/whse/cargospace/'+spaceId, method: 'GET', resConfig: {keyName: 'cargospaceInfo', is_must: true}},
        ], function (req, res, resultList) {

            var returnData = Base.mergeData(helper.mergeObject({
                title: ' ',
            }, resultList));
            res.render('order/cargospace/modify', returnData);
        });
    },
    doModify: function (req, res) {
        var spaceId =  req.body.spaceId;
        request(Base.mergeRequestOptions({
            method: 'put',
            url: '/api/whse/cargospace/update?'+queryString.stringify(req.body),
            // form:req.body,
        }, req, res), function (error, response, body) {
            if (!error && response.statusCode == 201) {
                Base.handlerSuccess(res, req);
                // var lid = JSON.parse(body).lid;
                res.redirect("/cargospace/cargospace/detail/"+spaceId);

            } else {
                Base.handlerError(res, req, error, response, body);
            }
        })

    },


    doClose: function (req, res) {
        var spaceId = req.params.spaceId;
        request(Base.mergeRequestOptions({
            method: 'delete',
            url: '/api/whse/cargospace/'+spaceId,
        }, req, res), function (error, response, body) {
            if (!error && response.statusCode == 204) {

                res.sendStatus(200);
            } else {
                Base.handlerError(res, req, error, response, body);
            }
        })

    },
    doOpen: function (req, res) {
        var spaceId = req.params.spaceId;
        request(Base.mergeRequestOptions({
            method: 'put',
            url: '/api/whse/cargospace/enable/'+spaceId,
        }, req, res), function (error, response, body) {
            if (!error && response.statusCode == 201) {

                res.sendStatus(200);
            } else {
                Base.handlerError(res, req, error, response, body);
            }
        })

    },


};

module.exports = CargospaceController;