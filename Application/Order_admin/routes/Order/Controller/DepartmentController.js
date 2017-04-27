//请求代理控制器
var Base = require('./BaseController');

var Pagination = require('pagination');

var queryString = require('qs');

var helper = require('../config/helper');

var request = require('request');

var Permissions = require('../config/permission');

var DepartmentController = {
    listPage: function (req, res) {
        var bid = req.params.bid;
        var type = req.params.type;

        Base.multiDataRequest(req, res, [
            {url: '/api/'+type+'/departments/list/'+bid, method: 'GET', resConfig: {keyName: 'departmentsInfo', is_must: true}}
        ], function (req, res, resultList) {
            var returnData = Base.mergeData(helper.mergeObject({
                title: ' ',
                bid: bid,
                type: type,
                Permission :Permissions,
            }, resultList));
            res.render('order/department/index', returnData);
        });
    },

    doCreate: function (req, res) {
        var bid = req.body.bid;
        var type = req.body.type;
        // console.log('departments',JSON.stringify(req.body))
        // console.log( '/api/'+type+'/departments')
        request(Base.mergeRequestOptions({
            method: 'post',
            url: '/api/'+type+'/departments',
            form:req.body,
        }, req, res), function (error, response, body) {
            if (!error && response.statusCode == 201) {
                Base.handlerSuccess(res, req);
                res.redirect("/department/"+type+'/'+bid);
            } else {
                Base.handlerError(res, req, error, response, body);
            }
        })


    },
    doModify: function (req, res) {
        var bid = req.body.bid;
        var cid = req.body.cid;
        var type = req.body.type;
        request(Base.mergeRequestOptions({
            method: 'put',
            url: '/api/'+type+'/departments/'+cid+"?"+queryString.stringify(req.body),
        }, req, res), function (error, response, body) {
            if (!error && response.statusCode == 201) {
                Base.handlerSuccess(res, req);
                res.redirect("/department/"+type+'/'+bid);
            } else {
                Base.handlerError(res, req, error, response, body);
            }
        })
    },


    doDelete: function (req, res) {
        var id = req.params.id;
        var type = req.params.type;
        request(Base.mergeRequestOptions({
            method: 'delete',
            url: '/api/'+type+'/departments/'+id,
            // form:req.body,
        }, req, res), function (error, response, body) {
            if (!error && response.statusCode == 204) {

                res.sendStatus(200)
            } else {
                Base.handlerError(res, req, error, response, body);
            }
        })
    },
    doOpen: function (req, res) {
        var id = req.params.id;
        var type = req.params.type;
        request(Base.mergeRequestOptions({
            method: 'put',
            url: '/api/'+type+'/departments/use/'+id,
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

module.exports = DepartmentController;