//网格地图页面的controller
app.controller('gridmapctl',
  ['$scope', '$rootScope', '$http', '$compile', 'localStorageService', 'userService', 'gridmapService',
    function ($scope, $rootScope, $http, $compile, localStorageService, userService, gridmapService) {
      $rootScope.mapEngine = {};
      //一个地图上的所有可移动目标
      $rootScope.movingObjs = [
        //    {
        //    name: '张三',
        //    curlocation: '',
        //    lastTime: '',
        //    historylocations: []
        //}
      ];
      if ($scope.map) {
        $scope.map.clearMap();
      }
      // $rootScope.hideAccountTab=false;
      // alert('隐藏tabs：'+$rootScope.hideAccountTab);
      $scope.isAllreadyDrawGridArea = false;
      // $scope.map='';
      $scope.mapCreated = function (map) {
        $scope.map = map;
        $rootScope.map = map;

        // 进行定位
        //地图插件加入geolocation
        $scope.geolocation = new AMap.Geolocation({
          enableHighAccuracy: true,//是否使用高精度定位，默认:true
          timeout: 10000,          //超过10秒后停止定位，默认：无穷大
          maximumAge: 0,           //定位结果缓存0毫秒，默认：0
          convert: true,           //自动偏移坐标，偏移后的坐标为高德坐标，默认：true
          showButton: true,        //显示定位按钮，默认：true
          buttonPosition: 'LB',    //定位按钮停靠位置，默认：'LB'，左下角
          buttonOffset: new AMap.Pixel(10, 20),//定位按钮与设置的停靠位置的偏移量，默认：Pixel(10, 20)
          showMarker: true,        //定位成功后在定位到的位置显示点标记，默认：true
          showCircle: true,        //定位成功后用圆圈表示定位精度范围，默认：true
          panToLocation: true,     //定位成功后将定位到的位置作为地图中心点，默认：true
          zoomToAccuracy: true      //定位成功后调整地图视野范围使定位位置及精度范围视野内可见，默认：false
        });
      };

      //随机生成一个位置点
      $scope.getRadomPt = function (orgPt) {
        var resultPt = {
         longitude: '',
         latitude: ''
        };
        if (orgPt && orgPt.longitude && orgPt.latitude) {
         resultPt.longitude = orgPt.longitude + Math.random() / 25 * (Math.random() > 0.5 ? -1 : 1);
         resultPt.latitude = orgPt.latitude + Math.random() / 25 * (Math.random() > 0.5 ? -1 : 1);
        } else {
         resultPt.longitude = 116.40106141351825 + Math.random() / 25 * (Math.random() > 0.5 ? -1 : 1);
         resultPt.latitude = 39.994762731321174 + Math.random() / 25 * (Math.random() > 0.5 ? -1 : 1);
        }
        // alert("resultPt:"+resultPt.longitude+"<>"+resultPt.latitude);
        return resultPt;
      };


      $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
      };

      //$rootScope.mapEngine.mapEngine={}
      $rootScope.mapEngine.engineConfig = {
        showWorkMates: true,
        showSubDepartments: true,
        timeFrequency: 10,//秒
        showOnlineWarning: true,
        showOffdutyWarning: true,
        showLastMessage: true

      };
      /*
       * 刷新地图上所有活动点
       */
      $scope.refreshMovingObjs = function () {
        //console.log("刷新地图上所有活动点 refreshMovingObjs,这是每一轮循环必做之事：started");
        if (!($rootScope.movingObjs && $rootScope.movingObjs.length))return;//如果没有移动目标，就返回了

        for (var index = 0; index < $rootScope.movingObjs.length; index++) {
          if ($rootScope.movingObjs[index].type == "workmates" || $rootScope.movingObjs[index].type == "curUser") {
            $scope.refreshOnePersonLocation($rootScope.movingObjs[index]);
            //console.log($rootScope.movingObjs[index])
          }


          if (!$rootScope.movingObjs[index].curlocation) {
            //console.log('A');
            var temppt = $scope.getRadomPt();
            $rootScope.movingObjs[index].curlocation = temppt;
            // alert("$scope.movingObjs[index].curlocation:"+$scope.movingObjs[index].curlocation.longitude+"<>"+$scope.movingObjs[index].curlocation.latitude);
          }
          else {
            //console.log('B')
            $rootScope.movingObjs[index].curlocation = $scope.getRadomPt($rootScope.movingObjs[index].curlocation);
            //console.log($rootScope.movingObjs[index].curlocation);
          }
          $rootScope.movingObjs[index].lastTime = new Date();
        }
      }
      //console.log("!!!刷新地图上所有活动点 refreshMovingObjs,这是每一轮循环必做之事：ended");

// 地图上所有人员都有个当前最新位置，包括经纬度、定位时间、获取时间
      // 刷新地图上所有同事的位置
      $scope.refreshWorkmatesLocations = function () {
        // var workmates=$rootScope.movingObjs;
        // //console.log(">>>刷新地图上所有同事的位置 refreshWorkmatesLocations,这是每一轮循环必做之事：STARTed");
        if (!$rootScope.movingObjs) {
          return;
        } else {
          //console.log($rootScope.movingObjs)
          if ($rootScope.movingObjs && $rootScope.movingObjs.length > 0) {
            for (var ttt = 0; ttt < $rootScope.movingObjs.length; ttt++) {
              // //console.log('>>>去服务器取'+$rootScope.movingObjs.length+'个同事的位置：'+$rootScope.movingObjs[ttt].name+'<>'+($rootScope.movingObjs[ttt].type=='workmates')+'<>');
              if ($rootScope.movingObjs[ttt].type == 'workmates') {
                var curperson = $rootScope.movingObjs[ttt];
                //设定，最新位置都保存在movingObjs的latestLocation中
                var latestLocation = curperson.latestLocation;
                // localStorageService.clear("LatestLocation_"+workmates[ttt]._id );
                // 跟服务器通信时，返回
                //当30s之内取过值才有效，否则去重新取值 //当前用户的坐标不需要去服务器查询，自己定位就行了
                //如果去查询，有可能造成逻辑的纠缠
                if (!(latestLocation && latestLocation.getDate && ((new Date()).getTime() - (new Date(latestLocation.getDate)).getTime() < 1000 * 30)) && curperson._id != $rootScope.curUser._id) {
                  //console.log('>>>马上去服务器取同事的位置：');
                  // localStorageService.clear("LatestLocation_"+workmates[ttt]._id );
                  // console.log('>>>去服务器取同事的位置：'+curperson.name+'<>'+latestLocation+'<>'+latestLocation);
                  // 跟服务器通信时，返回
                  userService.getLatestLocationByUserId(curperson._id, $rootScope.applicationServerpath);
                  continue;
                }
              }
            }
          }
        }
        // //console.log(">>>刷新地图上所有同事的位置 refreshWorkmatesLocations,这是每一轮循环必做之事：ended");
      };

      //装载同事位置信息到移动对象集合中，仅在此controller有效
      $scope.assembleWorkmateLocation = function (workmateId, latestLocation) {
        //console.log(workmateId, latestLocation)
        if (!$rootScope.movingObjs) {
          return;
        } else {
          if ($rootScope.movingObjs && $rootScope.movingObjs.length > 0) {
            for (var ttt = 0; ttt < $rootScope.movingObjs.length; ttt++) {
              if ($rootScope.movingObjs[ttt].type == 'workmates') {
                var curperson = $rootScope.movingObjs[ttt];
                if (curperson._id == workmateId) {
                  $rootScope.movingObjs[ttt].latestLocation = latestLocation;
                  //console.log("<<<>>>装载同事位置信息到移动对象集合中 assembleWorkmateLocation,这是每一轮循环必做之事：ended"+$rootScope.movingObjs[ttt].name+"<>"+JSON.stringify($rootScope.movingObjs[ttt].latestLocation));
                }
              }
            }
          }
        }
      };
      //加载同事的人员信息，与位置无关
      $scope.refreshWorkmatesOfCurUser = function () {
        if ($rootScope.curUser && $rootScope.curUser._id) {
          userService.getWorkmatesByUserId($rootScope.curUser._id, $rootScope.applicationServerpath);
          console.log('加载人员');
        }
      };
      //装载同事信息到移动对象集合中，仅在此controller有效
      $scope.assembleWorkmates = function () {
        var workmates = localStorageService.get('workmates', 60 * 24);
        if (!(workmates && workmates.length > 0)) {
          return;
        }
        //把这些人员放到移动目标内
        if (!$rootScope.movingObjs) {
          $rootScope.movingObjs = new Array();
          for (var ttt = 0; ttt < workmates.length; ttt++) {
            workmates[ttt].type = 'workmates';
            $rootScope.movingObjs.push(workmates[ttt]);
          }
        } else {
          for (var ddd = 0; ddd < $rootScope.movingObjs.length; ddd++) {
            if ($rootScope.movingObjs[ddd].type == 'workmates') {
              var isDeleted = true;
              for (var ttt = 0; ttt < workmates.length; ttt++) {
                workmates[ttt].type = 'workmates';
                if ($rootScope.movingObjs[ddd]._id == workmates[ttt]._id) {
                  isDeleted = false;
                  for (var name in workmates[ttt]) {
                    $rootScope.movingObjs[ddd][name] = workmates[ttt][name];
                  }
                }
              }
            }
            $rootScope.movingObjs[ddd].isDeleted = isDeleted;//标记一下，这不是服务认可的同事了
            //console.log($rootScope.movingObjs[ddd]);
          }
          for (var ttt = 0; ttt < workmates.length; ttt++) {
            workmates[ttt].type = 'workmates';
            var isExisted = false;
            for (var ddd = 0; ddd < $rootScope.movingObjs.length; ddd++) {
              if ($rootScope.movingObjs[ddd].type == 'workmates') {
                if ($rootScope.movingObjs[ddd]._id == workmates[ttt]._id) {
                  isExisted = true;
                  for (var name in workmates[ttt]) {
                    $rootScope.movingObjs[ddd][name] = workmates[ttt][name];
                  }
                }
              }
            }
            if (!isExisted) {
              workmates[ttt].isDeleted = false;
              $rootScope.movingObjs.push(workmates[ttt]);
            }
          }
        }
        //console.log("装载同事信息到移动对象集合中 assembleWorkmates,这不是每一轮循环必做之事：ended $rootScope.movingObjs的数量："+$rootScope.movingObjs.length+"<>"+JSON.stringify($rootScope.movingObjs));
      }

      //检查一个坐标点是否在一定的网格区域内，如果在，就返回网格名称，如果不在，就说不在
      $scope.checkPersonLocationWithGridarea = function (latestLocation) {
        //console.log(latestLocation,$scope.polygonArrs);
        var curLocation = latestLocation.Location ? latestLocation.Location : latestLocation;
        var strOutput = '人员不在任何网格区域';
        if ($scope.polygonArrs && $scope.polygonArrs.length) {
          for (var ttt = 0; ttt < $scope.polygonArrs.length; ttt++) {
            if ($scope.polygonArrs[ttt].contains(curLocation)) {
              //网格的属性信息
              // polygon.setExtData({name:temp.name,status:temp.status,persons:temp.persons});
              //strOutput = "人员所在网格区域：" + $scope.polygonArrs[ttt].getExtData().name;
              strOutput = $scope.polygonArrs[ttt].getExtData().name;
              return strOutput;
            }
          }
        }
        //console.log(curLocation);
        //console.log($scope.polygonArrs);//多边形
        //console.log($scope.polylayers);//区域json
        //return strOutput;
        return false;
      };
      $scope.peopleinfoistime = {
        istime: function (data, time) {
          var timeStart, timeEnd;
          for (var i = 0; i < data.time.length; i++) {
            timeStart = data.time[i].timeStart;
            timeEnd = data.time[i].timeEnd;
            console.log(timeStart)
            console.log(timeEnd.slice(0, 1))
            console.log(timeEnd.slice(0, 1) >= time.getDay() && time.getDay() >= timeStart.slice(0, 1))
            if (timeEnd.slice(0, 1) >= time.getDay() && time.getDay() >= timeStart.slice(0, 1)) {
              console.log('进入第一关')
              if (timeEnd.slice(2, 4) >= time.getHours() && time.getHours() >= timeStart.slice(0, 1)) {
                console.log('进入第二关')
                return '<i class="glyphicon glyphicon-ok"></i>';
              }
            }
          }
          return '<i class="glyphicon glyphicon-remove"></i>';
        },
        formatTime: function (start, end) {
          var week = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];
          return week[start.slice(0, 1) - 1] + start.slice(2) + '--' + week[end.slice(0, 1) - 1] + end.slice(2)
        }
      }
      $scope.peopleinfo = function (data, gridname) {
        console.log(data)
        var returnText = '';
        userService.getLatestLocationByUserId(data.personID, $rootScope.applicationServerpath);
        var people = localStorageService.get("LatestLocation_" + data.personID)
        //console.log(people.getDate.formate('yyyy M '))
        console.log(people);
        var curlocation = people.Location;
        var currentposition = $scope.checkPersonLocationWithGridarea(people.Location);
        var lastTime = new Date(people.positioningdate);
        var ifworkarea;

        returnText = `<div class="modal-dialog" role="document">
                <div class="modal-content">
                    <div class="modal-header">
                        <button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true" onclick="$('.modal.fade.in').hide()">&times;</span>
                        </button>
                        <h4 class="modal-title">
                            ${data.name}
                        </h4>
                    </div>
                    <div class="modal-body">

                    <div class="panel panel-default">
   <div class="panel-heading">
      <h3 class="panel-title">
          安排时间
      </h3>
   </div>
   <div class="panel-body">
       <table class="table table-condensed table-hover" style='margin:0;'>
           <tr>
              <th>巡逻时间</th>
              <th>巡逻次数</th>
           </tr>`;
        //returnText += '<p></p>';
        for (var i = 0; i < data.time.length; i++) {
          returnText += '<tr><td>' + $scope.peopleinfoistime.formatTime(data.time[i].timeStart, data.time[i].timeEnd) + '</td>';
          returnText += '<td> 巡逻次数：' + data.time[i].frequency + '次</td></tr>';
        }
        if (currentposition == gridname) {
          ifworkarea = `<i class="glyphicon glyphicon-ok"></i>`;
        } else {
          ifworkarea = `<i class="glyphicon glyphicon-remove"></i>`;
        }
        returnText += `</table>
          </div>
          </div>
          <div class="panel panel-default">
            <div class="panel-heading">
              <h3 class="panel-title">人员状态</h3>
            </div>
            <div class="panel-body">
            <table class="table table-condensed table-hover text-center" style='margin:0;'>
            <tr>
              <td>最后一次定位时间</td>
              <td>${lastTime.formate("yyyy年M月d日h时m分s秒")}</td>
              <td></td>
            </tr>
            <tr>
              <td>是否在工作时间</td>
              <td>
              ${$scope.peopleinfoistime.istime(data, lastTime)}</td>
              <td></td>
            </tr>
            <tr>
              <td>是否在当前区域</td>
              <td>${ifworkarea}</td>
              <td>${currentposition ? currentposition : '不在任何网格区域'}</td>
            </tr>
            </table>`;
        //returnText +='<p>人员现在在规定区域内</p>';
        //returnText += `<div>最后一次定位时间 ${lastTime.formate("yyyy年M月d日h时m分s秒")}</div>`;
        returnText += `</div></div></div></div></div>`;
        $('#peopleinfo').html(returnText).show();
      }


      //无论是同事还是本人，他们的信息结构都是一样的
      //使用同一个显示刷新函数
      $scope.refreshOnePersonLocation = function (personObj) {

        if (personObj.isDeleted)return;//没有删除标志或者删除标志为false，表示正常有效的人员，其最新位置在latestLocation里
        if (!personObj.latestLocation)return;
        personObj.gridInfo = $scope.checkPersonLocationWithGridarea(personObj.latestLocation) ? "人员所在网格区域：" + $scope.checkPersonLocationWithGridarea(personObj.latestLocation) : '人员不在任何网格区域';
        //console.log(personObj.gridInfo);
        //console.log("使用同一个显示刷新函数 refreshOnePersonLocation,这是每一轮循环必做之事：personObj：" + personObj.name + "<>" + personObj._id + "<>" + personObj.gridInfo + "<>" + JSON.stringify(personObj.latestLocation));
        //构造信息窗口
        //console.log('去构造显示一个人的位置：' + personObj.name + '<>' + personObj.latestLocation + '<>' + personObj._id + '<>' + personObj.type);
        //组装地图上的信息
        $scope.assemblePersonMapInfo(personObj);
      };

      $scope.checkPersonLocationNormalpatroltime = function (latestLocation) {
        var curLocation = latestLocation.Location ? latestLocation.Location : latestLocation;
        var strOutput = '人员不在网格区域内';
        if ($scope.polygonArrs && $scope.polygonArrs.length) {
          for (var ttt = 0; ttt < $scope.polygonArrs.length; ttt++) {
            if ($scope.polygonArrs[ttt].contains(curLocation)) {
              //网格的属性信息
              // polygon.setExtData({name:temp.name,status:temp.status,persons:temp.persons});
              strOutput = "人员所在网格区域：" + $scope.polygonArrs[ttt].getExtData().name;
              return strOutput;
            }
          }
        }
        //console.log(curLocation);
        //console.log($scope.polygonArrs);//多边形
        //console.log($scope.polylayers);//区域json

        return strOutput;
      }
      $scope.checkregionalppersonnelinfo = function (e) {
        $(e).next().slideToggle()

      }


      // 如果接到通知，某人的最新位置获取成功，接着刷
      $scope.$on('gridareaReady', function (event, data) {
        //console.log('shuaxin');
        console.log('广播成功')
        $scope.drawpolylayer(data);
      });

      // 如果接到通知，某人的同事列表获取成功，接着刷
      $scope.$on('getWorkmatesByUserIdOk', function (event, sender) {
        $scope.assembleWorkmates();
        console.log($scope.map)
        console.log($scope.map);
        $scope.loadpolylayers();
        $scope.drawpolylayer($scope.spotarea)
      });
      // 如果接到通知，某同事的最新位置获取成功，接着刷
      $scope.$on('getLatestLocationByUserIdOk', function (event, data) {
        //console.log(event,data)
        var wId = data._id;
        var latestLocation = data//.latestLocation;
        $scope.assembleWorkmateLocation(wId, latestLocation);
      });

      /**
       *
       * @type {boolean}
       */

        // 显示活动目标列表
      $scope.showList = function () {
        // $scope.curVideo = videoUrl;
        $state.go("tab.account");
      };

      $scope.showModal = function (templateUrl) {
        $ionicModal.fromTemplateUrl(templateUrl, {
          scope: $scope,
          animation: 'slide-in-up'
        }).then(function (modal) {
          $scope.modal = modal;
          $scope.modal.show();
        });
      }

      // Close the modal
      $scope.closeModal = function () {
        $scope.modal.hide();
        $scope.modal.remove()
      };

      $scope.setcenterOn = false;
      //聚焦到当前用户
      $scope.setCurUserCenter = function () {
        var center = localStorageService.get('LatestLocation_' + $rootScope.curUser._id);
        //本来是打算用内存的值，不知道为什么取不到$scope.map，换成$rootScope.map，解决
        // console.log("定位到中心setCurUserCenter:"+$scope.map+"<$scope.map>"+$scope.centerLat+"《》"+$rootScope.map+"< $rootScope.mapp>"+JSON.stringify(center));
        console.log("setCurUserCenter:" + center);
        if ($rootScope.map && center && center.Location) {

          console.log("定位到中心setCurUserCenter:" + $scope.centerLong + "<>" + $scope.centerLat);
          $rootScope.map.setCenter(center.Location);
          // $scope.setcenterOn=!$scope.setcenterOn;
          // $scope.map.setCenter(AMap.LngLat(parseFloat(center.Location[0]),parseFloat(center.Location[1])));

        } else {
          //$scope.refeshCurUserLocation();
        }
        // $scope.openPopover();
      };
      $scope.setCurUserCenter();
      //听到需要定位人员的消息
      $scope.$on('needLocatedAPerson', function (event, personObj) {
        if (!(personObj.latestLocation && personObj.latestLocation.Location)) {
          $ionicPopup.alert({
            title: '<h4>请等候</h4>',
            template: "<br><h4>'正在定位此人员中...'</h4>",
            okText: '确认'
          });
          return;
        }
        if ($scope.map || $rootScope.map)$scope.map.setCenter(personObj.latestLocation.Location);
        if (personObj.infoWin)personObj.infoWin.open($scope.map, personObj.latestLocation.Location);
        if (personObj.mark) {
          personObj.mark.setMap($scope.map);
          personObj.mark.setPosition(personObj.latestLocation.Location);
        }
      });
      /*
       * @type {boolean}
       */
      //是否显示切换开关
      $scope.btntoggleShow = false;
      $scope.realtimeMapSetting = function () {
        $scope.btntoggleShow = !$scope.btntoggleShow;
      };

      // 显示用户的详细信息，应该是点击图标的时候发生
      $scope.assemblePersonMapInfo = function (personObj) {

        // //console.log("显示用户的详细信息 assemblePersonMapInfo,这是每一轮循环必做之事：started");

        var gettimeText = new Date(personObj.latestLocation.getDate);
        gettimeText = gettimeText.formate('yyyy-MM-dd HH:mm:ss');

        var positioningtime = new Date(personObj.latestLocation.positioningdate);
        var positioningtimeText = positioningtime.formate('yyyy-MM-dd HH:mm:ss');
        var ctt = new Date();
        var onlineStatus = (ctt.getTime() - positioningtime.getTime()) / 1000 / 60 > $rootScope.onlineTime ? "离线" : "在线";
        personObj.onlineStatus = onlineStatus;
        // console.log("显示用户的"+personObj.name+"在线信息 assemblePersonMapInfo:"+(ctt.getTime()-positioningtime.getTime())/1000/60)
        //
        var lnglat = new AMap.LngLat(116.407517, 39.912626);//$scope.centerLong, $scope.centerLat);
        if (!(personObj && personObj._id))return;
        /***
         * 这一大段是为了聊天用的
         */
        var receiver = {
          _id: personObj._id,
          name: personObj.name,
          messagestartTime: personObj.latestLocation.positioningdate
        };
        if (!(personObj.images)) {
          personObj.images = {};
          //if (!personObj.images.coverSmall) {
          //  $rootScope.getUserPicById(personObj._id, function (id, picData) {
          //    personObj.images.coverSmall = picData;
          //    receiver.pic = picData;
          //  });
          //  receiver.pic = personObj.images.coverSmall = $rootScope.getUserPicById(personObj._id);
          //}
        }
        if (!personObj.images.coverSmall) {
          //临时图片
          personObj.images.coverSmall = "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";
        }
        //把id、姓名和图片存到缓存中,为了给聊天提供数据
        localStorageService.update("messagedetail" + receiver._id, receiver);
        var btntext = (receiver._id == $rootScope.curUser._id) ? "当前用户" : (' <a href="#" style="color:#00f" >点击可发送消息</a>');
        var newBtnText = (receiver._id == $rootScope.curUser._id) ? "" : ('ng-click="gotoChat(\'' + personObj._id + '\')"');
        /******************************************************************************/
        //构建信息窗体中显示的内容class="list "
        var html = '<div ' +
          newBtnText +
          '><div class="info-top"><div>' + personObj.name + '<span style="font-size:11px;color:#F00;">' + onlineStatus + '</span>' + '</div></div><div class="info-middle" style="background-color: white;">' +
          '<img src="data:image/jpeg;base64,' + personObj.images.coverSmall + '" style="width:75px;height:90px;">' +
          '指挥中心下发数据时间:' + gettimeText + '<br>最后定位时间:' + positioningtimeText + '<br>' + personObj.gridInfo + '<br>' +
            // 直接加个链接，不好点，太小，改成直接点框就跳转
          btntext +
            // +
          '</div></div>';

        var template = angular.element(html);
        //编译模板
        var Element = $compile(template)($scope);
        var infowindow3 = new AMap.InfoWindow({
          // content: content,
          content: Element[0],
          // placeSearch: false,
          // asDestination: false,
          offset: new AMap.Pixel(0, -30)
        });
        infowindow3.open($scope.map, $scope.map.position);
        var str = JSON.stringify(personObj.latestLocation);
        // //console.log("一个人员对象："+personObj.name+"<>"+str);
        //console.log("！！！地图图标传值之前："+personObj._id+"<>"+str+"<>"+personObj.name+"<>"+personObj.latestLocation.getDate+"<>"+infowindow3+"::"+Element[0]);

        $scope.drawMapMarkerObj(personObj._id, personObj.latestLocation.Location, personObj.name, personObj.latestLocation.getDate, infowindow3);
        //console.log("显示用户的详细信息 assemblePersonMapInfo,这是每一轮循环必做之事：ended");
      };

      //跟某一用户聊天
      $scope.gotoChat = function (receiverid) {
        if (receiverid == $rootScope.curUser._id)return;
        //console.log("准备去聊天 messageDetailCtrl tab.messageDetail");
        //把id、姓名和图片存到缓存中,为了给聊天提供数据
        var receiverdata = localStorageService.get("messagedetail" + receiverid, 30);
        //清空覆盖物防止出错
        $scope.map.clearInfoWindow();
        //手动选择工作消息tab，再跳转
        // $ionicTabsDelegate.select(2);
        $state.go("tab.chat-messageDetail", {
          "senderId": receiverid,
          "senderName": receiverdata.name,
          "startTime": receiverdata.messagestartTime,
          'back': 'tab.chats'
        });
      };
      // 根据用户id、位置、名称、获取时间和信息窗体来建立一个图标，并且缓存到movingMarkers中
      $scope.drawMapMarkerObj = function (id, position, text, time, newinfoWin) {
        //console.log(id, position, text, time, newinfoWin)
        var newMark;
        if ($rootScope.movingObjs && $rootScope.movingObjs.length > 0) {
          for (var indd = 0; indd < $rootScope.movingObjs.length; indd++) {
            if ($rootScope.movingObjs[indd]._id == id)//不管是什么物体，唯一id就可以标示
            {
              if ($rootScope.movingObjs[indd].mark) {
                // 重置marker
                $rootScope.movingObjs[indd].mark.setMap(null);
                $rootScope.movingObjs[indd].mark = null;
              }
              // 重置信息窗口
              if ($rootScope.movingObjs[indd].infoWin) {
                $rootScope.movingObjs[indd].infoWin.close();
                $rootScope.movingObjs[indd].infoWin.setMap(null);
                $rootScope.movingObjs[indd].infoWin = null;
              }
              //构造新的mark
              newMark = new AMap.Marker({
                map: null,
                content: '<div ><img src="./img/personiconsmall.png" style="height:40px;width:15px"><br></div>'
              });
              // if(time){
              //   var timeText=new Date(time);
              //   timeText=timeText.formate('yyyy-MM-dd HH:mm:ss')
              //   text=text+'\n'+timeText;
              // }
              // 设置鼠标划过点标记显示的文字提示
              newMark.setTitle(text);
              var label = {//label默认蓝框白底左上角显示，样式className为：amap-marker-label
                offset: new AMap.Pixel(-10, 42),//修改label相对于maker的位置
                content: text,
                style: "{width:auto;    margin-left:1px;    float:left;    font-family:Arial, Helvetica, sans-serif;    font-size:13px;    color:#5f5f5f;    line-height:35px;    text-transform:uppercase}"
              };
              // 设置label标签
              newMark.setLabel(label);

              // 重新赋值，实际上，这样就已经完成了地图绘制
              $rootScope.movingObjs[indd].mark = newMark;
              $rootScope.movingObjs[indd].mark.setMap($scope.map);
              $rootScope.movingObjs[indd].mark.setPosition(position);         //鼠标点击marker弹出自定义的信息窗体
              $rootScope.movingObjs[indd].infoWin = newinfoWin;
              AMap.event.addListener($rootScope.movingObjs[indd].mark, 'click', function () {
                var opened = $rootScope.movingObjs[indd].infoWin.getIsOpen();
                if (!opened)$rootScope.movingObjs[indd].infoWin.open($scope.map, position); else $rootScope.movingObjs[indd].infoWin.close();
                $scope.map.setCenter(position);
              });

              //console.log("！！！地图图标："+id+"<>"+position+"<>"+text+"<>"+time+"<>"+newinfoWin+$rootScope.movingObjs[indd].name+"::"+$rootScope.movingObjs[indd].mark+"<>"+$rootScope.movingObjs[indd].infoWin);
              break;
            }
          }
        }
      };

      //绘制地图上一个活动图标,活动图标维护一个数组,按照index进行刷新
      $scope.drawMovingMarkerObj = function (index, position, text) {
        if (!$scope.movingMarkers[index]) {
          $scope.movingMarkers[index] = new AMap.Marker({map: $scope.map});
        }
        $scope.movingMarkers[index].setPosition(position);

        //构建信息窗体中显示的内容
        var html = '<div class="panel-heading">' + text + '</div>';
        var template = angular.element(html);
        //编译模板
        var Element = $compile(template)($scope);

        var infowindow3 = new AMap.InfoWindow({
          // content: content,
          content: Element[0],
          placeSearch: false,
          asDestination: false,
          offset: new AMap.Pixel(0, -30)
        });
        //console.log(Element[0])
//console.log(infowindow3)
        infowindow3.open($scope.movingMarkers[index]);
        // 设置鼠标划过点标记显示的文字提示
        $scope.movingMarkers[index].setTitle(text);

        // 设置label标签
        $scope.movingMarkers[index].setLabel({//label默认蓝框白底左上角显示，样式className为：amap-marker-label
          offset: new AMap.Pixel(20, 20),//修改label相对于maker的位置
          content: text
        });
      };
      $scope.regionInfo_eject = function () {

      }
      //实时手机定位刷新当前用户位置
      //定位是定位，上传是上传，所以这里函数通过回调来传递
      $scope.refeshCurUserLocation = function (callback) {

        //console.log("刷新当前用户位置 refeshCurUserLocation,这是每一轮循环必做之事：");
        var locationMethod;
        //采用地图页面的定位对象，目前初始化为高德地图对象
        if ($scope.geolocation) {
          locationMethod = $scope.geolocation;
          //alert("gaode location！\n"+Object.keys($scope.geolocation)+"\n"+locationMethod.getCurrentPosition);

          AMap.event.addListener(locationMethod, 'complete', $scope.processCurUserLocation);
          locationMethod.getCurrentPosition();
        }
        else if (navigator.geolocation)//如果高德的不行再用html5的
        {
          locationMethod = navigator.geolocation;
          locationMethod.getCurrentPosition($scope.processCurUserLocation, function (errData) {
            //对于迭代来说没有办法，错误数据仍然要传回服务器端
            //$timeout($scope.refeshLocation(callback),
            //$rootScope.locationRefreshTime);
          });
        }
        ;
      };

      //装载当前用户位置信息到移动对象集合中，仅在此controller有效
      $scope.assembleCurUserLocation = function (curUserID, latestLocation) {
        // //console.log("装载当前用户位置信息到移动对象集合中 assembleCurUserLocation,这是每一轮循环必做之事：started");
        var movingObjs = $rootScope.movingObjs;
        if (!movingObjs) {
          return;
        } else {
          if (movingObjs && movingObjs.length > 0) {
            for (var ttt = 0; ttt < movingObjs.length; ttt++) {
              if (movingObjs[ttt].type == 'curUser') {
                var curperson = movingObjs[ttt];
                if (curperson._id == curUserID) {
                  movingObjs[ttt].latestLocation = latestLocation;
                }
              }
            }
          }
        }
        // //console.log("装载当前用户位置信息到移动对象集合中 assembleCurUserLocation,这是每一轮循环必做之事：ended");
      };

      //装载当前用户到移动对象集合中，仅在此controller有效
      $scope.assembleCurUser = function () {
        if (!$rootScope.curUser) {
          $rootScope.refreshCurUser();
          return;
        }
        // //console.log("装载当前用户到移动对象集合中 assembleCurUser,这不是每一轮循环必做之事：started");
        // var movingObjs=$rootScope.movingObjs;
        if (!$rootScope.movingObjs) {
          $rootScope.movingObjs = new Array();
          $rootScope.curUser.type = 'curUser';
          $rootScope.movingObjs.push($rootScope.curUser);
        } else {
          if ($rootScope.movingObjs && $rootScope.movingObjs.length > 0) {
            for (var ttt = 0; ttt < $rootScope.movingObjs.length; ttt++) {
              if ($rootScope.movingObjs[ttt].type == 'curUser') {
                $rootScope.curUser.type = 'curUser';
                $rootScope.movingObjs[ttt] = $rootScope.curUser;
              }
            }
          }
        }
        // //console.log("装载当前用户到移动对象集合中 assembleCurUser,这不是每一轮循环必做之事：ended $rootScope.movingObjs的数量："+$rootScope.movingObjs.length);
      };

      //处理定位API返回的坐标，定位API可能有很多类别，所以需要这个函数作为中间环节
      $scope.processCurUserLocation = function (successData) {
        console.log(successData);
        //console.log("解析当前用户位置 processCurUserLocation,这是每一轮循环必做之事：started");
        var curlocation = {lontitude: '', latitude: ''};
        //alert(" location！\n"+Object.keys(successData)+"\n"+successData.position.lng+successData.position.lat);
        //表示是高德的格式
        if (successData.info) {
          //alert(" location！\n"+Object.keys(successData.position));
          curlocation.lontitude = successData.position.lng;
          curlocation.latitude = successData.position.lat;
        } else if ((successData.coords)) {
          curlocation.lontitude = successData.coords.longitude;
          curlocation.latitude = successData.coords.latitude;
        }
        else if ((successData.lontitude)) {
          //否则可能是百度或者HTML5的格式
          //curlocation=new AMap.LngLat($scope.centerLong,$scope.centerLat);
          curlocation.lontitude = successData.lontitude;
          curlocation.latitude = successData.latitude;
        }
        $scope.centerLong = curlocation.lontitude;
        $scope.centerLat = curlocation.latitude;

        console.log("赋值到中心setCurUserCenter:" + $scope.centerLong + "<>" + $scope.centerLat);
        var curUserLatestLocation = {
          Location: [curlocation.lontitude, curlocation.latitude],
          getDate: new Date(),
          positioningdate: new Date()
        };
        //只要定位成功，就将当前用户的最新位置存到本地缓存中，方便各模块取用
        localStorageService.update('LatestLocation_' + $rootScope.curUser._id, curUserLatestLocation);
        $scope.assembleCurUserLocation($rootScope.curUser._id, curUserLatestLocation);
        // //console.log("当前用户已定位localStorageService.update(LatestLocation_$rootScope.curUser._id',curlocation);"+curlocation.lontitude+"<>"+curlocation.latitude);
        // alert("当前用户已定位;"+JSON.stringify(successData));//successDataJSON.stringify(localStorageService.get('LatestLocation_'+$rootScope.curUser._id))
        //如果有回调函数，就把位置传进去
        var locationObj = {
          positioningdate: new Date(),
          SRS: '4321',
          geolocation: [curlocation.lontitude, curlocation.latitude]
        };

        //如果当前没有跟踪对象，就跟踪本机用户
        if (!$rootScope.focusMapObject) {
          if ($scope.map && $scope.setcenterOn) {
            $scope.map.setCenter([$scope.centerLong, $scope.centerLat]);
            return;
            // $scope.setcenterOn
          }
        }

        //上传定位点到服务器
        if ($scope.uploadLocation)($scope.uploadLocation(locationObj));

        //console.log("解析当前用户位置 processCurUserLocation,这是每一轮循环必做之事：ended");
      };
//pc端不适用

      //刷新地图,这是每一轮循环必做之事
      $scope.refeshMap = function () {
        $scope.refreshWorkmatesLocations();// 刷新地图上所有同事的位置

        //开始刷新定位
        $scope.refreshMovingObjs();

//随机人物坐标
//        for (var index = 0; index < $rootScope.movingObjs.length; index++) {
//          //alert(position);
//          var position = [$rootScope.movingObjs[index].curlocation.longitude, $rootScope.movingObjs[index].curlocation.latitude];
//          // alert("position:"+position);
//          var text = $rootScope.movingObjs[index].name + '\n' + $rootScope.movingObjs[index].lastTime;
//          // alert("text:"+text);
//          $scope.drawMovingMarkerObj(index, position, text);
//        }
        //$scope.map.setFitView();//设置合适的视图
        //alert("$rootScope.movingObjs.length:"+$rootScope.movingObjs.length);
      };

      /**
       * 解析geojson为方便高德输入的字符串,如果换其他地图,就换这里的地图数据
       */
      $scope.parseGeojson = function (jsonstr) {
        var polyArray = new Array();
        if (jsonstr.features) {
          for (var index = 0; index < jsonstr.features.length; index++) {
            polyArray[index] = {
              name: jsonstr.features[index].properties.name,
              path: jsonstr.features[index].geometry.coordinates[0],
              strokeColor: '#' + (Math.random() * 0xffffff << 0).toString(16), //线颜色
              strokeOpacity: 0.2, //线透明度
              strokeWeight: 3,    //线宽
              fillColor: '#' + (Math.random() * 0xffffff << 0).toString(16), //填充色
              fillOpacity: 0.35//填充透明度
            };
          }
        }
        return polyArray;
      };


//从服务器端解析位置
      $rootScope.parseGeojsonFromDb = function (jsonstr) {
        var polyArray = [];
        if (jsonstr.length > 0) {
          for (var index = 0; index < jsonstr.length; index++) {
            var processedPath = new Array();
            var temp = jsonstr[index].geometry.coordinates;
            var jjj = 0;
            for (var indexd = 0; indexd < temp.length - 1; indexd += 2) {
              var tmm = parseFloat(temp[indexd].toFixed(6));//;
              var tmm2 = parseFloat(temp[indexd + 1].toFixed(6));//;
              processedPath[jjj] = new Array(tmm, tmm2);//用firefox可以看到，之前数组元素是object，必须变成array（2）才能被高德识别
              jjj++;
            }
            polyArray[index] = {
              name: jsonstr[index].name,
              areaID: jsonstr[index]._id,
              status: jsonstr[index].status,
              persons: jsonstr[index].persons,
              path: processedPath,
              strokeColor: '#' + (Math.random() * 0xffffff << 0).toString(16), //线颜色
              strokeOpacity: 0.2, //线透明度
              strokeWeight: 3,    //线 宽
              fillColor: '#' + (Math.random() * 0xffffff << 0).toString(16), //填充色
              fillOpacity: 0.35//填充透明度
            };
            // console.info( polyArray[index]);
            // console.info( processedPath);
          }
        }
        //console.log(polyArray);
        return polyArray;
      };

      $scope.properdata = '';
      //绘制多边形图层
      $scope.drawpolylayer = function (polylayer) {
        console.log('加载 多边形图层');
        console.log(polylayer);
        console.log($scope.isAllreadyDrawGridArea || !$scope.map);
        if ($scope.isAllreadyDrawGridArea || !$scope.map) {
          return;
        }//如果画过就不画了,如果地图没准备好
        $scope.polygonArrs = new Array();//多边形覆盖物节点坐标数组

        for (var index = 0; index < polylayer.length; index++) {
          var temp = polylayer[index];
          //console.log(temp);
          var polygon = new AMap.Polygon({
            path: temp.path,//设置多边形边界路径
            strokeColor: temp.strokeColor, //线颜色
            strokeOpacity: temp.strokeOpacity, //线透明度
            strokeWeight: temp.strokeWeight,    //线宽
            fillColor: temp.fillColor, //填充色
            fillOpacity: temp.fillOpacity//填充透明度
          })
          //网格的属性信息
          polygon.setExtData({name: temp.name, status: temp.status, persons: temp.persons, areaId: temp.areaID})
          polygon.setMap($scope.map)
          //放到一个数组中
          $scope.polygonArrs.push(polygon);
          $scope.isAllreadyDrawGridArea = true;
          polygon.on('click', function (e) {
            //console.log(e);
            $scope.properdata = e.target.getExtData();
            console.log($scope.properdata);
            $scope.peopletime = [];
            //if($('#menu-2'))
            $scope.areahtml();
            //$rootScope.properdate=$scope.properdata;
            return $scope.properdata;
          })
        }
        //console.log($scope.polygonArrs)
      };
      $scope.areahtml = function () {
        if ($scope.properdata) {
          $('#menu-2').addClass('st-effect-1');//右侧弹出框
          $('#menu-1').removeClass('st-effect-1');//右侧弹出框
          //$scope.refreshMap();
          var menu = '';
          menu += `
   <div class="panel panel-default">
      <div class="panel-heading">
        <h4>${$scope.properdata.name}</h4>
      </div>
      <div class="panel-body">
          <div class="current_personnel">
              <h5 class="font-bold">当前员工</h5>
              <div class="clear" id="haveChosenPeople">`;

          menu += $scope.properdata.persons.length ? '' : '<div id="nopeople">当前区域没有人员</div>';
          menu += `
                <div class="btn btn-default" ng-repeat="aa in properdata.persons" ng-init="abc={index:$index,dom:this}">
                    <span ng-click="peopleinfo(aa,properdata.name)">{{aa.name}}</span>
                    <span ng-click="deleteAddpeople(abc.index,abc.dom)" class="close">&times;</span>
                </div>`;
          menu += `
            </div>
        </div>
	    </div>
  </div>`;

          menu += `<div class="panel panel-default">
	<div class="panel-heading">
		<h3 class="panel-title">
                    <a onclick="onlad.pull_person(this)">
                    <span class="pull-right text-muted">
                    <i class="fa fa-fw fa-angle-right text"></i></span>
                        <span>添加巡逻员</span>
                    </a>
       </h3>
	</div>
	<div class="">
                <li>

                    <div class="add_persons">
                        <div class="add_person">
                            <div class="add_person_con panel-body">
                            <p>
                                巡逻员
                            </p>
                                <select name="" id="add_person_con_name" size="5" class="add_person_con_name">
                                    <option value="{{obj.name}}" ng-repeat="obj in movingObjs">{{obj.name}}</option>
                                </select>
                            </div>
                            <div class="clear">
                                <button class="pull-right" onclick="onlad.next_step(this)">下一步</button>
                            </div>
                        </div>
                        <div class="add_person">
                            <div class="add_person_con panel-body">
                              <p>
                                时间段次数
                              </p>

                                <div class="demo add_person_con_timeStart">
                                    <div class="alreadyAddtime">
                                    </div>
                                    <div class="clear">
                                        <div class="pull-left" id="add_person_con_timeStart">
                                            <select name="" class="week">
                                                <option value="1">周一</option>
                                                <option value="2">周二</option>
                                                <option value="3">周三</option>
                                                <option value="4">周四</option>
                                                <option value="5">周五</option>
                                                <option value="6">周六</option>
                                                <option value="7">周日</option>
                                            </select>
                                            <select name="" class="time">
                                                <option value="00:00:00">00:00:00</option>
                                                <option value="01:00:00">01:00:00</option>
                                                <option value="02:00:00">02:00:00</option>
                                                <option value="03:00:00">03:00:00</option>
                                                <option value="04:00:00">04:00:00</option>
                                                <option value="05:00:00">05:00:00</option>
                                                <option value="06:00:00">06:00:00</option>
                                                <option value="07:00:00">07:00:00</option>
                                                <option value="08:00:00" selected>08:00:00</option>
                                                <option value="09:00:00">09:00:00</option>
                                                <option value="10:00:00">10:00:00</option>
                                                <option value="11:00:00">11:00:00</option>
                                                <option value="12:00:00">12:00:00</option>
                                                <option value="13:00:00">13:00:00</option>
                                                <option value="14:00:00">14:00:00</option>
                                                <option value="15:00:00">15:00:00</option>
                                                <option value="16:00:00">16:00:00</option>
                                                <option value="17:00:00">17:00:00</option>
                                                <option value="18:00:00">18:00:00</option>
                                                <option value="19:00:00">19:00:00</option>
                                                <option value="20:00:00">20:00:00</option>
                                                <option value="21:00:00">21:00:00</option>
                                                <option value="22:00:00">22:00:00</option>
                                                <option value="23:00:00">23:00:00</option>
                                            </select>
                                            ~
                                        </div>

                                        <div class="pull-left" id="add_person_con_timeEnd">
                                            <select name="" class="week">
                                                <option value="1">周一</option>
                                                <option value="2">周二</option>
                                                <option value="3">周三</option>
                                                <option value="4">周四</option>
                                                <option value="5">周五</option>
                                                <option value="6">周六</option>
                                                <option value="7">周日</option>
                                            </select>
                                            <select name="" class="time">
                                                <option value="00:00:00">00:00:00</option>
                                                <option value="01:00:00">01:00:00</option>
                                                <option value="02:00:00">02:00:00</option>
                                                <option value="03:00:00">03:00:00</option>
                                                <option value="04:00:00">04:00:00</option>
                                                <option value="05:00:00">05:00:00</option>
                                                <option value="06:00:00">06:00:00</option>
                                                <option value="07:00:00">07:00:00</option>
                                                <option value="08:00:00">08:00:00</option>
                                                <option value="09:00:00">09:00:00</option>
                                                <option value="10:00:00">10:00:00</option>
                                                <option value="11:00:00">11:00:00</option>
                                                <option value="12:00:00" selected>12:00:00</option>
                                                <option value="13:00:00">13:00:00</option>
                                                <option value="14:00:00">14:00:00</option>
                                                <option value="15:00:00">15:00:00</option>
                                                <option value="16:00:00">16:00:00</option>
                                                <option value="17:00:00">17:00:00</option>
                                                <option value="18:00:00">18:00:00</option>
                                                <option value="19:00:00">19:00:00</option>
                                                <option value="20:00:00">20:00:00</option>
                                                <option value="21:00:00">21:00:00</option>
                                                <option value="22:00:00">22:00:00</option>
                                                <option value="23:00:00">23:00:00</option>
                                            </select>
                                            <select name="" id="add_person_con_frequency">
                                                <option value="1">1</option>
                                                <option value="2" selected>2</option>
                                                <option value="3">3</option>
                                                <option value="4">4</option>
                                                <option value="5">5</option>
                                            </select>
                                        </div>
                                        <div class="btn btn-xs" ng-click="showalreadytime.alreadyAddtime()"><i
                                                class="glyphicon glyphicon-ok"></i></div>
                                    </div>
                                </div>
                                <!--<script src="js/adddate.js"></script>-->
                            </div>
                            <div class="clear">
                                <button class="pull-right" ng-click="add_personnel()">确定</button>
                                <button class="pull-right" onclick="onlad.last_step(this)">上一步</button>
                            </div>
                        </div>
                    </div>
                </li>
	</div>
</div>

<div class="panel-group" id="accordion">
	<div class="panel panel-default">
		<div class="panel-heading">
			<h3 class="panel-title">
                    <span class="pull-right text-muted">
                    <i class="fa fa-fw fa-angle-right text"></i></span>
				<a data-toggle="collapse" data-parent="#accordion"
				   href="#collapseOne" onclick="return false">查看区域人员
				</a>
			</h3>
		</div>
		<div id="collapseOne" class="panel-collapse collapse">
			<div class="panel-body">
		面板内容
			</div>
		</div>
	</div>
	</div>
</div>
<div class="panel panel-default">
	<div class="panel-heading">
		<h3 class="panel-title">
                    <a>
                    <span class="pull-right text-muted">
                    <i class="fa fa-fw fa-angle-right text"></i></span>
                        <span ng-click="deletepolylayer(properdata)">删除该区域</span>
                    </a>
		</h3>
	</div>
</div>`;

          $('#menu-1').html($compile(menu)($scope))
        }
      }

      $scope.peopletime = [];
      $scope.deletepolylayer = function (data) {
        //var data = data.name;
        //console.log(data);
        console.log('删除区域' + data.name);
        $http({
          method: 'POST',
          url: $rootScope.applicationServerpath + 'spotarea/spotareaDelete',
          data: data
        }).then(function (resp) {
          console.log('删除成功')
        })
      }
      $scope.showalreadytime = {
        alreadyAddtime: function () {
          //alert('a')
          var kweek = $('#add_person_con_timeStart .week').val(),
            jweek = $('#add_person_con_timeEnd .week').val(),
            ktime = $('#add_person_con_timeStart .time').val(), jtime = $('#add_person_con_timeEnd .time').val();
          //zhou = ['周一', '周二', '周三', '周四', '周五', '周六', '周末'],
          k = kweek + ' ' + ktime,
            j = jweek + ' ' + jtime,
            frequency = parseInt($('#add_person_con_frequency').val());
          if (!k | !j) {
            return
          }
          if ($scope.peopletime) {//判断添加重复
            for (var a = 0; a < $scope.peopletime.length; a++) {
              if ($scope.peopletime[a].timeStart == k & $scope.peopletime[a].timeEnd == j) {
                return;
              }
            }
          }
          $scope.peopletime.push({
            'timeStart': k,//开始时间
            'timeEnd': j, //结束时间
            'frequency': frequency
          });
          $scope.showalreadytime.addhtml();
          console.log($scope.peopletime)
        },
        deleteAddtime: function (e) {
          $scope.peopletime.splice(e, 1);
          $scope.showalreadytime.addhtml()
        },
        addhtml: function () {
          var forhtml = '';
          for (var index = 0; index < $scope.peopletime.length; index++) {
            forhtml += `<p title="点击删除" ng-click="showalreadytime.deleteAddtime(${index})">周` + $scope.peopletime[index].timeStart + ' - 周' + $scope.peopletime[index].timeEnd + ' 巡查' + $scope.peopletime[index].frequency + '次</p>';
          }
          $('.alreadyAddtime').html($compile(forhtml)($scope))
        }
      }

      $scope.deleteAddpeople = function (e, dom) {
        console.log(e)
        //console.log(dom)
        console.log($scope.properdata)
        $scope.properdata.position = e;
        //var parent=$(dom).parent();
        $http({
          method: 'POST',
          url: $rootScope.applicationServerpath + 'spotarea/spotareapeopleDelete',
          data: $scope.properdata
        }).then(function (data) {
          console.log('删除人员成功！')
          $('#haveChosenPeople>div').eq(e).remove();
        })
      }

      $scope.add_personnel = function () {
        console.log('区域人员信息');
        var personName = $('#add_person_con_name').val();
        var persons = $scope.properdata.persons;
        for (var j = 0; j < $rootScope.movingObjs.length; j++) {
          if (personName == $rootScope.movingObjs[j].name) {
            var id = $rootScope.movingObjs[j]._id
          }
        }
        var people = {
          'name': personName,
          'time': $scope.peopletime,
          'personID': id
          //'frequency': parseInt($('#add_person_con_frequency').val())//巡逻时间
        }
        for (var i = 0; i < persons.length; i++) {
          if (persons[i].name == people.name) {
            alert('选定的人员重复，请重新选择人员！');
            return;
          }
        }
        //if(parsons.timeEnd-persons.timeStart){}
        if (!people.time.length) {
          alert('时间没有添加！');
          return;
        }
        $('#nopeople').html('');
        $scope.properdata.persons.push(people);
        console.log($scope.properdata);
        $http({
          method: 'POST',
          url: $rootScope.applicationServerpath + 'spotarea/readtSpotarea',
          data: $scope.properdata
        }).then(function (data) {
          console.log(data);
        })

        $('.add_person').slideUp(300)
        $('.alreadyAddtime').html('');
        $scope.peopletime = [];
      }


      $scope.personnel_statistics = function () {
        alert('当前人员有：' + $rootScope.movingObjs.length + ' 人');
      }
//刷新地图区域
      $scope.refreshMap = function () {
        if ($scope.map) {
          //console.log('清除地图');

          $scope.spotarea = gridmapService.spotareagrid()
          $scope.isAllreadyDrawGridArea = false;
          $scope.map.clearMap();
          console.log($scope.spotarea);
          console.log('重绘区域');
          $scope.drawpolylayer($scope.spotarea)

        }
      }

      //$scope.getCoordinate = function () { //获得坐标
      //    if ($scope.isAllreadyDrawGridArea || !$scope.map)return;//如果画过就不画了,如果地图没准备好
      //    $scope.map.on('click', function (e) {
      //        return;
      //        if (e == $rootScope.eTarget) {//如果与旧值相等旧退出
      //            return;
      //        }
      //        //经度
      //
      //        //纬度
      //        $scope.lnglatXY = new AMap.LngLat(e.lnglat.getLng(), e.lnglat.getLat());
      //        console.log('经度：' + e.lnglat.getLng() + '纬度： ' + e.lnglat.getLat());
      //        $rootScope.eTarget = e;
      //        var MGeocoder;
      //        //加载地理编码插件
      //        $scope.map.plugin(["AMap.Geocoder"], function () {
      //            MGeocoder = new AMap.Geocoder({
      //                radius: 1000,
      //                extensions: "all"
      //            });
      //            //返回地理编码结果
      //            AMap.event.addListener(MGeocoder, "complete", function (data) {
      //                var address;
      //                //返回地址描述
      //                address = data.regeocode.formattedAddress;
      //                //返回结果拼接输出
      //                $('#position_information').html(address);
      //            })
      //            //逆地理编码
      //            MGeocoder.getAddress($scope.lnglatXY);
      //        })
      //    })
      //}
      $scope.filterpeoplepath = {
        oldpath: {n: '', a: '', d: ''},
        filter: function (lng, lat, date) {
          var n = $scope.filterpeoplepath.oldpath.n,
            a = $scope.filterpeoplepath.oldpath.a,
            d = $scope.filterpeoplepath.oldpath.d;//取旧值
          if (!n && !a) { //如果旧值为空
            $scope.filterpeoplepath.oldpath.n = lng,
              $scope.filterpeoplepath.oldpath.a = lat,
              $scope.filterpeoplepath.oldpath.d = date;
            //console.log('旧值为空')
            return [lng, lat, sspeed, date];
          } else {
            var sjc = (date - d) / 1000;//两点时间差 值为秒
            var distance = $scope.filterpeoplepath.rangingTool(a, n, lat, lng);//两点之间的距离
            //console.log(date);
            //console.log(d)
            //console.log(sjc + '秒')
            //console.log(distance + '米')
            //console.log('旧值' + a, n + '\n新值' + lat, lng)
            if (!distance || sjc < 1) {
              return false;
            }
            var sspeed = distance / sjc;//秒速 /s
            //console.log(sspeed + '/s')
            if (sspeed > 33) {
              return false;
            }//如果秒速大于50米 跳出
            //console.log('---------------------------------------------------------------')
            $scope.filterpeoplepath.oldpath.n = lng,
              $scope.filterpeoplepath.oldpath.a = lat,
              $scope.filterpeoplepath.oldpath.d = date;
            //if(jsc)
            return [lng, lat, sspeed, date];
          }
          //return false;
        },
        rangingTool: function (lat1, lng1, lat2, lng2) {
          //console.log(lat1,lng1)
          //console.log(lat2,lng2)
          //debugger;
          var lnglat = new AMap.LngLat(lng1, lat1);
          var jl = lnglat.distance([lng2, lat2]);
          //console.log('两点间距离为：' + jl + '米');
          return jl;
        }
      }

      $scope.positioninfo = function (currentcount, callback) {
        var MGeocoder = new AMap.Geocoder();
        $rootScope.address = '';
        AMap.event.addListener(MGeocoder, "complete", function (data) {
          //console.log(MGeocoder)
          //var address;
          //返回地址描述

          //返回结果拼接输出
          //$scope.address=address;
          callback(data.regeocode.formattedAddress)
        })
        MGeocoder.getAddress(currentcount);
      }
      $scope.historypath = {
        isline: false,
        dom: function () {
          $('#menu-1').addClass('st-effect-1');
          $('#menu-2').toggleClass('st-effect-1');

        },
        search: function () {
          var personID = $('#search-name').val();
          var start = $('.search-dateStartTime').val();
          var end = $('.search-dateEndTime').val();
          $scope.filterpeoplepath.oldpath = {n: '', a: '', d: ''};
          console.log(new Date(start),new Date(end));
          $http(
            {
              method: 'POST',
              url: $rootScope.applicationServerpath + 'person/getPersonLatestPositionInTimespan',
              data: {
                personID: personID,
                startTime: start,
                endTime: end
              }
            }
          ).then(function (resp) {
              console.log('fasongchenggong ~~~~~~~');
              var data = resp.data;
              if (!data) {
                return;
              }
              console.log('返回数据')
              console.log(data)
              var marker, lineArr = [], speed = [];
              for (var i = 0, locationtable = ''; i < data.length; i++) {
                var lngX = data[i].geolocation[0];
                var lngY = data[i].geolocation[1];
                var date = new Date(data[i].positioningdate);
                var filter = $scope.filterpeoplepath.filter(lngX, lngY, date)
                if (!filter) {
                  //console.log('跳出');
                  continue;
                }
                //console.log(filter);
                lineArr.push(filter);
                speed.push([filter[2] * 300, filter[3]])
                locationtable += '<tr><td>' + lngX + '</br>' + lngY + '</td><td>' + date.formate("M月d日 hh:mm") + '</td><td>' + $scope.checkPersonLocationWithGridarea([lngX, lngY]) + '</td>';
              }
              console.log(speed);
              //console.log(lineArr)
              //console.log('筛选后剩余' + lineArr.length)
              if ($scope.historypath.isline) {
                return;
              }
              $('.historical_routebtn').show()

              var X = data[0].geolocation[0], Y = data[0].geolocation[1];
              marker = new AMap.Marker({
                map: $scope.map,
                position: [X, Y],
                icon: "img/jiantou.png",
                offset: new AMap.Pixel(-15, -13),
                autoRotation: true
              });
              marker.on('click', function (e) {
                console.log(e.target);
              })
              //lineArr.push([lngX, lngY]);
              // 绘制轨迹
              var polyline = new AMap.Polyline({
                map: $scope.map,
                path: lineArr,
                strokeColor: "#00A",  //线颜色
                // strokeOpacity: 1,     //线透明度
                strokeWeight: 3      //线宽
                // strokeStyle: "solid"  //线样式
              });
              var passedPolyline = new AMap.Polyline({
                map: $scope.map,
                // path: lineArr,
                strokeColor: "#F00",  //线颜色
                // strokeOpacity: 1,     //线透明度
                strokeWeight: 3,      //线宽
                // strokeStyle: "solid"  //线样式
              });


              marker.on('moving', function (e) {
                passedPolyline.setPath(e.passedPath);
              })

              var currentcount = 0;
              AMap.event.addDomListener(document.getElementById('starthistory'), 'click', function () {
                var count = 0;
                marker.setPosition(lineArr[count])
                count++;
                //console.log(speed[count][0])
                marker.moveTo(lineArr[count], speed[count][0])
                marker.on('moveend', function () {
                  if (count < (lineArr.length - 1)) {
                    count++;
                    currentcount = count;
                  }
                  marker.moveTo(lineArr[count], speed[count][0])
                })
              }, false);
              AMap.event.addDomListener(document.getElementById('pausehistory'), 'click', function () {
                marker.pauseMove();

                console.log(lineArr[currentcount], speed[currentcount][1])
                var shucu = $scope.positioninfo(lineArr[currentcount], function (e) {

                  $rootScope.address = e;
                  //在指定位置打开信息窗体
                  //构建信息窗体中显示的内容
                  var info = '';
                  info += `<div>
                   <div>地址：${$rootScope.address}</div>
                  <div>位置：${lineArr[currentcount]}</div>
                  <div>时间：${speed[currentcount][1].formate("M月d日 hh:mm")}</div>
          </div>`;
                  var Element = $compile(info)($scope)

                  var infowindow3 = new AMap.InfoWindow({
                    // content: content,
                    content: Element[0],
                    placeSearch: false,
                    asDestination: false,
                    offset: new AMap.Pixel(0, -5)
                  })
                  infowindow3.open($scope.map, lineArr[currentcount]);

                })
                //console.log(shucu)
                //console.log(Element[0])
//console.log(infowindow3)
              }, false);
              AMap.event.addDomListener(document.getElementById('resumehistory'), 'click', function () {
                marker.resumeMove();
              }, false);
              AMap.event.addDomListener(document.getElementById('stophistory'), 'click', function () {
                //lineArr=[];
                //marker.stopMove();
                //marker.close(true);
                $scope.map.remove(passedPolyline);
                $scope.map.remove(polyline);
                $scope.map.remove(marker);
                $scope.historypath.isline = false;
              }, false);

              $scope.historypath.isline = true;
              var peopletable = '';
              peopletable += `<div class="panel panel-default">
                  <div class="panel-heading">
                    <h3 class="panel-title">位置列表</h3>
                  </div>
                  <div class="panel-body">`;
              peopletable += `<table class="table table-hover table-condensed"><th>位置</th><th>时间</th><th>所在区域</th>`;
              peopletable += locationtable;
              peopletable += '</table></div></div>';
              $('#Location_list').html(peopletable);
            })
        }
      }

      //这个地图上所有多边形图层的集合
      $scope.polylayers = [];

      /*
       加载多边形网格化区域图层
       */
      $scope.loadpolylayers = function () {
        //console.log('加载多边形网格化区域图层');
        //$scope.getCoordinate();//获取坐标
        //$scope.polylayers = localStorageService.get('gridarea', 60 * 24);
        //if (!$scope.polylayers) {
        //  $http(
        //    {
        //      method: 'POST',
        //      url: $rootScope.applicationServerpath + 'gridarea/getAllValidGridarea'
        //    }
        //  ).then(function (resp) {
        //      console.log('本地没有数据，从服务器获取！');
        //      console.log(resp);
        //      if (resp.data) {
        //        $scope.polylayers = $rootScope.parseGeojsonFromDb(resp.data);
        //      }
        //      // 将所有网格区域存到缓存中
        //      localStorageService.update('gridarea', $scope.polylayers);
        //      // 广播网格化区域已经加载
        //      $rootScope.$broadcast('gridareaReady', $scope.polylayers);
        //    });

        //console.log($scope.spotarea)

        //if ($scope.spotarea) {
        //  for (var i = 0; i < $scope.spotarea.length; i++) {
        //    $scope.polylayers.push($scope.spotarea[i]);
        //  }
        //}

        $scope.spotarea = gridmapService.spotareagrid();
        $rootScope.$broadcast('gridareaReady', $scope.spotarea);
        return;
      }
      //$scope.map.setFitView();

      /*
       加载多边形绘制区域图层
       */
      //$scope.spotareagrid=function(){
      //    $scope.spotarea=localStorageService.get('spotarea', 60 * 24);
      //    //if(!$scope.spotarea) {
      //    $http(
      //        {
      //            method: 'POST',
      //            url: $rootScope.applicationServerpath + 'spotarea/getMyNewestSpotareaFromWho'
      //        }
      //    ).then(function (resp) {
      //            console.log('从服务器获取数据！');
      //            console.log(resp);
      //            if (resp.data) {
      //                $scope.spotarea = $scope.parseGeojsonFromDb(resp.data);
      //            }
      //            // 将所有网格区域存到缓存中
      //            localStorageService.update('spotarea', $scope.spotarea);
      //        });
      //    console.log($scope.spotarea);
      //    for (var i = 0; i < $scope.spotarea.length; i++) {
      //        $scope.polylayers.push($scope.spotarea[i]);
      //    }
      //    console.log($scope.polylayers);
      //    //$scope.isAllreadyDrawGridArea=false;
      //    $rootScope.$broadcast('gridareaReady',$scope.polylayers);
      //    return;
      //    //}
      //}
      /*
       * 判断是否在指定多边形图层的多边形,区域内
       */
      $scope.judgePTInsidePolygon = function (postionarray, polygon) {
        // var polygon = new AMap.Polygon({
        //     map: map,
        //     path: path
        // });
        return polygon.contains(postionarray);//[116.368904, 39.923423]
        // alert("$scope.movingObjs.length:"+$scope.movingObjs.length);
      };

      $scope.editorRegion = {iscurrent: true};//定义编辑区域

      $scope.formatpath = function (path) {//格式化位置
        for (var i = 0, tpath = []; i < path.length; i++) {
          tpath.push(path[i].lng);
          tpath.push(path[i].lat);
        }
        return tpath;
      }

      //存储自定义图层
      $scope.saveGeographicArea = function () {
        var first = $('#firstname').val();
        var last = $('#lastname').val();
        var color = $("#regionColor").val();
        if (!first)return;

        var transform = function (obj) {//对象转为数组
          var arr = [];
          for (var item in obj) {
            arr.push(obj[item]);
          }
          return arr;
        }
        //console.log(transform($scope.editorRegion._polygonEditor))

        $scope.editPolygonPath = transform($scope.editorRegion._polygonEditor)[4][0];
        console.log($scope.editPolygonPath);

        console.log('名称：' + first, '类型：' + last);
        //$scope.formatpath($rootScope.editPolygonPath)
        var aa = localStorageService.get('spotarea', 60 * 24);
        $scope.polygonArr = {};
        $scope.polygonArr.name = first;
        $scope.polygonArr.type = last;
        //$scope.polygonArr.status = 1;
        //$scope.polygonArr.persons = [];
        $scope.polygonArr.geometry = {
          type: 'Polygon',
          coordinates: $scope.formatpath($scope.editPolygonPath)
        };

        for (var i = 0; i < aa.length; i++) {
          if (first == aa[i].name) {
            alert('填写的名称重复，请重新输入！')
            return;
          }
        }
        $('#addregionalinformation').hide()
        console.log($scope.polygonArr);

        $http(
          {
            method: 'POST',
            url: $rootScope.applicationServerpath + 'spotarea/sendASpotarea',
            data: $scope.polygonArr,
            headers: {'Content-Type': 'application/json;charset=utf-8'},
            dataType: 'JSON'
          }
        ).success(function (data, status, headers, config) {
            console.log('提交成功----')
            console.log(data);
            if (data) {
              //$scope.isAllreadyDrawGridArea=true;
              var polylayers = $scope.parseGeojsonFromDb([data]);
              //$scope.refreshMap(data);
              console.log(polylayers)
              $scope.map.remove($scope.editorRegion._polygonEditor);
              //$scope.isAllreadyDrawGridArea = false;
              $scope.drawpolylayer(polylayers);
            }
            // 将所有网格区域存到缓存中
            //localStorageService.update('spotarea', $scope.polylayers);//存为绘制区域
            // 广播网格化区域已经加载
          })
          .error(function (data, status, headers, config) {
            console.log('提交出错' + data)
          });

        //if (aa) {
        //    $rootScope.$broadcast('gridareaReady',$scope.polylayers);
        //} else {
        //    $scope.polylayers = [];
        //    $scope.polylayers[0] = $scope.polygonArr;
        //    console.log($scope.polylayers);
        //    $scope.drawpolylayer($scope.polylayers);
        //}
        //$scope.polygonArrs.push($scope.editorRegion._polygonEditor.Me);
        //$scope.isAllreadyDrawGridArea = true;
      }
      //加载自定义的多边形图层
      $scope.drawgeographicarea = {
        cc: function () {
          alert('cc')
        },
        _polygon: function (lat, lon) {
          var arr = [ //构建多边形经纬度坐标数组
            [lat - 0.008, lon + 0.005],
            [lat - 0.008, lon - 0.005],
            [lat + 0.008, lon - 0.005],
            [lat + 0.008, lon + 0.005]
          ]
          return new AMap.Polygon({
            map: $scope.map,
            path: arr,
            strokeColor: "#0000ff",
            strokeOpacity: 1,
            strokeWeight: 3,
            fillColor: "#f5deb3",
            fillOpacity: 0.35
          });
        },
        startEditPolygon: function () {

          var center = $scope.map.getCenter();
          if ($scope.editorRegion.iscurrent) {
            $scope.editorRegion._polygonEditor = new AMap.PolyEditor(
              $scope.map,
              $scope.drawgeographicarea._polygon(center.lng, center.lat));
            $scope.editorRegion._polygonEditor.open();
            console.log('当前中心点坐标：' + center.lng, center.lat);
            $scope.editorRegion.iscurrent = false;
            return;
          } else {
            alert('请结束编辑,再绘制');
          }
        },
        closeEditPolygon: function () {
          $scope.editorRegion.iscurrent = true;
          //$('#peopleinfo').show();
          $('#addregionalinformation').show();//显示模态框
          //$('#menu-1').removeClass('st-effect-1');//右侧弹出框

          $scope.editorRegion._polygonEditor.close();
        }
      };
      //$scope.loadpolylayers();
      /*
       *加载自定义的点图层
       */
      $scope.loadPointLayer = function (url, name) {
        var ptlayer = '';
        //    这里应该是从服务器读取图层，读什么位置，从配置上来
        ptlayer = [{
          name: '舅舅家',
          type: '1',
          position: $scope.getRadomPt()
        }, {
          name: '姥姥家',
          type: '3',
          position: $scope.getRadomPt()
        }, {
          name: '地方家',
          type: '2',
          position: $scope.getRadomPt()
        }
        ];
        for (var index = 0; index < ptlayer.length; index++) {
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
      };
      /**
       * 引擎初始化,读取和应用一些设置
       */
      $rootScope.mapEngine.engineInitialise = function (params) {
        var config = $rootScope.mapEngine.engineConfig;
        if (config.showWorkMates) {
          $scope.refreshWorkmatesOfCurUser();
          //console.log("引擎初始化,读取和应用一些设置: $scope.refreshWorkmatesOfCurUser");
        }
        $scope.movingMarkers = new Array();

        // $scope.loadpolylayers();
      };


      /***
       * 引擎运行
       */
      $rootScope.mapEngine.isRunning = false;
      $rootScope.mapEngine.engineRun = function (params) {
        //引擎设置好就开始运行
        // alert( '中文试试');
        // alert( $scope.engineRun);
        // alert( '中文试试2');
        $rootScope.mapEngine.engineInitialise();


        //在地图页面启动周期性函数
        $rootScope.mapEngineTimer = window.setInterval(
          function () {
            // alert('ok');
            // 只有有用户的时候，才开始地图循环
            if ($rootScope.curUser && $rootScope.curUser._id)
            //开始定位刷新地图
            {
              $scope.refeshMap();
              $rootScope.mapEngine.isRunning = true;
            }
          }
          , $rootScope.locationRefreshTime);
      };

      $rootScope.mapEngine.enginePause = function (params) {

      };

      $rootScope.mapEngine.engineResum = function (params) {

      };

      $rootScope.mapEngine.engineStop = function (params) {
        if (!$rootScope.mapEngine.isRunning)return;
        if ($rootScope.mapEngineTimer)
          window.clearInterval($rootScope.mapEngineTimer);
        $rootScope.mapEngineTimer = null;
        $rootScope.mapEngine.isRunning = false;
      };

      // 等到系统用户刷新成功后，开始运行引擎
      $scope.$on('rootUserReady', function (event, data) {

        //console.log('地图引擎开始运行 curUser：'+data._id);		 //子级能得到值
        $rootScope.mapEngine.engineInitialise();//初始化全部依靠当前用户的获取
        $rootScope.mapEngine.engineStop();
        $rootScope.mapEngine.engineRun();

      });

      $rootScope.mapEngine.engineStop();
      $rootScope.mapEngine.engineRun();


    }]);


