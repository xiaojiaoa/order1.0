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


var TaskseqController = {

    indexPage: function (req, res) {
        var lid =  req.params.lid;
        Base.multiDataRequest(req, res, [
                {url: '/api/taskseqs/basic/'+lid, method: 'GET', resConfig: {keyName: 'taskseqInfo', is_must: true}},
                {url: '/api/ebis/measure/'+ lid, method: 'GET', resConfig: {keyName: 'measureInfo', is_must: false}},
                {url: '/api/taskseqs/wardround/'+ lid, method: 'GET', resConfig: {keyName: 'wardroundInfo', is_must: false}},
                {url: '/api/taskseqs/followupassist?lid='+ lid, method: 'GET', resConfig: {keyName: 'followupInfo', is_must: false}},
                {url: '/api/files/'+ lid, method: 'GET', resConfig: {keyName: 'fileInfo', is_must: false}},
                {url: '/api/contracts/'+ lid, method: 'GET', resConfig: {keyName: 'contractInfo', is_must: false}},
                {url: '/api/taskseqs/space/'+ lid, method: 'GET', resConfig: {keyName: 'seqSpaceInfo', is_must: false}},
                {url: '/api/assist/taskseq/status', method: 'GET', resConfig: {keyName: 'statusInfo', is_must: false}},
                {url: '/api/taskseqs/progress/' + lid, method: 'GET', resConfig: {keyName: 'progressInfo', is_must: true}},
            ],
            function (req, res, resultList) {
            // console.log(8888,resultList.progressInfo);
                var returnData = Base.mergeData(helper.mergeObject({
                    title: ' ',
                    lid:lid,
                    Permission :Permissions,
                }, resultList));

                res.render('order/taskseq/index', returnData);
            });
    },
    communicatePage: function (req, res) {
        // console.log('44556968',req.params);
        var lid = req.params.lid;
        var returnData = {
            title: ' ',
            lid: lid,
        }
        res.render('order/taskseq/communicate_create', returnData);
    },
    doCreateCommunicate: function (req, res) {
        // console.log('44556968'+JSON.stringify(req.body))
        var lid = req.body.lid;
        request(Base.mergeRequestOptions({
            method: 'post',
            url: '/api/taskseqs/progress',
            form: req.body,
        }, req, res), function (error, response, body) {
            if (!error && response.statusCode == 201) {
                Base.handlerSuccess(res,req);
                res.redirect("/taskseq/index/" + lid);
            } else {
                Base.handlerError(res, req, error, response, body);
            }
        })
    },
    communicateAllPage: function (req, res) {
        var lid = req.params.lid;
        var paramObject = helper.genPaginationQuery(req);
        Base.multiDataRequest(req, res, [
            {url: '/api/taskseqs/progress?lid='+lid, method: 'GET', resConfig: {keyName: 'progressList', is_must: true}},
        ], function (req, res, resultList) {

            var paginationInfo = resultList.progressList;

            var boostrapPaginator = new Pagination.TemplatePaginator(helper.genPageInfo({
                prelink: paramObject.withoutPageNo,
                current: paginationInfo.page,
                rowsPerPage: paginationInfo.pageSize,
                totalResult: paginationInfo.totalItems
            }));

            var returnData = Base.mergeData(helper.mergeObject({
                title: ' ',
                lid: lid,
                pagination: boostrapPaginator.render()
            }, resultList));
            res.render('order/taskseq/communicate', returnData);
        });

    },

    listPage: function (req, res) {

    var paramObject = helper.genPaginationQuery(req);
        req.query.regionTypes=req.query.regionTypes?req.query.regionTypes.toString(','):'';
    Base.multiDataRequest(req, res, [
        {url: '/api/ebis/measure/page?'+ queryString.stringify(req.query), method: 'GET', resConfig: {keyName: 'taskseqList', is_must: true}},
        {url: '/api/assist/taskseq/status', method: 'GET', resConfig: {keyName: 'statusInfo', is_must: false}},
        {url: '/api/stores/list', method: 'GET', resConfig: {keyName: 'storesList', is_must: false}},
        {url: '/api/employees/getRegionTypeByGid ', method: 'GET', resConfig: {keyName: 'regionList', is_must: false}},
        {url: '/api/taskseqs/getRegionTypeByGid', method: 'GET', resConfig: {keyName: 'TypesList', is_must: true}},
    ], function (req, res, resultList) {
        // console.log('communicate','/api/tasks/measure?'+ queryString.stringify(req.query))
         // console.log('communicate',JSON.stringify(resultList))

        var paginationInfo =  resultList.taskseqList;

        var boostrapPaginator = new Pagination.TemplatePaginator(helper.genPageInfo({
            prelink: paramObject.withoutPageNo,
            current: paginationInfo.page,
            rowsPerPage: paginationInfo.pageSize,
            totalResult: paginationInfo.totalItems
        }));

        var returnData = Base.mergeData(helper.mergeObject({
            title: ' ',
            pagination: boostrapPaginator.render()
        },resultList));
        res.render('order/taskseqs', returnData);
    });
}

};

module.exports = TaskseqController;

