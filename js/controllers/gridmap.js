//网格地图页面的controller
app.controller('gridmapctl', ['$scope','$rootScope', '$http','$compile',function($scope,$rootScope,$http,$compile) {
    //一个地图上的所有可移动目标
    $scope.movingObjs=[{
        name:'张三',
        curlocation:'',
        lastTime:'',
        historylocations:[]
    },{
        name:'李四',
        curlocation:'',
        lastTime:'',
        historylocations:[]
    },{
        name:'王五',
        curlocation:'',
        lastTime:'',
        historylocations:[]
    },{
        name:'朱六',
        curlocation:'',
        lastTime:'',
        historylocations:[]
    },{
        name:'马就',
        curlocation:'',
        lastTime:'',
        historylocations:[]
    }];

    $scope.map='';




    //随机生成一个位置点
    $scope.getRadomPt = function(orgPt){
        var resultPt={
            longitude:'',
            latitude:''
        };
        if(orgPt && orgPt.longitude && orgPt.latitude){
            resultPt.longitude=orgPt.longitude+Math.random()/25*(Math.random()>0.5?-1:1);
            resultPt.latitude=orgPt.latitude+Math.random()/25*(Math.random()>0.5?-1:1);
        }else
        {
            resultPt.longitude=116.40106141351825+Math.random()/25*(Math.random()>0.5?-1:1);
            resultPt.latitude=39.994762731321174+Math.random()/25*(Math.random()>0.5?-1:1);
        }
        // alert("resultPt:"+resultPt.longitude+"<>"+resultPt.latitude);
        return resultPt;
    };


    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    }

    $scope.engineConfig={
        showWorkMates:true,
        showSubDepartments:true,
        timeFrequency:10,//秒
        showOnlineWarning:true,
        showOffdutyWarning:true,
        showLastMessage:true

    }

    /**
     * 刷新地图上所有活动点
     */
    $scope.refreshMovingObjs=function(){
        for(var index=0;index<$scope.movingObjs.length;index++){
            if(!$scope.movingObjs[index].curlocation){
                var temppt=$scope.getRadomPt();
                $scope.movingObjs[index].curlocation=temppt;
                //alert("$scope.movingObjs[index].curlocation:"+$scope.movingObjs[index].curlocation.longitude+"<>"+$scope.movingObjs[index].curlocation.latitude);
            }
            else {
                $scope.movingObjs[index].curlocation=$scope.getRadomPt($scope.movingObjs[index].curlocation);
            }
            $scope.movingObjs[index].lastTime=new Date();
        }
    }

    $scope.asd =function() {
        alert("asd")
    }
    /***
     * 绘制地图上一个活动图标,活动图标维护一个数组,按照index进行刷新
     */
    $scope.drawMovingMarkerObj=function(index,position,text)
    {
        if (!$scope.movingMarkers[index]) {
            $scope.movingMarkers[index]= new AMap.Marker({ map: $scope.map })
        }

        $scope.movingMarkers[index].setPosition(position);

        //  //构建信息窗体中显示的内容
        // var html='<div class="panel-heading"><button ng-click="asd()" class="btn m-b-xs w-xs btn-primary">asdasd</button></div>';
        // var template = angular.element(html);
        // //编译模板
        // var Element = $compile(template)($scope);
        //
        // var  infowindow3 = new AMap.InfoWindow({
        //     // content: content,
        //     content: Element[0],
        //     // placeSearch: false,
        //     // asDestination: false,
        //     offset: new AMap.Pixel(0, -30)
        // });
        //
        // infowindow3.open($scope.map,position);

        // 设置鼠标划过点标记显示的文字提示
        $scope.movingMarkers[index].setTitle(text);

        // 设置label标签
        $scope.movingMarkers[index].setLabel({//label默认蓝框白底左上角显示，样式className为：amap-marker-label
            offset: new AMap.Pixel(20, 20),//修改label相对于maker的位置
            content: text
        });
    }

    /**
     * 刷新地图,这是每一轮循环必做之事
     */
    $scope.refeshMap=function () {
        $scope.refreshMovingObjs();
        for(var index=0;index<$scope.movingObjs.length;index++){
            //alert(position);
            var position=[$scope.movingObjs[index].curlocation.longitude, $scope.movingObjs[index].curlocation.latitude];
            // alert("position:"+position);
            var text=$scope.movingObjs[index].name+'\n'+$scope.movingObjs[index].lastTime;
            // alert("text:"+text);
            $scope.drawMovingMarkerObj(index,position,text);
        }
        //$scope.map.setFitView();
        // alert("$scope.movingObjs.length:"+$scope.movingObjs.length);
    }

    /**
     * 解析geojson为方便高德输入的字符串,如果换其他地图,就换这里的地图数据
     */
    $scope.parseGeojson=function (jsonstr){
        var polyArray=new Array();
        if(jsonstr.features){
            for(var index=0;index<jsonstr.features.length;index++){
                polyArray[index]={
                    name:jsonstr.features[index].properties.name,
                    path:jsonstr.features[index].geometry.coordinates[0],
                    strokeColor:  '#'+(Math.random()*0xffffff<<0).toString(16), //线颜色
                    strokeOpacity: 0.2, //线透明度
                    strokeWeight: 3,    //线宽
                    fillColor:  '#'+(Math.random()*0xffffff<<0).toString(16), //填充色
                    fillOpacity: 0.35//填充透明度
                };
            }
        }
        return polyArray;
    }

    /*
    绘制多边形图层
     */
    $scope.drawpolylayer=function (polylayer){
        // var polygonArr = new Array();//多边形覆盖物节点坐标数组
        // polygonArr.push([116.403322, 39.920255]);
        // polygonArr.push([116.410703, 39.897555]);
        // polygonArr.push([116.402292, 39.892353]);
        // polygonArr.push([116.389846, 39.891365]);
        for(var index=0;index<polylayer.length;index++){
            var temp=polylayer[index];
            var  polygon = new AMap.Polygon({
                path: temp.path,//设置多边形边界路径
                strokeColor: temp.strokeColor, //线颜色
                strokeOpacity: temp.strokeOpacity, //线透明度
                strokeWeight: temp.strokeWeight,    //线宽
                fillColor: temp.fillColor, //填充色
                fillOpacity: temp.fillOpacity//填充透明度
            });
            polygon.setExtData({name:temp.name});
            polygon.setMap($scope.map);
        }
    }

    //这个地图上所有多边形图层的集合
    $scope.polylayers=new Array();
    /*
    加载多边形图层
     */
    $scope.loadpolylayers=function ()
    {
        for (var index=0;index<$rootScope.polylayers.length;index++){
           var path=$rootScope.polylayers[index].path;       // <!--获取本地json资源文件-->
            var filename=$rootScope.polylayers[index].name;
            $http.get($rootScope.serverpath+path+filename).success(function (data) {
                // console.log(data);
                $scope.polylayers[index]=$scope.parseGeojson(data);
                // console.log($scope.polylayers[index]);
                $scope.drawpolylayer($scope.polylayers[index]);
            });
        }
    }


    /***
     * 判断是否在指定多边形图层的多边形,区域内
     */
    $scope.judgePTInsidePolygon=function (postionarray,polygon) {
        // var polygon = new AMap.Polygon({
        //     map: map,
        //     path: path
        // });
        return  polygon.contains(postionarray);//[116.368904, 39.923423]
        // alert("$scope.movingObjs.length:"+$scope.movingObjs.length);
    }

    /*
    *加载自定义的多边形图层
     */


    /*
    *加载自定义的点图层
     */
    $scope.loadPointLayer=function (url,name) {
        var ptlayer='';
        //    这里应该是从服务器读取图层，读什么位置，从配置上来
        ptlayer=[{
            name:'舅舅家',
            type:'1',
            position:$scope.getRadomPt()
        },{
            name:'姥姥家',
            type:'3',
            position:$scope.getRadomPt()
        },{
            name:'地方家',
            type:'2',
            position:$scope.getRadomPt()
        }
        ];
        for(var index=0;index<ptlayer.length;index++){
            // var polygonArr = new Array();//多边形覆盖物节点坐标数组
            // polygonArr.push([116.403322, 39.920255]);
            // polygonArr.push([116.410703, 39.897555]);
            // polygonArr.push([116.402292, 39.892353]);
            // polygonArr.push([116.389846, 39.891365]);
            // var  polygon = new AMap.Polygon({
            //     path: polygonArr,//设置多边形边界路径
            //     strokeColor: "#FF33FF", //线颜色
            //     strokeOpacity: 0.2, //线透明度
            //     strokeWeight: 3,    //线宽
            //     fillColor: "#1791fc", //填充色
            //     fillOpacity: 0.35//填充透明度
            // });
            // polygon.setMap(map);
        }
    }
    /**
     * 引擎初始化,读取和应用一些设置
     */
    $scope.engineInitialise =function(params) {
        var config=$scope.engineConfig;
        if (config.showWorkMates) {
            if ($rootScope.workmates && $rootScope.workmates.length>0) {

            }

        }
        $scope.movingMarkers=new Array();

        $scope.loadpolylayers();
    }


    /***
     * 引擎运行
     */
    $scope.engineRun =function(params) {
        //引擎设置好就开始运行
        // alert( '中文试试');
        // alert( $scope.engineRun);
        // alert( '中文试试2');
        $scope.engineInitialise();
        //在地图页面启动周期性函数
        $rootScope.mapEngineTimer=window.setInterval(
            function(){
                // alert('ok');
                //开始定位刷新地图
                $scope.refeshMap();

                //获取信号强度，进行提示需要在设施准备好之后才能实施
                //    window.SignalStrength.dbm(function(db){
                //    //
                //    });
                //    alert('ok');

            }
            ,$rootScope.locationRefreshTime);
    }

    $scope.enginePause =function(params) {

    }

    $scope.engineResum =function(params) {

    }

    $scope.engineStop =function(params) {
        window.clearInterval($rootScope.mapEngineTimer);
    }




    $scope.engineRun();

}]);