app.directive('gdMap', function ($timeout, $window) {
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
        zoom: 12
      });


      //addMarker();
      function addMarker() {
        scope.map.clearMap();
        var marker = new AMap.Marker({
          map: scope.map,
          position: [116.397904, 39.907228]
        });
        //鼠标点击marker弹出自定义的信息窗体
        //AMap.event.addListener(marker, 'click', function () {
        //  infoWindow.open(scope.map, marker.getPosition());
        //});
      }


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
      //scope.map.addControl(new AMap.ToolBar());
      //加入鹰眼
      scope.map.addControl(new AMap.OverView());
      scope.map.on('click', function (e) {
        scope.$emit('map-click', e);

        if (!scope.marker) {
          //console.log($scope.marker);
          scope.marker = new AMap.Marker({map: scope.map})
        }
        // alert(scope.enginePause);

        $('#menu-1').addClass('st-effect-1');//收回右侧弹出框
        console.log('经度：' + e.lnglat.getLng() + '纬度： ' + e.lnglat.getLat());
        scope.marker.setPosition([e.lnglat.getLng(), e.lnglat.getLat()]);

        scope.lnglatXY = new AMap.LngLat(e.lnglat.getLng(), e.lnglat.getLat());
        //加载地理编码插件
        var MGeocoder = new AMap.Geocoder();
        AMap.event.addListener(MGeocoder, "complete", function (data) {
          var address;
          //console.log(MGeocoder)
          //返回地址描述
          address = data.regeocode.formattedAddress;
          //返回结果拼接输出
          $('#position_information').html(address);
        })
        MGeocoder.getAddress(scope.lnglatXY)
//        scope.map.plugin(["AMap.Geocoder"], function () {
//          MGeocoder = new AMap.Geocoder({
//            radius: 1000,
//            extensions: "all"
//          })
//
//          //返回地理编码结果
//          AMap.event.addListener(MGeocoder, "complete", function (data) {
//            var address;
//            //console.log(MGeocoder)
//            //返回地址描述
//            address = data.regeocode.formattedAddress;
//            //返回结果拼接输出
//            $('#position_information').html(address);
//          })
//          //逆地理编码
//          MGeocoder.getAddress(scope.lnglatXY)
//        })
      })


      scope.$on('setCenter', function (event, center) {
        if (!scope.map) return
        // scope.map.setCenter(center)
      })
    }
  }
})
  .directive('draggable', ['$document', function ($document) {
    return function (scope, element, attr) {
      var startX = 0, startY = 0, x = 0, y = 0;
      element = angular.element(document.getElementsByClassName("modal-dialog"));
      element.css({
        position: 'relative',
        cursor: 'move'
      });

      element.on('mousedown', function (event) {
        // Prevent default dragging of selected content
        event.preventDefault();
        startX = event.pageX - x;
        startY = event.pageY - y;
        $document.on('mousemove', mousemove);
        $document.on('mouseup', mouseup);
      });

      function mousemove(event) {
        y = event.pageY - startY;
        x = event.pageX - startX;
        element.css({
          top: y + 'px',
          left: x + 'px'
        });
      }

      function mouseup() {
        $document.off('mousemove', mousemove);
        $document.off('mouseup', mouseup);
      }
    };
  }]);
