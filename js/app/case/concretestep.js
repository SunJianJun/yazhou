/**
 * Created by Administrator on 2017/6/8.
 */
//$rootScope.casetypes;
app.controller('concretestepCtrl', function ($scope, $rootScope, localStorageService, $http, $state, userService, dateService, messageService, $stateParams
                                             //, $ionicBackdrop,$ionicPopup,$ionicModal,departmentAndPersonsService
) {
  //console.log($rootScope.casetypes)
  /*
   $rootScope.casetypes.forEach(function (val, key) {//需要重新加载，不可获取之前的数据
   //console.log(val._id)
   if (val._id === $stateParams.id) {
   console.log(val)
   $scope.process = val;
   $scope.taskcurrent = [], $scope.taskdone = [];
   console.log(val.step)
   $http({
   method: 'POST',
   url: $rootScope.applicationServerpath + 'concretesteproute/geteventstep',
   data: {id: val.step}
   }).then(function (resp) {
   var data = resp.data
   $scope.taskList = data;
   console.log(data)
   })
   })*/
  $rootScope.currenteventID=$stateParams.id;
  $rootScope.currenteventName=$stateParams.name;
  console.log($stateParams)
  $http({//获取事件中的步骤
    method: 'POST',
    url: $rootScope.applicationServerpath + 'mobilegrid/getcasestep',//获取到事件所有步骤
    data: {_id: $stateParams.id}
  }).then(function (resp) {
    var data = resp.data.success;
    $scope.taskList = data;
    console.log('获取到事件所有步骤');
    console.log($scope.taskList);
  });
  $http({//获取事件中进行中的步骤
    method: 'POST',
    url: $rootScope.applicationServerpath + 'mobilegrid/getcurrentstep',//获取到当前步骤
    data: {_id: $stateParams.id}
  }).then(function (resp) {
    var data = resp.data.success;
    $scope.taskcurrent = data;
    console.log('获取到当前步骤');
    console.log($scope.taskcurrent);
  });
  $http({//获取事件中已完成的步骤
    method: 'POST',
    url: $rootScope.applicationServerpath + 'mobilegrid/getcompletestep',//获取到已完成步骤
    data: {_id: $stateParams.id}
  }).then(function (resp) {
    var data = resp.data.success;
    $scope.taskdone = data;
    console.log('获取到已完成步骤');
    console.log($scope.taskdone);
  });
  //})
  $scope.addparameter = function (caseid) {
    console.log(caseid)
    $state.go('app.concreteargu', {
      'caseid': caseid
    });
  }
  $loadstep = function () {

  }
})