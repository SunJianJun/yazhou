/**
 * Created by Administrator on 2017/7/13.
 */
app.controller('abstrapstepNew', function ($scope, $compile, $rootScope, $window, localStorageService, $http, $state, userService, dateService, messageService, $stateParams) {
  console.log('获取抽象表编辑')
  console.log($stateParams.id)


  if (!$stateParams.id) {
    $rootScope.abstractstepN = ''
  } else {
    console.log($rootScope.abstractstepN)
    if ($rootScope.abstractstepN) {
      //console.log($rootScope.abstractstepN.power.go)
      $scope.activities = $rootScope.abstractstepN.argument;
      var getleaverindex = function (aa) {
        for (var i = 0; i < $scope.personPower.length; i++) {
          if ($scope.personPower[i]._id == aa) {
            return $scope.personPower[i].name;
          }
        }
      }
      if ($rootScope.abstractstepN.power && $rootScope.abstractstepN.power.new) {
        $rootScope.abstractstepN.power.new = getleaverindex($rootScope.abstractstepN.power.new)
      }
      if ($rootScope.abstractstepN.power && $rootScope.abstractstepN.power.audit) {
        $rootScope.abstractstepN.power.audit = getleaverindex($rootScope.abstractstepN.power.audit)
      }
      //$scope.selectedNew=getleaverindex($rootScope.abstractstepN.power.new)
//       $scope.activities.argument.push({'argutype': '其它', name: '其它'})

      $scope.arguisdefined = function (e) {
        console.log('$scope.settingargu[i].name')
        console.log(e)
        for(var item in $scope.settingargu){
          // console.log(aa[item].type)
          if($scope.settingargu[item].type==e){
            console.log($scope.settingargu[item]);
          }
        }
        var aa = $scope.settingargu.indexOf(e)
        if (aa + 1) {
          return true;
        } else {
          return false;
        }
      }
      //console.log($scope.selectedNew)
      //console.log(JSON.stringify($scope.personPower))
      $('#myEditor').html($rootScope.abstractstepN.wordTemplate)
      // $scope.um.setContent('添加文字测试');
      // $rootScope.abstractstepN.wordTemplate);
//       $('#updateStepDate').html(`<input type="text" name="type" value="${$scope.activities.type}">`)

      $scope.updatepower = function () {
        $scope.selectedUpdate=true;
      }

    }
  }
})