app.directive('gdMap', function ($timeout,$window) {
        return {
            restrict: 'EA',
            // scope: {
            //     point: '=?',
            // },
            template: '<div></div>',
            replace: true,
            link: function (scope, el, attr, ctrl) {

                scope.map = new AMap.Map(el[0], {
                    resizeEnable: true,
                    zoom: 12,
                });
                
                //自动最大化高度
                var winowHeight = $window.innerHeight; //获取窗口高度
                var headerHeight = 80;
                var footerHeight = 20;
                el.css('min-height',
                        (winowHeight - headerHeight - footerHeight) + 'px');
/*                        
                if (scope.point.lat && scope.point.lng) {
                    var center = [scope.point.lng, scope.point.lat]
                    scope.map.setCenter(center)
                    scope.marker = new AMap.Marker({ map: scope.map })
                    scope.marker.setPosition(center)
                }
*/

								//加入缩放工具栏
								scope.map.addControl(new AMap.ToolBar());
								//加入鹰眼
								scope.map.addControl(new AMap.OverView());
								
                scope.map.on('click', function (e) {
                    scope.$emit('map-click', e)

                    if (!scope.marker) {
                        scope.marker = new AMap.Marker({ map: scope.map })
                    }
                    // alert(scope.enginePause);

                    scope.marker.setPosition([e.lnglat.getLng(), e.lnglat.getLat()])
                })

                scope.$on('setCenter', function (event, center) {
                    if (!scope.map) return
                    // scope.map.setCenter(center)
                })
            }
        }
    });

