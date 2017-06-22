var DWY_GLOBAL_CONSTANT = {
    TimeOut: 500,
};

var DWY_Utils = DWY_Utils || {

        pagination: function (options) {

            // 设置属性参数
            var _paginationBox = options.pagination,
                _pageSize = options.pageSize,
                _dataContainer = options.dataContainer,
                _url = options.url,
                _method = options.method,
                _pageCount = 0,
                _callback = options.callback;


            // 请求初始数据
            $.ajax({
                url: _url,
                type: _method,
                data: {
                    pageSize: _pageSize,
                    pageNo: 1
                },
                success: function (data) {

                    // 成功后配置pagination
                    _pageCount = data.totalPages;

                    $(_dataContainer).html(data.listHtml);

                    // 如果有回调则执行回调
                    if (typeof _callback == 'function') {
                        _callback(_dataContainer);
                    }

                    $(_paginationBox).pagination({
                        pageCount: _pageCount,

                        // 切换函数
                        callback: function (pagination) {
                            $.ajax({
                                type: _method,
                                url: _url,
                                data: {
                                    pageSize: _pageSize,
                                    pageNo: pagination.getCurrent(),

                                },
                                success: function (data) {
                                    $(_dataContainer).html(data.listHtml);

                                    // 如果有回调则执行回调
                                    if (typeof _callback == 'function') {
                                        _callback(_dataContainer);
                                    }
                                }
                            })
                        }

                    })
                }
            })
        },

        StorageUtils: {
            // 从localStorage里获取列表数据
            getListArr: function (storageKey) {

                // console.log(this)
                return JSON.parse(localStorage.getItem(storageKey));
            },
            // 设置localStorage中的数据
            setList: function (storageKey, list) {
                return localStorage.setItem(storageKey, JSON.stringify(list));
            },

            // 添加一个项目
            addItem: function (item, prop, storageKey, callBack) {

                var listArr = this.getListArr(storageKey) || [];

                var len = listArr.length;


                if (len != 0) {
                    for (var i = 0; i < len; i++) {
                        if (item[prop] == listArr[i][prop]) {
                            return;
                        }
                    }
                }

                listArr.push(item);

                this.setList(storageKey, listArr);
                if (typeof callBack == 'function') {
                    callBack();
                }
            },

            // 删除一个项目
            deletItem: function (item, prop, storageKey, callBack) {
                var listArr = this.getListArr(storageKey);
                var len = listArr.length;
                if (len != 0) {
                    for (var i = 0; i < len; i++) {
                        if (item[prop] == listArr[i][prop]) {
                            listArr.splice(i, 1);
                            this.setList(storageKey, listArr);
                            if (typeof callBack == 'function') {
                                callBack();
                            }
                            return;
                        }
                    }
                }
            },

            // 删除所有项目
            deleteAll: function (storageKey, callBack) {
                this.setList(storageKey, "[]");
                if (typeof callBack == 'function') {
                    callBack();
                }
            }
        },
        CommonMethods: {
            // 合计，表格对象，对哪一列进行合计--使用方法 calcTotal(document.getElementById('table'),2,2);
            calcTotal: function (table, column, start) {
                var trs = table.getElementsByTagName('tr');
                var _start = start, // 忽略第一行的表头
                    end = trs.length - 1; // 忽略最后合计的一行
                var total = 0;
                for (var i = _start; i < end; i++) {
                    var td = trs[i].getElementsByTagName('td')[column];
                    var t = parseFloat(td.innerHTML);
                    if (t) total += t;
                }
                return total;
            },
        },
        Clicks:{
          clicks:function(){
              var _this = $(this);
              var col = $(".slideToggle");
              col.fadeToggle(200).toggleClass("cont");
              if(col.hasClass("cont")){
                  $(_this).find("i").removeClass("fa-chevron-down").addClass("fa-chevron-up");
              }else{
                  $(_this).find("i").removeClass("fa-chevron-up").addClass("fa-chevron-down");
              }
          },
        },
        ButtonExit:{
            judge:function(){
                $(".searchBut").addClass("exitClass");
                var html = " <div class='col-xs-12'>"
                    +"<hr class='simple'>"
                    +"<div class='col-xs-12 text-center'>"
                    +"<button class='btn btn-primary ' type='submit'>"
                    + "<i class='fa fa-search'></i>查询"
                    +"</button>"
                    +"</div>"
                    +"</div>"
                if($(".searchBut").hasClass("exitClass")){
                    $(".addHtml").append($(".lastEl").html());
                    $(".lastEl").empty();
                    $(".slideToggle").append(html);
                }else{
                }
            }
        },


    }

