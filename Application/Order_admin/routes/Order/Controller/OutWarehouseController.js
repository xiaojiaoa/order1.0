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


var OutWarehouseController = {

    waitSendPage: function (req, res) {
        var paramObject = helper.genPaginationQuery(req);
        Base.multiDataRequest(req, res, [
                {url: '/api/whse/cargout/delivery/page?'+queryString.stringify(req.query), method: 'GET', resConfig: {keyName: 'deliveryList', is_must: false}},
                {url: '/api/assist/taskseq/status', method: 'GET', resConfig: {keyName: 'statusInfo', is_must: false}},
            ],
            function (req, res, resultList) {
                var paginationInfo =  resultList.deliveryList;

                var boostrapPaginator = new Pagination.TemplatePaginator(helper.genPageInfo({
                    prelink: paramObject.withoutPageNo,
                    current: paginationInfo.page,
                    rowsPerPage: paginationInfo.pageSize,
                    totalResult: paginationInfo.totalItems
                }));

                var returnData = Base.mergeData(helper.mergeObject({
                    title: ' ',
                    pagination: boostrapPaginator.render(),
                }, resultList));
                res.render('order/shipments/wait_send', returnData);
            });

    },
    deliveryTidList:function(req,res){
        var lid = req.params.lid;
        // 添加模板文件
        var path = req.app.get('views') + '/order/shipments/deliver_tid.ejs';
        var template = require(path);


        request(Base.mergeRequestOptions({
            url: '/api/whse/cargout/delivery/list/' + lid,
            method: 'get',
            timeout: 5000
        }, req, res), function (error, response, body) {
            if (!error && response.statusCode == 200) {
                // 编译模板
                var data = JSON.parse(body);
                data = {result:data};
                var listHtml = template(data);
                res.send({
                    listHtml:listHtml
                });
            } else {
                Base.handlerError(res, req, error, response, body);
            }
        });


    },
    doDelivery: function (req, res) {
        var totalNum = req.body.totalNum;
        var tids = req.body.list;
        var tyoeof = typeof tids;
        if(tyoeof == 'string'){
            req.body.list =  [tids];
            req.body.noInNum = totalNum-1
        }else{
            var length = tids.length;
            req.body.noInNum = totalNum-length
        }
        // console.log('stringify',JSON.stringify(req.body));
        request(Base.mergeRequestOptions({
            method: 'post',
            url: '/api/whse/cargout/delivery',
            headers:{'Content-type':'application/json'},
            body:JSON.stringify(req.body),
        }, req, res), function (error, response, body) {
            if (!error && response.statusCode == 201) {
                res.redirect("/deliveryNote");
            } else {
                Base.handlerError(res, req, error, response, body);
            }
        })

    },
    deliveryNotePage: function (req, res) {
        var paramObject = helper.genPaginationQuery(req);
        Base.multiDataRequest(req, res, [
                {url: '/api/whse/cargout/delivery/notice/page?'+queryString.stringify(req.query), method: 'GET', resConfig: {keyName: 'deliveryNotice', is_must: false}},
            ],
            function (req, res, resultList) {
                var paginationInfo =  resultList.deliveryNotice;

                var boostrapPaginator = new Pagination.TemplatePaginator(helper.genPageInfo({
                    prelink: paramObject.withoutPageNo,
                    current: paginationInfo.page,
                    rowsPerPage: paginationInfo.pageSize,
                    totalResult: paginationInfo.totalItems
                }));

                var returnData = Base.mergeData(helper.mergeObject({
                    title: ' ',
                    pagination: boostrapPaginator.render(),
                }, resultList));
                res.render('order/shipments/deliver_note', returnData);
            });

    },
    doDeliveryChecked: function (req, res) {
        var id = req.params.id;
        request(Base.mergeRequestOptions({
            method: 'post',
            url: '/api/whse/cargout/delivery/notice/review/'+id,
        }, req, res), function (error, response, body) {
            if (!error && response.statusCode == 200) {
                res.sendStatus(200);
            } else {
                Base.handlerError(res, req, error, response, body);
            }
        })
    },
    deliveryNoteDeatil: function (req, res) {
        var id = req.params.id;
        Base.multiDataRequest(req, res, [
                {url: '/api/whse/cargout/delivery/notice/page?diId='+id, method: 'GET', resConfig: {keyName: 'deliveryInfo', is_must: false}},
                {url: '/api/whse/cargout/delivery/notice/list/'+id, method: 'GET', resConfig: {keyName: 'deliveryInfoList', is_must: false}},
            ],
            function (req, res, resultList) {
                resultList.deliveryInfo = resultList.deliveryInfo.result[0];
                var returnData = Base.mergeData(helper.mergeObject({
                    title: ' ',
                }, resultList));
                res.render('order/shipments/deliver_detail', returnData);
            });

    },
    outMaterialPage: function (req, res) {
        var ftyId = req.query.ftyId ? req.query.ftyId: req.session.user.ftyId;
        var paramObject = helper.genPaginationQuery(req);
        Base.multiDataRequest(req, res, [
            {url: '/api/whse/cargout/mates?'+ queryString.stringify(req.query), method: 'GET', resConfig: {keyName: 'matesList', is_must: true}},
            {url: '/api/whse/factory/list', method: 'GET', resConfig: {keyName: 'factoryList', is_must: true}},
            {url: '/api/whse/warehouse/list/'+ftyId, method: 'GET', resConfig: {keyName: 'warehouseList', is_must: true}},
        ], function (req, res, resultList) {

            var paginationInfo =  resultList.matesList;

            var boostrapPaginator = new Pagination.TemplatePaginator(helper.genPageInfo({
                prelink: paramObject.withoutPageNo,
                current: paginationInfo.page,
                rowsPerPage: paginationInfo.pageSize,
                totalResult: paginationInfo.totalItems
            }));

            var returnData = Base.mergeData(helper.mergeObject({
                title: ' ',
                userFtyId: ftyId,
                pagination: boostrapPaginator.render()
            },resultList));
            res.render('order/shipments/out_material', returnData);
        });

    },
    outMaterialChecked: function (req, res) {
        var id = req.params.id;
        request(Base.mergeRequestOptions({
            method: 'put',
            url: '/api/whse/cargout/mates?id='+id,
        }, req, res), function (error, response, body) {
            if (!error && response.statusCode == 201) {
                res.sendStatus(200);
            } else {
                Base.handlerError(res, req, error, response, body);
            }
        })
    },
    outMaterialDeatil: function (req, res) {
        var id = req.params.id;
        Base.multiDataRequest(req, res, [
            {url: '/api/whse/cargout/mates/'+ id, method: 'GET', resConfig: {keyName: 'matesInfo', is_must: true}},
        ], function (req, res, resultList) {

            var returnData = Base.mergeData(helper.mergeObject({
                title: ' ',
                outId: id,
            },resultList));
            res.render('order/shipments/out_material_detail', returnData);
        });

    },
    canSendPage: function (req, res) {
        var type = req.params.type;

        var paramObject = helper.genPaginationQuery(req);
        Base.multiDataRequest(req, res, [
            {url: '/api/whse/cargout/order?'+ queryString.stringify(req.query), method: 'GET', resConfig: {keyName: 'cargoutList', is_must: true}},
        ], function (req, res, resultList) {

            var paginationInfo =  resultList.cargoutList;

            var boostrapPaginator = new Pagination.TemplatePaginator(helper.genPageInfo({
                prelink: paramObject.withoutPageNo,
                current: paginationInfo.page,
                rowsPerPage: paginationInfo.pageSize,
                totalResult: paginationInfo.totalItems
            }));

            var returnData = Base.mergeData(helper.mergeObject({
                title: ' ',
                type:type,
                pagination: boostrapPaginator.render()
            },resultList));
            res.render('order/shipments/can_send', returnData);
        });

    },
    sendPage: function (req, res){
        var type = req.params.type;
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
                    type: type,
                    pagination: boostrapPaginator.render(),
                }, resultList));
                res.render('order/shipments/can_send_page', returnData);
            });

    },
    doSend: function (req, res) {
        var id = req.params.id;
        request(Base.mergeRequestOptions({
            method: 'post',
            url: '/api/whse/cargout/mates',
            form: req.body
        }, req, res), function (error, response, body) {
            if (!error && response.statusCode == 201) {
                res.sendStatus(200);
            } else {
                Base.handlerError(res, req, error, response, body);
            }
        })
    },
    canSendDeatil: function (req, res) {
        res.render('order/shipments/can_send_detail');

    },
    outProductPage: function (req, res) {
        var ftyId = req.query.ftyId ? req.query.ftyId: req.session.user.ftyId;
        var paramObject = helper.genPaginationQuery(req);
        Base.multiDataRequest(req, res, [
            {url: '/api/whse/cargout/prods?'+ queryString.stringify(req.query), method: 'GET', resConfig: {keyName: 'prodsList', is_must: true}},
            {url: '/api/whse/factory/list', method: 'GET', resConfig: {keyName: 'factoryList', is_must: true}},
            {url: '/api/whse/warehouse/list/'+ftyId, method: 'GET', resConfig: {keyName: 'warehouseList', is_must: true}},
        ], function (req, res, resultList) {

            var paginationInfo =  resultList.prodsList;

            var boostrapPaginator = new Pagination.TemplatePaginator(helper.genPageInfo({
                prelink: paramObject.withoutPageNo,
                current: paginationInfo.page,
                rowsPerPage: paginationInfo.pageSize,
                totalResult: paginationInfo.totalItems
            }));

            var returnData = Base.mergeData(helper.mergeObject({
                title: ' ',
                userFtyId: ftyId,
                pagination: boostrapPaginator.render()
            },resultList));
            res.render('order/shipments/out_product', returnData);
        });

    },
    outProductChecked: function (req, res) {
        var id = req.params.id;
        request(Base.mergeRequestOptions({
            method: 'put',
            url: '/api/whse/cargout/prods?id='+id,
        }, req, res), function (error, response, body) {
            if (!error && response.statusCode == 201) {
                res.sendStatus(200);
            } else {
                Base.handlerError(res, req, error, response, body);
            }
        })
    },
    outProductDeatil: function (req, res) {
        var id = req.params.id;
        Base.multiDataRequest(req, res, [
            {url: '/api/whse/cargout/prods/'+ id, method: 'GET', resConfig: {keyName: 'prodsInfo', is_must: true}},
        ], function (req, res, resultList) {

            var returnData = Base.mergeData(helper.mergeObject({
                title: ' ',
                outId: id,
            },resultList));
            res.render('order/shipments/out_product_detail', returnData);
        });
    },
    outBredPage: function (req, res) {
        var paramObject = helper.genPaginationQuery(req);
        Base.multiDataRequest(req, res, [
            {url: '/api/whse/cargout/plate/page?'+ queryString.stringify(req.query), method: 'GET', resConfig: {keyName: 'plateList', is_must: true}},
        ], function (req, res, resultList) {

            var paginationInfo =  resultList.plateList;

            var boostrapPaginator = new Pagination.TemplatePaginator(helper.genPageInfo({
                prelink: paramObject.withoutPageNo,
                current: paginationInfo.page,
                rowsPerPage: paginationInfo.pageSize,
                totalResult: paginationInfo.totalItems
            }));

            var returnData = Base.mergeData(helper.mergeObject({
                title: ' ',
                pagination: boostrapPaginator.render()
            },resultList));
            res.render('order/shipments/out_bred', returnData);
        });

    },
    outBredUpload: function (req, res) {
        request(Base.mergeRequestOptions({
            method: 'post',
            url: '/api/whse/cargout/plate/file',
            form:req.body,
        }, req, res), function (error, response, body) {
            if (!error && response.statusCode == 200) {
                var $data = JSON.parse(body);
                var returnData = Base.mergeData(helper.mergeObject({
                    title: '',
                }, {plateList: $data}));
                res.render('order/shipments/out_bred_doOut', returnData);
            } else {
                console.log('handlerError')
                Base.handlerError(res, req, error, response, body);
            }
        })


    },
    outBredDeatil: function (req, res) {
        var id = req.params.id;
        Base.multiDataRequest(req, res, [
            {url: '/api/whse/cargout/plate/list/'+ id, method: 'GET', resConfig: {keyName: 'plateInfo', is_must: true}},
            {url: '/api/whse/cargout/plate/page?outId='+id, method: 'GET', resConfig: {keyName: 'cargoutInfo', is_must: false}},

        ], function (req, res, resultList) {
            resultList.cargoutInfo = resultList.cargoutInfo.result[0];
            var returnData = Base.mergeData(helper.mergeObject({
                title: ' ',
                outId: id,
            },resultList));
            res.render('order/shipments/out_bred_detail', returnData);
        });
    },

    doCheckBred: function (req, res) {
        var id = req.params.id;
        request(Base.mergeRequestOptions({
            method: 'post',
            url: '/api/whse/cargout/plate/review/'+id,
        }, req, res), function (error, response, body) {
            if (!error && response.statusCode == 201) {
                res.sendStatus(200);
            } else {
                Base.handlerError(res, req, error, response, body);
            }
        })
    },
    doUnCheckBred: function (req, res) {
        var id = req.params.id;
        request(Base.mergeRequestOptions({
            method: 'put',
            url: '/api/orders/schedule/getTask?tids='+id,
        }, req, res), function (error, response, body) {
            if (!error && response.statusCode == 201) {
                res.sendStatus(200);
            } else {
                Base.handlerError(res, req, error, response, body);
            }
        })
    },
};

module.exports = OutWarehouseController;

