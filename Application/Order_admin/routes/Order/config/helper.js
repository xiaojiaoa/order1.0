//对象合并工具
var mergeTool = require('object-merge-advanced');

var queryString = require('qs');

var helper = {

    // 合并对象,返回新对象
    mergeObject: function (obj1, obj2) {
        var arg = arguments;
        var o = {};

        for (var i in arg) {
            if(arg.hasOwnProperty(i)){
                o = mergeTool(o, arg[i]);
            }
        }

        return o;
    },

    // 默认分页信息
    genPageInfo: function (options) {

        var translations = {
            'PREVIOUS' : '上一页',
            'NEXT' : '下一页',
            'FIRST' : '第一页',
            'LAST' : '最后一页',
            'CURRENT_PAGE_REPORT' : '搜索结果 {FromResult} - {ToResult} 共 {TotalResult}'
        };

        return helper.mergeObject(
            {
                pageParamName: 'pageNo',
                prelink: '',
                slashSeparator: false,
                template: function (result) {
                    var i, len, prelink;
                    var html = '<div><ul class="pagination">';
                    if (result.pageCount < 2) {
                        html += '</ul></div>';
                        return html;
                    }
                    prelink = this.preparePreLink(result.prelink);
                    if (result.previous) {
                        html += '<li><a href="' + prelink + result.previous + '">' + this.options.translator('PREVIOUS') + '</a></li>';
                    }
                    if (result.range.length) {
                        for (i = 0, len = result.range.length; i < len; i++) {
                            if (result.range[i] === result.current) {
                                html += '<li class="active"><a href="' + prelink + result.range[i] + '">' + result.range[i] + '</a></li>';
                            } else {
                                html += '<li><a href="' + prelink + result.range[i] + '">' + result.range[i] + '</a></li>';
                            }
                        }
                    }
                    if (result.next) {
                        html += '<li><a href="' + prelink + result.next + '" class="paginator-next">' + this.options.translator('NEXT') + '</a></li>';
                    }
                    html += '</ul></div>';
                    return html;
                },
                translator: function (str) {
                    return translations[str]
                }
            }, options)
    },

    // 生成分页请求query
    genPaginationQuery: function (req) {

        var res = {};

        var param = '', param_no_page = '';


        if (Object.keys(req.query).length != 0) {

            param = queryString.stringify(req.query);

            param_no_page = JSON.parse(JSON.stringify(req.query));

            if (param_no_page.pageNo) delete param_no_page.pageNo;

            param_no_page = queryString.stringify(param_no_page);

            return {
                withQuestionMark: '?' + param,
                withoutPageNo: param_no_page ? '?' + param_no_page : ''
            }

        }

        return {
            withQuestionMark: '',
            withoutPageNo: ''
        };


    },

    // 将含有相同父节点的子数据放置到该父节点的data中
    setChildDate:function(a,b) {
    a.forEach(function(element,index){
        if(element.parentId == 0){
            b[element.id] = element;
            b[element.id].data = [];
        }else{
            if(b[element.parentId]){
                b[element.parentId].data.push(element);
            }
        }
    })
},
};

module.exports = helper;

