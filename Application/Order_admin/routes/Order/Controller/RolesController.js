//请求代理控制器
var Base = require('./BaseController');

var Pagination = require('pagination');

var queryString = require('qs');

var helper = require('../config/helper');

var request = require('request');


var RolesController = {
    listPage: function (req, res) {
        var bid = req.params.bid;
        var scope = req.params.scope;
        Base.multiDataRequest(req, res, [
            {url: '/api/roles/'+bid+'?scope='+scope, method: 'GET', resConfig: {keyName: 'rolesInfo', is_must: true}}
        ], function (req, res, resultList) {
            var returnData = Base.mergeData(helper.mergeObject({
                title: ' ',
                bid:bid,
                scope:scope,
            }, resultList));
            res.render('order/role/index', returnData);
        });
    },
    createPage: function (req, res) {
        var bid = req.params.bid;
        var scope = req.params.scope;
        var roleScope = (scope == '9'?'1':'2');
        var type = req.params.type;
        Base.multiDataRequest(req, res, [
            {url: '/api/permissions?scope='+roleScope, method: 'GET', resConfig: {keyName: 'permissionsList', is_must: true}}
        ], function (req, res, resultList) {
            var returnData = Base.mergeData(helper.mergeObject({
                title: ' ',
                bid:bid,
                scope:scope,
                type:type,
            }, resultList));
            res.render('order/role/role_create', returnData);
        });
    },
    modifyPage: function (req, res) {
        var bid = req.params.bid;
        var scope = req.params.scope;
        var roleScope = (scope == '9'?'1':'2');
        var stcode = req.params.stcode;

        Base.multiDataRequest(req, res, [
            {url: '/api/permissions?scope='+roleScope, method: 'GET', resConfig: {keyName: 'permissionsAllList', is_must: true}},
            {url: '/api/roles/detail/'+stcode, method: 'GET', resConfig: {keyName: 'rolesInfo', is_must: true}}
        ], function (req, res, resultList) {
            var returnData = Base.mergeData(helper.mergeObject({
                title: ' ',
                bid:bid,
                scope:scope,
                stcode:stcode,
            }, resultList));
            res.render('order/role/role_modify', returnData);
        });
    },

    doCreate: function (req, res) {

        var bid = req.body.bidUrl;
        var scope = req.body.scope;
        var permissions = req.body.permission;
        var permission ="";
        if(permissions&&(typeof permissions == 'object')){
            for (var i=0;i<permissions.length;i++)
            {
                permission += permissions[i] +","
            }
            permission = permission.substring(0,permission.length-1);
            req.body.permission = permission;
        }
        //console.log('doCreate',JSON.stringify(req.body))
        request(Base.mergeRequestOptions({
            method: 'post',
            url: '/api/roles',
            form:req.body,
        }, req, res), function (error, response, body) {
            if (!error && response.statusCode == 201) {
                res.redirect("/roles/"+bid+'/'+scope);
            } else {
                Base.handlerError(res, req, error, response, body);
            }
        })
    },


    doModify: function (req, res) {
        var cid = req.body.cid;
        var bidUrl = req.body.bidUrl;
        var scope = req.body.scope;

        var permissions = req.body.permission;
        var permission ="";
        if(permissions&&(typeof permissions == 'object')){
            for (var i=0;i<permissions.length;i++)
            {
                permission += permissions[i] +","
            }
            permission = permission.substring(0,permission.length-1);
            req.body.permission = permission;
        }
        request(Base.mergeRequestOptions({
            method: 'put',
            url: '/api/roles/'+cid+"?"+queryString.stringify(req.body),
        }, req, res), function (error, response, body) {
            if (!error && response.statusCode == 201) {
                res.redirect("/roles/"+bidUrl+'/'+scope);
            } else {
                Base.handlerError(res, req, error, response, body);
            }
        })
    },


    setStatus: function (req, res) {
        var id = req.params.stcode;
        request(Base.mergeRequestOptions({
            method: 'put',
            url: '/api/roles/stcode/'+id+'?stcode=2',
            // form:req.body,
        }, req, res), function (error, response, body) {
            if (!error && response.statusCode == 201) {
                res.sendStatus(200)
            } else {
                Base.handlerError(res, req, error, response, body);
            }
        })
    },



};

module.exports = RolesController;