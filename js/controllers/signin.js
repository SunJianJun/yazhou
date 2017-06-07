'use strict';

/* Controllers */
  // signin controller
app.controller('SigninFormController', ['$rootScope','$scope', '$http', '$state','localStorageService', function($rootScope,$scope, $http, $state,localStorageService) {
    $scope.user = {};
    $scope.authError = null;
    //$scope.user.email='admin';
    //$scope.user.password='123456';
    $scope.user.email='谭剑';
    $scope.user.password='131321231321321231321';
    $scope.login = function() {
            //保存提交到服务器
            $http(
                {
                    method:'POST',
                    url:$rootScope.applicationServerpath+'person/pcLogin',
                    data:{"name":$scope.user.email,
                        "pwd":$scope.user.password
                    }
                }
            ).then(function(resp){
                // alert("部门数据库初始化成功！");
                console.log(resp);
                if(resp.status==200){
                    //说明服务器端查询用户成功
                    $rootScope.curUser=resp.data;
                    localStorageService.update('user',$rootScope.curUser);
                    console.log($rootScope.curUser);

                    //console.log("已取得用户:"+JSON.stringify($rootScope.curUser));

                    $state.go('app.gridmap');
                    console.log('请求成功');
                    console.log($rootScope.curUser);
                    //if(resp.data==''){
                    //    console.log('用户名和密码可能输入错误，没有返回数据')
                    //}
                }else{
                    $scope.authError = '请求出错';
                    //$scope.authError = '用户名和密码可能输入错误';
                }
            });

    };

}
    ]
)
;