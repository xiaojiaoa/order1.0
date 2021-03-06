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

var MaterialTypeController = {

    materialTypePage: function (req, res) {
        if(!req.query.stcode){
          req.query.stcode=1;
        }
        var paramObject = helper.genPaginationQuery(req);
        Base.multiDataRequest(req, res, [
            {url: '/api/categories?'+ queryString.stringify(req.query), method: 'GET', resConfig: {keyName: 'mateTypeList', is_must: true}}
        ], function (req, res, resultList) {

            var paginationInfo =  resultList.mateTypeList;

            var boostrapPaginator = new Pagination.TemplatePaginator(helper.genPageInfo({
                prelink: paramObject.withoutPageNo,
                current: paginationInfo.page,
                rowsPerPage: paginationInfo.pageSize,
                totalResult: paginationInfo.totalItems
            }));

            // TODO 添加分页信息
          //  req.session.paginationInfo = paramObject.withQuestionMark

            var returnData = Base.mergeData(helper.mergeObject({
                title: ' ',
                pagination: boostrapPaginator.render(),
                Permission :Permissions,
            },resultList));
            res.render('order/material/material_type',returnData);
        });
    },
    materialTypeCreOnePage: function (req, res) {
        Base.multiDataRequest(req, res, [
            {url: '/api/attributes/list/usable?'+ queryString.stringify(req.query), method: 'GET', resConfig: {keyName: 'usableAttrList', is_must: true}}
        ], function (req, res, resultList) {
            var returnData = Base.mergeData(helper.mergeObject({
                title: ' ',
            },resultList));
            res.render('order/material/material_type_creOne',returnData);
        });
    },
    materialTypeCreOtherPage: function (req, res) {
        var id =  req.params.id;
        Base.multiDataRequest(req, res, [
            {url: '/api/categories/attributes/'+ id, method: 'GET', resConfig: {keyName: 'mateCategory', is_must: true}},
        ], function (req, res, resultList) {
            var returnData = Base.mergeData(helper.mergeObject({
                title: ' ',
                id:id,
            },resultList));
            res.render('order/material/material_type_creOther',returnData);
        });
    },
    materialTypeCreOneDo: function (req, res) {
       // console.log('新建物料一级分类'+ JSON.stringify(req.body));
        request(Base.mergeRequestOptions({
            method: 'post',
            url: '/api/categories',
            form: req.body,
        }, req, res), function (error, response, body) {
            if (!error && response.statusCode == 201) {
                Base.handlerSuccess(res, req);
                res.redirect(req.session.backPath?req.session.backPath:"/materialManage/materialType");
            } else {
                Base.handlerError(res, req, error, response, body);
            }
        })

    },
    materialTypeCreOtherDo: function (req, res) {
         // console.log('新建物料二/三级分类'+ JSON.stringify(req.body));
        request(Base.mergeRequestOptions({
            method: 'post',
            url: '/api/categories',
            form:req.body,
        }, req, res), function (error, response, body) {
            if (!error && response.statusCode == 201) {
                Base.handlerSuccess(res, req);
                res.redirect(req.session.backPath?req.session.backPath:"/materialManage/materialType");
            } else {
                Base.handlerError(res, req, error, response, body);
            }
        })

    },
    setMaterialTypeStatus: function (req, res) {
        var id = req.params.id;
        var type = req.params.type;
        // console.log('ajx'+ JSON.stringify(req.params));
        request(Base.mergeRequestOptions({
            method: 'put',
            url: '/api/categories/stcode/'+id+'?stcode='+type,
        }, req, res), function (error, response, body) {
            if (!error && response.statusCode == 201) {

                res.sendStatus(200);
            } else {
                Base.handlerError(res, req, error, response, body);
            }
        })

    },
    materialTypeModify: function (req, res) {
        var id =  req.params.id;
        Base.multiDataRequest(req, res, [
            {url: '/api/categories/attributes/'+ id+'?showAttr=true', method: 'GET', resConfig: {keyName: 'mateCategory', is_must: true}},
        ], function (req, res, resultList) {
            var returnData = Base.mergeData(helper.mergeObject({
                title: ' ',
                id:id,
            },resultList));
            res.render('order/material/material_type_modify',returnData);
        });
    },
    materialTypeDoModify: function (req, res) {
        // console.log('修改分类'+ JSON.stringify(req.body));
        var id=req.body.id;
        request(Base.mergeRequestOptions({
            method: 'put',
            url: '/api/categories/'+id+'?'+queryString.stringify(req.body),
        }, req, res), function (error, response, body) {
            if (!error && response.statusCode == 201) {
                Base.handlerSuccess(res, req);

                //TODO withPaginationInfo
                //res.redirect(helper.withPaginationInfo("/materialManage/materialType",req.session));
                res.redirect(req.session.backPath?req.session.backPath:"/materialManage/materialType");

            } else {
                Base.handlerError(res, req, error, response, body);
            }
        })

    },
};

module.exports = MaterialTypeController;

