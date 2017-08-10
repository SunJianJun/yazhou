'use strict';

/* Controllers */
// signin controller
app.controller('SigninFormController', ['$rootScope', '$scope', '$interval', '$http', '$state','$timeout','localStorageService',function ($rootScope, $scope, $interval, $http, $state,$timeout, localStorageService) {
    $scope.user = {};
    $scope.authError = null;
    //$scope.user.email='admin';
    //$scope.user.password='123456';
    $rootScope.curUser = '';//清空当前账户
    $scope.user.email = '谭剑';
    $scope.user.password = '123456';
    // $scope.user.email=$rootScope.curUser.name;
    // $scope.user.password=$rootScope.curUser.idNum;
    $scope.login = function () {
      //保存提交到服务器
      $http(
        {
          method: 'POST',
          url: $rootScope.applicationServerpath + 'person/pcLogin',
          data: {
            "name": $scope.user.email,
            "pwd": $scope.user.password
          }
        }
      ).then(function (resp) {
        // alert("部门数据库初始化成功！");
        console.log(resp);
        if (resp.data) {
          if (resp.status == 200) {
            //说明服务器端查询用户成功
            $rootScope.curUser = resp.data;
            localStorageService.update('user', $rootScope.curUser);
            console.log($rootScope.curUser);

            //console.log("已取得用户:"+JSON.stringify($rootScope.curUser));
            console.log($rootScope.fromstate)
            if ($rootScope.fromstate) {
              $state.go($rootScope.fromstate);
            } else {
              $state.go('app.gridmap');
            }
            console.log('请求成功');
            console.log($rootScope.curUser);
            //if(resp.data==''){
            //    console.log('用户名和密码可能输入错误，没有返回数据')
            //}
          } else {
            $scope.authError = '请求出错';
            //$scope.authError = '用户名和密码可能输入错误';
          }
        } else {
          alert('密码错误');
        }
      });
    };


    $scope.iscode = false;


    $scope.loadlogin = function (uuid) {

      $scope.logintimer = $interval(function () {
        if (uuid) {
          console.log(uuid)
            $http({
                method: 'POST',
                url: $rootScope.applicationServerpath + 'personalinfo/getphoneBypclogin',
                data: {_id:uuid}
              }).then(function (resp) {
              console.log('返回数据')
              console.log(resp.data)
              var success = resp.data.success, error = resp.data.error;
              if (success) {
                if (success.person) {
                  $rootScope.curUser = success.person;
                  $state.go('app.gridmap');
                  return;
                } else {

                }
              }
              if (error) {
                $interval.cancel($scope.logintimer);
                console.log(resp.data)
                return;
              }
            if ($rootScope.curUser) {
              $interval.cancel($scope.logintimer);
              $state.go('app.gridmap');
            }
        })

        }

      }, 2000);
      $timeout(function () {
        $interval.cancel($scope.logintimer);
      },30000)


    }

  $scope.showscanningqrcode = function () {
    $scope.iscode = true;
    var loadloginID=localStorageService.get('loadloginID',2)
    console.log(loadloginID)
    if(!loadloginID){
      console.log('缓存没数据')
      $http(//打开页面，现在数据库中添加记录，手机扫描
        {
          method: 'POST',
          url: $rootScope.applicationServerpath + 'personalinfo/sendphoneBypcloginuuid'
        }
      ).then(function (resp) {
        console.log(resp.data)
        if (resp.data) {
          if(resp.data.success){
            $scope.login_id = resp.data.success;
            console.log($scope.login_id)
            localStorageService.update('loadloginID',$scope.login_id)
            $scope.loadlogin($scope.login_id);
          }else{

          }
        }
      })
    }else{
      $scope.loadlogin(loadloginID);
    }
  }
  $scope.showdownload = function () {
    $scope.iscode = false;
  }
  }]
);