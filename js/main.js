'use strict';

/* Controllers */

angular.module('app')
  .controller('AppCtrl', ['$scope', '$translate', '$localStorage', '$window', '$rootScope','$http','$modal','$state','$timeout','localStorageService',
    function(              $scope,   $translate,   $localStorage,   $window ,$rootScope,$http,$modal,$state,$timeout,localStorageService) {
      // add 'ie' classes to html
      var isIE = !!navigator.userAgent.match(/MSIE/i);
      isIE && angular.element($window.document.body).addClass('ie');
      isSmartDevice( $window ) && angular.element($window.document.body).addClass('smart');
        /*
         * 所有全局变量开始
         */
        // 当前用户
        $rootScope.curUser;
        $scope.tempUser;


        //引擎管理需要一个定时器，如果没有引用就无法销毁
        $rootScope.mapEngineTimer;

        //是否异步载入部门和人员，如果真，就是点一下载入一次
        $rootScope.lazyloadDepartmentAndWorkers=true;
        //定时器的刷新频率
        $rootScope.locationRefreshTime=10000;
        //全局基础路径
        $rootScope.serverpath='http://localhost:2000/pcclient/';
        //全局加载图层路径，名字，参数

        $rootScope.polylayers=[
            {
              path:'mapdata/',
              name:'yazhougridpolygon_wgs84.json',
              params:''
            },
            {
                path:'mapdata/',
                name:'beijingtest.json',
                params:''
            }
        ];
        $rootScope.applicationServerpath='http://localhost:2000/';

         $rootScope.applicationServerpath='http://120.76.228.172:2000/';
        console.log('接口测试'+$rootScope.applicationServerpath);
          // $http({
          //         method:'POST',
          //         url:$rootScope.applicationServerpath+'mobilegrid/getcurrentexamineevent',
          //         data:{
          //           department: "58c3a5e9a63cf24c16a50b8e"
          //         }
          //     }).then(function(resp){
          //     console.log('返回数据')
          //     console.log(resp.data)
          // })

        // 桌面端的用户需要登录信息，用户名就是人名，密码第一次可以是身份证号，之后可以修改，pwd
        $rootScope.confirmUser = function(callback) {
            if(!$rootScope.curUser|| !$rootScope.curUser.role){
                $rootScope.confirmUserModalInstance = $modal.open({
                        template: '        <div class="modal-header">  '+
                        '<h3>请登录或先用手机注册!</h3>  '+
                        '</div>'+
                        '<div class="modal-body">'+
                        '<ul>'+
                        "编辑状态中无法查看其它部门或人员信息"+
                        '<li >'+
                        '姓名：<input type="text" class="form-control"  ng-model="tempUsername" >'+
                        '</li>'+
                        '<li >'+
                        '密码（第一次登录为本人身份证号码）：<input type="text" class="form-control" ng-model="tempUserpwd" >'+
                        '</li>'+
                        '</ul>'+
                        // 'Selected: <b>{{ selected.item }}</b>'+
                        '</div>'+
                        '<div class="modal-footer">'+
                        '<button class="btn btn-primary" ng-click="ok()">登录</button>'+
                        // '<button class="btn btn-warning" ng-click="initialize()">初始化</button>'+
                        '<a ui-sref="access.signin" class="btn btn-warning">返回首页</a>'+
                        '</div>  ',
                        controller : function($scope, $modalInstance) {
                            $scope.tempUser={};
                            $scope.tempUsername='admin';
                            $scope.tempUserpwd='123456';
                            $scope.ok = function() {
                                //保存提交到服务器
                                $http(
                                    {
                                        method:'POST',
                                        url:$rootScope.applicationServerpath+'person/pcLogin',
                                        data:{"name":$scope.tempUsername,
                                        "pwd":$scope.tempUserpwd
                                    }
                                    }
                                ).then(function(resp){
                                        // alert("部门数据库初始化成功！");
                                        console.log(resp);
                                        if(resp.status==200){
                                            //说明服务器端查询用户成功
                                            $rootScope.curUser=resp.data;
                                            console.log(resp.data);
                                            $modalInstance.close(true);
                                        };
                                    });
                            };
                            $scope.initialize = function() {
                                //保存提交到服务器
                                $http.post($rootScope.applicationServerpath+'person/initializePersons',
                                    [])
                                    .then(function(resp){
                                        // alert("用户初始化成功！");
                                        if(resp==200){
                                            //说明服务器端新定位点保存成功
                                            $modalInstance.dimiss("initializePersons");
                                        };
                                    });
                            };
                        },
                        backdrop: 'static',
                        keyboard: false
                    }
                );

            }
            $rootScope.confirmUserModalInstance.result.then(function(result) {
                console.log(($state.current.name!='access.signin'));
                console.log(result);
                $rootScope.confirmUserModalInstance=null;
                if(callback)
                callback();
            }, function(reason) {
                console.log(reason);// 点击空白区域，总会输出backdrop
                $rootScope.confirmUserModalInstance=null;
                // dismiss的时候不callback
                // callback();
            });
        };


        // 登录的检验，初级版
        if( (!$rootScope.curUser|| !$rootScope.curUser.role)){
            // console.log(($state.current));
            // $rootScope.confirmUser();($state.name!='access.signin')&&

            // $state.go('app.gridmap');
            // $state.go('app.signin');
        };

        // 登录的豪华版，1，监控路由变化
        $rootScope.$on('$stateChangeStart',function(event, toState, toParams, fromState, fromParams){
          console.log("捕获angular路由变化，要去的页面路由名称是："+toState.name);
          $rootScope.fromstate=fromState.name; //上个路由地址

          $rootScope.curUser=localStorageService.get('user',500,'请重新登录');
          console.log($rootScope.curUser);
          $scope.userName=$rootScope.curUser.name;
            if(toState.name=='access.signin')return;// 如果是进入登录界面则允许

            // 如果用户不存在
            localStorageService.update('user',$rootScope.curUser);//每次跳转重新计时
            if((!$rootScope.curUser|| !$rootScope.curUser.role)){
                console.log('阻止跳转');
                event.preventDefault();// 取消默认跳转行为
                $state.go("access.signin",{from:fromState.name,w:'notLogin'});//跳转到登录界面
            }
        });
        window.setInterval(function(){
            var promptboth=localStorageService.get('messagespromptboth'+$rootScope.curUser._id,24)
          for(var i=0;i<promptboth.length;i++){
            var info=localStorageService.get('PersonInfo_'+promptboth[i].sender,24);
            promptboth[i].name=info.name;
          }
          $rootScope.promptboth=promptboth;
          // console.log($rootScope.promptboth);

        },$rootScope.locationRefreshTime)
        // 2对用户超时事件进行捕捉，还未使用
        /**
         * .factory('UserInterceptor', ["$q","$rootScope",function ($q,$rootScope) {
    return {
        request:function(config){
            config.headers["ROLE"] = $rootScope.curUser.role;
            return config;
        },
        responseError: function (response) {
            var data = response.data;
            // 判断错误码，如果是未登录
            if(data["errorCode"] == "500999"){
                // 清空用户本地token存储的信息，如果
                $rootScope.curUser = {role:""};
                // 全局事件，方便其他view获取该事件，并给以相应的提示或处理
                $rootScope.$emit("userIntercepted","notLogin",response);
            }
            // 如果是登录超时
            if(data["errorCode"] == "500998"){
                $rootScope.$emit("userIntercepted","sessionOut",response);
            }
            return $q.reject(response);
        }
    };
}]).config(function ($httpProvider) {
    $httpProvider.interceptors.push('UserInterceptor');
})
         */

        $scope.autosize=function(){
          var winowHeight = $window.innerHeight; //获取窗口高度
          var headerHeight = 50;
          var footerHeight = 50;
          var winHei = winowHeight - footerHeight -headerHeight;
//$window.innerHeight - 100 -250 + 'px'
//             console.log(winHei);
          var asidescroll=winowHeight-headerHeight+'px';//右侧导航栏
          var mail_contacts=winHei - 50 + 'px';
          var mail_list_win=winHei - 230 + 'px';
          var app_content=winHei + 'px';
          $('.amap-container').css('min-height',app_content);
          //console.log(app_content);
          $('#myStyle').html('.mail-contacts{height:'+mail_list_win+';}.mail-list-win{height:'+mail_list_win+';}.app-content{height:'+app_content+';}.asidescroll{height:'+asidescroll+';overflow-y:scroll;}');
        }
      $scope.autosize();
        //自动最大化高度
         window.onresize=function(){
           $scope.autosize();
        }

        $rootScope.$on('userIntercepted',function(errorType){
            // 跳转到登录界面，这里我记录了一个from，这样可以在登录后自动跳转到未登录之前的那个界面
            $state.go("access.signin",{from:$state.current.name,w:errorType});
        });

         /* 所有全局变量结束
         * ***/
      // config
      $scope.app = {
        name: '崖州网格化',
        version: '1.0.0',
        // for chart colors
        color: {
          primary: '#7266ba',
          info:    '#23b7e5',
          success: '#27c24c',
          warning: '#fad733',
          danger:  '#f05050',
          light:   '#e8eff0',
          dark:    '#3a3f51',
          black:   '#1c2b36'
        },
        settings: {
          themeID: 1,
          navbarHeaderColor: 'bg-black',
          navbarCollapseColor: 'bg-white-only',
          asideColor: 'bg-black',
          headerFixed: true,
          asideFixed: false,
          asideFolded: false,
          asideDock: false,
          container: false
        }
      }

      // save settings to local storage
      if ( angular.isDefined($localStorage.settings) ) {
        $scope.app.settings = $localStorage.settings
      } else {
        $localStorage.settings = $scope.app.settings;
      }
      $scope.$watch('app.settings', function(){
        if( $scope.app.settings.asideDock  &&  $scope.app.settings.asideFixed ){
          // aside dock and fixed must set the header fixed.
          $scope.app.settings.headerFixed = true;
        }
        // save to local storage
        $localStorage.settings = $scope.app.settings;
      }, true);

      // angular translate
      $scope.lang = { isopen: false };
      //多语言设置：这个很有意思，通过key值去指定路径下读取对应的js文件，通过注入，将html标签中对应的条目更换语言
      $scope.langs = {cn:'中文',en:'English', de_DE:'German', it_IT:'Italian'};
      $scope.selectLang = $scope.langs[$translate.proposedLanguage()] || "中文";
      $scope.setLang = function(langKey, $event) {
        // set the current lang
        $scope.selectLang = $scope.langs[langKey];
        // You can change the language during runtime
        $translate.use(langKey);
        $scope.lang.isopen = !$scope.lang.isopen;
      };

      function isSmartDevice( $window )
      {
          // Adapted from http://www.detectmobilebrowsers.com
          var ua = $window['navigator']['userAgent'] || $window['navigator']['vendor'] || $window['opera'];
          // Checks for iOs, Android, Blackberry, Opera Mini, and Windows mobile devices
          return (/iPhone|iPod|iPad|Silk|Android|BlackBerry|Opera Mini|IEMobile/).test(ua);
      }

			$scope.engineInitialise =function(params) {
				
			}
			
			$scope.engineRun =function(params) {
				
			}			
			
			$scope.enginePause =function(params) {
				
			}
			
			$scope.engineResum =function(params) {
				
			}
			
			$scope.engineStop =function(params) {
				
			}		
			
			$scope.my_data  = [
      {
        label: 'Animal',
        children: [
          {
            label: 'Dog',
            data: {
              description: "man's best friend"
            }
          }, {
            label: 'Cat',
            data: {
              description: "Felis catus"
            }
          }, {
            label: 'Hippopotamus',
            data: {
              description: "hungry, hungry"
            }
          }, {
            label: 'Chicken',
            children: ['White Leghorn', 'Rhode Island Red', 'Jersey Giant']
          }
        ]
      }, {
        label: 'Vegetable',
        data: {
          definition: "A plant or part of a plant used as food, typically as accompaniment to meat or fish, such as a cabbage, potato, carrot, or bean.",
          data_can_contain_anything: true
        },
        onSelect: function(branch) {
          return $scope.output = "Vegetable: " + branch.data.definition;
        },
        children: [
          {
            label: 'Oranges'
          }, {
            label: 'Apples',
            children: [
              {
                label: 'Granny Smith'
              }, {
                label: 'Red Delicous'
              }, {
                label: 'Fuji'
              }
            ]
          }
        ]
      }, {
        label: 'Mineral',
        children: [
          {
            label: 'Rock',
            children: ['Igneous', 'Sedimentary', 'Metamorphic']
          }, {
            label: 'Metal',
            children: ['Aluminum', 'Steel', 'Copper']
          }, {
            label: 'Plastic',
            children: [
              {
                label: 'Thermoplastic',
                children: ['polyethylene', 'polypropylene', 'polystyrene', ' polyvinyl chloride']
              }, {
                label: 'Thermosetting Polymer',
                children: ['polyester', 'polyurethane', 'vulcanized rubber', 'bakelite', 'urea-formaldehyde']
              }
            ]
          }
        ]
      }
    ];

    $scope.my_tree_handler = function(branch) {
      var _ref;
      $scope.output = "You selected: " + branch.label;
      if ((_ref = branch.data) != null ? _ref.description : void 0) {
        return $scope.output += '(' + branch.data.description + ')';
      }
    };
    
    
    //= treedata_avm;
    $scope.my_tree = {};

  // 对Date的扩展，将 Date 转化为指定格式的String
  // 月(M)、日(d)、小时(h)、分(m)、秒(s)、季度(q) 可以用 1-2 个占位符，
  // 年(y)可以用 1-4 个占位符，毫秒(S)只能用 1 个占位符(是 1-3 位的数字)
  // 例子：
  // (new Date()).formate("yyyy-MM-dd hh:mm:ss.S") ==> 2006-07-02 08:09:04.423
  // (new Date()).formate("yyyy-M-d h:m:s.S")      ==> 2006-7-2 8:9:4.18
        Date.prototype.formate = function (fmt) { //author: meizz
          var o = {
            "M+": this.getMonth() + 1, //月份
            "d+": this.getDate(), //日
            "h+": this.getHours(), //小时
            "m+": this.getMinutes(), //分
            "s+": this.getSeconds(), //秒
            "q+": Math.floor((this.getMonth() + 3) / 3), //季度
            "S": this.getMilliseconds() //毫秒
          };
          if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
          for (var k in o)
            if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
          return fmt;
        }
      // var compare = function (obj1, obj2) {//排序函数
      //   var val1 = obj1.no;
      //   var val2 = obj2.no;
      //   if (val1 < val2) {
      //     return -1;
      //   } else if (val1 > val2) {
      //     return 1;
      //   } else {
      //     return 0;
      //   }
      // }
  }]);