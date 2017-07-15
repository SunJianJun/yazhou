/**
 * Created by Administrator on 2017/6/8.
 */
app.controller('concreteeventCtrl', function ($scope, $rootScope, localStorageService, $http, $state, userService, dateService, messageService, $stateParams
                                              //, $ionicBackdrop,$ionicPopup,$ionicModal,departmentAndPersonsService
) {
    $scope.casetypes = {};
    $scope.onload = function () {
        console.log('加载具体事件')
        $http({
            method: 'POST',
            url: $rootScope.applicationServerpath + 'mobilegrid/getAllconcreteevent',//获取到所有具体事件
            data:{departmentID:'111'}
        }).then(function (resp) {
            var data = resp.data.success;
            console.log(data)
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
    $scope.onload();
    $scope.concreteeventGo = function (id) {
        $state.go('app.concretestep', {
            'id': id
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
            url: $rootScope.applicationServerpath + 'mobilegrid/getAllAbstracttype'//获取抽象表中的类型
        }).then(function (resp) {
            var data = resp.data.success;
            console.log(data)
            $scope.typeArr = data;
            $('#newabstracttype').show();
        })
    }
    $scope.newcase = function (name) {
        var typeName = $('#newtypeType').val();
        var typeDepartment = $('#newtypeDepartment').val();
        console.log(name, typeName,typeDepartment);
        $http({
            method: 'POST',
            url: $rootScope.applicationServerpath + 'mobilegrid/sendnewEvent',//新建一个事件
            data: {
                name: name,
                type: typeName,
                departmentID:typeDepartment,
                newwho:$rootScope.curUser._id
            }
        }).then(function (resp) {
            console.log(resp.data)
            $scope.onload()
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
})