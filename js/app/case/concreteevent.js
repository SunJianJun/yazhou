/**
 * Created by Administrator on 2017/6/8.
 */
app.controller('concreteeventCtrl', function ($scope, $rootScope, localStorageService,departmentAndPersonsService, $http, $state, userService, dateService, messageService, $stateParams
                                              //, $ionicBackdrop,$ionicPopup,$ionicModal,departmentAndPersonsService
) {
    $scope.casetypes = {};
  $scope.currentdocument='';
  $scope.iscurrentaddclass=function (id) {
    if(id==$scope.currentdocument){
      return 'active'
    }
  }
    $scope.onload = function (depart) {
        console.log('加载具体事件')
        $http({
            method: 'POST',
            url: $rootScope.applicationServerpath + 'mobilegrid/getAllconcreteevent',//获取到所有具体事件
            data:{departmentID:depart}
        }).then(function (resp) {
            var data = resp.data.success;
            data.forEach(function (val, key) {
                    val.newer = new Date(val.newer).formate("yyyy年M月d日h时m分s秒");
                val.step.forEach(function (step, key) {
                    if (step.status == 1) {
                        val.current = step;
                        console.log()
                    }
                })
            })
            $scope.casetypes = data;
            console.log($scope.casetypes)
            $rootScope.casetypes = data;
        })
    }
    $scope.concreteeventGo = function (id,name) {
        $state.go('app.concretestep', {
            'id': id,
          name:name
        });
    }
    $scope.removeconcreteevent = function (id) {
        console.log(id);
        $http({
            method:"POST",
            url: $rootScope.applicationServerpath + 'mobilegrid/sendeeventDelete',//删除一个具体事件
            data:{
                'id':id
            }
        }).then(function(resp){
            console.log(resp.data);
            $scope.onload()
        })
    }
    $scope.newabstracttype = function () {
        $http({  //获取抽象表中的类型
            method: 'POST',
            url: $rootScope.applicationServerpath + 'mobilegrid/getAllAbstracttypetodep',//获取抽象表中的类型
            data:{departmentID:$scope.currentdocument}
        }).then(function (resp){
            var data = resp.data.success;
            console.log(data)
            $scope.typeArr = data;
            $('#newabstracttype').removeClass('hide');
        })
    }
    $scope.newcase = function (name) {
        var typeName = $('#newtypeType').val();
        console.log(name, typeName,$scope.currentdocument);
        $http({
            method: 'POST',
            url: $rootScope.applicationServerpath + 'mobilegrid/sendnewEvent',//新建一个事件
            data: {
                name: name,
                type: typeName,
                departmentID:$scope.currentdocument,
                newwho:$rootScope.curUser._id
            }
        }).then(function (resp) {
            console.log(resp.data)
            $scope.onload()
          // $state.go('app.concreteargu', {
          //   'caseid': caseid
          // });
        })
        $('#newabstracttype').hide();
        //$http({
        //  method:'POST',
        //  url:$rootScope.applicationServerpath+'abstracttyperoute/getoneeventtype',
        //  data:{type:typeName}
        //}).then(function(resp){
        //    var steps=resp.data.steps;
        //})
    }
  //切换一个当前部门列表
  $scope.checkoutdepartmentevent=function (id) {
    console.log(id)
    $scope.currentdocument=id;
      $('#newabstracttype').addClass('hide');
    $scope.onload($scope.currentdocument);
  }
  departmentAndPersonsService.getAllDepartments($rootScope.applicationServerpath,function (dep) {
    console.log(dep)
    $scope.currentdocument=dep[0]._id;
    $scope.alldocuments=dep;
    $scope.onload($scope.currentdocument);
  })
})