/**
 * Created by Administrator on 2017/6/9.
 */
app.controller('concretearguCtrl', function ($scope, $rootScope, $compile, localStorageService, $http, $state, userService, dateService, messageService, $stateParams
                                             //, $ionicBackdrop,$ionicPopup,$ionicModal,departmentAndPersonsService
) {
  $scope.currentcaseID = $stateParams.caseid;//当前案件的ID
  console.log($scope.currentcaseID)

  $http({
    method: 'POST',
    url: $rootScope.applicationServerpath + 'mobilegrid/getargutostep',//根据步骤获取所有步骤的参数
    data: {
      'id': $scope.currentcaseID
    }
  }).then(function (arguresp) {
    $scope.arguArr = arguresp.data.success;
    console.log($scope.arguArr)
    //console.log($scope.steps.wordTemplate);
    //   if($scope.steps.wordTemplate){
    //     //var um = UM.getEditor('myEditor');
    //     //um.setContent($scope.steps.wordTemplate);
    //   }
    $http({
      method:'POST',
      url:$rootScope.applicationServerpath+'mobilegrid/getstepaudittext',
      data:{stepID:$scope.currentcaseID}
    }).then(function(resp){
      console.log(resp.data)
      if(resp.data.success){
        $scope.audittext=resp.data.success;
        var map = new AMap.Map("alertmapa", {
          resizeEnable: true,
          center: [116.397428, 39.90923],//地图中心点
          zoom: 13 //地图显示的缩放级别
        });
        var clickEventListener = map.on('click', function(e) {
          $('.locationsmap').val(e.lnglat.getLng() + ',' + e.lnglat.getLat())
          // console.log(e.lnglat.getLng() + ',' + e.lnglat.getLat())
        });
      }else{

      }
    })
    $scope.choicelocation=function (ce) {
      console.log(ce)
      if(ce=='location'){
        $('.alertmap').show();
      }
    }
  })
  $http({
    method: 'POST',
    url: $rootScope.applicationServerpath + 'mobilegrid/getoneeventstep',//根据步骤ID获取步骤
    data: {
      'id': $scope.currentcaseID
    }
  }).then(function (arguresp) {
    $scope.steps = arguresp.data.success;//当前页面案件
    console.log($scope.steps)
    //$rootScope.curUser.title //当前登录用户的职务
    $http({
      method: 'POST',
      url: $rootScope.applicationServerpath + 'mobilegrid/getpersonpower',//获取当前用户的权限
      data: {
        'power': $scope.steps.power,
        'title': $rootScope.curUser.title
        //power:{backoff:"59520e5d7b6d7fa011adcc73",go:"59520e5d7b6d7fa011adcc73",new:"all"},title:'59520e5d7b6d7fa011adcc73'
      }
    }).then(function (resp) {
      console.log("获取当前用户编辑文档的权限")
      var current = resp.data.success, currenthtml = '';
      console.log(current)
      for (var i = 0; i < current.length; i++) {
        if (current[i] == 'new') {
          currenthtml += '<button ng-click="argusave.alert()" class="btn btn-default" data-toggle="modal" data-target="#myModal2">保存修改</button> <button ng-click="argusubmit.alert()" class="btn btn-default" data-toggle="modal" data-target="#myModal2">提交</button>'
        }
        if (current[i] == 'power') {
          currenthtml += ' <button ng-click="stepgo.alert()" class="btn btn-success">推进</button> ' +
            '<button ng-click="stepbackoff.alert()" class="btn btn-warning">驳回</button>'
        }
      }
      $('#personcurrent').html($compile(currenthtml)($scope))
    })
    //console.log($scope.steps.wordTemplate);
    //   if($scope.steps.wordTemplate){
    //     //var um = UM.getEditor('myEditor');
    //     //um.setContent($scope.steps.wordTemplate);
    //   }
  })
  $scope.stepdata = {
    date: new Date().formate("yyyy年M月d日h时m分s秒")
  };
  $scope.createWord = function () {
    var typeJSON = $('#typeJSON').serializeArray('title');
    var thisTemplate = $scope.steps.wordTemplate;
    console.log(typeJSON)
    for (var i = 0; i < typeJSON.length; i++) {
      thisTemplate = thisTemplate.replace('<span style="color:red;">|*' + $("#" + typeJSON[i].name)[0].title + '*|</span>', '<span>' + typeJSON[i].value + '</span>')
      //typeJSON[i].name
    }
    var um = UM.getEditor('myEditor');
    //$scope.steps.wordTemplate
    um.setContent(thisTemplate);
  };
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
    adddepartment: function () {
      $('#addargument').append(`<div class="wrapper-xs">
                                   类型: <select name="" id="" onchange="this">
                                    <option value="时间">时间</option>
                                            <option value="地点">地点</option>
                                            <option value="法规">法规</option>
                                            <option value="部门人员">部门人员</option>
                                            <option value="社会人员">社会人员</option>
                                        </select>
                                            名称：<input type="date"/>
                                            <button onclick="$(this).parent().remove()">删除</button>
                                        </div>`)
    }
  }
  $scope.pwdvalidate = function (id, pwd, callback) {//验证用户密码
    $http({
      method: "POST",
      url: $rootScope.applicationServerpath + 'personalinfo/ispersonpassword',
      data: {_id: id, pwd: pwd}
    }).then(function (resp) {
      if (resp.data.success) {
        callback(null, 'success')
      } else {
        callback(resp.data.error, null)
      }
    })
  }
  //参数保存
  $scope.argusave = {
    alert: function () {
      $scope.argualert = false;
      console.log('参数保存')
    },
    yanzheng: function (e) {
      console.log('参数保存');
      if (!e) {
        alert('请输入密码！');
        return;
      }
      $scope.pwdvalidate($rootScope.curUser._id, e, function (err, obj) {
        if (err) {
          alert(err);
        } else {
          var typeJSON = $('#typeJSON').serializeArray();
          var thisTemplate = $scope.steps.wordTemplate;
          // $scope.steps._id
          for (var i = 0, typeArr = []; i < typeJSON.length; i++) {
            typeArr.push({arguid: typeJSON[i].name, value: typeJSON[i].value})
          }
          console.log(typeArr)
          console.log($rootScope.currenteventID)
          $http({
            method: 'POST',
            url: $rootScope.applicationServerpath + 'mobilegrid/sendeventargument',//参数保存
            data: {
              'eventID': $rootScope.currenteventID,
              'arguments': typeArr,
              'setwho': $rootScope.curUser._id
            }
          }).then(function (arguresp) {
            if (arguresp.data.error) {

              console.log(arguresp.data.error)
            } else {
              console.log(arguresp.data.success)
              alert('保存成功')
              $state.go('app.concreteevent')
            }
          })
        }
      })
    }
  }
  //参数向上级提交
  $scope.argusubmit = {
    alert: function () {
      $scope.argualert = true;
      console.log('参数提交')
    },
    yanzheng: function (e) {
      console.log('参数提交')
      if (!e) {
        alert('请输入密码！');
        return;
      }
      $scope.pwdvalidate($rootScope.curUser._id, e, function (err, obj) {

        if (err) {
          alert(err);
        } else {//密码验证成功，进行保存
          var typeJSON = $('#typeJSON').serializeArray();
          var thisTemplate = $scope.steps.wordTemplate;
          // $scope.steps._id
          console.log(typeJSON)
          for(var type=0;type<typeJSON.length;type++) {
            if(!typeJSON[type].value){
              alert('参数不完整，请补充')
              return;
            }
          }

          for (var i = 0, typeArr = []; i < typeJSON.length; i++) {
            typeArr.push({arguid: typeJSON[i].name, value: typeJSON[i].value})
          }
          console.log(typeArr)
          console.log($rootScope.currenteventID)
          $http({
            method: 'POST',
            url: $rootScope.applicationServerpath + 'mobilegrid/sendeventargumentpush',//参数填写完成向上级提交
            data: {
              'eventID': $rootScope.currenteventID,
              stepID: $scope.currentcaseID,
              'arguments': typeArr,
              'setwho': $rootScope.curUser._id
            }
          }).then(function (arguresp) {
            console.log(arguresp.data)
            alert('提交成功')
            $state.go('app.concreteevent')
          })

        }

      })
    }
  }
  //步骤驳回
  $scope.stepbackoff = {
    alert: function () {
      $scope.powerisshow = false;
      console.log('参数审批不通过，驳回')

      console.log($rootScope.currenteventID)
      $('#leadreason').toggle();
    },
    send: function (text) {
      console.log('参数审批不通过，驳回')
      if(text) {
        $http({
          method: 'POST',
          url: $rootScope.applicationServerpath + 'mobilegrid/sendeventargbackoff',//参数审批不通过，驳回
          data: {
            'eventID': $rootScope.currenteventID,
            stepID: $scope.currentcaseID,
            'text':text,
            'person': $rootScope.curUser._id,
            'personTitle':$rootScope.curUser.title
          }
        }).then(function (arguresp) {
          console.log(arguresp.data)
          alert('提交成功')
          $state.go('app.concreteevent')
        })
      }else{
        alert('请输入驳回理由！')
      }

    }
  }
  //步骤审核通过
  $scope.stepgo = {
    alert: function () {
      $scope.powerisshow = true;
      console.log('参数审批通过！')

      console.log($rootScope.currenteventID)
      $('#leadreason').toggle();
    },
    send: function (text) {
      console.log('参数审批通过,进入下一流程')
      console.log(text)
      if (text) {
        $http({
          method: "POST",
          url: $rootScope.applicationServerpath + 'mobilegrid/sendstepgo',
          data: {
            stepID: $scope.currentcaseID,
            person: $rootScope.curUser._id,
            personTitle: $rootScope.curUser.title,
            text:text,
            'eventID': $rootScope.currenteventID
          }
        }).then(function (resp) {
          console.log('审核通过')
          alert(resp.data.success||resp.data.error)

          $state.go('app.concreteevent')
        })
      }else{
        alert('请输入审核意见！')
      }

    }
  }


})