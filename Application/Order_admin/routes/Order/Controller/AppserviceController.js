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
        var ftyId = req.params.ftyId;
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
};
module.exports = AppServiceController;

