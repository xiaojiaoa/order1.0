//请求代理控制器
var Base = require('./BaseController');

var Pagination = require('pagination');

var queryString = require('qs');

var helper = require('../config/helper');

var request = require('request');


var DepartmentController = {
    listPage: function (req, res) {
        var bid = req.params.bid;
        Base.multiDataRequest(req, res, [
            {url: '/api/stores/departments/'+bid, method: 'GET', resConfig: {keyName: 'departmentsInfo', is_must: true}}
        ], function (req, res, resultList) {
            var returnData = Base.mergeData(helper.mergeObject({
                title: ' ',
                bid: bid,
            }, resultList));
            res.render('order/department/index', returnData);
        });
    },

    doCreate: function (req, res) {
        var bid = req.params.bid;
        request(Base.mergeRequestOptions({
            method: 'post',
            url: '/api/stores/departments',
            form:req.body,
        }, req, res), function (error, response, body) {
            if (!error && response.statusCode == 201) {
                res.redirect("/department/"+bid);
            } else {
                Base.handlerError(res, req, error, response, body);
            }
        })


    },
    doModify: function (req, res) {
        var bid = req.params.bid;
        var cid = req.body.cid;
        request(Base.mergeRequestOptions({
            method: 'put',
            url: '/api/stores/departments/'+cid+"?"+queryString.stringify(req.body),
        }, req, res), function (error, response, body) {
            if (!error && response.statusCode == 201) {
                res.redirect("/department/"+bid);
            } else {
                Base.handlerError(res, req, error, response, body);
            }
        })
    },


    doDelete: function (req, res) {
        var bid = req.params.bid;
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

};

module.exports = DepartmentController;