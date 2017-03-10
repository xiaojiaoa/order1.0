var DWY_Utils = DWY_Utils || {

	pagination:function(options){

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
			url:_url,
			type:_method,
			data:{
				pageSize:_pageSize,
				pageNo:1
			},
			success:function(data){

				// 成功后配置pagination
				_pageCount = data.totalPages;

				$(_dataContainer).html(data.listHtml);

				// 如果有回调则执行回调
				if(typeof _callback == 'function'){
					_callback(_dataContainer);
				}

				$(_paginationBox).pagination({
					pageCount :_pageCount,

					// 切换函数
					callback :function(pagination){
						$.ajax({
		                    type:_method,
		                    url:_url,
		                    data:{
		                    	pageSize:_pageSize,
		                        pageNo:pagination.getCurrent(),

		                    },
		                    success:function(data){
		                        $(_dataContainer).html(data.listHtml);

		                        // 如果有回调则执行回调
		                        if(typeof _callback == 'function'){
									_callback(_dataContainer);
								}
		                    }
		                })
					}

				})
			}
		}) 
	}
}

