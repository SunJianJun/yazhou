/**
 * Created by Administrator on 2017/6/8.
 */
//$rootScope.casetypes;
app.controller('caseprocessCtrl', function ($scope, $rootScope, localStorageService, $http, $state, userService, dateService, messageService, $stateParams
                                          //, $ionicBackdrop,$ionicPopup,$ionicModal,departmentAndPersonsService
) {
    //console.log($rootScope.casetypes)

    $rootScope.casetypes.forEach(function(val,key){
        //console.log(val._id)
        if(val._id===$stateParams.id) {
            $scope.process = val;
            $scope.taskList=[],$scope.taskcurrent=[],$scope.taskdone=[];
            val.step.forEach(function(task,val){
                if(task.status==0){
                    $scope.taskList.push(task)
                }else if(task.status==1){
                    $scope.taskcurrent.push(task)
                }else if(task.status==2){
                    $scope.taskdone.push(task)
                }

            })
        }
    })
    console.log($scope.process)
})