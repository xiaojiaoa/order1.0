//请求代理控制器
var Base = require('./BaseController');

var Pagination = require('pagination');

var queryString = require('qs');

var helper = require('../config/helper');

var request = require('request');


var EmployeeController = {
    listPage: function (req, res) {
        var paramObject = helper.genPaginationQuery(req);
        var type = req.params.type;
        var bid = req.query.bid;
        var did = req.query.did;
        var employeesUrl = (type == 'stores')? '/api/stores/employees?' : '/api/employees?' ;
        Base.multiDataRequest(req, res, [
            {url: employeesUrl + (queryString.stringify(req.query)), method: 'GET', resConfig: {keyName: 'employeesList', is_must: true}},
            {url: '/api/'+type+'/departments/'+bid, method: 'GET', resConfig: {keyName: 'departmentsInfo', is_must: true}},
        ], function (req, res, resultList) {

            var paginationInfo = resultList.employeesList;
            console.log('paginationInfo',paginationInfo);

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
                pagination: boostrapPaginator.render()
            }, resultList));

            res.render('order/employees', returnData);

        });

    },
    createPage: function (req, res) {
        var type = req.params.type;
        var bid = req.params.bid;
        var scope = (type == 'stores')? 1 : 2 ;
        Base.multiDataRequest(req, res, [
            {url: '/api/'+type+'/departments/'+bid, method: 'GET', resConfig: {keyName: 'departmentsInfo', is_must: true}},
            {url: '/api/roles/'+bid+'?scope='+scope, method: 'GET', resConfig: {keyName: 'rolesInfo', is_must: true}},
            {url: '/api/assist/education', method: 'GET', resConfig: {keyName: 'educationInfo', is_must: true}},
        ], function (req, res, resultList) {
            var returnData = Base.mergeData(helper.mergeObject({
                title: ' ',
                bid: bid,
                type: type
            }, resultList));
            res.render('order/employees/create', returnData);
        });
    },

    doCreate: function (req, res) {
        var roles = req.body.roles;
        var role ="";
        if(roles&&(typeof roles == 'object')){
            for (var i=0;i<roles.length;i++)
            {
                role += roles[i] +","
            }
            role = role.substring(0,role.length-1);
            req.body.roles = role;
        }

        // console.log('999'+ JSON.stringify(req.body))
        request(Base.mergeRequestOptions({
            method: 'post',
            url: '/api/employees',
            form:req.body,
        }, req, res), function (error, response, body) {
            if (!error && response.statusCode == 201) {
                // var lid = JSON.parse(body).lid;
                res.redirect("/employees");

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
        var scope = (type == 'stores')? 1 : 2 ;
        var employeesUrl = (type == 'stores')? '/api/stores/employees/' : '/api/employees/' ;
        Base.multiDataRequest(req, res, [
            {url: employeesUrl+cid, method: 'GET', resConfig: {keyName: 'employeesInfo', is_must: true}},
            {url: '/api/'+type+'/departments/'+bid, method: 'GET', resConfig: {keyName: 'departmentsInfo', is_must: true}},
            {url: '/api/roles/'+bid+'?scope='+scope, method: 'GET', resConfig: {keyName: 'rolesInfo', is_must: true}},
            {url: '/api/assist/education', method: 'GET', resConfig: {keyName: 'educationInfo', is_must: true}},
        ], function (req, res, resultList) {

            var returnData = Base.mergeData(helper.mergeObject({
                title: ' ',
                cid:cid
            }, resultList));
            // console.log('employees'+ JSON.stringify(resultList))
            res.render('order/employees/modify', returnData);
        });
    },
    doModify: function (req, res) {
        var cid = req.body.cid;
        var roles = req.body.roles;
        var role ="";
        if(roles&&(typeof roles == 'object')){
            for (var i=0;i<roles.length;i++)
            {
                role += roles[i] +","
            }
            role = role.substring(0,role.length-1);
            req.body.roles = role;
        }

        request(Base.mergeRequestOptions({
            method: 'put',
            url: '/api/employees/'+cid+"?"+queryString.stringify(req.body),
            // form:req.body,
        }, req, res), function (error, response, body) {
            if (!error && response.statusCode == 201) {
                // var lid = JSON.parse(body).lid;
                res.redirect("/employees/detail/"+cid);

            } else {
                Base.handlerError(res, req, error, response, body);
            }
        })

    },
    resetPassword: function (req, res) {
        var cid = req.params.cid;
        var type = req.params.type;
        request(Base.mergeRequestOptions({
            method: 'put',
            url: '/api/stores/employees/password/rest/'+cid,
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
        // console.log('cid'+cid+'--type'+type)
        request(Base.mergeRequestOptions({
            method: 'put',
            url: '/api/stores/employees/stcode/'+cid+'?stcode='+type,
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