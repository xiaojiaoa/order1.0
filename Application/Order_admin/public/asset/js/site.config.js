// jquery validate engien custom function
var custom_validate_fn = {
    // 手机验证
    isMobile: function (field, rules, i, options) {
        var value = field.val();
        return (value.length == 11 && /^1[3578]\d{9}$/.test(value)) ? true : '请输入有效的手机号码';
    },

    // 密码验证
    regexPassword: function (field, rules, i, options) {
        // -S-密码校验
        var value = field.val();
        return /^(?![^a-zA-Z]+$)(?!\D+$).{8,16}$/.test(value) ? true : "8-16位字符，其中包括至少一个字母和一个数字";
    },
    // 邮箱验证
    isEMail: function (field, rules, i, options) {
        var value = field.val();
        return (/^\w+((-\w+)|(\.\w+))*\@[A-Za-z0-9]+((\.|-)[A-Za-z0-9]+)*\.[A-Za-z0-9]+$/.test(value)) ? true : '请输入正确的邮箱格式';
    },
    // 身份证验证
    // -S-身份证验证
    isIdCardNo: function (field, rules, i, options) {

        function isDate6(sDate) {
            if (!/^[0-9]{6}$/.test(sDate)) {
                return false;
            }
            var year, month, day;
            year = sDate.substring(0, 4);
            month = sDate.substring(4, 6);
            if (year < 1700 || year > 2500) return false
            if (month < 1 || month > 12) return false
            return true
        }

        function isDate8(sDate) {
            if (!/^[0-9]{8}$/.test(sDate)) {
                return false;
            }
            var year, month, day;
            year = sDate.substring(0, 4);
            month = sDate.substring(4, 6);
            day = sDate.substring(6, 8);
            var iaMonthDays = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
            if (year < 1700 || year > 2500) return false;
            if (((year % 4 == 0) && (year % 100 != 0)) || (year % 400 == 0)) iaMonthDays[1] = 29;
            if (month < 1 || month > 12) return false;
            if (day < 1 || day > iaMonthDays[month - 1]) return false;
            return true
        }

        function isIdCardNo(num) {
            var factorArr = [7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2, 1];
            var parityBit = ["1", "0", "X", "9", "8", "7", "6", "5", "4", "3", "2"];
            var varArray = [];
            var intValue;
            var lngProduct = 0;
            var intCheckDigit;
            var intStrLen = num.length;
            var idNumber = num;
            // initialize
            if ((intStrLen != 15) && (intStrLen != 18)) {
                return false;
            }
            // check and set value
            for (i = 0; i < intStrLen; i++) {
                varArray[i] = idNumber.charAt(i);
                if ((varArray[i] < '0' || varArray[i] > '9') && (i != 17)) {
                    return false;
                } else if (i < 17) {
                    varArray[i] = varArray[i] * factorArr[i];
                }
            }
            if (intStrLen == 18) {
                // check date
                var date8 = idNumber.substring(6, 14);
                if (isDate8(date8) == false) {
                    return false;
                }
                // calculate the sum of the products
                for (i = 0; i < 17; i++) {
                    lngProduct = lngProduct + varArray[i];
                }
                // calculate the check digit
                intCheckDigit = parityBit[lngProduct % 11];
                // check last digit
                if (varArray[17] != intCheckDigit) {
                    return false;
                }
            }
            else {        // length is 15
                // check date
                var date6 = idNumber.substring(6, 12);
                if (isDate6(date6) == false) {
                    return false;
                }
            }
            return true;
        }

        // -S-密码校验
        var value = field.val();
        return isIdCardNo(value) ? true : "请正确输入您的身份证号码";
    },



};

