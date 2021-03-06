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


var EnterController = {

    enterMaterialPage: function (req, res) {
        // console.log('user_session9999',req.session.user.ftyId)
        var ftyId = req.query.ftyId ? req.query.ftyId: req.session.user.ftyId;
        var whseId = req.query.whseId;
        // var regionId = req.query.regionId;
        // console.log('ftyId:'+ftyId+'whseId:'+whseId+'regionId:'+regionId);
        var multiDataRequest= [
            {url: '/api/whse/cargoin/mate/page?'+queryString.stringify(req.query), method: 'GET', resConfig: {keyName: 'mateList', is_must: false}},
            {url: '/api/whse/factory/list', method: 'GET', resConfig: {keyName: 'factoryList', is_must: true}},
        ];
        if(ftyId){
            // console.log('有whseId');
            multiDataRequest= [
                {url: '/api/whse/cargoin/mate/page?'+queryString.stringify(req.query), method: 'GET', resConfig: {keyName: 'mateList', is_must: false}},
                {url: '/api/whse/factory/list', method: 'GET', resConfig: {keyName: 'factoryList', is_must: true}},
                {url: '/api/whse/warehouse/list/'+ftyId, method: 'GET', resConfig: {keyName: 'warehouseList', is_must: true}},
            ];
        }
        if(whseId){
            // console.log('有whseId');
            multiDataRequest= [
                {url: '/api/whse/cargoin/mate/page?'+queryString.stringify(req.query), method: 'GET', resConfig: {keyName: 'mateList', is_must: false}},
                {url: '/api/whse/factory/list', method: 'GET', resConfig: {keyName: 'factoryList', is_must: true}},
                {url: '/api/whse/warehouse/list/'+ftyId, method: 'GET', resConfig: {keyName: 'warehouseList', is_must: true}},
                {url: '/api/whse/region/list/'+whseId, method: 'GET', resConfig: {keyName: 'regionList', is_must: true}},
            ];
        }
        var paramObject = helper.genPaginationQuery(req);
        Base.multiDataRequest(req, res, multiDataRequest,
            function (req, res, resultList) {
                var paginationInfo =  resultList.mateList;

                var boostrapPaginator = new Pagination.TemplatePaginator(helper.genPageInfo({
                    prelink: paramObject.withoutPageNo,
                    current: paginationInfo.page,
                    rowsPerPage: paginationInfo.pageSize,
                    totalResult: paginationInfo.totalItems
                }));
                if(!ftyId){
                    resultList.warehouseList = [];
                }
                if(!whseId){
                    resultList.regionList = [];
                }

                var returnData = Base.mergeData(helper.mergeObject({
                    title: ' ',
                    userFtyId: ftyId,
                    pagination: boostrapPaginator.render(),
                    Permission :Permissions,
                }, resultList));
                res.render('order/enter/enter_material', returnData);
            });

    },
    enterMaterialDetailPage: function (req, res) {
        var id =  req.params.id;
        Base.multiDataRequest(req, res, [
                {url: '/api/whse/cargoin/mate/inlist?inId='+ id, method: 'GET', resConfig: {keyName: 'mateInfo', is_must: true}},
                {url: '/api/whse/cargoin/mate/inlist/page?inId='+ id, method: 'GET', resConfig: {keyName: 'inlistInfo', is_must: true}},
            ],
            function (req, res, resultList) {
                var returnData = Base.mergeData(helper.mergeObject({
                    title: ' ',
                    id:id,
                }, resultList));
                res.render('order/enter/enter_material_detail', returnData);

            });
    },
    doPassMaterial: function (req, res) {
        var inId = req.params.inId;
        var purId = req.params.purId;
        var stcode = req.params.stcode;
        var inMode = req.params.inMode;
        if(purId == undefined) purId='';
        request(Base.mergeRequestOptions({
            method: 'put',
            url: '/api/whse/cargoin/mate/review?inId='+inId+'&purIdS='+purId+'&stcode='+stcode+'&inMode='+inMode
        }, req, res), function (error, response, body) {
            if (!error && response.statusCode == 201) {

                res.sendStatus(200);
            } else {
                Base.handlerError(res, req, error, response, body);
            }
        })

    },
    notPassMaterial: function (req, res) {
        var id = req.params.id;
        request(Base.mergeRequestOptions({
            method: 'put',
            url: '/api/orders/review/getTask/'+id,
        }, req, res), function (error, response, body) {
            if (!error && response.statusCode == 201) {

                res.sendStatus(200);
            } else {
                Base.handlerError(res, req, error, response, body);
            }
        })

    },
    stockOverPage: function (req, res){
        request(Base.mergeRequestOptions({
            method: 'GET',
            url: '/api/purchase/reqmaterial/purchase?'+queryString.stringify(req.query)
        }, req, res), function (error, response, body) {
            if (!error && response.statusCode == 200) {
                var returnData = JSON.parse(body);
                res.render('order/enter/enter_material_stock',returnData);
            } else {
                Base.handlerError(res, req, error, response, body);
            }
        });
    },
    stockEnterPage: function (req, res){
        var id = req.query.purcId;
        var paramObject = helper.genPaginationQuery(req);
        Base.multiDataRequest(req, res, [
                {url: '/api/purchase/reqmaterial/purchase/cargoin?'+queryString.stringify(req.query), method: 'GET', resConfig: {keyName: 'cargoinList', is_must: false}},
                {url: '/api/whse/factory/list', method: 'GET', resConfig: {keyName: 'factoryList', is_must: true}},
            ],
            function (req, res, resultList) {
                var paginationInfo =  resultList.cargoinList;

                var boostrapPaginator = new Pagination.TemplatePaginator(helper.genPageInfo({
                    prelink: paramObject.withoutPageNo,
                    current: paginationInfo.page,
                    rowsPerPage: paginationInfo.pageSize,
                    totalResult: paginationInfo.totalItems
                }));

                var returnData = Base.mergeData(helper.mergeObject({
                    title: ' ',
                    pid:id,
                    pagination: boostrapPaginator.render(),
                    Permission :Permissions,
                }, resultList));
                res.render('order/enter/stock_enter', returnData);
            });

    },
    ifCanEnter: function (req, res) {
        // console.log('/api/whse/cargoin/mate/usable?'+queryString.stringify(req.body))
        request(Base.mergeRequestOptions({
            method: 'get',
            url: '/api/whse/cargoin/mate/usable?'+queryString.stringify(req.body),
        }, req, res), function (error, response, body) {
            if (!error && response.statusCode == 200) {
                res.status(200).json(body);
            } else {
                res.status(500).json(body.responseJSON)
                // res.status(500).send({code: code, msg: msg});
            }
        })

    },
    findWhse: function (req, res) {
        // console.log('findWhse'+JSON.stringify(req.body))
        request(Base.mergeRequestOptions({
            method: 'post',
            url: '/api/whse/cargoin/prod/notin/find',
            form: req.body
        }, req, res), function (error, response, body) {
            if (!error && response.statusCode == 200) {
                res.status(200).json(body);
            } else {
                res.status(500).json(body)
            }
        })

    },
    doEnter: function (req, res) {
        // var num = req.body.num0;
        // console.log('doEnter',JSON.stringify(req.body))
        request(Base.mergeRequestOptions({
            method: 'post',
            url: '/api/whse/cargoin/mate',
            headers:{'Content-type':'application/json'},
            body:JSON.stringify(req.body),
        }, req, res), function (error, response, body) {
            if (!error && response.statusCode == 201) {
                res.sendStatus(200);
            } else {
                Base.handlerError(res, req, error, response, body);
            }
        })
    },
    reqmaterialModify: function (req, res) {
        // var num = req.body.num0;
        // console.log('doEnterreqmaterial',JSON.stringify(req.body))
        request(Base.mergeRequestOptions({
            method: 'post',
            url: '/api/purchase/reqmaterial/money',
            headers:{'Content-type':'application/json'},
            body:JSON.stringify(req.body),
        }, req, res), function (error, response, body) {
            if (!error && response.statusCode == 201) {

                res.sendStatus(200);
            } else {
                Base.handlerError(res, req, error, response, body);
            }
        })


    },
    getEmptyOne: function (req, res) {
        // console.log('getEmptyOne'+JSON.stringify(req.body))
        request(Base.mergeRequestOptions({
            method: 'post',
            url: '/api/whse/cargoin/mate/cargospace/empty',
            form: req.body
        }, req, res), function (error, response, body) {
            if (!error && response.statusCode == 200) {
                res.status(200).json(body);
            } else {
                res.status(500).json(body)
            }
        })

    },
    enterProductPage: function (req, res){
        var ftyId = req.query.ftyId ? req.query.ftyId: req.session.user.ftyId;
        var whseId = req.query.whseId;
        var multiDataRequest= [
            {url: '/api/whse/cargoin/prod/page?'+queryString.stringify(req.query), method: 'GET', resConfig: {keyName: 'prodList', is_must: false}},
            {url: '/api/whse/factory/list', method: 'GET', resConfig: {keyName: 'factoryList', is_must: true}},
        ];
        if(ftyId){
            // console.log('有whseId');
            multiDataRequest= [
                {url: '/api/whse/cargoin/prod/page?'+queryString.stringify(req.query), method: 'GET', resConfig: {keyName: 'prodList', is_must: false}},
                {url: '/api/whse/factory/list', method: 'GET', resConfig: {keyName: 'factoryList', is_must: true}},
                {url: '/api/whse/warehouse/list/'+ftyId, method: 'GET', resConfig: {keyName: 'warehouseList', is_must: true}},
            ];
        }
        if(whseId){
            // console.log('有whseId');
            multiDataRequest= [
                {url: '/api/whse/cargoin/prod/page?'+queryString.stringify(req.query), method: 'GET', resConfig: {keyName: 'prodList', is_must: false}},
                {url: '/api/whse/factory/list', method: 'GET', resConfig: {keyName: 'factoryList', is_must: true}},
                {url: '/api/whse/warehouse/list/'+ftyId, method: 'GET', resConfig: {keyName: 'warehouseList', is_must: true}},
                {url: '/api/whse/region/list/'+whseId, method: 'GET', resConfig: {keyName: 'regionList', is_must: true}},
            ];
        }

        var paramObject = helper.genPaginationQuery(req);
        Base.multiDataRequest(req, res, multiDataRequest,
            function (req, res, resultList) {
                var paginationInfo =  resultList.prodList;

                var boostrapPaginator = new Pagination.TemplatePaginator(helper.genPageInfo({
                    prelink: paramObject.withoutPageNo,
                    current: paginationInfo.page,
                    rowsPerPage: paginationInfo.pageSize,
                    totalResult: paginationInfo.totalItems
                }));
                if(!ftyId){
                    resultList.warehouseList = [];
                }
                if(!whseId){
                    resultList.regionList = [];
                }
                var returnData = Base.mergeData(helper.mergeObject({
                    title: ' ',
                    userFtyId: ftyId,
                    pagination: boostrapPaginator.render(),
                    Permission :Permissions,
                }, resultList));
                res.render('order/enter/enter_product', returnData);
            });
    },
    enterProductDetailPage: function (req, res){
        var id =  req.params.id;
        var paramObject = helper.genPaginationQuery(req);
        Base.multiDataRequest(req, res, [
                {url: '/api/whse/cargoin/prod/inlist/page?inId='+ id+'&'+queryString.stringify(req.query), method: 'GET', resConfig: {keyName: 'inlistInfo', is_must: true}},
                {url: '/api/whse/cargoin/prod/inlist?inId='+ id, method: 'GET', resConfig: {keyName: 'inlistPageInfo', is_must: true}},
            ],
            function (req, res, resultList) {
                var paginationInfo =  resultList.inlistInfo;
                var boostrapPaginator = new Pagination.TemplatePaginator(helper.genPageInfo({
                    prelink: paramObject.withoutPageNo,
                    current: paginationInfo.page,
                    rowsPerPage: paginationInfo.pageSize,
                    totalResult: paginationInfo.totalItems
                }));


                var returnData = Base.mergeData(helper.mergeObject({
                    title: ' ',
                    pagination: boostrapPaginator.render(),
                    id:id,
                }, resultList));
                res.render('order/enter/enter_product_detail', returnData);

            });
    },
    enterNotinPage: function (req, res){
        var type = req.query.type;
        if(!type){type='';}
        var paramObject = helper.genPaginationQuery(req);
        Base.multiDataRequest(req, res, [
                {url: '/api/whse/cargoin/prod/notin/page?'+queryString.stringify(req.query), method: 'GET', resConfig: {keyName: 'cargoinList', is_must: false}},
                {url: '/api/whse/factory/list', method: 'GET', resConfig: {keyName: 'factoryList', is_must: true}},
                {url: '/api/whse/cargoin/prod/packagetype?'+queryString.stringify(req.query), method: 'GET', resConfig: {keyName: 'packageType', is_must: true}},
            ],
            function (req, res, resultList) {
                // typeId 不存在，从菜单栏点击进入页面时
                if(resultList.packageType && resultList.packageType.length>0){
                    if(!type){
                        type = resultList.packageType[0].id;
                        return  res.redirect("/enterProduct/notin?type="+type);
                    }
                }

                var paginationInfo =  resultList.cargoinList.page;

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
                }, resultList));
                res.render('order/enter/enter_product_scanning', returnData);
            });
    },
    doEnterProduct: function (req, res) {
        var id = req.params.id;
        request(Base.mergeRequestOptions({
            method: 'put',
            url: '/api/orders/review/getTask/'+id,
        }, req, res), function (error, response, body) {
            if (!error && response.statusCode == 201) {

                res.sendStatus(200);
            } else {
                Base.handlerError(res, req, error, response, body);
            }
        })

    },

    selectMatePage: function (req, res){
        var paramObject = helper.genPaginationQuery(req);
        var bid = req.query.bid? req.query.bid: req.session.user.bid;
        Base.multiDataRequest(req, res, [
                {url: '/api/categories/list/usable', method: 'GET', resConfig: {keyName: 'suppliersMaterialList', is_must: true}},
                {url: '/api/materials?'+(queryString.stringify(req.query)), method: 'GET', resConfig: {keyName: 'supMaterialList', is_must: true}},
                {url: '/api/whse/factory/list', method: 'GET', resConfig: {keyName: 'factoryList', is_must: true}},
                {url: '/api/assist/cargo/inmode', method: 'GET', resConfig: {keyName: 'inMode', is_must: true}},

            ],
            function (req, res, resultList) {
                var paginationInfo =  resultList.supMaterialList;
                var boostrapPaginator = new Pagination.TemplatePaginator(helper.genPageInfo({
                    prelink: paramObject.withoutPageNo,
                    current: paginationInfo.page,
                    rowsPerPage: paginationInfo.pageSize,
                    totalResult: paginationInfo.totalItems
                }));

                var returnData = Base.mergeData(helper.mergeObject({
                    title: ' ',
                    Permission :Permissions,
                    pagination: boostrapPaginator.render(),
                    bid:bid,
                }, resultList));
                res.render('order/enter/select_mate_enter', returnData);
            });
    },



};

module.exports = EnterController;

