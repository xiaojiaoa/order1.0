//模板 供复制用
var Base = require('./BaseController');

//分页
var Pagination = require('pagination');

//生成请求query
var queryString = require('qs');

//文件系统
var fs = require('fs');

//自定义帮助函数
var helper = require('../config/helper');

//请求模块
var request = require('request');

var stream = require('stream');

var GlobalConfig = require('../config/global');

var _ = require('lodash');

var TemplateController = {

    //请求方式
    requestNormal: function (req, res) {


        var returnData = Base.mergeData(helper.mergeObject(
            {
                title: '页面标题',
            },
            //Customize Data
            {}
        ));


        res.render('Path/to/view', returnData);

    },

    requestFormData: function (req, res) {


        var returnData = Base.mergeData(helper.mergeObject(
            {
                title: '页面标题',
            },
            //Customize Data
            {}
        ));


        res.render('Path/to/view', returnData);

    },

    requestBase: function (req, res) {
        request(Base.mergeRequestOptions({
            method: 'get',
            url: '/java/api/link',
        }, req, res), function (error, response, body) {
            if (!error && response.statusCode == 200) {
                // Show the HTML for the Google homepage

                var $data = JSON.parse(body);

                var returnData = Base.mergeData(helper.mergeObject({
                    title: '页面标题',
                }, {keyName: $data}));

                res.render('Path/to/view', returnData);

            } else {
                Base.handlerError(res, req, error, response, body);
            }
        })
    },

    requestWithPagination: function (req, res) {

        var paramObject = helper.genPaginationQuery(req);

        request(Base.mergeRequestOptions({
            method: 'get',
            url: '/java/api/link' + '?' + (queryString.stringify(req.query)),
        }, req, res), function (error, response, body) {
            if (!error && response.statusCode == 200) {
                // Show the HTML for the Google homepage

                var paginationInfo = JSON.parse(body);

                var boostrapPaginator = new Pagination.TemplatePaginator(helper.genPageInfo({
                    prelink: paramObject.withoutPageNo,
                    current: paginationInfo.page,
                    rowsPerPage: paginationInfo.pageSize,
                    totalResult: paginationInfo.totalItems
                }));

                //console.log(boostrapPaginator.render());

                var returnData = Base.mergeData(helper.mergeObject({
                    title: '页面标题',
                    pagination: boostrapPaginator.render()
                }, {}));

                res.render('Path/to/view', returnData);

            } else {
                Base.handlerError(res, req, error, response, body);
            }
        })

    },

    requestMulti: function (req, res) {
        Base.multiDataRequest(req, res, [
            {url: '/api/employees/current', method: 'GET', resConfig: {keyName: 'user', is_must: false}},
            {url: '/api/employees/current', method: 'GET', resConfig: {keyName: 'userInfo', is_must: true}}
        ], function (req, res, resultList) {
            res.render('order/index', Base.mergeData(helper.mergeObject({title: '门店登录系统'}, resultList)));
        });
    },


    //resource page
    listPage: function (req, res) {
    },

    createPage: function (req, res) {
        res.render('order/template/template', Base.mergeData(helper.mergeObject({title: '门店登录系统'}, {})));
    },
    doCreate: function (req, res) {

    },

    updatePage: function (req, res) {
    },
    doUpdate: function (req, res) {
    },

    doDelete: function (req, res) {
    },

    //resource json
    listApi: function (req, res) {
    },

    singleApi: function (req, res) {
    },

    doImgUpload: function (req, res) {


        //请求文件
        var file = req.file;

        //请求数据
        var data = req.body;

        var formData = helper.mergeObject(data, {file: fs.createReadStream(file.destination + file.filename)});

        request(Base.mergeRequestOptions({
            method: 'post',
            host: GlobalConfig.server.Upload.host,
            port: GlobalConfig.server.Upload.port,
            url: '/api/statics/file/card',
            formData: formData
        }, req, res), function (error, response, body) {
            if (!error && response.statusCode == 200) {
                // Show the HTML for the Google homepage

                var $data = JSON.parse(body);

                // res.status(200).send(_.merge({}, $data, {tmp_path: file.filename}));
                fs.unlink(file.destination + file.filename, function () {
                    res.status(200).send(_.merge({}, $data, {tmp_path: file.filename}));
                });
            } else {
                Base.handlerError(res, req, error, response, body);
                fs.unlink(file.destination + file.filename);
            }

        })
    },

    doSingleUpload: function (req, res) {
        var type = req.params.type;
        var ajaxUrl = '';

        switch (type){
            case 'share':
                ajaxUrl = '/api/statics/file/share';
                break;
            case 'materiel':
                ajaxUrl = '/api/statics/file/materiel';
                break;
            case 'order':
                ajaxUrl = '/api/statics/file/order';
                break;
            case 'temporary':
                ajaxUrl = '/api/statics/file/temporary';
                break;
        }

        //请求文件
        var file = req.file;

        //请求数据
        var data = req.body;

        var formData = helper.mergeObject(data, {file: fs.createReadStream(file.destination + file.filename)});
        request(Base.mergeRequestOptions({
            method: 'post',
            host: GlobalConfig.server.Upload.host,
            port: GlobalConfig.server.Upload.port,
            url: ajaxUrl,
            formData: formData
        }, req, res), function (error, response, body) {
            if (!error && response.statusCode == 200) {
                // Show the HTML for the Google homepage

                var $data = JSON.parse(body);

                fs.unlink(file.destination + file.filename, function () {
                    res.status(200).send(_.merge({}, $data, {tmp_path: file.filename}));
                });

            } else {
                Base.handlerError(res, req, error, response, body);
                fs.unlink(file.destination + file.filename);
            }
            // fs.unlink(file.destination + file.filename, function () {
            //     res.status(200).send(_.merge({}, $data, {tmp_path: file.filename}));
            // });
        })
    },

    doMultiUpload: function (req, res) {

        //请求文件组
        var files = req.files;

        //请求数据
        var data = req.body;

        res.status(200).send('Done');
    },

    doCustomUpload: function (req, res) {

        //请求文件组
        var files = req.files;

        var file = files;


    },

    doAnyUpload: function (req, res) {

        //请求文件组
        var files = req.files;

        //请求数据
        var data = req.body;

    },

    //获取请求数据
    getData: function (req, res) {

        var url = req.url.replace('/cascade', '');

        request(Base.mergeRequestOptions({
            url: url,
            method: req.method,
            timeout: 5000
        }, req, res), function (error, response, body) {
            if (!error && response.statusCode == 200) {

                res.send(JSON.parse(body));
            } else {
                Base.handlerError(res, req, error, response, body);
            }
        });
    },

    downloadData: function (req,res) {
        var url = req.url.replace('/download', '');

        request(Base.mergeRequestOptions({
            host:'www.dwy_node.com',
            port:'8080',
            url: url,
            method: req.method,
            timeout: 5000
        }, req, res), function (error, response, body) {
            if (!error && response.statusCode == 200) {

                res.send(response);
            } else {
                Base.handlerError(res, req, error, response, body);
            }
        });
    },


    //前端ajax分页处理 

    pagination:function(req,res){
            // 添加模板文件
            var path = req.app.get('views') + '/order/template/template_page_list.ejs'; 
            var template = require(path);

            request(Base.mergeRequestOptions({
                url: '/api/materials?' + queryString.stringify(req.query),
                method: 'get',
                timeout: 5000
            }, req, res), function (error, response, body) {
                if (!error && response.statusCode == 200) {
                    // 编译模板
                    var data = JSON.parse(body);
                    var listHtml = template(data);
                    res.send({
                        totalPages:data.totalPages,
                        listHtml:listHtml
                    });
                } else {
                    Base.handlerError(res, req, error, response, body);
                }
            });

          
    },

};

module.exports = TemplateController;

