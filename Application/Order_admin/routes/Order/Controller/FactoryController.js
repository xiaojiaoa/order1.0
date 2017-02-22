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

    ifHaved: function (req, res) {
        var mobile =  req.params.mobile;
        request(Base.mergeRequestOptions({
            method: 'get',
            url: '/api/employees?mobile='+mobile,
        }, req, res), function (error, response, body) {
            if (!error && response.statusCode == 200) {
                if(body){
                    var $data = JSON.parse(body);
                    // res.redirect("/customer/detail/"+custInfo.cid);
                    res.send($data);
                }
            }
        })
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
        var cid = req.body.cid;
        var roles = req.body.roles;
        var role ="";
        if(roles&&(typeof roles == 'object')){
            for (var i=0;i<roles.length;i++)
            {
                role += roles[i] +","
            }
            role = role.substring(0,role.length-1);
            req.body.roles = role;
        }

        request(Base.mergeRequestOptions({
            method: 'put',
            url: '/api/employees/'+cid+"?"+queryString.stringify(req.body),
            // form:req.body,
        }, req, res), function (error, response, body) {
            if (!error && response.statusCode == 201) {
                // var lid = JSON.parse(body).lid;
                res.redirect("/employees/detail/"+cid);

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
        var paramObject = helper.genPaginationQuery(req);
        Base.multiDataRequest(req, res, [
            {url: '/api/whse/warehouse?'+ queryString.stringify(req.query), method: 'GET', resConfig: {keyName: 'warehouseList', is_must: true}},
            {url: '/api/assist/warehouse/types', method: 'GET', resConfig: {keyName: 'warehouseTypes', is_must: true}},
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
                pagination: boostrapPaginator.render()
            }, resultList));

            res.render('order/factory/warehouse', returnData);

        });

    },
    createWarehousePage: function (req, res) {
        Base.multiDataRequest(req, res, [
            {url: '/api/organizations/factory', method: 'GET', resConfig: {keyName: 'organizationsList', is_must: true}},
            {url: '/api/assist/warehouse/types', method: 'GET', resConfig: {keyName: 'warehouseTypes', is_must: true}},
        ], function (req, res, resultList) {
            var returnData = Base.mergeData(helper.mergeObject({
                title: ' ',
            }, resultList));
            res.render('order/factory/warehouse_create', returnData);
        });
    },
    doWarehouseCreate: function (req, res) {
        // Base.multiDataRequest(req, res, [
        //     {url: '/api/organizations/page', method: 'GET', resConfig: {keyName: 'organizationsList', is_must: true}},
        //     {url: '/api/assist/warehouse/types', method: 'GET', resConfig: {keyName: 'warehouseTypes', is_must: true}},
        // ], function (req, res, resultList) {
        //     var returnData = Base.mergeData(helper.mergeObject({
        //         title: ' ',
        //     }, resultList));
        //     res.render('order/factory/warehouse_create', returnData);
        // });
    },
    listFacWarehousePage: function (req, res) {
        var ftyId = req.params.ftyId;
        Base.multiDataRequest(req, res, [
            {url: '/api/whse/warehouse/list/'+ ftyId, method: 'GET', resConfig: {keyName: 'warehouseList', is_must: true}},
            {url: '/api/assist/warehouse/types', method: 'GET', resConfig: {keyName: 'warehouseTypes', is_must: true}},
        ], function (req, res, resultList) {
            var returnData = Base.mergeData(helper.mergeObject({
                title: '',
                typePage: 'all',
            }, resultList));
            res.render('order/factory/warehouse', returnData);

        });

    },
    listRegionPage: function (req, res) {
        var paramObject = helper.genPaginationQuery(req);
        Base.multiDataRequest(req, res, [
            {url: '/api/whse/region?'+ queryString.stringify(req.query), method: 'GET', resConfig: {keyName: 'regionList', is_must: true}},
            {url: '/api/assist/warehouse/types', method: 'GET', resConfig: {keyName: 'warehouseTypes', is_must: true}},
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
                pagination: boostrapPaginator.render()
            }, resultList));

            res.render('order/factory/region', returnData);

        });

    },
    createRegionPage: function (req, res) {
        res.render('order/factory/region_create');
        // Base.multiDataRequest(req, res, [
        //     {url: '/api/organizations/factory', method: 'GET', resConfig: {keyName: 'organizationsList', is_must: true}},
        //     {url: '/api/assist/warehouse/types', method: 'GET', resConfig: {keyName: 'warehouseTypes', is_must: true}},
        // ], function (req, res, resultList) {
        //     var returnData = Base.mergeData(helper.mergeObject({
        //         title: ' ',
        //     }, resultList));
        //     res.render('order/factory/warehouse_create', returnData);
        // });
    },
    doRegionCreate: function (req, res) {

    },
};

module.exports = FactoryController;