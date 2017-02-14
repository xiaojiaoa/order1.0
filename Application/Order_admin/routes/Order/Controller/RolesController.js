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
        console.log('scope22222')
        var scope = req.params.scope;
        console.log('scope22222',scope)
        Base.multiDataRequest(req, res, [
            {url: '/api/permissions?scope='+scope, method: 'GET', resConfig: {keyName: 'permissionsList', is_must: true}}
        ], function (req, res, resultList) {
            var returnData = Base.mergeData(helper.mergeObject({
                title: ' ',
            }, resultList));
            res.render('order/role/role_create', returnData);
        });
    },
    modifyPage: function (req, res) {

        res.render('order/role/role_modify');
    },
    doCreate: function (req, res) {
        // console.log('999'+ JSON.stringify(req.body))
        request(Base.mergeRequestOptions({
            method: 'post',
            url: '/api/stores/departments',
            form:req.body,
        }, req, res), function (error, response, body) {
            if (!error && response.statusCode == 201) {
                res.redirect("/department");
            } else {
                Base.handlerError(res, req, error, response, body);
            }
        })


    },
    doModify: function (req, res) {

        var cid = req.body.cid;
        request(Base.mergeRequestOptions({
            method: 'put',
            url: '/api/stores/departments/'+cid+"?"+queryString.stringify(req.body),
        }, req, res), function (error, response, body) {
            if (!error && response.statusCode == 201) {
                res.redirect("/department");
            } else {
                Base.handlerError(res, req, error, response, body);
            }
        })
    },


    doDelete: function (req, res) {

        var id = req.params.id;
        request(Base.mergeRequestOptions({
            method: 'delete',
            url: '/api/stores/departments/'+id,
            // form:req.body,
        }, req, res), function (error, response, body) {
            if (!error && response.statusCode == 204) {
                res.sendStatus(200)
            } else {
                Base.handlerError(res, req, error, response, body);
            }
        })
    },

    createDiyPage: function (req, res) {

        res.render('order/role/role_diy_create');
    },
    modifyDiyPage: function (req, res) {

        res.render('order/role/role_diy_modify');
    },
    doDiyCreate: function (req, res) {
        // console.log('999'+ JSON.stringify(req.body))
        request(Base.mergeRequestOptions({
            method: 'post',
            url: '/api/stores/departments',
            form:req.body,
        }, req, res), function (error, response, body) {
            if (!error && response.statusCode == 201) {
                res.redirect("/department");
            } else {
                Base.handlerError(res, req, error, response, body);
            }
        })


    },
    doDiyModify: function (req, res) {

        var cid = req.body.cid;
        request(Base.mergeRequestOptions({
            method: 'put',
            url: '/api/stores/departments/'+cid+"?"+queryString.stringify(req.body),
        }, req, res), function (error, response, body) {
            if (!error && response.statusCode == 201) {
                res.redirect("/department");
            } else {
                Base.handlerError(res, req, error, response, body);
            }
        })
    },


};

module.exports = RolesController;