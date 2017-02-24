//请求代理控制器
var Base = require('./BaseController');

var Pagination = require('pagination');

var queryString = require('qs');

var helper = require('../config/helper');

var request = require('request');


var CargospaceController = {
    unlistPage: function (req, res) {
        Base.multiDataRequest(req, res, [
            {url: '/api/whse/factory/list', method: 'GET', resConfig: {keyName: 'factoryList', is_must: true}},
        ], function (req, res, resultList) {
            var returnData = Base.mergeData(helper.mergeObject({
                title: '',
            }, resultList));
            res.render('order/cargospace/index_unselect', returnData);
        });
    },
    getWarehouse: function (req, res) {
        var ftyId = req.params.ftyId;

        request(Base.mergeRequestOptions({
            method: 'GET',
            url: '/api/whse/warehouse/list/'+ftyId,
        }, req, res), function (error, response, body) {
            if (!error && response.statusCode == 200) {
                // res.sendStatus(200);
                res.status(200).json(body)

            } else {
                Base.handlerError(res, req, error, response, body);
            }
        })

    },
    getRegion: function (req, res) {
        var whseId = req.params.whseId;
        request(Base.mergeRequestOptions({
            method: 'GET',
            url: '/api/whse/region/list/'+whseId,
        }, req, res), function (error, response, body) {
            if (!error && response.statusCode == 200) {
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
                pagination: boostrapPaginator.render()
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
        Base.multiDataRequest(req, res, [
            {url: '/api/organizations/factory', method: 'GET', resConfig: {keyName: 'factoryList', is_must: true}},
        ], function (req, res, resultList) {
            var returnData = Base.mergeData(helper.mergeObject({
                title: ' ',
            }, resultList));
            res.render('order/cargospace/create-next', returnData);
        });
    },

    doCreate: function (req, res) {
        // var type = req.body.type;
        // var bid = req.body.bid;
        // var roles = req.body.roles;
        // var role ="";
        // if(roles&&(typeof roles == 'object')){
        //     for (var i=0;i<roles.length;i++)
        //     {
        //         role += roles[i] +","
        //     }
        //     role = role.substring(0,role.length-1);
        //     req.body.roles = role;
        // }
        var name = req.body.name;
        req.body.name = [{name:'a' , value:666},{name:'b' , value:666}]
        console.log('employees999'+ JSON.stringify(req.body))
        request(Base.mergeRequestOptions({
            method: 'post',
            url: '/api/employees',
            form:req.body,
        }, req, res), function (error, response, body) {
            if (!error && response.statusCode == 201) {
                // var lid = JSON.parse(body).lid;
                res.redirect("/"+type+"/employees?bid="+bid);

            } else {
                Base.handlerError(res, req, error, response, body);
            }
        })
    },
    detailPage: function (req, res) {
        var spaceId =  req.params.spaceId;
        Base.multiDataRequest(req, res, [
            {url: '/api/whse/cargospace/'+spaceId, method: 'GET', resConfig: {keyName: 'cargospaceInfo', is_must: true}},
        ], function (req, res, resultList) {

            var returnData = Base.mergeData(helper.mergeObject({
                title: ' ',
            }, resultList));
            res.render('order/cargospace/detail', returnData);
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

    setStatus: function (req, res) {
        var ftyId = req.params.ftyId;
        var type = req.params.type;
        var apiUrl = (bidtype == 'stores')? '/api/stores/employees/stcode/' : '/api/employees/stcode/' ;
        // console.log('cid'+cid+'--type'+type)
        request(Base.mergeRequestOptions({
            method: 'put',
            url: apiUrl+cid+'?stcode='+type,
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