var data_time_picker = {
    data_picker: {
        dateFormat: 'Y-m-d',
        locale: "zh",
        onChange: function (selectedDates, dateStr, instance) {
            data_time_picker_changeData(selectedDates, dateStr, instance);
            data_time_picker_validate(selectedDates, dateStr, instance);
        },
        onReady: function (selectedDates, dateStr, instance) {
            data_time_picker_changeData(selectedDates, dateStr, instance);
        }
    },
    data_time_picker: {
        dateFormat: 'Y-m-d H:i:S',
        locale: "zh",
        enableTime: true,
        time_24hr: true,
        onChange: function (selectedDates, dateStr, instance) {
            data_time_picker_changeData(selectedDates, dateStr, instance);
            data_time_picker_validate(selectedDates, dateStr, instance);
        },
        onReady: function (selectedDates, dateStr, instance) {
            data_time_picker_changeData(selectedDates, dateStr, instance)
        }
    },
    time_picker: {
        dateFormat: 'H:i:S',
        locale: "zh",
        noCalendar: true,
        enableTime: true,
    },
    purchase_data_picker: {
        dateFormat: 'Y-m-d',
        locale: "zh",
        minDate: "today",
        onChange: function (selectedDates, dateStr, instance) {
            data_time_picker_changeData(selectedDates, dateStr, instance);
            data_time_picker_validate(selectedDates, dateStr, instance);
        },
        onReady: function (selectedDates, dateStr, instance) {
            data_time_picker_changeData(selectedDates, dateStr, instance)
        }
    },


}
var data_time_picker_changeData = function (selectedDates, dateStr, instance) {
    var $ele = $(instance.element);
    if (dateStr != '') {
        if ($ele.next().length == 0) {
            $ele.parent().append("<i class = 'close-picker fa fa-times'></i>");

            $ele.next().on("click", function () {
                instance.clear();
            })
        }

    } else {
        $ele.next().remove();
    }
};
var data_time_picker_validate = function (selectedDates, dateStr, instance) {
    var $ele = $(instance.element);
    $ele.validationEngine("validate");
};
var DWY_area = {
    area: {},
    getAreaList: function (id, callback) {

        if (DWY_area.area[id]) {
            callback ? callback(DWY_area.area[id]) : '';
            return;
        }

        $.ajax({
            url: '/cascade/api/areas' + (((id != 'province') && id) ? '?id=' + id : ''),
            method: "get",
            success: function (data) {
                if (id)
                    DWY_area.area[id] = data;
                else
                    DWY_area.area.province = data;

                // 有回调执行回调
                callback ? callback(data) : '';
            }
        })
    },
    refreshCity: function ($city, $district, province_id, city_id) {

        $city.find('option').remove();

        DWY_area.getAreaList(province_id, function (data) {
            var city_option_list = [];
            if (data.length > 1) {
                // 多个选项
                city_option_list.push(new Option('- 市 -',''));
                for (var i in data) {
                    if(data.hasOwnProperty(i)){
                        city_option_list.push(new Option(data[i].name, data[i].id));
                    }
                }
                $city.append($(city_option_list).clone());

                // DWY_area.clearDistrict($district);
                if(!city_id){
                    DWY_area.clearDistrict($district);
                }
                if(city_id){
                    $city.val(city_id)
                }
            } else {
                // 如果只有一个选项
                $city.append($(new Option(data[0].name, data[0].id)).attr('selected', true));
                $city.trigger('change');
                if(city_id){
                    $city.val(city_id)
                }
            }

        })


    },
    refreshDistrict: function ($district, city_id, district_id) {
        $district.find('option').remove();

        DWY_area.getAreaList(city_id, function (data) {
            var district_option_list = [];
            if (data.length > 1) {
                // 多个选项
                district_option_list.push(new Option('- 区 -',''));
                for (var i in data) {
                    if(data.hasOwnProperty(i)){
                        district_option_list.push(new Option(data[i].name, data[i].id));
                    }
                }
                $district.append($(district_option_list).clone());

                if(district_id){
                    $district.val(district_id)
                }
            } else {
                // 如果只有一个选项
                $district.append($(new Option(data[0].name, data[0].id)).attr('selected', true));
                if(district_id){
                    $district.val(district_id)
                }
            }

        })

    },
    clearDistrict: function ($district) {
        $district.find('option').remove();
        $district.append(new Option('- 区 -',''));
    },
    setValue: function (list) {
        if(list){
            for(var i=0; i<list.length; i++){
                var element = list[i];
                if(element.value){
                    switch (element.key){
                        case 'province':
                            DWY_area.refreshCity($('select[name='+element.linkcity+']'), $('select[name='+element.linkdis+']'), element.value, element.cityId);
                            break;
                        case 'city':
                            DWY_area.refreshDistrict($('select[name='+element.linkdis+']'), element.value, element.disId);
                            break;
                    }
                    $("select[name="+element.name+"]").val(element.value);
                }

                // $("select[name=birthCity]").val(650400);
            }

        }
    },
    init: function (config) {
        var _config = config || {};
        _config.target = _config.target || '.dwy-area';
        _config.province = _config.province || '.dwy-province';
        _config.city = _config.city || '.dwy-city';
        _config.district = _config.district || '.dwy-district';

        _config.defaultValue = _config.defaultValue || [];

        if (!_config.target) {
            // console.log('目标不存在!')
        }

        DWY_area.getAreaList('province', function (data) {

            var province_option_list = [];

            province_option_list.push(new Option('- 省 -',''));

            for (var i in data) {
                if(data.hasOwnProperty(i)){
                    province_option_list.push(new Option(data[i].name, data[i].id));
                }
            }


            $(_config.target).each(function (index, element) {
                var area_select = $(element);
                var province = area_select.find(_config.province);
                var city = area_select.find(_config.city);
                var district = area_select.find(_config.district);
                province.find('option').remove();
                province.append($(province_option_list).clone());

                province.on({
                    change: function (e) {
                        var province_id = $(this).val();
                        DWY_area.refreshCity(city, district, province_id);
                    }
                });
                city.on({
                    change: function (e) {
                        var city_id = $(this).val();
                        DWY_area.refreshDistrict(district, city_id);
                    }
                })


            });

            DWY_area.setValue(_config.defaultValue);

        })

    },

}

