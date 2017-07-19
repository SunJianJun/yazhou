/**
 * Created by Administrator on 2017/6/9.
 */
app.controller('abstractstepCtrl',
    function ($scope, $compile, $rootScope,$window, localStorageService, $http, $state, userService, dateService, messageService, $stateParams) {

        $http({ //获取人员 title 权限
            method:'POST',
            url:$rootScope.applicationServerpath + 'personadminroute/getpersontitleTodepartment',
            data:{departmentID:'58c3a5e9a63cf24c16a50b8c'}
        }).then(function(resp){
            var data=resp.data.success;
            $scope.personPower=data;
             //data.forEach(function(val,key){
             //    if(val.title) {
             //        val.title.forEach(function(aa){
             //            $scope.personPower.push(aa)
             //        })
             //    }
             //})

            $scope.personPower.unshift({_id:'all',name:'所有人'});
            console.log($scope.personPower)
        });
      $scope.selectedNew =true;

        $scope.namestr='大队长';
        $scope.stepdata = {
            date: new Date().formate("yyyy年M月d日h时m分s秒")
        }
        $scope.adda = {
            person: [],
            addcaseperson: function (person) {
                console.log(person);
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

                var num = $('#addargument>div').length+1;
                var quoteCon="quoteCon"+num;
                $('#addargument').append($compile(`<div class="wrapper-xs clear">
                                        <div class="w pull-left">
                                            <span>${num}</span>
                                            类型: <select class="w-sm" name="argument" id=${'myArgument'+num} ng-change=chooseargument(${'myArgument'+ num},${num}) ng-model=${'myArgument'+num}>
                                            <option>时间</option>
                                            <option>地点</option>
                                            <option>法规</option>
                                            <option>部门人员</option>
                                            <option>社会人员</option>
                                            <option>其它</option>
                                        </select>
                                        </div>
                                        <div class="w pull-left">
                                            名称：<input class="w-sm" type="test" name="${quoteCon}" ng-model="${quoteCon}"/>
                                            </div>
                                            <div class="pull-left">
                                                <button ng-click="quotecontent(${quoteCon})">插入</button>
                                            <button onclick="$(this).parent().parent().remove()">删除</button>
                                        </div>
                                        </div>`)($scope))
            }
        };
        console.log('准备获取步骤')
        $http({
            method: 'POST',
            url: $rootScope.applicationServerpath + 'abstractsteproute/getAllAbstractstep',
            data: {department: '崖州区城市管理局'}
        }).then(function (resp) {
            console.log('获取步骤')
            var data = resp.data
            console.log(data);
            $scope.stepAll = data;

        })
        $scope.getpagsCon=function(){  //获取页面填写内容 用于更新和新建
            var tijiao = {};
            var powerJSON = $('#newFrom').serializeArray();
            var typeJSON = $('#typeJSON').serializeArray();
             console.log(powerJSON)
            var argument = [];
            for (var a = 0; a < typeJSON.length; a++) {
                if (a < 2) {
                    var name = typeJSON[a].name;
                    if (!typeJSON[a].value) {
                        return false;
                    }
                    tijiao[name] = typeJSON[a].value
                } else {
                    // var getNum=function(text){
                    //     var value = text.search(/[^0-9]/ig)+1;  //查到数字
                    //     var b = text.search(/[\u4e00-\u9fa5]+/ig)+1;//查到汉字
                    //     if(b){
                    //         argument.push(typeJSON[a].value);
                    //         return;
                    //     }
                    //     if(value){
                    //         argument.push(typeJSON[a].name);
                    //     }
                    // }
                    console.log(typeJSON[a])
                    if(typeJSON[a].value) {
                      argument.push(typeJSON[a].value);
                    }
                  // console.log(argument)
                }
            }
            if(argument.length%2==0){
            for (var i = 0, arr1 = []; i < argument.length; i += 2) {
              if(argument[i]&&argument[i + 1]) {
                arr1.push({argutype: argument[i], name: argument[i + 1]})
              }else{
                console.log('参数不完整')
              }
            }
            }else{
              console.log('参数不完整')
            }
            tijiao.argument = arr1;
          $scope.um= UM.getEditor('myEditor')
            tijiao.wordTemplate =$scope.um.getContent();
            if(powerJSON&&powerJSON.length) {
              for (var i = 0, arr2 = {}; i < powerJSON.length; i++) {
                arr2[powerJSON[i].name] = powerJSON[i].value;
              }
              tijiao.power = arr2;
            }
            tijiao.status = 1;
            tijiao.author = $rootScope.curUser._id;
            return tijiao;
        }
        $scope.newpersonpower = function () {  //提交新建步骤
          console.log('提交新建步骤')
            var pagscon=$scope.getpagsCon()
          console.log(pagscon)
            if(!pagscon){return;}
            $http({
                method: 'POST',
                url: $rootScope.applicationServerpath + 'abstractsteproute/sendAAbstractstep',
                data: pagscon
            }).then(function (resp) {
                console.log(resp)
                $window.location.reload();
            })
        }
        $scope.updatepersonpower=function(id){ //更新步骤
          console.log('更新步骤')
            var pagscon=$scope.getpagsCon();
            console.log(pagscon)
            console.log(id)
            $http({
                method: 'POST',
                url: $rootScope.applicationServerpath + 'abstractsteproute/updatepersonpower',
                data: {id: id,pagscon:pagscon}
            }).then(function (resp) {
                var data = resp.data;
                $window.location.reload();
            })
        }
        $scope.removepersonpower=function(id){
            console.log(id)
            $http({
                method: 'POST',
                url: $rootScope.applicationServerpath + 'abstractsteproute/removepersonpower',
                data: {id: id}
            }).then(function (resp) {
                var data = resp.data;
                $window.location.reload();
            })
        }

        $scope.quotecontent=function(e){
          $scope.um= UM.getEditor('myEditor')
            var dfg = $scope.um.selection.getText();
          $scope.um.execCommand('insertHtml','<span contenteditable="false" style="color:red;">|*'+e+'*|</span>');
            console.log('<span contenteditable="false" style="color:red;">|*'+e+'*|</span>');
            //$http({
            //    method: 'POST',
            //    url: $rootScope.applicationServerpath + 'abstractsteproute/getoneeventstep',
            //    data: {id: id}
            //}).then(function (resp) {
            //    var data = resp.data;
            //})

        }
        $scope.chooseargument = function (e, id) {
          // console.log(e,id)
            var type = e;
            //console.log(type +'+++'+id)
            if (type=='其它') {
                console.log(e + id)
                if (id) {
                    $('#myArgument' + id).replaceWith('<input class="w-sm" type="text" name="name"/>')
                } else {
                    $('#myArgument').replaceWith('<input class="w-sm" type="text" name="name"/>')
                }
            }
        }
        $scope.newcaseroute = function () {
          console.log('tijia')
          $scope.selectedNew =true;
            $state.go('app.abstractstep.abstractstepNew',{id:''});
        }

        $scope.editStep = function (id) {
            console.log(id)
            $http({
                method: 'POST',
                url: $rootScope.applicationServerpath + 'abstractsteproute/getoneeventstep',
                data: {id: id}
            }).then(function (resp) {
                var data = resp.data;
              $rootScope.abstractstepN=data;
              console.log($rootScope.abstractstepN)
              console.log('跳转')
              $scope.selectedNew =false;
              $state.go('app.abstractstep.abstractstepNew',{id:data._id});

            })
        }
        $scope.ceshi = function (e) {
            console.log(e)
        }
        console.log($scope.selectedNew,$scope.selectedUpdate)
    })