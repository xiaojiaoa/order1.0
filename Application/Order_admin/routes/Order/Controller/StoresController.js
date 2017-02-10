//请求代理控制器
var Base = require('./BaseController');

var Pagination = require('pagination');

var queryString = require('qs');

var helper = require('../config/helper');

var request = require('request');


var StoresController = {
    listPage: function (req, res) {
        // Base.multiDataRequest(req, res, [
        //     {url: '/api/stores/departments', method: 'GET', resConfig: {keyName: 'departmentsInfo', is_must: true}}
        // ], function (req, res, resultList) {
        //     var returnData = Base.mergeData(helper.mergeObject({
        //         title: ' ',
        //     }, resultList));
        //     res.render('store/department/index', returnData);
        // });
        res.render('order/manages/store');
    },
    detailPage: function (req, res) {
        var cid =  req.params.cid;
        res.render('order/manages/store_detail');
    },
    createPage: function (req, res) {
        res.render('order/manages/store_create');
    },
    modifyPage: function (req, res) {
        res.render('order/manages/store_modify');
    },
    doCreate: function (req, res) {
        // console.log('999'+ JSON.stringify(req.body))
        request(Base.mergeRequestOptions({
            method: 'post',
            url: '/api/stores/departments',
            form: req.body,
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
            url: '/api/stores/departments/' + cid + "?" + queryString.stringify(req.body),
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
            url: '/api/stores/departments/' + id,
            // form:req.body,
        }, req, res), function (error, response, body) {
            if (!error && response.statusCode == 204) {
                res.sendStatus(200)
            } else {
                Base.handlerError(res, req, error, response, body);
            }
        })
    },

};

module.exports = StoresController;