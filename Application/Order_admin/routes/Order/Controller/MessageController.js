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


var MessageController = {

    listPage: function (req, res) {
        Base.multiDataRequest(req, res, [
                {url: '/api/assist/order/messageInfo?' + queryString.stringify(req.query), method: 'GET', resConfig: {keyName: 'messageList', is_must: true}},
            ], function (req, res, resultList) {
            var returnData = Base.mergeData(helper.mergeObject({
                title: ' ',
                Permission:Permissions
            }, resultList));
            res.render('order/message/index', returnData);
        })
        // res.render('order/message/index')
    },
    storelistPage: function (req, res) {
        var paramObject = helper.genPaginationQuery(req);
        var type = req.query.type;
        var sid = req.query.sid;
        var oid = req.query.oid;
        var employeeUrl =(type=='store'&& !oid)?'/api/stores/employees?bid=':'/api/employees?bid=';
        var storeSearch = {
            storeName: req.query.storeName
        }
        // console.log('storeList22222',employeeUrl+ sid+'&'+queryString.stringify(req.query))
        var multiDataRequest = [
            {url: '/api/stores?' + queryString.stringify(storeSearch), method: 'GET', resConfig: {keyName: 'storeList', is_must: true}},
            {url: '/api/organizations//list', method: 'GET', resConfig: {keyName: 'orzList', is_must: true}},
        ]
        if(type=='store'&& sid && !oid){
            multiDataRequest=[
                {url: '/api/stores?' + queryString.stringify(storeSearch), method: 'GET', resConfig: {keyName: 'storeList', is_must: true}},
                {url: '/api/organizations//list', method: 'GET', resConfig: {keyName: 'orzList', is_must: true}},
                {url: employeeUrl+ sid+'&'+queryString.stringify(req.query), method: 'GET', resConfig: {keyName: 'employeesList', is_must: true}},
                {url: '/api/message/getRelateGid?bid='+sid+'&messageId='+ req.query.messageId, method: 'GET', resConfig: {keyName: 'gidsList', is_must: true}},
                {url: '/api/message/getRelateGidAndName?bid='+sid+'&messageId='+ req.query.messageId, method: 'GET', resConfig: {keyName: 'gidsNameList', is_must: true}},
            ]
        }

        if(type=='store'&& oid){
            multiDataRequest=[
                {url: '/api/stores?' + queryString.stringify(storeSearch), method: 'GET', resConfig: {keyName: 'storeList', is_must: true}},
                {url: '/api/organizations//list?' + queryString.stringify(req.query), method: 'GET', resConfig: {keyName: 'orzList', is_must: true}},
                {url: employeeUrl + oid +'&'+queryString.stringify(req.query), method: 'GET', resConfig: {keyName: 'employeesList', is_must: true}},
                {url: '/api/message/getRelateGid?bid='+sid+'&messageId='+ req.query.messageId, method: 'GET', resConfig: {keyName: 'gidsList', is_must: true}},
                {url: '/api/message/getRelateGidAndName?bid='+sid+'&messageId=' +req.query.messageId, method: 'GET', resConfig: {keyName: 'gidsNameList', is_must: true}},
            ]
            console.log(222222)
        }
        Base.multiDataRequest(req, res, multiDataRequest, function (req, res, resultList) {

            var paginationFinal = null;
            if(resultList.employeesList){
                var paginationInfo =  resultList.employeesList;
                var boostrapPaginator = new Pagination.TemplatePaginator(helper.genPageInfo({
                    prelink: paramObject.withoutPageNo,
                    current: paginationInfo.page,
                    rowsPerPage: paginationInfo.pageSize,
                    totalResult: paginationInfo.totalItems
                }));

                paginationFinal = boostrapPaginator.render();
            }else{
                resultList.employeesList = {}
            }
            if(!resultList.gidsList){
                resultList.gidsList = []
            }
            if(!resultList.gidsNameList){
                resultList.gidsNameList = []
            }
            // console.log('employeesList',resultList.employeesList)
            var returnData = Base.mergeData(helper.mergeObject({
                title: ' ',
                Permission:Permissions,
                pagination: paginationFinal,
                sid:sid,
                oid:oid,
                messageId:req.query.messageId,
            }, resultList));
            res.render('order/message/storeList', returnData);
        })
    },
    getDepartList: function (req, res) {
        var storeId = req.params.sid;
        var path = req.app.get('views')+'/order/message/deptList.ejs';
        var template = require(path);
        request(Base.mergeRequestOptions({
            method: 'GET',
            url:'/api/stores/departments/'+storeId,
        }, req, res), function (error, response, body) {
            if (!error && response.statusCode == 200) {
                var data = JSON.parse(body);
                var deptList = template({result:data});
                res.send(deptList);
            } else {
                Base.handlerError(res, req, error, response, body);
            }
        })
    },

    getEmployeeList: function (req, res) {
        var storeId = req.params.sid;
        var deptId = req.params.did;
        var path = req.app.get('views')+'/order/message/employee.ejs';
        var template = require(path);
        request(Base.mergeRequestOptions({
            method: 'GET',
            url:'/api/stores/departments/'+storeId+'/'+deptId,
        }, req, res), function (error, response, body) {
            if (!error && response.statusCode == 200) {
                var data = JSON.parse(body);
                var employeeList = template({result:data});
                res.send(employeeList);
            } else {
                Base.handlerError(res, req, error, response, body);
            }
        })
    },
    selectEmployees: function (req, res) {
        req.body.gids = req.body.gids.toString(',');
        console.log('gids23333', req.body.gids)
        request(Base.mergeRequestOptions({
            method: 'put',
            url: '/api/message/saveGid?'+queryString.stringify(req.body),
        }, req, res), function (error, response, body) {
            if (!error && response.statusCode == 201) {
                Base.handlerSuccess(res, req);
                res.redirect(req.session.backPath?req.session.backPath:"/storeList");
            } else {
                Base.handlerError(res, req, error, response, body);
            }
        })
    },
    removeGid: function (req, res) {
        req.body.gids = req.body.gids.toString(',');
        console.log('removeGid', req.body.gids)
        request(Base.mergeRequestOptions({
            method: 'put',
            url: '/api/message/deleteGid?'+queryString.stringify(req.body),
        }, req, res), function (error, response, body) {
            if (!error && response.statusCode == 201) {
                Base.handlerSuccess(res, req);
                res.redirect(req.session.backPath?req.session.backPath:"/storeList");
            } else {
                Base.handlerError(res, req, error, response, body);
            }
        })
    },
};

module.exports = MessageController;

