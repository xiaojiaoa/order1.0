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


var SystemController = {
    indexPage: function (req, res) {
        //res.render('order/system/index');
         Base.multiDataRequest(req, res, [
                 {url: '/api/assist', method: 'GET', resConfig: {keyName: 'basicDataList', is_must: true}},
                 {url: '/api/assist/package/category', method: 'GET', resConfig: {keyName: 'packageCate', is_must: true}},
          ],
            function (req, res, resultList) {
                //console.log(1111,resultList);
          var returnData = Base.mergeData(helper.mergeObject({
                 title: '个人中心',
                 Permission :Permissions,
               }, resultList));

                res.render('order/system/index', returnData);
             });

    },
    keyFirstPage: function (req, res) {
        var key = req.params.key;
        request(Base.mergeRequestOptions({
            method: 'GET',
            url: '/api/assist/list/enabled?key='+key,
        }, req, res), function (error, response, body) {
            if (!error && response.statusCode == 200) {
                // Base.handlerSuccess(res, req);
                res.status(200).json(body)
            } else {
                Base.handlerError(res, req, error, response, body);
            }
        })
    },
    keyFirstALLPage: function (req, res) {
        var key = req.params.key;
        //引入模板文件的路径
        var path = req.app.get('views')+'/order/system/basicDataThree.ejs';
        var template = require(path);
        request(Base.mergeRequestOptions({
            method: 'GET',
            url: '/api/assist/list?key='+key,
        }, req, res), function (error, response, body) {
            if (!error && response.statusCode == 200) {
                // 编译模板
                var data = JSON.parse(body);
                var basicDataThree = template({result:data,key:key});
                res.send(basicDataThree);
            } else {
                Base.handlerError(res, req, error, response, body);
            }
        })
    },
    doCreate: function (req, res) {
        // console.log( "新建",req.body);
        request(Base.mergeRequestOptions({
            method: 'post',
            url: '/api/assist',
            form:req.body,
        }, req, res), function (error, response, body) {
            if (!error && response.statusCode == 201) {
                Base.handlerSuccess(res, req);
                res.redirect("/system");
            } else {
                Base.handlerError(res, req, error, response, body);
            }
        })
    },
    doModify: function (req, res) {
         // console.log("修改",req.body);
        request(Base.mergeRequestOptions({
            method: 'put',
            url: '/api/assist/update'+"?"+queryString.stringify(req.body)
        }, req, res), function (error, response, body) {
            if (!error && response.statusCode == 201) {
                Base.handlerSuccess(res, req);
                res.redirect("/system");
            } else {
                Base.handlerError(res, req, error, response, body);
            }
        })
    },
    resupplyReasonPage: function (req, res) {
        var parentId = req.params.parentId;
        //引入模板文件的路径
        var path = req.app.get('views')+'/order/system/basicDataOne.ejs';
        var template = require(path);

        request(Base.mergeRequestOptions({
            method: 'GET',
            url: '/api/assist/resupplyReason/subclass?parentId='+parentId,
        }, req, res), function (error, response, body) {
            if (!error && response.statusCode == 200) {
                // 编译模板
                var data = JSON.parse(body);
                var basicDataOne = template({result:data});
                res.send(basicDataOne);
            } else {
                Base.handlerError(res, req, error, response, body);
            }
        })
    },
    orderSpaceinfoPage: function (req, res) {
        var parentId = req.params.parentId;

        //引入模板文件的路径
        var path = req.app.get('views')+'/order/system/basicDataOne.ejs';
        var template = require(path);

        request(Base.mergeRequestOptions({
            method: 'GET',
            url: '/api/assist/orderSpaceinfo/subclass?parentId='+parentId,
        }, req, res), function (error, response, body) {
            if (!error && response.statusCode == 200) {
                // 编译模板
                var data = JSON.parse(body);
                var basicDataOne = template({result:data});
                res.send(basicDataOne);
            } else {
                Base.handlerError(res, req, error, response, body);
            }
        })



    },
    orderSpaceinfoTwoPage: function (req, res) {
        var spaceId = req.params.spaceId;
        //引入模板文件的路径
        var path = req.app.get('views')+'/order/system/basicDataOne.ejs';
        var template = require(path);
        request(Base.mergeRequestOptions({
            method: 'GET',
            // url: '/api/assist/space/prod?spaceId='+spaceId,
            url:'/api/assist/space/allprod?spaceId='+spaceId
        }, req, res), function (error, response, body) {
            if (!error && response.statusCode == 200) {
                // 编译模板
                var data = JSON.parse(body);
               // console.log('data是啥',data)
                var basicDataOne = template({result:data});
                res.send(basicDataOne);
            } else {
                Base.handlerError(res, req, error, response, body);
            }
        })
    },
    doClearCache: function (req, res) {
        request(Base.mergeRequestOptions({
            method: 'put',
            url: '/api/clearCache',
        }, req, res), function (error, response, body) {
            if (!error && response.statusCode == 201) {
                Base.handlerSuccess(res, req);
                res.redirect("/system");
            } else {
                Base.handlerError(res, req, error, response, body);
            }
        })
    },
    assistantMaterialUnitPage: function (req, res) {
        var parentId = req.params.parentId;
        //引入模板文件的路径
        var path = req.app.get('views')+'/order/system/basicDataTwo.ejs';
        var template = require(path);
        request(Base.mergeRequestOptions({
            method: 'GET',
            url: '/api/assist/material/units/'+parentId,
        }, req, res), function (error, response, body) {
            if (!error && response.statusCode == 200) {
                // 编译模板
                var data = JSON.parse(body);
                var basicDataTwo = template({result:data});
                res.send(basicDataTwo);
            } else {
                Base.handlerError(res, req, error, response, body);
            }
        })
    },
    assistantPackageTypePage: function (req, res) {
        var parentId = req.params.parentId;
        //引入模板文件的路径
        var path = req.app.get('views')+'/order/system/basicDataOne.ejs';
        var template = require(path);
        request(Base.mergeRequestOptions({
            method: 'GET',
            url: '/api/assist/package/types/'+parentId,
        }, req, res), function (error, response, body) {
            if (!error && response.statusCode == 200) {
                // 编译模板
                var data = JSON.parse(body);
                // console.log('data是啥',data)
                var basicDataOne = template({result:data});
                res.send(basicDataOne);
            } else {
                Base.handlerError(res, req, error, response, body);
            }
        })
    },
    timeSetPage: function (req, res) {
        res.render('order/system/time')
    },
    doSetTime: function (req, res) {

    },
    templatePage: function (req, res) {
        var ftyId = req.session.user.ftyId? req.session.user.ftyId: '';
        // console.log('templatePageftyId',ftyId)

        Base.multiDataRequest(req, res, [
            {url: '/api/whse/freemarker/list?ftyId=0', method: 'GET', resConfig: {keyName: 'freemarkerSystem', is_must: true}},
            {url: '/api/whse/freemarker/list?ftyId='+ftyId, method: 'GET', resConfig: {keyName: 'freemarkerSelf', is_must: true}},
            {url: '/api/whse/factory/list', method: 'GET', resConfig: {keyName: 'factoryList', is_must: true}},

        ], function (req, res, resultList) {
            if(!ftyId){
                resultList.freemarkerSelf = [];
            }
            var returnData = Base.mergeData(helper.mergeObject({
                title: ' ',
                freemarkerInfo:{},
                id:'',
                userFtyId:ftyId,
                type:'createSys'
            }, resultList));
            res.render('order/system/template', returnData);
        });
    },
    modifyPage: function (req, res) {
        var id = req.params.id;
        var paramsType = req.params.type;
        var ftyId = req.session.user.ftyId? req.session.user.ftyId: '';
        Base.multiDataRequest(req, res, [
            {url: '/api/whse/freemarker/list?ftyId=0', method: 'GET', resConfig: {keyName: 'freemarkerSystem', is_must: true}},
            {url: '/api/whse/freemarker/list?ftyId='+ftyId, method: 'GET', resConfig: {keyName: 'freemarkerSelf', is_must: true}},
            {url: '/api/whse/freemarker/listone/'+id, method: 'GET', resConfig: {keyName: 'freemarkerInfo', is_must: true}},
            {url: '/api/whse/factory/list', method: 'GET', resConfig: {keyName: 'factoryList', is_must: true}},
        ], function (req, res, resultList) {
            if(!ftyId){
                resultList.freemarkerSelf = [];
            }
            var returnData = Base.mergeData(helper.mergeObject({
                title: ' ',
                type:'modify',
                paramsType:paramsType,
                id:id,
                userFtyId:ftyId,
            }, resultList));
            res.render('order/system/template', returnData);
        });
    },
    templateCreate: function (req, res) {
        // var ftlId = req.body.ftlId;
        // if(ftlId == 0){
        //     req.body.name = req.body.ftlName;
        // }
        // console.log( "templateCreate",JSON.stringify(req.body));


        request(Base.mergeRequestOptions({
            method: 'post',
            url: '/api/whse/freemarker',
            form:req.body,
        }, req, res), function (error, response, body) {
            if (!error && response.statusCode == 201) {
                Base.handlerSuccess(res, req);
                res.redirect("/system/template");
            } else {
                Base.handlerError(res, req, error, response, body);
            }
        })
    },
    templateModify: function (req, res) {
        var id = req.body.id;
        var paramsType = req.body.paramsType;

        // console.log( 'templateModify',JSON.stringify(req.body));

        request(Base.mergeRequestOptions({
            method: 'put',
            url: '/api/whse/freemarker/'+id+'?'+queryString.stringify(req.body),
        }, req, res), function (error, response, body) {
            if (!error && response.statusCode == 201) {
                Base.handlerSuccess(res, req);
                res.redirect("/system/template/modify/"+paramsType+"/"+id);
            } else {
                Base.handlerError(res, req, error, response, body);
            }
        })
    },
    templateDelete: function (req, res) {
        var id = req.params.id;
        // console.log('/api/whse/freemarker/status/'+id+'?stcode=0')
        request(Base.mergeRequestOptions({
            method: 'put',
            url: '/api/whse/freemarker/status/'+id+'?stcode=0',
        }, req, res), function (error, response, body) {
            if (!error && response.statusCode == 201) {
                res.sendStatus(200);
            } else {
                Base.handlerError(res, req, error, response, body);
            }
        })
    },
    printOut: function (req, res) {

        var id = req.params.id;
        request(Base.mergeRequestOptions({
            method: 'get',
            url: '/api/whse/freemarker/print/'+id,
        }, req, res), function (error, response, body) {
            if (!error && response.statusCode == 200) {
                // console.log('printOut',body)
                // res.status(200).json(body);
                var returnData = Base.mergeData(helper.mergeObject({
                    id:id,
                }, {printINfo:body}));
                res.render('order/system/print', returnData);
            } else {
                Base.handlerError(res, req, error, response, body);
            }
        })
    },
    printPackageLid: function (req, res) {
        var packageLid = req.params.packageLid;
        request(Base.mergeRequestOptions({
            method: 'get',
            url: '/api/orders/package/inventory/'+packageLid,
        }, req, res), function (error, response, body) {
            if (!error && response.statusCode == 200) {
                // console.log('printOut',body)
                // console.log('printOuttype',typeof body)
                // res.status(200).json(body);
                // var resultList = body;
                var returnData = Base.mergeData(helper.mergeObject({
                    id:packageLid,
                    type:'html'
                }, {printINfo:body}));
                res.render('order/system/print', returnData);
            } else {
                Base.handlerError(res, req, error, response, body);
            }
        })
    },
    printParts: function (req, res) {
        var batchNumber = req.params.batchNumber;
        var factoryId = req.params.factoryId;
        var type = req.query.type;
        request(Base.mergeRequestOptions({
            method: 'get',
            url: '/api/orders/package/print/packagelist/'+batchNumber+'/'+factoryId,
        }, req, res), function (error, response, body) {
            if (!error && response.statusCode == 200) {
                var returnData = Base.mergeData(helper.mergeObject({
                    batchNumber:batchNumber,
                    factoryId:factoryId,
                    type:'arry',
                    showTYpe:type
                }, {printINfo:JSON.parse(body)}));
                res.render('order/system/print', returnData);
            } else {
                Base.handlerError(res, req, error, response, body);
            }
        })
    },
    printDelivery: function (req, res) {
        var id = req.params.id;
        request(Base.mergeRequestOptions({
            method: 'get',
            url: '/api/whse/cargout/delivery/print/delivery/'+id,
        }, req, res), function (error, response, body) {
            if (!error && response.statusCode == 200) {
                var returnData = Base.mergeData(helper.mergeObject({
                    id:id,
                    type:'delivery',
                }, {printINfo:JSON.parse(body)}));
                res.render('order/system/print', returnData);
            } else {
                Base.handlerError(res, req, error, response, body);
            }
        })
    },

};

module.exports = SystemController;

