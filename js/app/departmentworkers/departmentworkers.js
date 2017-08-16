/**
 * Created by tj on 2017/2/27.

 */
app.controller('departmentworkerCtrl', ['$scope', '$rootScope', '$http', '$filter', '$timeout', '$modal','localStorageService','departmentAndPersonsService', function ($scope, $rootScope, $http, $filter, $timeout, $modal,localStorageService,departmentAndPersonsService) {


  var apple_selected, tree, treedata_avm, treedata_geography;
  //当前选中的树节点,给个值是为了界面上的按钮显示判断
  $scope.item = {
    // data: '1'
  };
  $scope.my_data={};
  $timeout(function () {
    $scope.my_data=localStorageService.get('AllDepartment',30);
    console.log($scope.my_data)
  if(!$scope.my_data) {
    $http(
      {
        method: 'POST',
        url: $rootScope.applicationServerpath + 'personadminroute/getAllDepartment'
      }
    ).then(function (resp) {
      console.log('返回数据')
      $scope.my_data = resp.data.success;
      console.log($scope.my_data)
      localStorageService.update('AllDepartment', resp.data.success)
      $scope.my_data=localStorageService.get('AllDepartment',30);
      //读到全部树节点后，半秒后将其全部展开
      return $timeout(function () {

      }, 500);
    })
  }
  },500);

  $scope.editInfoModalInstance;
  //树的节点点击操作函数
  $scope.my_tree_handler = function (branch) {
    if ($scope.item.editing && !$scope.editInfoModalInstance) {
      $scope.editInfoModalInstance = $modal.open(
        {
          template: '        <div class="modal-header">  ' +
          '<h3>请注意!</h3>  ' +
          '</div>' +
          '<div class="modal-body">' +
          '<ul>' +
          "编辑状态中无法查看其它部门或人员信息" +
          // '<li ng-repeat="item in items"><a        ng-click="selected.item = item">{{ item }}</a></li>'+
          '</ul>' +
          // 'Selected: <b>{{ selected.item }}</b>'+
          '</div>' +
          '<div class="modal-footer">' +
          '<button class="btn btn-primary" ng-click="ok()">知道了</button>' +
          // '<button class="btn btn-warning" ng-click="cancel()">取消</button>'+
          '</div>  ',
          controller: function ($scope, $modalInstance) {
            $scope.ok = function () {
              $modalInstance.close(true);
            };
            $scope.cancel = function () {
              $modalInstance.dismiss(false);
            };
          }

        }
      );
      $scope.editInfoModalInstance = '';
      return;
    }
    // 要异步加载节点了
    if ($rootScope.lazyloadDepartmentAndWorkers) {

    }
  };


  /*
   因为现在原生的树控件不能直接表达部门人员的节点信息,修改有有点没必要,否则每种树状结构我们都得定义一套了
   所以弄一个翻译函数,负责把部门人员树转换为原生树的默认格式,即label+data集合
   */
  $scope.translateToOrgintree = function (treeJson) {
    var treenode = {};
    // console.info(treeJson);

    //department node
    if (treeJson && treeJson.info) {
      treenode.label = treeJson.name;
      // console.info(treeJson.name);
      treenode.data = {
        _id: treeJson._id,
        info: treeJson.info,
        leader: treeJson.leader,
        deputyleader: treeJson.deputyleader,
        create_date: treeJson.create_date
      };
      treenode.children = new Array();
      if (treeJson.persons) {
        // console.info(treeJson.persons);
        for (var index = 0; index < treeJson.persons.length; index++) {
          var temp = treeJson.persons[index];
          var personNode = {};
          personNode.label = temp.name;
          personNode.data = {
            _id: temp._id,
            sex: temp.sex,
            nation: temp.nation,
            birthday: temp.birthday,
            residence: temp.residence,
            idNum: temp.idNum,
            mobileUUid: temp.mobileUUid,
            title: temp.title,
            mobile: temp.mobile,
            age: temp.age,
            create_date: temp.create_date,
            images: {
              coverSmall: temp.images.coverSmall,
              coverBig: temp.images.coverBig
            }
          }
          treenode.children.push(personNode);
        }
        if (treeJson.Departments) {
          for (var index = 0; index < treeJson.Departments.length; index++) {
            treenode.children.push($scope.translateToOrgintree(treeJson.Departments[index]));
          }
        }
      }

    }
    return treenode;
  }
  //after test if we not give a value here,the http return can not affect the tree
  treedata_avm = [{
    label: "正在读取。。。"
  }];
  $scope.my_data = treedata_avm;
  $scope.try_changing_the_tree_data = function () {
    if ($scope.my_data === treedata_avm) {
      return $scope.my_data = treedata_avm[0].children;
    } else {
      return $scope.my_data = treedata_avm;
    }
  };
  $scope.my_tree = tree = {};
  $scope.try_async_load = function () {
    $scope.my_data = [];
    $scope.doing_async = true;
    return $timeout(function () {
      if (Math.random() < 0.5) {
        $scope.my_data = treedata_avm;
      } else {
        $scope.my_data = treedata_geography;
      }
      $scope.doing_async = false;
      return tree.expand_all();
    }, 1000);
  };

  //添加单位
  $scope.try_adding_a_branch = function () {
    /*// 第一步，先找到对应的单位节点
    var b;
    // b = tree.get_selected_branch();
    if (!b.data.info) {
      while (1) {
        tree.select_prev_branch();
        b = tree.get_selected_branch();
        if (b.data.info) {
          break;
        }
      }
    }
    // 第二步，复制这个节点作为它的子节点
    var newB = tree.add_branch(b, {
      label: b.label + '下设机构',
      data: b.data
    });
    tree.select_branch(newB);
    //第三步，进入编辑状态
    $scope.item = newB;
    $scope.item.editing = true;
    // tree.select_next_branch();
    return;*/
    var mydata=$scope.my_data;
    var modalInstance = $modal.open({
        template: '        <div class="modal-header">  ' +
        '<h3>新建部门</h3>  ' +
        '<div class="modal-body">' +
        '<div class="clear wrapper-xs">' +
        '<div class="pull-left w-sm">部门名称：</div>' +
        '<input type="text" ng-model="depart.name" class="pull-left w form-control">' +
        '</div>'+
        '<div class="clear wrapper-xs">' +
        '<div class="pull-left w-sm">描述信息：</div>' +
        '<input type="text" ng-model="depart.info" class="pull-left w form-control">' +
        '</div>'+
        '<div class="clear wrapper-xs">' +
        '<div class="pull-left w-sm">部门网址：</div>' +
        '<input type="text" ng-model="depart.infoLink" class="pull-left w form-control">' +
        '</div>'+
        '<div class="clear wrapper-xs">' +
        '<div class="pull-left w-sm">上级部门：</div>' +
        '<input type="text" ng-model="depart.parentID" class="pull-left w form-control">' +
        '<select>' +
        '<option ng-repeat="delast in mydata">{{delast.name}}</option>' +
        '</select>' +
        '</div>'+
        // 'Selected: <b>{{ selected.item }}</b>'+
        '</div>' +
        '<div class="modal-footer">' +
        '<button class="btn btn-primary" ng-click="newdepartment(depart)">新建</button>' +
        '<button class="btn btn-warning" ng-click="cancel()">取消</button>' +
        '</div>  ',
        controller: function ($scope, $modalInstance) {
          $scope.ok = function () {
            $modalInstance.close(true);
          };
          $scope.cancel = function () {
            $modalInstance.dismiss(false);
          };
          $scope.depart={};
          $scope.newdepartment=function(e){
            console.log('新建部门')
            console.log(e)
            $http({
              method:"POST",
              url: $rootScope.applicationServerpath + 'personadminroute/sendnewdepartment',
              data:e
            }).then(function (resp) {
              if(resp.data){
                console.log(resp.data);
                $modalInstance.dismiss(false);
              }
            })
          };
          $scope.mydata=mydata;
        }
      });
    console.log(mydata)
  };
  //整个部门所有职务的等级和上级关联的部门全部修改
  $scope.savedepartmenttitle=function () {
    var deptitle=$('#departmenttitlesort li');
    for(var i=0,titarr=[];i<deptitle.length;i++){
      //console.log($(deptitle[i]).find('i').html())
      titarr.push({grade:i+1,_id:deptitle[i].title,name:$(deptitle[i]).find('i').html(),parentTitle:deptitle[i-1]?deptitle[i-1].title:null})
    }
    console.log(titarr)
    $http(
      {
        method: 'POST',
        url: $rootScope.applicationServerpath + 'personadminroute/settitlesort',
        data:titarr
      }
    ).then(function (resp) {
      console.log(resp);
      alert('保存职务成功')
    })
  }
  //部门新建一个职务
  $scope.newdeparmenttitle=function (newtitle,depart) {
    console.log(newtitle,depart)
    $scope.newdeptitleval='';
    $http(
      {
        method: 'POST',
        url: $rootScope.applicationServerpath + 'personadminroute/sendtitle',
        data: {
          name:newtitle,
          departmentID:depart
        }
      }
    ).then(function (resp) {
      console.log(resp.data.success)
      if(resp.data.success){
      $scope.item.data.depinfo.push(resp.data.success)
      }
    })
  }
  // 用来初始化部门数据库的测试按钮
  $scope.initialDatabase = function () {
    $http(
      {
        method: 'POST',
        url: $rootScope.applicationServerpath + 'department/departmentInitialize',
        data: {
          "userid": $rootScope.curUser._id,
          "pwd": $scope.tempUserpwd
        }
      }
    ).then(function (resp) {
      // alert("部门数据库初始化成功！");
      console.log(resp);
      if (resp.status == 200) {
        //说明服务器端查询用户成功
        $rootScope.curUser = resp.data;
        console.log(resp.data);
        //初始化人员保存提交到服务器
        $http.post($rootScope.applicationServerpath + 'person/initializePersons',
          [])
          .then(function (resp) {
            // alert("用户初始化成功！");
            if (resp == 200) {
              //说明服务器端新定位点保存成功
              $modalInstance.dimiss("initializePersons");
            }
            ;
          });
        $modalInstance.close(true);
      }
      ;
    });
  };
  $scope.initialdepartmentTree = function () {
    console.info('当前用户id：' + $rootScope.curUser._id);
    $http(
      {
        method: 'POST',
        url: $rootScope.applicationServerpath + 'department/getAllInvolvedDepartmentsByUserid',
        data: {
          "_id": $rootScope.curUser._id,
          "pwd": $scope.tempUserpwd
        }
      }
    ).then(function (resp) {
      for (var obj in resp.data.err) {
        console.info('当前用户所有部门：' + obj + '<>' + resp.data.err);
      }
    });
  }
  // 如果没有用户，而且也没弹出登录框
  if (!$rootScope.curUser && !$rootScope.confirmUserModalInstance)
  // 弹出登陆框
  {
    $rootScope.confirmUser($scope.initialdepartmentTree);
  } else {
    //初始化部门树
    $scope.initialdepartmentTree();
  }


  // 删除一个单位，实际在后台就是标记这个单位的状态为不可用
  $scope.try_delete_a_branch = function () {
    var b;
    var modalInstance = $modal.open(
      {
        template: '        <div class="modal-header">  ' +
        '<h3>请注意!</h3>  ' +
        '</div>' +
        '<div class="modal-body">' +
        '<ul>' +
        "单位删除后无法恢复，请确定要删除？" +
        // '<li ng-repeat="item in items"><a        ng-click="selected.item = item">{{ item }}</a></li>'+
        '</ul>' +
        // 'Selected: <b>{{ selected.item }}</b>'+
        '</div>' +
        '<div class="modal-footer">' +
        '<button class="btn btn-primary" ng-click="ok()">删除</button>' +
        '<button class="btn btn-warning" ng-click="cancel()">取消</button>' +
        '</div>  ',
        controller: function ($scope, $modalInstance) {
          $scope.ok = function () {
            $modalInstance.close(true);
          };
          $scope.cancel = function () {
            $modalInstance.dismiss(false);
          };
        }

      }
    );

    modalInstance.result.then(function (result) {
      console.log(result);
    }, function (reason) {
      console.log(reason);// 点击空白区域，总会输出backdrop
    });
  };
  $scope.getpersoninfo=function(e) {
    console.log(e)
    if(!e){console.log('没有数据');return;}
    // for(var i=0,perarr=[];i<e.length;i++){
    //   perarr.push(e[i].person)
    // }
    // console.log(perarr);
    // return [1,2,3,4,5];

    $http({
      method: "POST",
      url: $rootScope.applicationServerpath + 'personadminroute/getUserInfoById',
      data:{personID:e}
    }).then(function (resp) {
      console.log(resp.data)
      return resp.data.success;
    })

  }

  // $http.get('js/app/departmentworkers/departmentworkers.json').then(function (resp) {
  //     //  $http.get('js/app/contact/contacts.json').then(function (resp) {
  //     // $scope.items = resp.data.items;
  //     // $scope.item = $filter('orderBy')($scope.items, 'first')[0];
  //     // $scope.item.selected = true;
  //     // alert(resp.data);
  //     //对于单根节点，这是必须要加new array的
  //   console.log(resp.data);
  //     treedata_avm= new Array($scope.translateToOrgintree(resp.data));
  //     console.log(treedata_avm);
  //     $scope.my_data=treedata_avm;
  //     //读到全部树节点后，半秒后将其全部展开
  //     return $timeout(function() {
  //         // $scope.my_tree.expand_all();
  //        // return $scope.my_tree.select_first_branch();
  //     }, 500);
  // });
  $scope.filter = '';
  $scope.groups = [
    {name: 'Coworkers'},
    {name: 'Family'},
    {name: 'Friends'},
    {name: 'Partners'},
    {name: 'Group'}
  ];

  $scope.createGroup = function () {
    var group = {name: 'New Group'};
    group.name = $scope.checkItem(group, $scope.groups, 'name');
    $scope.groups.push(group);
  };

  $scope.checkItem = function (obj, arr, key) {
    var i = 0;
    angular.forEach(arr, function (item) {
      if (item[key].indexOf(obj[key]) == 0) {
        var j = item[key].replace(obj[key], '').trim();
        if (j) {
          i = Math.max(i, parseInt(j) + 1);
        } else {
          i = 1;
        }
      }
    });
    return obj[key] + (i ? ' ' + i : '');
  };

  $scope.deleteGroup = function (item) {
    $scope.groups.splice($scope.groups.indexOf(item), 1);
  };

  $scope.selectGroup = function (item) {
    angular.forEach($scope.groups, function (item) {
      item.selected = false;
    });
    $scope.group = item;
    $scope.group.selected = true;
    $scope.filter = item.name;
  };

  $scope.selectItem = function (item) {
    angular.forEach($scope.items, function (item) {
      item.selected = false;
      item.editing = false;
    });
    $scope.item = item;
    $scope.item.selected = true;
  };

  $scope.deleteItem = function (item) {
    $scope.items.splice($scope.items.indexOf(item), 1);
    $scope.item = $filter('orderBy')($scope.items, 'first')[0];
    if ($scope.item) $scope.item.selected = true;
  };

  $scope.createItem = function () {
    var item = {
      group: 'Friends',
      avatar: 'img/a0.jpg'
    };
    $scope.items.push(item);
    $scope.selectItem(item);
    $scope.item.editing = true;
  };

  $scope.editItem = function (item) {
    console.log(item)
    if (item.data) {
      $scope.item.editing = true;
    }
  };

  $scope.doneEditing = function (item) {
    console.log(item)
    $scope.item.editing = false;
    var data=item.data;
    var updatainfo={};
    updatainfo.name=data.name;
    updatainfo.sex=data.sex;
    updatainfo.mobile=data.mobile;
    updatainfo.nation=data.nation;
    updatainfo.residence=data.residence;
    updatainfo._id=data._id;
    updatainfo.birthday=data.birthday;
    updatainfo.title=data.title._id;
    // console.log(updatainfo)
    $http({
      method: "POST",
      url: $rootScope.applicationServerpath + 'personadminroute/updatepersoninfo',
      data: updatainfo
    }).then(function (resp) {
      console.log(resp.data.success)
      var personinfo = resp.data.success;
      localStorageService.clear('PersonInfo_'+data._id)
    })
  };

  $scope.newSubItem = function (e) {
    var target=e;
    console.log(target)
    //获取到部门内所有的职务
    departmentAndPersonsService.getpersontitleTodepartment(target.depart?target.depart._id:target.node._id,$rootScope.applicationServerpath,function (resp) {
      console.log(resp)
      $scope.depinfo = resp;


    if(e.depart) {            //部门信息
      if(!target.depart.info){target.depart.info='默认'}
        target.depart.depinfo=$scope.depinfo;
        $scope.item.data = target.depart;



    }else if(e.person) {       //人员信息
      $scope.item.data = target.person;
      var storge=localStorageService.get('PersonInfo_'+e.person._id,300)
      if(storge) {
        departmentAndPersonsService.getpersontitle(storge.title,$rootScope.applicationServerpath,function(title){
          storge.title=title;
          $scope.item.data = storge;
        })
      }else {
        $http({
          method: "POST",
          url: $rootScope.applicationServerpath + 'personadminroute/getUserInfoById',
          data: {personID: e.person._id}
        }).then(function (resp) {
          var personinfo = resp.data.success;
          localStorageService.update('PersonInfo_'+personinfo._id,personinfo)
          $scope.item.name = personinfo.name;
          departmentAndPersonsService.getpersontitle(personinfo.title,$rootScope.applicationServerpath,function(title){
            personinfo.title = title.name;
            $scope.item.data = personinfo;
          })
        })
      }
    }

    })

  }
  //删除一个职务
  $scope.deletetitle=function (title) {
    console.log(title)
    var modalInstance = $modal.open(
      {
        template: '<div class="modal-header">  ' +
        '<h4 class="no-margin">请注意!</h4>  ' +
        '</div>' +
        '<div class="modal-body">' +
        '<span>' +
        "单位职务删除后无法恢复，请确定要删除？" +
        '</span>' +
        '</div>' +
        '<div class="modal-footer">' +
        '<button class="btn btn-primary" ng-click="titleok()">删除</button>' +
        '<button class="btn btn-warning" ng-click="titlecancel()">取消</button>' +
        '</div> ',
        controller: function ($scope, $modalInstance) {
          $scope.titleok = function () {
            departmentAndPersonsService.deletedepartmenttitle(title._id,$rootScope.applicationServerpath,function(e){
              console.log(e)
              // departmentAndPersonsService.getpersontitleTodepartment(title.departmentID,$rootScope.applicationServerpath,function (title) {
              //   var obj={};
              //   console.log(e+JSON.stringify(title))
              // })
            })
            $modalInstance.close(true);
          };
          $scope.titlecancel = function () {
            $modalInstance.dismiss(false);
          };
        }

      }
    );
  }

}]);