// 工厂-仓库-区域 联动下拉框
var DWY_fty_region = {
    region_diff: {},

    getFactoryList: function (callback) {
        $.ajax({
            url: '/getFactoryList',
            method: "get",
            success: function (data) {
                data = JSON.parse(data);
                // if (id)
                //     DWY_fty_region.area[id] = data;
                // else
                //     DWY_fty_region.area.factory = data;

                // 有回调执行回调
                callback ? callback(data) : '';
            }
        })
    },

    getWarehouseList: function (id, callback) {

        // if (DWY_fty_region.area[id]) {
        //     callback ? callback(DWY_fty_region.area[id]) : '';
        //     return;
        // }

        $.ajax({
            url: '/getWarehouseList/'+id,
            method: "put",
            success: function (data) {
                 data = JSON.parse(data);
                // if (id)
                //     DWY_fty_region.area[id] = data;
                // else
                //     DWY_fty_region.area.factory = data;

                // 有回调执行回调
                callback ? callback(data) : '';
            }
        })
    },
    getRegionList: function (id, callback) {

        // if (DWY_fty_region.area[id]) {
        //     callback ? callback(DWY_fty_region.area[id]) : '';
        //     return;
        // }

        $.ajax({
            url: '/getRegionList/'+id+'?cargoId='+DWY_fty_region.region_diff.cargoId+'&type='+DWY_fty_region.region_diff.type,
            method: "put",
            success: function (data) {
                data = JSON.parse(data);
                // if (id)
                //     DWY_fty_region.area[id] = data;
                // else
                //     DWY_fty_region.area.factory = data;

                // 有回调执行回调
                callback ? callback(data) : '';
            }
        })
    },
    setFactoryValue: function ($factory,$warehouse, $region,factory_id,warehouse_id,region_id) {
        $factory.val(factory_id);
        DWY_fty_region.refreshWarehouse($warehouse, $region, factory_id,warehouse_id,region_id);
    },
    refreshWarehouse: function ($warehouse, $region, factory_id, warehouse_id,region_id) {

        $warehouse.find('option').remove();

        DWY_fty_region.getWarehouseList(factory_id, function (data) {
            var warehouse_option_list = [];
            warehouse_option_list.push(new Option('- 仓库 -',''));
            for (var i in data) {
                if(data.hasOwnProperty(i)){
                    warehouse_option_list.push(new Option(data[i].name, data[i].whseId));
                }
            }
            $warehouse.append($(warehouse_option_list).clone());

            DWY_fty_region.clearRegion($region);

            if(warehouse_id){
                $warehouse.val(warehouse_id);
                DWY_fty_region.refreshRegion($region, warehouse_id,region_id);
            }
        })



    },
    refreshRegion: function ($region, warehouse_id, region_id) {
        $region.find('option').remove();

        DWY_fty_region.getRegionList(warehouse_id, function (data) {
            var region_option_list = [];
            region_option_list.push(new Option('- 区域 -',''));
            for (var i in data) {
                if(data.hasOwnProperty(i)){
                    region_option_list.push(new Option(data[i].name, data[i].regionId));
                }
            }
            $region.append($(region_option_list).clone());

            if(region_id){
                $region.val(region_id)
            }

        })

    },
    clearWarehouse: function ($warehouse) {
        $warehouse.find('option').remove();
        $warehouse.append(new Option('- 仓库 -',''));
    },
    clearRegion: function ($region) {
        $region.find('option').remove();
        $region.append(new Option('- 区域 -',''));
    },
    setValue: function (list) {
        var _config = list || {};
        _config.target = _config.target || '.target';
        _config.factoryValue = _config.factoryValue || '';
        _config.warehouseValue = _config.warehouseValue || '';
        _config.regionValue = _config.regionValue || '';

        if (!_config.target) {
            // console.log('目标不存在!')
        }

        $(_config.target).each(function (index, element) {
            var area_select = $(element);
            var factory = area_select.find('.ftyId');
            var warehouse = area_select.find('.whseId');
            var region = area_select.find('.regionId');
            DWY_fty_region.setFactoryValue(factory,warehouse,region, _config.factoryValue,_config.warehouseValue,_config.regionValue);


        });

    },
    init: function (config) {
        var _config = config || {};
        _config.target = _config.target || '.target';
        _config.factory = _config.factory || '.ftyId';
        _config.warehouse = _config.warehouse || '.whseId';
        _config.region = _config.region || '.regionId';

        _config.factoryValue = _config.factoryValue || '';
        _config.warehouseValue = _config.warehouseValue || '';
        _config.regionValue = _config.regionValue || '';

        _config.cargoId = _config.cargoId || '';
        _config.type = _config.type || '';

        DWY_fty_region.region_diff.cargoId = _config.cargoId;
        DWY_fty_region.region_diff.type = _config.type;

        _config.defaultValue = _config.defaultValue || [];

        if (!_config.target) {
            // console.log('目标不存在!')
        }

        DWY_fty_region.getFactoryList(function (data) {

            var factory_option_list = [];

            factory_option_list.push(new Option('- 工厂 -',''));

            for (var i in data) {
                if(data.hasOwnProperty(i)){
                    factory_option_list.push(new Option(data[i].name, data[i].ftyId));
                }
            }


            $(_config.target).each(function (index, element) {
                var area_select = $(element);
                var factory = area_select.find(_config.factory);
                var warehouse = area_select.find(_config.warehouse);
                var region = area_select.find(_config.region);
                factory.find('option').remove();
                factory.append($(factory_option_list).clone());

                factory.on({
                    change: function (e) {
                        var factory_id = $(this).val();
                        if(factory_id){
                            DWY_fty_region.refreshWarehouse(warehouse, region, factory_id);
                        }else{
                            DWY_fty_region.clearWarehouse(warehouse);
                            DWY_fty_region.clearRegion(region);
                        }

                    }
                });
                warehouse.on({
                    change: function (e) {
                        var warehouse_id = $(this).val();
                        if(warehouse_id){
                            DWY_fty_region.refreshRegion(region, warehouse_id);
                        }else{
                            DWY_fty_region.clearRegion(region);
                        }

                    }
                });

                if(_config.factoryValue){
                    DWY_fty_region.setFactoryValue(factory,warehouse,region, _config.factoryValue,_config.warehouseValue,_config.regionValue);
                }


            });


        })

    },

}

