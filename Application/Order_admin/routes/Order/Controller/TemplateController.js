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

                console.log(boostrapPaginator.render());

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

    doSingleUpload: function (req, res) {


        //请求文件
        var file = req.file;

        //请求数据
        var data = req.body;

        //var formData = {
        //    // Pass a simple key-value pair
        //    my_field: 'my_value',
        //    // Pass data via Buffers
        //    my_buffer: new Buffer([1, 2, 3]),
        //    // Pass data via Streams
        //    my_file: fs.createReadStream(__dirname + '/unicycle.jpg'),
        //    // Pass multiple values /w an Array
        //    attachments: [
        //        fs.createReadStream(__dirname + '/attachment1.jpg'),
        //        fs.createReadStream(__dirname + '/attachment2.jpg')
        //    ],
        //    // Pass optional meta-data with an 'options' object with style: {value: DATA, options: OPTIONS}
        //    // Use case: for some types of streams, you'll need to provide "file"-related information manually.
        //    // See the `form-data` README for more information about options: https://github.com/form-data/form-data
        //    custom_file: {
        //        value:  fs.createReadStream('/dev/urandom'),
        //        options: {
        //            filename: 'topsecret.jpg',
        //            contentType: 'image/jpg'
        //        }
        //    }
        //};


        var formData = helper.mergeObject(data, {file: fs.createReadStream(file.destination + file.filename)});

        request(Base.mergeRequestOptions({
            method: 'post',
            host: GlobalConfig.server.Upload.host,
            port: GlobalConfig.server.Upload.port,
            url: '/api/statics/file',
            formData: formData
        }, req, res), function (error, response, body) {
            if (!error && response.statusCode == 200) {
                // Show the HTML for the Google homepage

                var $data = JSON.parse(body);

                var returnData = Base.mergeData(helper.mergeObject({
                    title: '页面标题',
                }, {keyName: $data}));

                res.status(200).send(JSON.stringify($data));

            } else {
                Base.handlerError(res, req, error, response, body);
            }
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
    }

};

module.exports = TemplateController;

