/**
 * Created by Administrator on 2017/6/9.
 */
app.controller('concretearguCtrl', function ($scope, $rootScope, localStorageService, $http, $state, userService, dateService, messageService, $stateParams
                                         //, $ionicBackdrop,$ionicPopup,$ionicModal,departmentAndPersonsService
) {
  console.log('argu')
  $scope.stepdata = {
    date: new Date().formate("yyyy年M月d日h时m分s秒")
  }
  $scope.add = {
    person: [],
    addcaseperson: function (person) {
      console.log(person)
      if (person) {
        for (var i = 0; i < $scope.add.person.length; i++) {
          if ($scope.add.person[i] == person) {
            return;
          }
        }
        $scope.add.person.push(person)
        console.log($scope.add.person)
      }
      return person
      //console.log($('#addcaseperson').val())
    },
    addTime: function (time) {

    },
    addPlace:function(){

    },
    addStatute:function(){

    },
    adddepartment:function(){
      $('#addargument').append(`<div class="wrapper-xs">
                                   类型: <select name="" id="" onchange="this">
                                    <option value="date">时间</option>
                                            <option value="localtion">地点</option>
                                            <option value="laws">法规</option>
                                            <option value="workers">部门人员</option>
                                            <option value="peoples">社会人员</option>
                                        </select>
                                            名称：<input type="date"/>
                                            <button onclick="$(this).parent().remove()">删除</button>
                                        </div>`)
    }
  }
})