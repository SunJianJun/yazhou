/**
 * Created by Administrator on 2017/6/8.
 */
app.controller('abstracttypeCtrl', function ($scope, $rootScope, localStorageService, $http, $state, userService, dateService, messageService, $stateParams
                                      //, $ionicBackdrop,$ionicPopup,$ionicModal,departmentAndPersonsService
) {
$scope.abstracttype={};
  $http({
    method: 'POST',
    url:$rootScope.applicationServerpath+'abstracttyperoute/getAllAbstracttype'
  }).then(function(resp){
    var data=resp.data;
    data.forEach(function(val,key){
      val.createDate=new Date().formate("yyyy年M月d日h时m分s秒");
      val.steps.forEach(function(step,key){
        if(step.status==1){
          val.current=step;
        }
      })
    })
    $scope.abstracttypeGo=function(id){
      $state.go('app.abstractstep',{
        'id':id
      });
    }
    $scope.abstracttype=data;
    $rootScope.abstracttype=data;
  })

  $scope.newcase=function(type){
    $http({
      method: 'POST',
      url:$rootScope.applicationServerpath+'abstracttyperoute/sendAAbstracttype',
      data:{
        typeName:type
      }
    }).then(function(resp){
      if(resp.data){
        console.log(resp.data)
      }
    })
  }
  $scope.removecase=function(id){
    $http({
      method: 'POST',
      url:$rootScope.applicationServerpath+'abstracttyperoute/abstracttypeDelete',
      data:{
        id:id
      }
    }).then(function(resp){
      if(resp.data){
        console.log(resp.data)
      }
    })
  }

})