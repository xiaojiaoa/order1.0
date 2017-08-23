//模板 供复制用
var Base = require('./BaseController');


//生成请求query
var queryString = require('qs');

//自定义帮助函数
var helper = require('../config/helper');

//请求模块
var request = require('request');


var AppServiceController = {

    error:{
        msg:"服务器异常",
        code:500
    },

    doLogin: function (req, res) {

        request(Base.mergeRequestOptions({
            method: 'POST',
            url: '/api/token',
            form: req.body
        }, req, res), function (error, response, body) {
            if (!error) {
                res.send(JSON.parse(body));
            } else {
                res.send(AppServiceController.error);
            }
        })
    },

    refreshToken:function(req,res){
        var refreshToken = req.body.refresh_token;
        request(Base.mergeRequestOptions({
            method: 'POST',
            url: '/api/refresh',
            form: {refreshToken: refreshToken}
        }, req, res), function (error, response, body) {
            if (!error) {
                res.send(JSON.parse(body));
            } else {
                res.send(AppServiceController.error);
            }
        })

    },
    cargooutPage: function (req, res) {
        var tid = req.params.tid;
        request(Base.mergeRequestOptions({
            method: 'get',
            url: '/api/whse/app/cargoout/package/list/'+tid,
            headers:req.headers,
        }, req, res), function (error, response, body) {
            if (!error) {
                res.send(JSON.parse(body));
            } else {
                res.send(AppServiceController.error);
            }
              
        })
    },
    cargooutOrder: function (req, res) {
        request(Base.mergeRequestOptions({
            method: 'get',
            url: '/api/whse/app/cargoout/order/list?'+queryString.stringify(req.query),
            headers:req.headers,
        }, req, res), function (error, response, body) {
            if (!error) {
                res.send(JSON.parse(body));
            } else {
                res.send(AppServiceController.error);
            }
        })
    },

    getWhseSel: function (req, res) {
        request(Base.mergeRequestOptions({
            method: 'get',
            url: '/api/whse/app/find/info?'+queryString.stringify(req.query),
            headers:req.headers,
        }, req, res), function (error, response, body) {
            if (!error ) {
                var $data = JSON.parse(body);
                res.send($data);
            }else{
                res.send(AppServiceController.error);
            }
        })
    },
    cargoinPackage: function (req, res) {
        request(Base.mergeRequestOptions({
            method: 'get',
            url: '/api/whse/app/cargoin/package/list',
            headers:req.headers,
        }, req, res), function (error, response, body) {
            if (!error) {
                res.send(JSON.parse(body));
            } else {
                res.send(AppServiceController.error);
            }
        })
    },
    cargoinOrder: function (req, res) {
        request(Base.mergeRequestOptions({
            method: 'post',
            url: '/api/whse/app/cargoin/order/package/list',
            headers:req.headers,
            form:req.body
        }, req, res), function (error, response, body) {
            if (!error) {
                res.send(JSON.parse(body));
            } else {
               res.send(AppServiceController.error);
            }
        })
    },
    cargoinOrderWeb: function (req, res) {
        Base.multiDataRequest(req, res, [
                {url: '/api/whse/app/cargoin/order/package/list', method: 'post', form:req.body,resConfig: {keyName: 'packageList', is_must: false}},
                {url: '/api/whse/factory/list', method: 'GET', resConfig: {keyName: 'factoryList', is_must: true}},
            ],
            function (req, res, resultList) {
                var returnData = Base.mergeData(helper.mergeObject({
                    title: ' ',
                }, resultList));
            if(resultList.packageList.list.length>0){
                res.render('order/enter/enter_product_scanning', returnData);
            }else{
                var error;
                var msgid = '';
                var arry = resultList.packageList.info.errorPackgeNos;
                var length = arry.length;
                for(var i=0;i<length;i++){
                    msgid += arry[i] + ",</br>"
                }
                msgid = msgid.substring(0,msgid.length-6);
                var response = {
                    body: '{"code":8001,"msg":"导入包装号失败</br>'+msgid+'"}'

                }
                Base.handlerError(res, req, error, response);
            }

            });
    },
    doCargoin: function (req, res) {
        request(Base.mergeRequestOptions({
            method: 'post',
            url: '/api/whse/app/cargoin/package',
            form: req.body,
            headers:req.headers,
        }, req, res), function (error, response, body) {
            if (!error) {
                res.send(JSON.parse(body));
            } else {
                res.send(AppServiceController.error);
            }
        })
    },
    doCargoout: function (req, res) {
        request(Base.mergeRequestOptions({
            method: 'post',
            url: '/api/whse/app/cargoout/prod',
            form: req.body,
            headers:req.headers,
        }, req, res), function (error, response, body) {
            if (!error) {
                res.send(JSON.parse(body));
            } else {
                res.send(AppServiceController.error);
            }
        })
    },
    getWhse: function (req, res) {
        request(Base.mergeRequestOptions({
            method: 'get',
            url: '/api/whse/app/ftyid?'+queryString.stringify(req.query),
            headers:req.headers,
        }, req, res), function (error, response, body) {
            if (!error ) {
                var $data = JSON.parse(body);
                res.send($data);               
            }else{
                res.send(AppServiceController.error);
            }
        })
    },
    isFull: function (req, res) {
        
        request(Base.mergeRequestOptions({
            method: 'post',
            url: '/api/whse/app/usable',
            headers:req.headers,
            form: req.body
        }, req, res), function (error, response, body) {
            if (!error) {
                // res.redirect('/enterMaterial')
                res.send(JSON.parse(body));
            } else {
                res.send(AppServiceController.error);
            }
        })
    },
    find: function (req, res) {

        request(Base.mergeRequestOptions({
            method: 'post',
            url: '/api/whse/app/cargospace/find',
            headers:req.headers,
            form: req.body
        }, req, res), function (error, response, body) {
            if (!error) {
                // res.redirect('/enterMaterial')
                res.send(JSON.parse(body));
            } else {
                res.send(AppServiceController.error);
            }
        })
    },
    getStock: function (req, res) {
        request(Base.mergeRequestOptions({
            method: 'get',
            url: '/api/whse/app/stock/order/list',
            headers:req.headers,
        }, req, res), function (error, response, body) {
            if (!error) {
                res.send(JSON.parse(body));
            } else {
                res.send(AppServiceController.error);
            }
        })
    },
    doStock: function (req, res) {
        request(Base.mergeRequestOptions({
            method: 'post',
            url: '/api/whse/app/stock',
            form: req.body,
            headers:req.headers,
        }, req, res), function (error, response, body) {
            if (!error) {
                res.send(JSON.parse(body));
            } else {
                res.send(AppServiceController.error);
            }
        })
    },
    getStockList: function (req, res) {
        request(Base.mergeRequestOptions({
            method: 'get',
            url: '/api/whse/app/stock/list?'+queryString.stringify(req.query),
            headers:req.headers,
        }, req, res), function (error, response, body) {
            if (!error) {
                res.send(JSON.parse(body));
            } else {
                res.send(AppServiceController.error);
            }
        })
    },
    packagetype: function (req, res) {
        request(Base.mergeRequestOptions({
            method: 'get',
            url: '/api/whse/app/packagetype?'+queryString.stringify(req.query),
            headers:req.headers,
        }, req, res), function (error, response, body) {
            if (!error) {
                res.send(JSON.parse(body));
            } else {
                res.send(AppServiceController.error);
            }
        })
    },
    packagePage: function (req, res) {
        request(Base.mergeRequestOptions({
            method: 'get',
            url: '/api/whse/app/cargoin/package/page?'+queryString.stringify(req.query),
            headers:req.headers,
        }, req, res), function (error, response, body) {
            if (!error) {
                res.send(JSON.parse(body));
            } else {
                res.send(AppServiceController.error);
            }
        })
    },
    cargoinBatch: function (req, res) {
        request(Base.mergeRequestOptions({
            method: 'get',
            url: '/api/whse/app/cargoin/batch/page?'+queryString.stringify(req.query),
            headers:req.headers,
        }, req, res), function (error, response, body) {
            if (!error) {
                res.send(JSON.parse(body));
            } else {
                res.send(AppServiceController.error);
            }
        })
    },
    cargoinOrderPage: function (req, res) {
        request(Base.mergeRequestOptions({
            method: 'get',
            url: '/api/whse/app/cargoin/order/page?'+queryString.stringify(req.query),
            headers:req.headers,
        }, req, res), function (error, response, body) {
            if (!error) {
                res.send(JSON.parse(body));
            } else {
                res.send(AppServiceController.error);
            }
        })
    },
    deliveryAll: function (req, res) {
        request(Base.mergeRequestOptions({
            method: 'get',
            url: '/api/whse/app/stock/delivery/all?'+queryString.stringify(req.query),
            headers:req.headers,
        }, req, res), function (error, response, body) {
            if (!error) {
                res.send(JSON.parse(body));
            } else {
                res.send(AppServiceController.error);
            }
        })
    },
    deliveryOwn: function (req, res) {
        request(Base.mergeRequestOptions({
            method: 'get',
            url: '/api/whse/app/stock/delivery/own?'+queryString.stringify(req.query),
            headers:req.headers,
        }, req, res), function (error, response, body) {
            if (!error) {
                res.send(JSON.parse(body));
            } else {
                res.send(AppServiceController.error);
            }
        })
    },
    unlockStock: function (req, res) {
        request(Base.mergeRequestOptions({
            method: 'post',
            url: '/api/whse/app/stock/unlock',
            form: req.body,
            headers:req.headers,
        }, req, res), function (error, response, body) {
            if (!error) {
                res.send(JSON.parse(body));
            } else {
                res.send(AppServiceController.error);
            }
        })
    },
    receiveStock: function (req, res) {
        request(Base.mergeRequestOptions({
            method: 'post',
            url: '/api/whse/app/stock/receive',
            form: req.body,
            headers:req.headers,
        }, req, res), function (error, response, body) {
            if (!error) {
                res.send(JSON.parse(body));
            } else {
                res.send(AppServiceController.error);
            }
        })
    },
    orderStock: function (req, res) {
        request(Base.mergeRequestOptions({
            method: 'get',
            url: '/api/whse/app/stock/order?'+queryString.stringify(req.query),
            headers:req.headers,
        }, req, res), function (error, response, body) {
            if (!error) {
                res.send(JSON.parse(body));
            } else {
                res.send(AppServiceController.error);
            }
        })
    },
    permission: function (req, res) {
        request(Base.mergeRequestOptions({
            method: 'get',
            url: '/api/whse/app/permission?'+queryString.stringify(req.query),
            headers:req.headers,
        }, req, res), function (error, response, body) {
            if (!error) {
                res.send(JSON.parse(body));
            } else {
                res.send(AppServiceController.error);
            }
        })
    },
    batchNumberCode: function (req, res) {
        request(Base.mergeRequestOptions({
            method: 'get',
            url: '/api/orders/batchNumber/code?'+queryString.stringify(req.query),
            headers:req.headers,
        }, req, res), function (error, response, body) {
            if (!error) {
                res.send(JSON.parse(body));
            } else {
                res.send(AppServiceController.error);
            }
        })
    },
    cargoinInscan: function (req, res) {
        var packId = req.params.packId
        request(Base.mergeRequestOptions({
            method: 'post',
            url: '/api/whse/app/cargoin/inscan/'+packId,
            headers:req.headers,
        }, req, res), function (error, response, body) {
            if (!error) {
                res.send(JSON.parse(body));
            } else {
                res.send(AppServiceController.error);
            }
        })
    },
    cargoinPage: function (req, res) {
        request(Base.mergeRequestOptions({
            method: 'get',
            url: '/api/whse/app/cargoin/inscan/page?'+queryString.stringify(req.query),
            headers:req.headers,
        }, req, res), function (error, response, body) {
            if (!error) {
                res.send(JSON.parse(body));
            } else {
                res.send(AppServiceController.error);
            }
        })
    },
    cargoinPageClassify: function (req, res) {
        request(Base.mergeRequestOptions({
            method: 'get',
            url: '/api/whse/app/cargoin/inscan/page/classify?'+queryString.stringify(req.query),
            headers:req.headers,
        }, req, res), function (error, response, body) {
            if (!error) {
                res.send(JSON.parse(body));
            } else {
                res.send(AppServiceController.error);
            }
        })
    },
    cargoinPageTid: function (req, res) {
        request(Base.mergeRequestOptions({
            method: 'get',
            url: '/api/whse/app/cargoin/inscan/page/tid?'+queryString.stringify(req.query),
            headers:req.headers,
        }, req, res), function (error, response, body) {
            if (!error) {
                res.send(JSON.parse(body));
            } else {
                res.send(AppServiceController.error);
            }
        })
    },
    cargoinTable: function (req, res) {
        var id = req.params.id
        request(Base.mergeRequestOptions({
            method: 'get',
            url: '/api/whse/app/cargoin/inscan/table?'+queryString.stringify(req.query),
            headers:req.headers,
        }, req, res), function (error, response, body) {
            if (!error) {
                res.send(JSON.parse(body));
            } else {
                res.send(AppServiceController.error);
            }
        })
    },
    cargoinCancel: function (req, res) {
        var id = req.params.id
        request(Base.mergeRequestOptions({
            method: 'post',
            url: '/api/whse/app/cargoin/inscan/cancel/'+id,
            headers:req.headers,
        }, req, res), function (error, response, body) {
            if (!error) {
                res.send(JSON.parse(body));
            } else {
                res.send(AppServiceController.error);
            }
        })
    },


    dealCargoin: function (req, res) {
        request(Base.mergeRequestOptions({
            method: 'post',
            url: '/api/whse/app/cargoin/distribute/space',
            form: req.body,
            headers:req.headers,
        }, req, res), function (error, response, body) {
            if (!error) {
                res.send(JSON.parse(body));
            } else {
                res.send(AppServiceController.error);
            }
        })
    },

    unShelve: function (req, res) {
        request(Base.mergeRequestOptions({
            method: 'post',
            url: '/api/whse/app/cargoin/scanCage/offShelves',
            form: req.body,
            headers:req.headers,
        }, req, res), function (error, response, body) {
            if (!error) {
                res.send(JSON.parse(body));
            } else {
                res.send(AppServiceController.error);
            }
        })
    },

    unShelveShow: function (req, res) {
        request(Base.mergeRequestOptions({
            method: 'post',
            url: '/api/whse/app/cargoin/cargoin',
            form: req.body,
            headers:req.headers,
        }, req, res), function (error, response, body) {
            if (!error) {
                res.send(JSON.parse(body));
            } else {
                res.send(AppServiceController.error);
            }
        })
    },

    scanCargoin: function (req, res) {
        request(Base.mergeRequestOptions({
            method: 'post',
            url: '/api/whse/app/cargoin/scan/space',
            form: req.body,
            headers:req.headers,
        }, req, res), function (error, response, body) {
            if (!error) {
                res.send(JSON.parse(body));
            } else {
                res.send(AppServiceController.error);
            }
        })
    },



    cancelScanCargoin: function (req, res) {
        request(Base.mergeRequestOptions({
            method: 'post',
            url: '/api/whse/app/cargoin/cancel/scan/space',
            form: req.body,
            headers:req.headers,
        }, req, res), function (error, response, body) {
            if (!error) {
                res.send(JSON.parse(body));
            } else {
                res.send(AppServiceController.error);
            }
        })
    },

    waitRacking: function (req, res) {
        request(Base.mergeRequestOptions({
            method: 'post',
            url: '/api/whse/app/cargoin/wate/shelves',
            form: req.body,
            headers:req.headers,
        }, req, res), function (error, response, body) {
            if (!error) {
                res.send(JSON.parse(body));
            } else {
                res.send(AppServiceController.error);
            }
        })
    },

    confirmRacking: function (req, res) {
        request(Base.mergeRequestOptions({
            method: 'post',
            url: '/api/whse/app/cargoin/shelves/space',
            form: req.body,
            headers:req.headers,
        }, req, res), function (error, response, body) {
            if (!error) {
                res.send(JSON.parse(body));
            } else {
                res.send(AppServiceController.error);
            }
        })
    },

    cancelRacking: function (req, res) {
        request(Base.mergeRequestOptions({
            method: 'post',
            url: '/api/whse/app/cargoin/offshelves/space',
            form: req.body,
            headers:req.headers,
        }, req, res), function (error, response, body) {
            if (!error) {
                res.send(JSON.parse(body));
            } else {
                res.send(AppServiceController.error);
            }
        })
    },

    shelvesSpacePage: function (req, res) {
        request(Base.mergeRequestOptions({
            method: 'get',
            url: '/api/whse/app/cargoin/shelves/space/page?'+queryString.stringify(req.query),
            headers:req.headers,
        }, req, res), function (error, response, body) {
            if (!error) {
                res.send(JSON.parse(body));
            } else {
                res.send(AppServiceController.error);
            }
        })
    },
    shelvesSpace: function (req, res) {
        request(Base.mergeRequestOptions({
            method: 'get',
            url: '/api/whse/app/cargoin/offshelves/space?'+queryString.stringify(req.query),
            headers:req.headers,
        }, req, res), function (error, response, body) {
            if (!error) {
                res.send(JSON.parse(body));
            } else {
                res.send(AppServiceController.error);
            }
        })
    },

    lidCargoShow: function (req, res) {
        var packageLid = req.params.packageLid;
        request(Base.mergeRequestOptions({
            method: 'get',
            url: '/api/whse/app/cargoin/space/packageLid/'+packageLid,
            headers:req.headers,
        }, req, res), function (error, response, body) {
            if (!error) {
                res.send(JSON.parse(body));
            } else {
                res.send(AppServiceController.error);
            }
        })
    },
    orderCargoShow: function (req, res) {
        var tid = req.params.tid;
        request(Base.mergeRequestOptions({
            method: 'get',
            url: '/api/whse/app/cargoin/space/tid/'+tid,
            headers:req.headers,
        }, req, res), function (error, response, body) {
            if (!error) {
                res.send(JSON.parse(body));
            } else {
                res.send(AppServiceController.error);
            }
        })
    },
    offshelvesShow: function (req, res) {
        var offshelves = req.params.offshelves;
        request(Base.mergeRequestOptions({
            method: 'get',
            url: '/api/whse/app/cargoin/offshelves/'+offshelves,
            headers:req.headers,
        }, req, res), function (error, response, body) {
            if (!error) {
                res.send(JSON.parse(body));
            } else {
                res.send(AppServiceController.error);
            }
        })
    },
    findBatchnumber: function (req, res) {
        var batid = req.params.batid;
        request(Base.mergeRequestOptions({
            method: 'get',
            url: '/api/whse/app/cargoin/find/batchnumber/'+batid,
            headers:req.headers,
        }, req, res), function (error, response, body) {
            if (!error) {
                res.send(JSON.parse(body));
            } else {
                res.send(AppServiceController.error);
            }
        })
    },
    findLid: function (req, res) {
        var lid = req.params.lid;
        request(Base.mergeRequestOptions({
            method: 'get',
            url: '/api/whse/app/cargoin/find/lid/'+lid,
            headers:req.headers,
        }, req, res), function (error, response, body) {
            if (!error) {
                res.send(JSON.parse(body));
            } else {
                res.send(AppServiceController.error);
            }
        })
    },
    findTid: function (req, res) {
        var tid = req.params.tid;
        request(Base.mergeRequestOptions({
            method: 'get',
            url: '/api/whse/app/cargoin/find/tid/'+tid,
            headers:req.headers,
        }, req, res), function (error, response, body) {
            if (!error) {
                res.send(JSON.parse(body));
            } else {
                res.send(AppServiceController.error);
            }
        })
    },
    notinInfo: function (req, res) {
        var tid = req.params.tid;
        request(Base.mergeRequestOptions({
            method: 'get',
            url: '/api/whse/app/cargoin/notin/info?tid='+tid,
            headers:req.headers,
        }, req, res), function (error, response, body) {
            if (!error) {
                res.send(JSON.parse(body));
            } else {
                res.send(AppServiceController.error);
            }
        })
    },
    sortView: function (req, res) {
        request(Base.mergeRequestOptions({
            method: 'post',
            url: '/api/orders/sort/view',
            form: req.body,
            headers:req.headers,
        }, req, res), function (error, response, body) {
            if (!error) {
                // console.log('sortView:',body)
                res.send(JSON.parse(body));
            } else {
                res.send(AppServiceController.error);
            }
        })
    },
    sortBatchNumber: function (req, res) {
        request(Base.mergeRequestOptions({
            method: 'get',
            url: '/api/orders/sort/batchNumber?'+queryString.stringify(req.query),
            headers:req.headers,
        }, req, res), function (error, response, body) {
            if (!error) {
                res.send(JSON.parse(body));
            } else {
                res.send(AppServiceController.error);
            }
        })
    },
    sortList: function (req, res) {
        request(Base.mergeRequestOptions({
            method: 'get',
            url: '/api/orders/sort/list?'+queryString.stringify(req.query),
            headers:req.headers,
        }, req, res), function (error, response, body) {
            if (!error) {
                res.send(JSON.parse(body));
            } else {
                res.send(AppServiceController.error);
            }
        })
    },
    sortWorkPiece: function (req, res) {
        request(Base.mergeRequestOptions({
            method: 'get',
            url: '/api/orders/sort/workPiece?'+queryString.stringify(req.query),
            headers:req.headers,
        }, req, res), function (error, response, body) {
            if (!error) {
                res.send(JSON.parse(body));
            } else {
                res.send(AppServiceController.error);
            }
        })
    },
    sortWorkPieceScaned: function (req, res) {
        request(Base.mergeRequestOptions({
            method: 'get',
            url: '/api/orders/sort/workPiece/scaned?'+queryString.stringify(req.query),
            headers:req.headers,
        }, req, res), function (error, response, body) {
            if (!error) {
                res.send(JSON.parse(body));
            } else {
                res.send(AppServiceController.error);
            }
        })
    },

    scanningCargoin: function (req, res) {
        var spaceId = req.params.spaceId;
        request(Base.mergeRequestOptions({
            method: 'post',
            url: '/api/whse/app/cargoin/inscan/space/'+spaceId,
            form: req.body,
            headers:req.headers,
        }, req, res), function (error, response, body) {
            if (!error) {
                res.send(JSON.parse(body));
            } else {
                res.send(AppServiceController.error);
            }
        })
    },
    scanningGoods: function (req, res) {
        var packageLid = req.params.packageLid;
        request(Base.mergeRequestOptions({
            method: 'post',
            url: '/api/whse/app/cargoin/inscan/cargo/'+packageLid,
            form: req.body,
            headers:req.headers,
        }, req, res), function (error, response, body) {
            if (!error) {
                res.send(JSON.parse(body));
            } else {
                res.send(AppServiceController.error);
            }
        })
    },
    orderTaskStatusCargo: function (req, res) {
        request(Base.mergeRequestOptions({
            method: 'get',
            url: '/api/whse/app/cargoin/inscan/cargo/allList?'+queryString.stringify(req.query),
            headers:req.headers,
        }, req, res), function (error, response, body) {
            if (!error) {
                res.send(JSON.parse(body));
            } else {
                res.send(AppServiceController.error);
            }
        })
    },
    orderTaskPackageCargo: function (req, res) {
        request(Base.mergeRequestOptions({
            method: 'get',
            url: '/api/whse/app/cargoin/inscan/cargo/scanList?'+queryString.stringify(req.query),
            headers:req.headers,
        }, req, res), function (error, response, body) {
            if (!error) {
                res.send(JSON.parse(body));
            } else {
                res.send(AppServiceController.error);
            }
        })
    },
    goodsScanCancle: function (req, res) {
        request(Base.mergeRequestOptions({
            method: 'post',
            url: '/api/whse/app/cargoin/inscan/cargo/changeScan',
            form: req.body,
            headers:req.headers,
        }, req, res), function (error, response, body) {
            if (!error) {
                res.send(JSON.parse(body));
            } else {
                res.send(AppServiceController.error);
            }
        })
    },
    cargoinRacking: function (req, res) {
        request(Base.mergeRequestOptions({
            method: 'post',
            url: '/api/whse/app/cargoin/cargoIn',
            form: req.body,
            headers:req.headers,
        }, req, res), function (error, response, body) {
            if (!error) {
                res.send(JSON.parse(body));
            } else {
                res.send(AppServiceController.error);
            }
        })
    },

    cargoMovingPack: function (req, res) {
        request(Base.mergeRequestOptions({
            method: 'post',
            url: '/api/whse/app/change/space/scan/package',
            form: req.body,
            headers:req.headers,
        }, req, res), function (error, response, body) {
            if (!error) {
                res.send(JSON.parse(body));
            } else {
                res.send(AppServiceController.error);
            }
        })
    },
    cargoMoving: function (req, res) {
        request(Base.mergeRequestOptions({
            method: 'post',
            url: '/api/whse/app/change/space/scan/space',
            form: req.body,
            headers:req.headers,
        }, req, res), function (error, response, body) {
            if (!error) {
                res.send(JSON.parse(body));
            } else {
                res.send(AppServiceController.error);
            }
        })
    },
    moveShowPacklist: function (req, res) {
        request(Base.mergeRequestOptions({
            method: 'get',
            url: '/api/whse/app/change/space/list?'+queryString.stringify(req.query),
            headers:req.headers,
        }, req, res), function (error, response, body) {
            if (!error) {
                res.send(JSON.parse(body));
            } else {
                res.send(AppServiceController.error);
            }
        })
    },
    cargoPostingup: function (req, res) {
        request(Base.mergeRequestOptions({
            method: 'post',
            url: '/api/whse/app/change/space/change',
            form: req.body,
            headers:req.headers,
        }, req, res), function (error, response, body) {
            if (!error) {
                res.send(JSON.parse(body));
            } else {
                res.send(AppServiceController.error);
            }
        })
    },


};
module.exports = AppServiceController;

