
var DWY_Layout_initValue = DWY_Layout_initValue || {

        initValue:function(options){
		// 设置属性参数
		var _dataContainer = options.dataContainer,
			_url = options.url,
			_method = options.method,
			_callback = options.callback;


		// 请求初始数据
		$.ajax({
			url:_url,
			type:_method,

			success:function(data){

				$(_dataContainer).html(data.listHtml);

				// 如果有回调则执行回调
				if(typeof _callback == 'function'){
					_callback(_dataContainer);
				}

			}
		}) 
	},

}