var errorLayout = {
    normal : function (data) {
        var _data = JSON.parse(data.responseText);
        $.smallBox({
            title: "操作失败",
            content: _data.msg,
            color: "#C46A69",
            iconSmall: "fa fa-times fa-2x fadeInRight animated",
            timeout: 3000
        });

    },
}
var successLayout = {
    reload : function () {
        $.smallBox({
            title: "操作成功",
            content:"刷新页面中...",
            color: "#8ac38b",
            iconSmall: "fa fa-times fa-2x fadeInRight animated",
            timeout: DWY_GLOBAL_CONSTANT.TimeOut
        });
        setTimeout(function () {
            window.location.reload();
        },DWY_GLOBAL_CONSTANT.TimeOut)
    },
    hrefTo : function (url) {
        $.smallBox({
            title: "操作成功",
            content:"跳转页面中...",
            color: "#8ac38b",
            iconSmall: "fa fa-times fa-2x fadeInRight animated",
            timeout: DWY_GLOBAL_CONSTANT.TimeOut
        });
        setTimeout(function () {
            location.href = url
        },DWY_GLOBAL_CONSTANT.TimeOut)
    },
}




$(document).ready(function () {
    var dwy_msg_type = $('input[name=dwy-message-type]');
    var dwy_msg_info = $('input[name=dwy-message-info]');
    var dwy_msg_sign = $('input[name=dwy-message-sign]');


    // 信息处理
    if (dwy_msg_sign.val() && (dwy_msg_sign.val() != localStorage.getItem('dwy_msg_sign'))) {
        if (dwy_msg_type.val() == 'error') {
            $.smallBox({
                title: "操作失败",
                content: dwy_msg_info.val(),
                color: "#C46A69",
                iconSmall: "fa fa-times fa-2x fadeInRight animated",
                timeout: 3000
            });
        }

        if (dwy_msg_type.val() == 'info') {
            $.smallBox({
                title: "操作成功",
                content: dwy_msg_info.val(),
                color: "#8ac38b",
                iconSmall: "fa fa-times fa-2x fadeInRight animated",
                timeout: DWY_GLOBAL_CONSTANT.TimeOut
            });
        }

        localStorage.setItem('dwy_msg_sign', dwy_msg_sign.val());
    }

});