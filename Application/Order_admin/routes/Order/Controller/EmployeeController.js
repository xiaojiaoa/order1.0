//请求代理控制器
var Base = require('./BaseController');

var Pagination = require('pagination');

var queryString = require('qs');

var helper = require('../config/helper');

var request = require('request');

//引入权限
var Permissions = require('../config/permission');


var EmployeeController = {
    listPage: function (req, res) {
        var paramObject = helper.genPaginationQuery(req);
        var type = req.params.type;
        var bid = req.query.bid? req.query.bid: req.session.user.bid;
        var did = req.query.did;
        // /organizations/employees?bid=<%= user.bid %>
        var employeesUrl = (type == 'stores')? '/api/stores/employees?' : '/api/employees?' ;
        Base.multiDataRequest(req, res, [
            {url: employeesUrl + (queryString.stringify(req.query)), method: 'GET', resConfig: {keyName: 'employeesList', is_must: true}},
            {url: '/api/'+type+'/departments/'+bid, method: 'GET', resConfig: {keyName: 'departmentsInfo', is_must: true}},
            {url: '/api/roles/current/'+bid, method: 'GET', resConfig: {keyName: 'roleList', is_must: true}},
            {url: '/api/organizations/list', method: 'GET', resConfig: {keyName: 'organizationsList', is_must: true}},
        ], function (req, res, resultList) {

            var paginationInfo = resultList.employeesList;

            var boostrapPaginator = new Pagination.TemplatePaginator(helper.genPageInfo({
                prelink: paramObject.withoutPageNo,
                current: paginationInfo.page,
                rowsPerPage: paginationInfo.pageSize,
                totalResult: paginationInfo.totalItems
            }));

            var returnData = Base.mergeData(helper.mergeObject({
                title: '柜员管理',
                type: type,
                bid: bid,
                did: did,
                pagination: boostrapPaginator.render(),
                Permission :Permissions,
            }, resultList));

            res.render('order/employees', returnData);

        });

    },
    createPage: function (req, res) {
        var type = req.params.type;
        var bid = req.params.bid;
        // var scope = (type == 'stores')? 1 : 2 ;
        var scope = req.session.user.orgType;
        //console.log('orgType',req.session.user.orgType)
        Base.multiDataRequest(req, res, [
            {url: '/api/'+type+'/departments/'+bid, method: 'GET', resConfig: {keyName: 'departmentsInfo', is_must: true}},
            {url: '/api/roles/'+bid+'?scope='+scope, method: 'GET', resConfig: {keyName: 'rolesInfo', is_must: true}},
            {url: '/api/assist/education', method: 'GET', resConfig: {keyName: 'educationInfo', is_must: true}},
            {url: '/api/assist/region/types', method: 'GET', resConfig: {keyName: 'regionInfo', is_must: true}},
        ], function (req, res, resultList) {
            //console.log(11111,resultList.regionInfo);
            var returnData = Base.mergeData(helper.mergeObject({
                title: ' ',
                bid: bid,
                type: type
            }, resultList));
            res.render('order/employees/create', returnData);
        });
    },

    doCreate: function (req, res) {
        var type = req.body.type;
        var bid = req.body.bid;
        req.body.roles=req.body.roles.toString(',');
        req.body.regionTypes=req.body.regionTypes.toString(',');

        //console.log('999'+ JSON.stringify(req.body));
        request(Base.mergeRequestOptions({
            method: 'post',
            url: '/api/employees',
            form:req.body,
        }, req, res), function (error, response, body) {
            if (!error && response.statusCode == 201) {
                Base.handlerSuccess(res, req);
                // var lid = JSON.parse(body).lid;
                res.redirect("/"+type+"/employees?bid="+bid);

            } else {
                Base.handlerError(res, req, error, response, body);
            }
        })
    },
    detailPage: function (req, res) {
        var type =  req.params.type;
        var bid =  req.params.bid;
        var cid =  req.params.cid;
        var employeesUrl = (type == 'stores')? '/api/stores/employees/' : '/api/employees/' ;
        Base.multiDataRequest(req, res, [
            {url: employeesUrl+cid, method: 'GET', resConfig: {keyName: 'employeesInfo', is_must: true}},
            {url: '/api/assist/education', method: 'GET', resConfig: {keyName: 'educationInfo', is_must: true}},
        ], function (req, res, resultList) {

            var returnData = Base.mergeData(helper.mergeObject({
                title: ' ',
                type:type,
                bid:bid,
                Permission :Permissions,
            }, resultList));
            res.render('order/employees/detail', returnData);
        });
    },

    ifHaved: function (req, res) {
        var mobile =  req.params.mobile;
        request(Base.mergeRequestOptions({
            method: 'get',
            url: '/api/employees?mobile='+mobile,
        }, req, res), function (error, response, body) {
            if (!error && response.statusCode == 200) {

                if(body){
                    var $data = JSON.parse(body);
                    // res.redirect("/customer/detail/"+custInfo.cid);
                    res.send($data);
                }
            }
        })
    },
    modifyPage: function (req, res) {
        var cid =  req.params.cid;
        var type =  req.params.type;
        var bid =  req.params.bid;
        // var scope = (type == 'stores')? 1 : 2 ;
        // var scope = req.session.user.orgType;
        var employeesUrl = (type == 'stores')? '/api/stores/employees/' : '/api/employees/' ;
        Base.multiDataRequest(req, res, [
            {url: employeesUrl+cid, method: 'GET', resConfig: {keyName: 'employeesInfo', is_must: true}},
            {url: '/api/'+type+'/departments/'+bid, method: 'GET', resConfig: {keyName: 'departmentsInfo', is_must: true}},
            // {url: '/api/roles/'+bid+'?scope='+scope, method: 'GET', resConfig: {keyName: 'rolesInfo', is_must: true}},
            {url: '/api/roles/current/'+bid, method: 'GET', resConfig: {keyName: 'rolesInfo', is_must: true}},
            {url: '/api/assist/education', method: 'GET', resConfig: {keyName: 'educationInfo', is_must: true}},
            {url: '/api/assist/region/types', method: 'GET', resConfig: {keyName: 'regionInfo', is_must: true}},
        ], function (req, res, resultList) {
           // console.log('8888', resultList);
            var returnData = Base.mergeData(helper.mergeObject({
                title: ' ',
                cid:cid,
                type:type,
                bid:bid,
                Permission :Permissions,
            }, resultList));
            res.render('order/employees/modify', returnData);
        });
    },
    doModify: function (req, res) {
        var urlType = req.body.urlType;
        var bid = req.body.bid;
        var cid = req.body.cid;
         req.body.roles=req.body.roles.toString(',');
         req.body.regionTypes=req.body.regionTypes?req.body.regionTypes.toString(','):'';

        request(Base.mergeRequestOptions({
            method: 'put',
            url: '/api/employees/'+cid+"?"+queryString.stringify(req.body),
            // form:req.body,
        }, req, res), function (error, response, body) {
            if (!error && response.statusCode == 201) {
                Base.handlerSuccess(res, req);
                // var lid = JSON.parse(body).lid;
                res.redirect("/"+urlType+"/employees/detail/"+bid+"/"+cid);

            } else {
                Base.handlerError(res, req, error, response, body);
            }
        })
    },
    resetPassword: function (req, res) {
        var cid = req.params.cid;
        var type = req.params.type;
        var url = (type == 'stores')?'/api/stores/employees/password/rest/'+cid :'/api/employees/password/rest/'+cid
        request(Base.mergeRequestOptions({
            method: 'put',
            url: url,
        }, req, res), function (error, response, body) {
            if (!error && response.statusCode == 201) {

                res.sendStatus(200);
            } else {
                Base.handlerError(res, req, error, response, body);
            }
        })
    },
    setStatus: function (req, res) {
        var cid = req.params.cid;
        var type = req.params.type;
        var bidtype = req.params.bidtype;
        var apiUrl = (bidtype == 'stores')? '/api/stores/employees/stcode/' : '/api/employees/stcode/' ;
        // console.log('cid'+cid+'--type'+type)
        request(Base.mergeRequestOptions({
            method: 'put',
            url: apiUrl+cid+'?stcode='+type,
        }, req, res), function (error, response, body) {
            if (!error && response.statusCode == 201) {

                res.sendStatus(200);
            } else {
                Base.handlerError(res, req, error, response, body);
            }
        })

    },
    openLogin: function (req, res) {
        var cid = req.params.cid;
        request(Base.mergeRequestOptions({
            method: 'put',
            url:  '/api/employees/cache/'+cid,
        }, req, res), function (error, response, body) {
            if (!error && response.statusCode == 201) {
                res.sendStatus(200);
            } else {
                Base.handlerError(res, req, error, response, body);
            }
        })

    },
};

module.exports = EmployeeController;