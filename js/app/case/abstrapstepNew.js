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
                    if ($scope.personPower[i]._id ==aa) {
                        return $scope.personPower[i].name;
                    }
                }
            }
            $rootScope.abstractstepN.power.new=getleaverindex($rootScope.abstractstepN.power.new);
            $rootScope.abstractstepN.power.audit=getleaverindex($rootScope.abstractstepN.power.audit);
            //$scope.selectedNew=getleaverindex($rootScope.abstractstepN.power.new)
//       $scope.activities.argument.push({'argutype': '其它', name: '其它'})

            //console.log($scope.selectedNew)
            //console.log(JSON.stringify($scope.personPower))
            $('#myEditor').html($rootScope.abstractstepN.wordTemplate)
            // $scope.um.setContent('添加文字测试');
            // $rootScope.abstractstepN.wordTemplate);
//       $('#updateStepDate').html(`<input type="text" name="type" value="${$scope.activities.type}">`)


            // for (var a = 0, str1 = ''; a < $scope.activities.length; a++) {
            //   var count = a + 1;
            //   //abstractstepN[a].argutype;//类型
            //   str1 += `<div class="wrapper-xs">
            //        <span>${count}</span>
            //              类型:
            //              <select name="argutype" id="${'myArgument' + count}" ng-init="engineer${count}='${$scope.activities[a].argutype}'" ng-model="engineer${count}" ng-options="ac.argutype as ac.argutype for ac in activities" ng-change="chooseargument(engineer${count},${count})"></select>`;
            //   str1 += `
            //                  名称：<input type="test" name="name" value="${$scope.activities[a].name}"/>
            // <button ng-click="quotecontent('${$scope.activities[a].name}')">插入</button>
            //                       <button onclick="$(this).parent().remove()">删除</button>
            //                  </div>`;
            //   console.log($scope.activities[a].name)
            // }
            // if(str1){$('#addargument').html($compile(str1)($scope))}


//       $scope.power = $scope.activities.power;
//       for (var b = 0; b < $scope.activities.power; b++) {
//
//       }
//
            $scope.updatepower = function (e) {
                console.log(e)
                switch (e) {
                    case 'selectedNew':
                        $scope.selectedNew = '123';
                        console.log( $scope.selectedNew)
                        break;
                    case 'selectedoff':
                        $scope.selectedoff = '456';
                        console.log( $scope.selectedNew)
                        break;
                }
            }

        }
    }
})