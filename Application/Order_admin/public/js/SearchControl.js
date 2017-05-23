// version: "1.3.9"

var BMapLib = window.BMapLib = BMapLib || {};
(function () {

    window.LOCAL_SEARCH = "1";
    window.SEARCH_RANG = false;

    function initMap(option) {
        this.map = option.map;
        this.projection = this.map.getMapType().getProjection();
        // this.container = option.container; //存放控件的容器
        this.type = option.type || LOCAL_SEARCH;
        // 添加控件时是否进行定位,默认添加控件时定位到当前城市
        this.enableAutoLocation = option.enableAutoLocation === false ? false : true;
        this.initialize();
        this.map.enableInertialDragging(); //开启关系拖拽
        this.map.enableScrollWheelZoom();  //开启鼠标滚动缩放
        //创建鱼骨控件
        var navCtrl = new BMap.NavigationControl({
            anchor: BMAP_ANCHOR_TOP_LEFT //设置鱼骨控件的位置
        });
        this.map.addControl(navCtrl);// 将鱼骨添加到地图当中
    }

    initMap.prototype = {
        constructor: initMap,
        initialize: function () {
            this._initDom();
            if (this.enableAutoLocation) {
                this._initLocalCity()
            }
            this._initService();
            this._initCityTab();
            this._bind();
        },

        //获取demo元素
        _initDom: function () {
            this.dom = {
                searchBoxContent: $("#BMapLib_searchBoxContent"),
                sc0: $("#BMapLib_sc0"),
                searchText: $("#BMapLib_PoiSearch"),
                nSearchBtn: $("#BMapLib_sc_b0"),
                cityTab: $("#BMapLib_cityTab"),
                tipBox: $("#BMapLib_tipBox"),
                provinces: $("#BMapLib_provinces"),
                selectcity: $("#BMapLib_city"),
                longLatitude: $("#longLatitude"),
                address: $("#search_address"),
                resultArea: $("#BMapLib_resultArea")
            };
            this.cityListSub = {};
        },

        //启动时定位到当前城市
        _initLocalCity: function () {
            var localCity = new BMap.LocalCity(), map = this.map, cityTab = this.dom.cityTab;
            localCity.get(function (result) {
                // console.log("initLocalCity", result)
                var cityName = result.name;
                map.setCenter(cityName);
                cityTab.html(cityName);
            });

        },

        _initService: function () {
            var map = this.map;
            var _self = this;
            this.localSearch = new BMap.LocalSearch(map, {
                renderOptions: {
                    map: map,
                    selectFirstResult: true
                },
                onSearchComplete: function (result) {
                    var resultStatus = _self.localSearch.getStatus();
                    if (result.getPoi(0)) {
                        // console.log("result", result.getPoi(0))
                        var poi = result.getPoi(0);
                        _self.dom.longLatitude.text(poi.point.lng + "," + poi.point.lat);
                        _self.dom.address.text(poi.title);
                    }
                    //     var poi = searchResult.getPoi(0);
                    //     k.map.centerAndZoom(poi.point, 13);
                    //     var marker = new BMap.Marker(new BMap.Point(poi.point.lng, poi.point.lat));  // 创建标注，为要查询的地方对应的经纬度
                    //     k.map.addOverlay(marker);

                    if (resultStatus != BMAP_STATUS_SUCCESS) {
                        _self.showTipBox(resultStatus)
                    } else {
                        if (result.city) {
                            _self.setCityTabName(result.city)
                        }
                    }
                },
                onMarkersSet: function (pois) {
                    for (var i = 0; i < pois.length; i++) {
                        pois[i].marker.addEventListener("click", function () {
                            var position = this.getPosition();
                            var address = this.getTitle();
                            _self.dom.longLatitude.text(position.lng + "," + position.lat);
                            _self.dom.address.text(address);
                            _self.dom.searchText.val(address);

                        })
                    }
                }
            });

        },

        _bind: function () {
            var _self = this;
            this.dom.nSearchBtn.on("click", function () {
                _self.localSearchAction()
            });
            this.dom.searchText.on("keydown", function (event) {
                if(event.keyCode==13){
                    _self.localSearchAction()
                }
            });
            // this.autoCompleteIni()
        },

        localSearchAction: function () {
            this.reset();
            this.dom.searchText.blur();
            // this.searchAC.hide();
            var searchText = this.dom.searchText.val();
            if (searchText) {
                this.localSearch.search(searchText, {
                    forceLocal: window.SEARCH_RANG
                });
                this.dom.resultArea.show();
            }

        },

        //未搜索到准确的结果提示
        showTipBox: function (status) {
            var resultText = "未搜索到准确的结果";
            switch (status) {
                case BMAP_STATUS_UNKNOWN_LOCATION:
                    resultText = "位置结果未知";
                    break;
                case BMAP_STATUS_UNKNOWN_ROUTE:
                    resultText = "导航结果未知";
                    break
            }
            var _self = this;
            _self.dom.tipBox.html(resultText);
            _self.dom.tipBox.show();
            window.setTimeout(function () {
                _self.dom.tipBox.hide();
            }, 2000)
        },

        //输入自动提示，目前屏蔽该块代码，百度API 有问题，location 不起作用
        autoCompleteIni: function () {
            this.searchAC = new BMap.Autocomplete({
                input: "BMapLib_PoiSearch",
                location: this.map
                // location:  '北京市',
            });

            //鼠标点击下拉列表后的事件
            this.searchAC.addEventListener("onconfirm", function (e) {
                // var _value = e.item.value;
                // console.log(_value);
            });
        },

        //清空搜索数据
        reset: function () {
            this.localSearch.clearResults();
        },

        //省份select 初始化
        _initCityTab: function () {
            this.citySelectDom = this.dom.provinces;
            var provinces = "北京|131,上海|289,天津|332,重庆|132,安徽|23,福建|16,甘肃|6,广东|7,广西|17,贵州|24,海南|21,河北|25,黑龙江|2,河南|30,湖北|15,湖南|26,江苏|18,江西|31,吉林省|9,辽宁|19,内蒙古|22,宁夏|20,青海|11,山东|8,山西|10,陕西|27,四川|32,新疆|12,西藏|13,云南|28,浙江|29".split(",");
            var provincesArry = [];
            for (var i = 0; i < provinces.length; i++) {
                var provinceValue = provinces[i].split("|");
                provincesArry.push({name: provinceValue[0], code: provinceValue[1]})
            }
            var provincesOption = '';
            for (var j = 0; j < provincesArry.length; j++) {
                provincesOption += '<option type= "1" value="' + provincesArry[j]["code"] + '"  id="BMapLib_cityItem' + provincesArry[j]["code"] + '">' + provincesArry[j]["name"] + "</option>"
            }
            var _self = this;
            _self.dom.provinces.append(provincesOption);

            _self.dom.provinces.change(function () {
                var selectedIndex = this.selectedIndex;
                var provinceValue = this.value;
                var provinceText = this.options[selectedIndex].text;
                if (provinceValue != 0) {
                    window.SEARCH_RANG = true;
                    // 若有下级数据缓存则取缓存数据
                    if (window.localStorage && window.localStorage.getItem("BMapLib_city" + provinceValue)) {
                        var cities = window.localStorage.getItem("BMapLib_city" + provinceValue);
                        _self.selectCityCallback(JSON.parse(cities));
                    } else {
                        // 若无则发起请求获取下级数据
                        _self.request(provinceValue)
                    }
                    _self.map.centerAndZoom(provinceText, 12);
                    _self.setCityTabName(provinceText);
                    _self.dom.longLatitude.text("");
                    _self.dom.address.text("");

                } else {
                    window.SEARCH_RANG = false
                    // _self.map.centerAndZoom(new BMap.Point(116.30946, 39.937629), 12);
                    _self.setCityTabName("全国");
                    _self.dom.selectcity.html('<option type="0" value="0" >- 全国 -</option>')
                }
            });

            _self.dom.selectcity.change(function () {
                var cityValue = this.value;
                var selectedIndex = this.selectedIndex;
                var cityText = this.options[selectedIndex].text;
                // console.log("cityValue", cityValue)
                if (cityValue != 0) {
                    _self.dom.longLatitude.text("");
                    _self.dom.address.text("");
                    _self.setCityTabName(cityText);
                    var pointXY = cityValue.split(",");
                    var pixel = new BMap.Pixel(pointXY[0], pointXY[1]);
                    var pointToLngLat = _self.projection.pointToLngLat(pixel);
                    _self.map.centerAndZoom(pointToLngLat, 13);
                }
            });
        },

        //修改城市文字
        setCityTabName: function (value) {
            this.dom.cityTab.html(value)
        },

        //通过省份请求下级数据
        request: function (cityCode) {
            var _self = this;
            var random = (Math.random() * 100000).toFixed(0);
            window.baidu = window.baidu || {};
            window.baidu["_cbk" + random] = function (result) {
                if (window.localStorage && window.localStorage != null) {
                    window.localStorage.setItem("BMapLib_city" + cityCode, JSON.stringify(result))
                }
                _self.selectCityCallback(result);
                delete window.baidu["_cbk" + random]
            };
            var getCitiesUrl = "http://map.baidu.com/?qt=sub_area_list&areacode=" + cityCode + "&level=1&from=mapapi&ie=utf-8&l=12&callback=baidu._cbk" + random;
            var createScript = document.createElement("script");
            createScript.setAttribute("src", getCitiesUrl);
            createScript.setAttribute("type", "text/javascript");
            createScript.setAttribute("charset", "utf-8");
            if (createScript.addEventListener) {
                createScript.addEventListener("load", function (option) {
                    var target = option.target;
                    target.parentNode.removeChild(target)
                }, false)
            } else {
                if (createScript.attachEvent) {
                    createScript.attachEvent("onreadystatechange", function () {
                        var srcElement = window.event.srcElement;
                        if (srcElement && (srcElement.readyState == "loaded" || srcElement.readyState == "complete")) {
                            srcElement.parentNode.removeChild(srcElement)
                        }
                    })
                }
            }
            setTimeout(function () {
                document.getElementsByTagName("head")[0].appendChild(createScript);
                createScript = null
            }, 1)
        },

        //城市选择事件
        selectCityCallback: function (cities) {
            if (cities.result.error != 0) {
                return
            }
            var sub = cities.content.sub, area_code = cities.content.area_code, area_name = cities.content.area_name;
            if (!this.cityListSub[area_code]) {
                this.cityListSub[area_code] = this.dom.selectcity;
                var cityOption = "";
                var municipalities = /北京|上海|天津|重庆/g;
                if (area_name.match(municipalities)) {
                    cityOption += "<option type='3' value='0' cityname='" + area_name + "'>全市</option>"
                }
                for (var i = 0; i < sub.length; i++) {
                    var geo = sub[i].geo.split("|")[2];
                    cityOption += "<option  type='2' value='" + geo.substr(0, geo.length - 1) + "'>" + sub[i].area_name + "</option>"
                }
                this.dom.selectcity.html(cityOption);
            }
        }
    };

    BMapLib.SearchControl = initMap
})();

