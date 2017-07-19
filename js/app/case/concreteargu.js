/**
 * Created by Administrator on 2017/6/9.
 */
app.controller('concretearguCtrl', function ($scope, $rootScope,$compile, localStorageService, $http, $state, userService, dateService, messageService, $stateParams
                                         //, $ionicBackdrop,$ionicPopup,$ionicModal,departmentAndPersonsService
) {
  $scope.currentcaseID=$stateParams.caseid;//当前案件的ID
  console.log($scope.currentcaseID)

      $http({
        method:'POST',
        url:$rootScope.applicationServerpath + 'mobilegrid/getargutostep',//根据步骤获取所有步骤的参数
        data:{
          'id':$scope.currentcaseID
        }
      }).then(function(arguresp){
          $scope.arguArr=arguresp.data.success;
          console.log($scope.arguArr)
        //console.log($scope.steps.wordTemplate);
        //   if($scope.steps.wordTemplate){
        //     //var um = UM.getEditor('myEditor');
        //     //um.setContent($scope.steps.wordTemplate);
        //   }
      })
  $http({
    method:'POST',
    url:$rootScope.applicationServerpath + 'mobilegrid/getoneeventstep',//根据步骤ID获取步骤
    data:{
      'id':$scope.currentcaseID
    }
  }).then(function(arguresp){
    $scope.steps=arguresp.data.success;//当前页面案件
    console.log($scope.steps)
    //$rootScope.curUser.title //当前登录用户的职务
    $http({
      method:'POST',
      url:$rootScope.applicationServerpath + 'mobilegrid/getpersonpower',//获取当前用户的权限
      data:{
        'power':$scope.steps.power,
        'title':$rootScope.curUser.title
    //power:{backoff:"59520e5d7b6d7fa011adcc73",go:"59520e5d7b6d7fa011adcc73",new:"all"},title:'59520e5d7b6d7fa011adcc73'
      }
    }).then(function(resp){
      console.log("获取当前用户编辑文档的权限")
      var current=resp.data.success,currenthtml='';
      console.log(current)
      for(var i=0;i<current.length;i++){
        if(current[i]=='new'){
          currenthtml+='<button ng-click="argusave.alert()" class="btn btn-default" data-toggle="modal" data-target="#myModal2">保存修改</button> <button ng-click="argusubmit()" class="btn btn-default" data-toggle="modal" data-target="#myModal2">提交</button>'
        }
        if(current[i]=='audit'){
          currenthtml+=' <button ng-click="stepgo()" class="btn btn-success">推进</button> <button ng-click="stepbackoff.alert()" class="btn btn-warning">驳回</button>'
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
  $scope.createWord=function(){
    var typeJSON = $('#typeJSON').serializeArray('title');
    var thisTemplate=$scope.steps.wordTemplate;
    console.log(typeJSON)
    for(var i=0;i<typeJSON.length;i++){
      thisTemplate=thisTemplate.replace('<span style="color:red;">|*'+$("#"+typeJSON[i].name)[0].title+'*|</span>','<span>'+typeJSON[i].value+'</span>')
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
    addTime: function (time) {

    },
    addPlace:function(){

    },
    addStatute:function(){

    },
    adddepartment:function(){
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
  //参数保存
  $scope.argusave={
    alert:function () {
    console.log('参数保存')
  },
  yanzheng:function(e){
    // console.log(e);
    $http({
      method:"POST",
      url:$rootScope.applicationServerpath + 'personalinfo/ispersonpassword',//验证用户密码
      data:{_id:$rootScope.curUser._id,pwd:e}
    }).then(function(resp){
      console.log(resp.data)
      if(resp.data.success){//密码验证成功，进行保存
        var typeJSON = $('#typeJSON').serializeArray();
        var thisTemplate=$scope.steps.wordTemplate;
        // $scope.steps._id
        for(var i=0,typeArr=[];i<typeJSON.length;i++){
          typeArr.push({arguid:typeJSON[i].name,value:typeJSON[i].value})
        }
        console.log(typeArr)
        console.log($rootScope.currenteventID)
        $http({
         method:'POST',
         url:$rootScope.applicationServerpath + 'mobilegrid/sendeventargument',//参数保存
         data:{
           'eventID':$rootScope.currenteventID,
           'arguments':typeArr,
           'setwho':$rootScope.curUser._id
         }
        }).then(function(arguresp){
         if(arguresp.data.error){

           console.log(arguresp.data.error)
         }else{
           console.log(arguresp.data.success)
           alert('保存成功')
         }
        })
      }else if(resp.data.error){//密码验证错误
        alert(resp.data.error);

      }
    })
  }
  }
  //参数向上级提交
  $scope.argusubmit=function () {
    console.log('参数提交')
    var typeJSON = $('#typeJSON').serializeArray();
    var thisTemplate=$scope.steps.wordTemplate;
    // $scope.steps._id
    for(var i=0,typeArr=[];i<typeJSON.length;i++){
      typeArr.push({arguid:typeJSON[i].name,value:typeJSON[i].value})
    }
    console.log(typeArr)
    console.log($rootScope.currenteventID)
    // $http({
    //   method:'POST',
    //   url:$rootScope.applicationServerpath + 'mobilegrid/sendeventargumentpush',//参数填写完成向上级提交
    //   data:{
    //     'eventID':$rootScope.currenteventID,
    //     stepID:$scope.currentcaseID,
    //     'arguments':typeArr,
    //     'setwho':$rootScope.curUser._id
    //   }
    // }).then(function(arguresp){
    //     console.log(arguresp.data)
    //   alert('提交成功')
    // })
  }
  //步骤驳回
  $scope.stepbackoff={
    alert:
    function () {

      console.log('参数审批不通过，驳回')

      console.log($rootScope.currenteventID)
      $('#leadreason').toggle();
    },
    send:function(){
      $http({
        method:'POST',
        url:$rootScope.applicationServerpath + 'mobilegrid/sendeventargumentpu',//参数审批不通过，驳回
        data:{
          'eventID':$rootScope.currenteventID,
          stepID:$scope.currentcaseID,
          'arguments':typeArr,
          'setwho':$rootScope.curUser._id
        }
      }).then(function(arguresp){
        console.log(arguresp.data)
        alert('提交成功')
      })
    }
  }
  //步骤审核通过
  $scope.stepgo=function(){
    console.log('参数审批通过,进入下一流程')

  }
})