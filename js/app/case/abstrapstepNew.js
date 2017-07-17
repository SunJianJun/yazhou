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
      console.log($rootScope.abstractstepN.power.go)
      $scope.activities = $rootScope.abstractstepN.argument;
//       $scope.activities.argument.push({'argutype': '其它', name: '其它'})
      console.log($scope.activities)
      console.log()
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
      var str2 = `<tr>
<td style="width:200px">新建/编辑</td><td><select name="new" id="" onchange="this">`;
      for (var per = 0, str3 = ''; per < $scope.personPower.length; per++) {
        var power = $scope.personPower[per];
        str3 += `<option value="${power}" ${$rootScope.abstractstepN.power.new == power ? 'selected' : ''}>${power}</option>`;
      }
      str2 += str3;
      str2 += `</select>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>驳回（删除）</td>
                                        <td>
                                            <select name="backOff" id="" onchange="this">`
      for (var per = 0, str3 = ''; per < $scope.personPower.length; per++) {
        var power = $scope.personPower[per];
        str3 += `<option value="${power}" ${$rootScope.abstractstepN.power.backOff == power ? 'selected' : ''}>${power}</option>`;
      }
      str2 += str3;
      str2 += `</select>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>推进（审核完成）</td>
                                        <td>
                                            <select name="go" id="" onchange="this">`;
      for (var per = 0, str3 = ''; per < $scope.personPower.length; per++) {
        var power = $scope.personPower[per];
        str3 += `<option value="${power}" ${$rootScope.abstractstepN.power.go == power ? 'selected' : ''}>${power}</option>`;
      }
      str2 += str3;
      str2 += `</select>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td></td>
                                        <td>
                                            <button ng-click="updatepersonpower('${$stateParams.id}')">完成</button>
                                            <button>返回</button>
                                            <button ng-click="removepersonpower('${$stateParams.id}')">删除</button>
                                        </td>
                                    </tr>`;
      // console.log(str2)
      // $('#newFrom table').html('123321')
      $scope.city='大队长';
    }
  }
})