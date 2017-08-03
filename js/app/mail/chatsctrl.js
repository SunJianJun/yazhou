app.controller('ChatsCtrl', function ($scope, $rootScope, $compile, localStorageService, $http, $state, userService, dateService, $stateParams, Upload, $timeout, ChatService, departmentAndPersonsService, localToolService
                                      //, $ionicBackdrop,$ionicPopup,$ionicModal,departmentAndPersonsService
) {

  console.log('----NO1---');
  //所有的单位
  $scope.alldepartments = {};
  $scope.alldepartmentsAndPersonMessages = localStorageService.get('alldepartmentsAndPersonMessages', 30);
  //测试一下加载人员后的单位树

  //最近消息的发送人
  $scope.unreadPersons = {};
  // $scope.unreadPersons=localStorageService.get("recentChatPersons");
  localStorageService.clear('recentChatPersons');
  // $scope.unreadPersons = (localStorageService.get('recentChatPersons') && localStorageService.get('recentChatPersons').length)?localStorageService.get('recentChatPersons'):[];


  //测试一下加载人员后的单位树
  //console.log('测试一下从缓存读出的人员消息后');
  var str = JSON.stringify($scope.alldepartmentsAndPersonMessages);
  //console.log(str);
  //抓获动态页面
  // http://www.cnblogs.com/xinzhyu/p/4214669.html
  /**
   * 引擎初始化,读取和应用一些设置
   */
  if (!$rootScope.messageEngine) $rootScope.messageEngine = {};
  if (!$rootScope.messageRefreshTime) $rootScope.messageRefreshTime = 10000;
  $rootScope.messageEngine.engineInitialise = function (params) {
    if (!$scope.alldepartmentsAndPersonMessages || !$scope.alldepartmentsAndPersonMessages.length)
    // 刷新部门和人员
    {
      var isNeedRefreshPersons = true;
      $scope.refreshDepartments($rootScope.curUser, isNeedRefreshPersons);
    }
  }


  /***
   * 引擎运行
   */
  $rootScope.messageEngine.engineRun = function (params) {
    //引擎设置好就开始运行
    // alert( '中文试试');
    // alert( $rootScope.messageEngine.engineRun);
    // alert( '中文试试2');
    $rootScope.messageEngine.engineInitialise();

    // $scope.checkDepartmentAndPersonJsonObj();
    //在地图页面启动周期性函数
    $rootScope.messageEngineTimer = window.setInterval(
      function () {
        // alert('ok');
        // 只有有用户的时候，才开始地图循环
        if ($rootScope.curUser && $rootScope.curUser._id)
        //开始定位刷新地图
        {
          $scope.refreshAllMessageList();
          $scope.refreshUnreadMessagePersons();
          // $scope.testclick();

          // $scope.unreadPersons.push({"_id":"58cb2031e68197ec0c7b935b","name":"周鹏宇","sex":"男","nation":"汉","birthday":"1997-03-26","residence":"山东省淄博市博山区山头街道兴源村282号","idNum":"370304199703261618","mobile":8615510590829,"mobileUUid":"6f24df8da22b4c35","__v":2149,"status":9,"create_date":"2017-03-16T23:30:57.203Z","images":{"coverSmall":"http://localhost:2000/person/personPic?pid=58cb2031e68197ec0c7b935b"}});
        }
      }
      , $rootScope.messageRefreshTime);

  }

  $rootScope.messageEngine.enginePause = function (params) {

  }

  $rootScope.messageEngine.engineResum = function (params) {

  }

  $rootScope.messageEngine.engineStop = function (params) {
    if ($rootScope.messageEngineTimer)
      window.clearInterval($rootScope.messageEngineTimer);
    $rootScope.messageEngineTimer = null;
  }


  //每次循环必须执行的函数，刷新人员列表中的所有人员
  $scope.refreshAllMessageList = function () {

    if (!($scope.alldepartmentsAndPersonMessages && $scope.alldepartmentsAndPersonMessages.length > 0))return;
    console.log(str);
    //组装单位
    for (var indd = 0; indd < $scope.alldepartmentsAndPersonMessages.length; indd++) {
      if ($scope.alldepartmentsAndPersonMessages[indd].isDeleted)continue;//如果已经被标识为被删除，即最近一次刷新部门时，不在服务器部门列表里
      if (!($scope.alldepartmentsAndPersonMessages[indd].persons && $scope.alldepartmentsAndPersonMessages[indd].persons.length > 0))continue;//这个单位下属没有人员，不用装配
      for (var inddt = 0; inddt < $scope.alldepartmentsAndPersonMessages[indd].persons.length; inddt++) {
        var sender = $scope.alldepartmentsAndPersonMessages[indd].persons[inddt].person;
        $scope.refreshMessageListByPersonID(sender._id);//无脑怒刷
      }
    }
  }


  //刷新就是刷新，装配交给装配，这是刷新部门
  $scope.refreshDepartments = function (curUser, isNeedRefreshPersons) {
    localStorageService.clear("allInvolvedDepartments");
    // $scope.alldepartmentsAndPersonMessages=cacheDpts;
    var cacheDpts;
    if (!cacheDpts) {
      var dpromise = departmentAndPersonsService.refreshInvolvedDepartmentsListSyn(curUser, $rootScope.applicationServerpath, isNeedRefreshPersons);
      dpromise.then(function (data) {  // 调用承诺API获取数据 .resolve
        $scope.alldepartmentsAndPersonMessages = data;
        if (isNeedRefreshPersons) {
          //组装单位人员
          for (var indd = 0; indd < $scope.alldepartmentsAndPersonMessages.length; indd++) {
            var did = $scope.alldepartmentsAndPersonMessages[indd]._id;
            localStorageService.clear("allPersonsUkSeeInDepartment" + did);

            // if(!$scope.alldepartmentsAndPersonMessages[indd].persons)
            // {
            $scope.refreshDepartmentPersons($scope.alldepartmentsAndPersonMessages[indd]);
            // continue;
            // }
          }
        }
      }, function (data) {  // 处理错误 .reject
        // $scope.user = {error: '用户不存在！'};
      });
    }
  };


  //装配部门下属人员的消息列表
  $scope.assemblePersonMessagelistInDepartments = function (senderID, mlistData) {
    //注意，消息列表里有什么呢？
    // sender.messageabstract=data.abstract; 文字摘要
    // sender.messagecount=data.count; 未读消息总数
    // sender.messagelastTime=data.lastTime; 最近一条消息的时间startTime
    var cachePersonMessageList = mlistData ? mlistData : localStorageService.get("messagesAbstractBySenderID" + senderID, 60 * 24);
    if (!(cachePersonMessageList && cachePersonMessageList.abstract))return;//没有装配的必要
    //console.log("装配部门下属人员的消息列表 assemblePersonMessagelistInDepartments started：" + cachePersonMessageList+"<1>");
    // 下面就是装配下属人员的消息列表到本页面需要的数据列表中
    if (!($scope.alldepartmentsAndPersonMessages && $scope.alldepartmentsAndPersonMessages.length > 0))return;//没有单位，不用装配
    //console.log("装配部门下属人员的消息列表 assemblePersonMessagelistInDepartments started：" + cachePersonMessageList+"<2>");
    //遍历单位
    for (var indd = 0; indd < $scope.alldepartmentsAndPersonMessages.length; indd++) {
      if ($scope.alldepartmentsAndPersonMessages[indd].isDeleted) {
        //console.log(" 如果已经被标识为被删除，即最近一次刷新部门时，不在服务器部门列表里 ");
        continue;//如果已经被标识为被删除，即最近一次刷新部门时，不在服务器部门列表里
      }
      if (!($scope.alldepartmentsAndPersonMessages[indd].persons && $scope.alldepartmentsAndPersonMessages[indd].persons.length > 0)) {
        //console.log(" 这个单位下属没有人员，不用装配 ");
        continue;//这个单位下属没有人员，不用装配
      }
      for (var inddt = 0; inddt < $scope.alldepartmentsAndPersonMessages[indd].persons.length; inddt++) {
        var sender = $scope.alldepartmentsAndPersonMessages[indd].persons[inddt].person;
        // var personwithmessagelists=localStorageService.get("$messagesAbstractBySenderID"+sender._id,1);
        if (sender._id == senderID)
        //   // 如果消息列表不为空，就更新此人，否则还是原来这个人
        {
          // console.log("比较是否要更新这个人的消息列表：" + sender._id+"<>"+sender.name+JSON.stringify(sender)+"<>"+cachePersonMessageList.count+"<>"+cachePersonMessageList.abstract);
          // var temp=localStorageService.get("$messagesAbstractBySenderID"+sender._id);
          //console.log("消息列表 这个人" + cachePersonMessageList.abstract+"<>"+cachePersonMessageList.count+"<>"+cachePersonMessageList.lastTime);
          $scope.alldepartmentsAndPersonMessages[indd].persons[inddt].person.messageabstract = cachePersonMessageList.abstract;
          $scope.alldepartmentsAndPersonMessages[indd].persons[inddt].person.messagecount = cachePersonMessageList.count;
          $scope.alldepartmentsAndPersonMessages[indd].persons[inddt].person.messagelastTime = cachePersonMessageList.lastTime;
          $scope.alldepartmentsAndPersonMessages[indd].persons[inddt].person.messagestartTime = cachePersonMessageList.startTime;
        }
        if (!$scope.alldepartmentsAndPersonMessages[indd].persons[inddt].person.images) $scope.alldepartmentsAndPersonMessages[indd].persons[inddt].person.images = {};
        // if(!$scope.alldepartmentsAndPersonMessages[indd].persons[inddt].person.images.coverSmall) $scope.alldepartmentsAndPersonMessages[indd].persons[inddt].person.images.coverSmall=$rootScope.getUserPicById(sender._id);

      }
    }
    //console.log("装配部门下属人员的消息列表 assemblePersonMessagelistInDepartments curSender：" + senderID+"<3>");
  }

  // 刷新指定人员的消息列表
  $scope.refreshMessageListByPersonID = function (senderID) {
    if (senderID) {
      // console.log("刷新指定人员的消息列表：" + senderID+"<>");
      var promise = ChatService.refreshMessageListByPersonIdsSyn(senderID, $rootScope.curUser._id, $rootScope.applicationServerpath);
      promise.then(function (data) {  // 调用承诺API获取数据 .resolve
        $scope.assemblePersonMessagelistInDepartments(senderID, data);
      }, function (data) {  // 处理错误 .reject
        // $scope.user = {error: '用户不存在！'};
      });
    }
  };


  // 等到系统用户刷新成功后，开始运行引擎
  $scope.$on('rootUserReady', function (event, data) {

    //console.log('engineRun curUser：', data._id);		 //子级能得到值
    $rootScope.messageEngine.engineStop();
    $rootScope.messageEngine.engineRun();
  });


  //启动本页面的循环
  if (!($rootScope.curUser && $rootScope.curUser._id)) {
    $rootScope.refreshCurUser();
  }
  else {
    $rootScope.messageEngine.engineStop();
    $rootScope.messageEngine.engineRun();
  }
  $scope.testclicktrue=true;
  $scope.testclick = function (pObj) {
    $scope.unreadPersons = localStorageService.get("recentChatPersons");
    console.log($scope.unreadPersons)

    if($scope.testclicktrue) {
      console.log('再次插入')
      messtr = '<li ng-repeat="fold in unreadPersons" ui-sref-active="active">' +
        '<a class="media friend" ng-click="mailList(fold._id,fold.name)">' +
        '<div class="media-left">' +
        '<img ng-src=' +
        '{{fold.images.coverSmall}}' +
        ' />' +
        '</div>' +
        '<div class="media-body">' +
        '<h4>' +
        '{{fold.name}}' +
        '</h4>' +
        '<p >' +
        '{{fold.content}}' +
        '</p>' +
        '</div>' +
        '<div class="media-right">' +
        '<p>' +
        ''+
          '<span class="badge badge-sm bg-danger pull-right-xs">{{fold.nodu}}</span>'+
        //$scope.messageDate($scope.unreadPersons[mes].lastMessage.originalTime)+
        '</p>' +
        '</div>' +
        '</a>' +
        '</li>'
    // }
    $('#unreadPersons').html($compile(messtr)($scope))
      $scope.testclicktrue=false;
  }
    // $scope.unreadPersons.push({"_id":"58cb2031e68197ec0c7b935b","name":"周鹏宇","sex":"男","nation":"汉","birthday":"1997-03-26","residence":"山东省淄博市博山区山头街道兴源村282号","idNum":"370304199703261618","mobile":8615510590829,"mobileUUid":"6f24df8da22b4c35","__v":2149,"status":9,"create_date":"2017-03-16T23:30:57.203Z","images":{"coverSmall":"http://localhost:2000/person/personPic?pid=58cb2031e68197ec0c7b935b"}});
    // $scope.unreadPersons.push({"_id":"58cb2031e68197ec0c7b935b","name":"周鹏宇","sex":"男","nation":"汉","birthday":"1997-03-26","residence":"山东省淄博市博山区山头街道兴源村282号","idNum":"370304199703261618","mobile":8615510590829,"mobileUUid":"6f24df8da22b4c35","__v":2149,"status":9,"create_date":"2017-03-16T23:30:57.203Z","images":{"coverSmall":"http://localhost:2000/person/personPic?pid=58cb2031e68197ec0c7b935b"}});
    if (!$scope.$$phase) {
      //$digest or $apply
      $scope.$digest();

    }
    // +JSON.stringify($scope.unreadPersons)
    console.log("$scope.unreadPersons有几个人：" + $scope.unreadPersons.length + "$scope.unreadPersons");
  }

  // $scope.unreadPersons = [{"_id":"58cb2031e68197ec0c7b935b","name":"周鹏宇","sex":"男","nation":"汉","birthday":"1997-03-26","residence":"山东省淄博市博山区山头街道兴源村282号","idNum":"370304199703261618","mobile":8615510590829,"mobileUUid":"6f24df8da22b4c35","__v":2149,"status":9,"create_date":"2017-03-16T23:30:57.203Z","images":{"coverSmall":"http://localhost:2000/person/personPic?pid=58cb2031e68197ec0c7b935b"}},{"_id":"58cb2031e68197ec0c7b935b","name":"周鹏宇","sex":"男","nation":"汉","birthday":"1997-03-26","residence":"山东省淄博市博山区山头街道兴源村282号","idNum":"370304199703261618","mobile":8615510590829,"mobileUUid":"6f24df8da22b4c35","__v":2149,"status":9,"create_date":"2017-03-16T23:30:57.203Z","images":{"coverSmall":"http://localhost:2000/person/personPic?pid=58cb2031e68197ec0c7b935b"}},{"_id":"58cb2031e68197ec0c7b935b","name":"周鹏宇","sex":"男","nation":"汉","birthday":"1997-03-26","residence":"山东省淄博市博山区山头街道兴源村282号","idNum":"370304199703261618","mobile":8615510590829,"mobileUUid":"6f24df8da22b4c35","__v":2149,"status":9,"create_date":"2017-03-16T23:30:57.203Z","images":{"coverSmall":"http://localhost:2000/person/personPic?pid=58cb2031e68197ec0c7b935b"}}];

  // 得到并刷新最近有消息的人员
  $scope.refreshUnreadMessagePersons = function (curDid) {
    var uid = curDid ? curDid : $rootScope.curUser._id;
    var promise = ChatService.getAllUnreadMessagesSyn(uid, $rootScope.applicationServerpath);
    promise.then(function (data) {  // 调用承诺API获取数据 .resolve
      $scope.alwaysnotifications=data;
      console.log(data)
      //debugger;
      var compare = function (obj1, obj2) {//排序函数
        var val1 = obj1.sender;
        var val2 = obj2.sender;
        if (val1 < val2) {
          return -1;
        } else if (val1 > val2) {
          return 1;
        } else {
          return 0;
        }
      }
      var res ={};
      data.sort(compare);
      for(var c=0,aryaa=[];c<data.length;c++){
        if(!data[c].type||data[c].type=='message'){
          aryaa.push(data[c])
        }
      }
      for (var i = 0; i <aryaa.length;) {
        var count = 0;
        for (var j = i; j <aryaa.length; j++) {
            if (aryaa[i].sender ==aryaa[j].sender) {
              count++;
            }
        }
        res[aryaa[i].sender]=count;
        i += count;
      }
      console.log(res)
      var temppp = localStorageService.get("recentChatPersons")?localStorageService.get("recentChatPersons") : new Array();
      for (var index = 0; index < data.length; index++){
        // console.log("下属人员：" + data[index]);
        // console.log("UnreadMessageS人员：" + JSON.stringify(localStorageService.get("PersonInfo_"+data[index].sender)));
        var pObj = localStorageService.get("PersonInfo_" + data[index].sender,360);
        if (pObj) {
          // console.log(temppp);
          for(var aa in res){
            if(aa==pObj._id){
              pObj.nodu=res[aa];
            }
          }
          var isyou = false;
          for (var z = 0; z < temppp.length; z++) {
            if(temppp[z]._id===pObj._id){
              isyou=true;
              temppp[z].nodu=pObj.nodu;
            }
          }
          if(!isyou){
            temppp.push(pObj);
          }
        }
      }
      console.log(temppp)
      localStorageService.update("recentChatPersons", temppp)
      $scope.testclick();
      // $scope.$apply();//用$apply来强制刷新数据
    }, function (data) {  // 处理错误 .reject

    });
  }

  // 得到并刷新部门的人员
  $scope.refreshDepartmentPersons = function (curDid) {
    localStorageService.clear("allPersonsUkSeeInDepartment" + curDid._id);
    var cachePersons = localStorageService.get("allPersonsUkSeeInDepartment" + curDid._id);
    if (!cachePersons) {// 同步调用，获得承诺接口
      var rpromise = departmentAndPersonsService.loadAllInvolvedChildrenByDidSyn(curDid, $rootScope.applicationServerpath);
      rpromise.then(function (data) {  // 调用承诺API获取数据 .resolve
        // console.log('得到并刷新部门的人员refreshDepartmentPersons：' + + curDid._id);		 //子级能得到值
        // curDid.persons=data;
        // 继续列出来
        curDid.persons = new Array();
        for (var index = 0; index < data.persons.length; index++) {
          // console.log("下属人员：" + data.persons[index]);
          curDid.persons.push(data.persons[index]);
          localToolService.insertAPerson(data.persons[index].person);
        }

        console.log(curDid.persons)
      }, function (data) {  // 处理错误 .reject

      });
    }
  };


  // 等到系统用户刷新成功后，开始运行引擎
  $scope.$on('rootUserReady', function (event, data) {
    console.log('engineRun curUser：', data._id);		 //子级能得到值
    $scope.engineStop();
    $scope.engineRun();
  });

  // 切换到对应人员的详细消息记录
  $scope.messageDetils = function (sender) {
    console.log("一个人的详细消息记录.messageDetail：" + sender.name + "<>" + sender.messagestartTime);
    sender.messagecount = 0;
    $state.go("tab.chat-messageDetail", {
      "senderId": sender._id,
      "senderName": sender.name,
      "startTime": sender.messagestartTime
    });
    //把id、姓名和图片存到缓存中,不这么简单存了，改用系统服务
    // localStorageService.update("messagedetail"+sender._id,{name:sender.name,pic:sender.images.coverSmall});
  };

  /**************************************************************************************************************************************************
   * 以下是详细消息列表的部分
   *************************************************************************************************************************************************/

  // var viewScroll = $ionicScrollDelegate.$getByHandle('messageDetailsScroll');
  //console.log("enter messageDetailCtrl");
  //把id、姓名和图片存到缓存中{name:sender.name,pic:sender.images.coverSmall}
  $scope.curSender = {
    _id: $stateParams.senderId,
    name: $stateParams.senderName
  };
  //当路由跳转的时候，判断是不是到手工添加了返回按钮的页面，在某些情况下禁止手工按钮
  // $scope.showMauualBackBtn=true;
  // $scope.$on('$ionicView.beforeEnter', function (event, viewData) {
  //     viewData.enableBack = true;
  // });
  // $rootScope.$on('$stateChangeStart',
  //     function(event, toState, toParams, fromState, fromParams){
  //         // console.log("event:"+event.name+'《页面view进入》'+' toState.name:'+toState.name+' fromState.name:'+fromState.name);
  //         if(fromState.name!="tab.chats"){
  //
  //             console.log("event:"+event.name+'《页面view进入没有botton》'+' toState.name:'+toState.name+' fromState.name:'+fromState.name+"event.targetScope:"+(event.targetScope.doRefresh));
  //             // toParams.showBackBotton=false;
  //             $scope.showMauualBackBtn=true;
  //         }else {
  //             console.log("event:"+event.name+'《页面view进入有botton》'+' toState.name:'+toState.name+' fromState.name:'+fromState.name+"event.targetScope:"+(event.targetScope.doRefresh));
  //             $scope.showMauualBackBtn=false;
  //         }
  //     });

  $scope.messageDetils;//当前显示的消息记录
  $scope.allMessageDetils;//全部的消息记录
  $scope.isRecVoice = false;
  $scope.messageFirstRun = true;
  // 当前是否在向服务器查询大批数据中
  $scope.isRefreshLongListFromServer = false;
  $scope.doRefresh = function () {
    // //console.log("ok");
    $scope.messageNum += 5;
    $timeout(function () {
      $scope.messageDetils = ChatService.getAmountMessageByBothId($scope.messageNum,
        $stateParams.senderId, $rootScope.curUser._id);
      $scope.$broadcast('scroll.refreshComplete');
      // viewScroll.scrollTop();
    }, 200);
  };
  $scope.back = function () {
    // $ionicViewSwitcher.nextDirection('back');
    // $state.go($stateParams.back?$stateParams.back:'tab.chats');
  };


  // localStorageService.clear("messagesListboth" + $stateParams.senderId+'_'+$rootScope.curUser._id);
  $scope.refreshMessagessss = function () {
    //这是为了得到头像之类的玩意
    $rootScope.getUserPicById($stateParams.senderId, function (id, picData) {
      $scope.curSender.pic = picData;
    });
    if (!$rootScope.curUser) {
      $rootScope.refreshCurUser();
      return;
    }
    // 这是得到缓存中的消息记录数据
    $scope.allMessageDetils = ChatService.getMessageByBothId($stateParams.senderId, $rootScope.curUser._id);
    // 缓存中的消息记录按生产时间排序

    // //console.log($rootScope.curUser._id+" 看看传过来的参数messageDetailCtrl $ionicView.beforeEnter"+'<>'+$stateParams.senderId+$stateParams.startTime+'<>'+$scope.messageDetils);
    //设置当前显示数量为4
    $scope.messageNum = $scope.messageFirstRun ? 4 : $scope.messageNum;
    $scope.messageFirstRun = false;//不是第一次刷新了，可显示消息数量不再直接设为4条
    $scope.messageDetils = ChatService.getAmountMessageByBothId($scope.messageNum,
      $stateParams.senderId, $rootScope.curUser._id);
    // $timeout(function() {
    //   viewScroll.scrollBottom();
    // }, 0);


    var curTime = new Date();
    // 如果没有消息记录
    if (!$scope.messageDetils) {
      var startTime = new Date($stateParams.startTime);
      // 按天太不精确了
      var stTime = startTime.formate("yyyy-MM-dd");
      var crTime = curTime.formate("yyyy-MM-dd");
      // 如果起止日期是同一天，就把起始日期挪到昨天，这样才能取到今天的消息
      startTime = new Date(startTime.getDate() - 10);
      stTime = stTime == crTime ? startTime.formate("yyyy-MM-dd") : stTime;
      // 就去找10天以内的消息
      if (!$scope.isRefreshLongListFromServer) {
        ChatService.initMessageListInTimeSpanByPersonIds($stateParams.senderId, $rootScope.curUser._id, stTime, curTime, $rootScope.applicationServer);
        $scope.isRefreshLongListFromServer = true;
      }
      return;
    } else if (Date.parse(curTime) - Date.parse($scope.allMessageDetils[$scope.allMessageDetils.length - 1].create_date) > 3 * 1000)//距今有3秒
    {
      if (!$scope.isRefreshLongListFromServer) {
        ChatService.initMessageListInTimeSpanByPersonIds($stateParams.senderId, $rootScope.curUser._id, $scope.allMessageDetils[$scope.allMessageDetils.length - 1].create_date, curTime, $rootScope.applicationServer);
        // $scope.isRefreshFromServer=true;
      }
      return;
    }
  };

  // 等到系统用户刷新成功后，刷新可见部门
  $scope.$on('rootUserReady', function (event, data) {
    $rootScope.messageDetailEngine.engineStop();
    $rootScope.messageDetailEngine.engineRun();
  });


  window.addEventListener("native.keyboardshow", function (e){
      viewScroll.scrollBottom();
    });

  // 图片显示
  $scope.showImage = function (imageUrl) {
    console.log("展示的图片路径：" + imageUrl);
    $scope.curImage = imageUrl;
    $scope.showModal('templates/imagehover.html');
  };

  // 视频播放
  $scope.playVideo = function (videoUrl) {
    $scope.curVideo = videoUrl;
    $scope.showModal('templates/videohover.html');
  };

  $scope.showModal = function (templateUrl) {
    $ionicModal.fromTemplateUrl(templateUrl, {
      scope: $scope,
      animation: 'slide-in-up'
    }).then(function (modal) {
      $scope.modal = modal;
      $scope.modal.show();
    });
  }

  // Close the modal
  $scope.closeModal = function () {
    $scope.modal.hide();
    $scope.modal.remove()
  };




  //上传之后，得到返回值，给消息对应的字段赋值
  $scope.afterUpload = function (fileResponse) {
    // fileResponse.fileType
    // fileResponse.filename
    console.log("上传完成后文件名：" + fileResponse.filename);
    //
    // $ionicLoading.hide();
    switch (fileResponse.fileType) {
      case 'video':
        $scope.unSendMessage.video = fileResponse.filename;
        break;
      case 'commentImg':
        $scope.unSendMessage.image = fileResponse.filename;
        break;
      case 'voice':
        $scope.unSendMessage.voice = fileResponse.filename;
        break;
      default:
        break;
    }
    var unsendM = $scope.unSendMessage;
    //自动上传
    if ((unsendM.text && unsendM.text != '') || (unsendM.video && unsendM.video != '') || (unsendM.image && unsendM.image != '') || (unsendM.voice && unsendM.voice != '')) {
      // 自动上传，类似微信
      $scope.sendMessage()
    }
  }

  /**
   * uploadImageFile 发送图片
   * @param file
   * @param errFiles
   * @param callback
   */
  $scope.uploadImageFile = function (file, errFiles) {
    console.log('开始上传文件:' + file);
    ChatService.uploadImagefile(file, errFiles, $scope.afterUpload);
  }

  /**
   * uploadVideoFile 发送视频
   * @param file
   * @param errFiles
   * @param callback
   */
  $scope.uploadVideoFile = function (file, errFiles) {
    console.log('开始上传文件:' + file);
    ChatService.uploadVideoFile(file, errFiles, $scope.afterUpload);
  }

  $scope.mailList = function (id, name) {
    console.log("接收者：" + id + "," + name);
    $state.go('app.mail.list', {
      'receiverID': id,
      'receiverName': name
    });
  }

  //console.log(aaa);

  $scope.messageDate = function (ee) {
    return dateService.handleMessageDate(ee);
    //console.log(a);
  }


  //切换好友列表
  $scope.tabs = [true, false];
  $scope.tab = function (index) {
    angular.forEach($scope.tabs, function (i, v) {
      $scope.tabs[v] = false;
    });
    $scope.tabs[index] = true;
  }

  //抓获动态页面
  // http://www.cnblogs.com/xinzhyu/p/4214669.html


  //重新请求数据
  //$scope.chats = mails.all();
  //$scope.remove = function(chat) {
  //  Chats.remove(chat);
  //};

  $scope.refeshMails = function () {
    $scope.allmails = localStorageService.get("allMails", 30);
    if (allmails) {
      mails.refreshAll();
      return;
    }

    return $scope.allmails;
  }

  $scope.$on("mailsRefreshOK", function (event, data) {
    $scope.refeshMails();
  });


  function dfff() {
    if ($scope.allmails) {

    } else {
      $scope.refeshMails();
      return;
    }
  }

  $scope.messages = ChatService.getAllMessages();
  // console.log($scope.messages);
  // 左拖朋友条的时候跳转到什么位置
  $scope.onSwipeLeft = function () {
    $state.go("tab.friends");
  };
  $scope.popupMessageOpthins = function (message) {
    $scope.popup.index = $scope.messages.indexOf(message);
    $scope.popup.optionsPopup = $ionicPopup.show({
      templateUrl: "templates/message_popup.html",
      scope: $scope,
    });
    $scope.popup.isPopup = true;
  };
  $scope.markMessage = function () {
    var index = $scope.popup.index;
    var message = $scope.messages[index];
    if (message.showHints) {
      message.showHints = false;
      message.noReadMessages = 0;
    } else {
      message.showHints = true;
      message.noReadMessages = 1;
    }
    $scope.popup.optionsPopup.close();
    $scope.popup.isPopup = false;
    ChatService.updateMessage(message);
  };
  $scope.deleteMessage = function () {
    var index = $scope.popup.index;
    var message = $scope.messages[index];
    $scope.messages.splice(index, 1);
    $scope.popup.optionsPopup.close();
    $scope.popup.isPopup = false;
    ChatService.deleteMessageId(message.id);
    ChatService.clearMessage(message);
  };
  $scope.topMessage = function () {
    var index = $scope.popup.index;
    var message = $scope.messages[index];
    if (message.isTop) {
      message.isTop = 0;
    } else {
      message.isTop = new Date().getTime();
    }
    $scope.popup.optionsPopup.close();
    $scope.popup.isPopup = false;
    ChatService.updateMessage(message);
  };

  // 切换到对应人员的详细消息记录
  /*
   $scope.messageDetils = function (sender) {
   console.log("enter messageDetailCtrl tab.messageDetail");
   sender.messagecount = 0;
   $state.go("tab.chat-messageDetail", {
   "senderId": sender._id,
   "startTime":sender.messagestartTime
   });
   };
   */
  $scope.$on("$ionicView.beforeEnter", function () {
    // console.log($scope.messages);
    $scope.messages = ChatService.getAllMessages();
    $scope.popup = {
      isPopup: false,
      index: 0
    };
  });
})