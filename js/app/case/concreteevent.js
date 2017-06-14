/**
 * Created by Administrator on 2017/6/8.
 */
app.controller('concreteeventCtrl', function ($scope, $rootScope, localStorageService, $http, $state, userService, dateService, messageService, $stateParams
                                      //, $ionicBackdrop,$ionicPopup,$ionicModal,departmentAndPersonsService
) {
$scope.casetypes={};
  $http({
    method: 'POST',
    url:$rootScope.applicationServerpath+'concreteeventroute/getAllconcreteevent',
    data:{no:'jiushou'}
  }).then(function(resp){
    var data=resp.data;
    data.forEach(function(val,key){
      val.createDate=new Date().formate("yyyy年M月d日h时m分s秒");
      val.step.forEach(function(step,key){
        if(step.status==1){
          val.current=step;
          console.log()
        }
      })
    })
    $scope.casetypes=data;
    console.log($scope.casetypes)
    $rootScope.casetypes=data;
  })
  $scope.concreteeventGo=function(id){
    $state.go('app.concretestep',{
      'id':id
    });
  }
  $scope.newcase=function(){

  }
})