/**
 * Created by Administrator on 2017/6/8.
 */
app.controller('abstracttypeCtrl', function ($scope, $compile, $window, $rootScope, localStorageService, $http, $state, userService, dateService, messageService, $stateParams
                                             //, $ionicBackdrop,$ionicPopup,$ionicModal,departmentAndPersonsService
) {
    $scope.abstracttype = {};
    $scope.loadCase=function() {   //加载 事件
        $http({
            method: 'POST',
            url: $rootScope.applicationServerpath + 'mobilegrid/getAllAbstracttypetodep',
          data:{departmentID:'123'}
        }).then(function (yresp) {
            console.log(yresp.data)
          if(yresp.data.error){
              console.log(yresp.data.error);
              return;
          }
            var ydata = yresp.data.success;

            $scope.abstracttype = ydata;
            $rootScope.abstracttype = ydata;
            var typelength=$scope.abstracttype.length;
            var count=0;
            var jiazai=function(){
                // console.log('kaishi')
                $http({
                    method: 'POST',
                    url: $rootScope.applicationServerpath + 'abstractsteproute/getstepsName',
                    data:{id:$scope.abstracttype[count].steps}
                }).then(function (steo) {
                  var setpname=steo.data;
                    // console.log(count)
                  // console.log(setpname)
                  for(var a=0;a<setpname.length;a++){
                    // console.log(setpname[a])
                    // console.log(ydata[count].steps)
                    for(b=0;b<ydata[count].steps.length;b++){
                        // console.log(ydata[count].steps[b].step,setpname[a]._id)
                        if(ydata[count].steps[b].step==setpname[a]._id){//判断流程顺序
                          setpname[a].no=ydata[count].steps[b].no;
                          //console.log(setpname[a].no)
                        }
                    }
                    // setpname.no=ydata.step
                  }
                  $scope.abstracttype[count].step=setpname;
                  // console.log(setpname)
                    count++;
                    if(count<typelength){
                        jiazai();
                    }else{
                      // console.log($rootScope.abstracttype)
                        return;
                    }
                })
            }
            if($scope.abstracttype.length) {
                jiazai();
            }

        })
    }
    var getSTEPS=function(stepID){
    }
    $scope.getstepName=function(step){
        var stepID=step;
        console.log(stepID)
        getSTEPS(stepID);
        return ['1','2','3'];
    }
    $scope.loadCase();

    $scope.abstracttypeEdit = function (dom) {
        $http({
            method: 'POST',
            url: $rootScope.applicationServerpath + 'abstractsteproute/getAllAbstractstep',
            data:{department:'崖州区城市管理局'}
        }).then(function (resp) {
            console.log('获取步骤')
            var data=resp.data;
            console.log(data);
            var stepAll='';
            for(var a=0;a<data.length;a++){
                stepAll+='<option value="'+data[a]._id+'">'+data[a].type+'</option>'
            }
            var thisDom = dom.target;
            var parent = $(thisDom).parent().parent();
            var abstracttypeName = parent.find('.abstracttypeName').html();
            var abstracttypeStep = parent.find('.abstracttypeStep');
            for(var b=0;b<$scope.abstracttype.length;b++){
                if($scope.abstracttype[b].typeName==abstracttypeName){
                    $scope.currentEdit=$scope.abstracttype[b];
                    console.log($scope.currentEdit)
                }
            }
          var by = function(name){//排序函数
            return function(o, p){
              var a, b;
              if (typeof o === "object" && typeof p === "object" && o && p) {
                a = o[name];
                b = p[name];
                if (a === b) {
                  return 0;
                }
                if (typeof a === typeof b) {
                  return a < b ? -1 : 1;
                }
                return typeof a < typeof b ? -1 : 1;
              }
              else {
                throw ("error");
              }
            }
          }
          $scope.currentEdit.step.sort(by('no'));//排序
            for(var c=0,currentStep='';c<$scope.currentEdit.steps.length;c++){
              // console.log($scope.currentEdit.steps[c])
                            //有两个参数 step 和 steos step是添加后的数据对应的
                currentStep+='<option value='+$scope.currentEdit.step[c]._id+'>'+$scope.currentEdit.step[c].type+'</option>';
            }
            parent.find('.abstracttypeName').html(`<input type="text" value="${abstracttypeName}" title="${abstracttypeName}" id="abstracttypeName"/>`)
            abstracttypeStep.html(`<div class="pull-left">
                                        <h5>所有步骤</h5>
                                        <select name="sel_place1" size="8" id="sel_place1" class="w-sm">
                                    ${stepAll}
                                </select>
                                    </div>
                                    <div class="pull-left" style="margin:40px 10px 0">
                                        <div class="m-xs">
                                        <input name="sure1" type="button" id="sure1"
                                               onClick="allsel($('#sel_place2')[0],$('#sel_place1')[0]);"
                                               value="移除"/>
                                        </div>
                                        <table></table>
                                        <div class="m-xs">
                                            <input name="sure2" type="button" id="sure2"
                                                   onClick="allsel($('#sel_place1')[0],$('#sel_place2')[0]);"
                                                   value="添加" align="center"
                                                   height="2">
                                        </div>
                                    </div>
                                    <div class="pull-left">
                                        <h5>当前步骤</h5>
                                        <select name="sel_place2" id="sel_place2" size="8" onChange="selectMoveUp(this)" class="w-sm">${currentStep}</select>
                                    </div>`)
            $(thisDom).replaceWith($compile(`<button ng-click="abstracttypeDone('${abstracttypeName}')">完成</button>`)($scope));
        })
    }
    $scope.movesel = function (e) {
        console.log(e)
    }

    $scope.steplistEdit = {
        allsel: function (n1, n2) {
            console.log(n1)
            console.log(n2)
            while (n1.selectedIndex != -1) {
                var indx = n1.selectedIndex;
                var t = n1.options[indx].text;
                n2.options.add(new Option(t));
                n1.remove(indx);
            }
        }
    }
    $scope.abstracttypeDone = function (doc) { //更新编辑
        console.log('刷新')
        var beforeName=doc;//之前的事件名称
        var department=$('.casedepertment_list .active a').html();
        var val=$('#abstracttypeName').val();//修改的事件名称
        var option=$('#sel_place2 option');//选中添加的列表
        for(var i=0,steps=[],I=1;i<option.length;i++){
            steps.push({no:I+i,step:option[i].value})//{stepName:String,stepID:String}
        }
        console.log(data={
            beforeName:beforeName,
                typeName:val,
                step:steps,
                newer:new Date()
        })
        // $http({
        //     method:'POST',
        //     url:$rootScope.applicationServerpath + 'abstracttyperoute/updateAbstracttype',
        //     data:{
        //         beforeName:beforeName,
        //         typeName:val,
        //         step:steps,
        //         newer:new Date()
        //     }
        // }).then(function(resp){
        //     console.log(resp.data);
        //     $scope.loadCase();
        //     //$window.location.reload();
        // })
    }
    $scope.newabstracttype=function(){
        $('#newabstracttype').show();
    }
    $scope.newcase = function (type) {
        console.log(type)
        if(!type){return;}
        $http({
            method: 'POST',
            url: $rootScope.applicationServerpath + 'abstracttyperoute/sendAAbstracttype',
            data: {
                typeName: type,
                createparent:$rootScope.curUser._id
            }
        }).then(function (resp) {
            if (resp.data) {
                $scope.loadCase();
                console.log(resp.data)
            }
            $('#newabstracttype').hide();
        })
    }
    $scope.removecase = function (id) {
        $http({
            method: 'POST',
            url: $rootScope.applicationServerpath + 'abstracttyperoute/abstracttypeDelete',
            data: {
                id: id
            }
        }).then(function (resp) {
            if (resp.data) {
                console.log(resp.data)
            }
        })
    }

})