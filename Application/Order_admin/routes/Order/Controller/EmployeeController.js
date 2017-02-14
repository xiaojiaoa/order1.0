//请求代理控制器
var Base = require('./BaseController');

var Pagination = require('pagination');

var queryString = require('qs');

var helper = require('../config/helper');

var request = require('request');


var EmployeeController = {
    listPage: function (req, res) {
        var paramObject = helper.genPaginationQuery(req);

        Base.multiDataRequest(req, res, [
            {url: '/api/employees?' + (queryString.stringify(req.query)), method: 'GET', resConfig: {keyName: 'userList', is_must: true}},
            {url: '/api/stores/departments', method: 'GET', resConfig: {keyName: 'departmentsInfo', is_must: true}},
        ], function (req, res, resultList) {

            var paginationInfo = resultList.userList;
            console.log('paginationInfo',paginationInfo);

            var boostrapPaginator = new Pagination.TemplatePaginator(helper.genPageInfo({
                prelink: paramObject.withoutPageNo,
                current: paginationInfo.page,
                rowsPerPage: paginationInfo.pageSize,
                totalResult: paginationInfo.totalItems
            }));


            var returnData = Base.mergeData(helper.mergeObject({
                title: '门店登录系统',
                pagination: boostrapPaginator.render()
            }, resultList));

            res.render('order/employees', returnData);

        });

        // request(Base.mergeRequestOptions(
        //     {
        //     method: 'get',
        //     url: '/api/employees?' + (queryString.stringify(req.query)),
        // }, req, res), function (error, response, body) {
        //     if (!error && response.statusCode == 200) {
        //         // Show the HTML for the Google homepage
        //
        //         var paginationInfo = JSON.parse(body);
        //         console.log('paginationInfo',paginationInfo);
        //
        //         var boostrapPaginator = new Pagination.TemplatePaginator(helper.genPageInfo({
        //             prelink: paramObject.withoutPageNo,
        //             current: paginationInfo.page,
        //             rowsPerPage: paginationInfo.pageSize,
        //             totalResult: paginationInfo.totalItems
        //         }));
        //
        //         console.log(boostrapPaginator.render());
        //
        //         var returnData = Base.mergeData(helper.mergeObject({
        //             title: '门店登录系统',
        //             pagination: boostrapPaginator.render()
        //         }, {'userList': paginationInfo}));
        //
        //         res.render('store/employees', returnData);
        //
        //     } else {
        //         Base.handlerError(res, req, error, response, body);
        //     }
        // })

    },
    createPage: function (req, res) {
        Base.multiDataRequest(req, res, [
            {url: '/api/stores/departments', method: 'GET', resConfig: {keyName: 'departmentsInfo', is_must: true}},
            {url: '/api/roles', method: 'GET', resConfig: {keyName: 'rolesInfo', is_must: true}},
            {url: '/api/assist/education', method: 'GET', resConfig: {keyName: 'educationInfo', is_must: true}},
        ], function (req, res, resultList) {


            var returnData = Base.mergeData(helper.mergeObject({
                title: ' ',
            }, resultList));
            console.log('employees'+ JSON.stringify(resultList))
            res.render('order/employees/create', returnData);
        });
        // res.render('store/employees/create')
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
        var cid =  req.params.cid;
        Base.multiDataRequest(req, res, [
            {url: '/api/employees/'+cid, method: 'GET', resConfig: {keyName: 'employeesInfo', is_must: true}},
            {url: '/api/assist/education', method: 'GET', resConfig: {keyName: 'educationInfo', is_must: true}},
        ], function (req, res, resultList) {

            var returnData = Base.mergeData(helper.mergeObject({
                title: ' ',
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
        // console.log('999'+ JSON.stringify(req.body))
        Base.multiDataRequest(req, res, [
            {url: '/api/employees/'+cid, method: 'GET', resConfig: {keyName: 'employeesInfo', is_must: true}},
            {url: '/api/stores/departments', method: 'GET', resConfig: {keyName: 'departmentsInfo', is_must: true}},
            {url: '/api/roles', method: 'GET', resConfig: {keyName: 'rolesInfo', is_must: true}},
            {url: '/api/assist/education', method: 'GET', resConfig: {keyName: 'educationInfo', is_must: true}},
        ], function (req, res, resultList) {

            var returnData = Base.mergeData(helper.mergeObject({
                title: ' ',
                cid:cid
            }, resultList));
            console.log('employees'+ JSON.stringify(resultList))
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
        request(Base.mergeRequestOptions({
            method: 'put',
            url: '/api/employees/password/rest/'+cid,
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
        // console.log('cid'+cid+'--type'+type)
        request(Base.mergeRequestOptions({
            method: 'put',
            url: '/api/employees/stcode/'+cid+'?stcode='+type,
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