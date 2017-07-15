/*
 app.controller('MailListCtrl', ['$scope', '$http', '$stateParams', '$rootScope', 'messageService', function ($scope, $http, $stateParams, $rootScope, messageService) {

 $scope.fold = $stateParams.fold || '7';
 console.log('当前聊天对应id--' + $stateParams.fold);

 $scope.sendMessage = function (fileResponse) {
 console.log('点击了发送');
 var messageobj = {
 text: '20170325看看事故现场jkhkjh123',
 video: 'message_321.mp4',
 location: {geolocation: [116.385029, 39.992495]}
 };
 var senderId = "58cb2031e68197ec0c7b935b";
 var receiverId = "58c043cc40cbb100091c640d";
 messageService.sendMessages(messageobj, senderId, receiverId, $rootScope.applicationServer);
 messageService.sendMessages(messageobj, senderId, receiverId, $rootScope.applicationServer);
 }
 $scope.afterUpload = function (fileResponse) {
 // fileResponse.fileType
 switch (fileResponse.fileType) {
 case 'video':
 $scope.unSendMessage.video = fileResponse.filename;
 break;
 case 'commentImg':
 $scope.unSendMessage.image = fileResponse.filename;
 break;
 default:
 break;
 }
 }


 }
 ]);
 */
app.controller('ChatsCtrl', function ($scope, $rootScope, localStorageService, $http, $state, userService, dateService, messageService, $stateParams
                                      //, $ionicBackdrop,$ionicPopup,$ionicModal,departmentAndPersonsService
) {

  console.log('----NO1---');
  //所有的单位
  $scope.alldepartments = {};
  $scope.alldepartmentsAndPersonMessages = localStorageService.get('alldepartmentsAndPersonMessages', 30);
  //测试一下加载人员后的单位树
  // console.log('测试一下从缓存读出的人员消息后');
  var str = JSON.stringify($scope.alldepartmentsAndPersonMessages);
  // console.dir(str);
  $scope.message = function () {
    // console.time('继续请求');
    $http.get('js/app/mail/mails.json').then(
      function (resp) {
        $rootScope.fakemessages = resp.data.fakemessages;
        // console.log($rootScope.fakemessages);
        localStorageService.update('alldepartmentsAndPersonMessages', $rootScope.fakemessages);
        // console.timeEnd('继续请求成功');
      }
    );
  };
  if ($scope.alldepartmentsAndPersonMessages) {
    // console.log('本地读取数据');
    $rootScope.fakemessages = $scope.alldepartmentsAndPersonMessages;

    //请求部门
    $http.get('js/app/mail/department.json').then(
      function (resp) {
        $rootScope.department = resp.data.department;
        //localStorageService.update('alldepartmentsAndPersonMessages', $rootScope.department);
        // console.timeEnd('请求部门');
      }
    );

    $scope.message();
  } else {
    // console.log('服务器加载数据');
    $scope.message();
  }

  $scope.mailList = function (id, name) {
    //console.log(id, name);
    $state.go('app.mail.list', {
      'id': id,
      'name': name
    });
  }

  //console.log(aaa);

  $scope.messageDate=function(ee){
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

  //根据各异步返回值组装数据对象
  $scope.resembleJsonObj = function () {
    $scope.alldepartmentsAndPersonMessages = localStorageService.get("allInvolvedDepartments");
    //组装单位
    for (var indd = 0; indd < $scope.alldepartmentsAndPersonMessages.length; indd++) {
      var did = $scope.alldepartmentsAndPersonMessages[indd]._id;
      //组装单位人员
      $scope.alldepartmentsAndPersonMessages[indd].persons = localStorageService.get("allPersonsUkSeeInDepartment" + did);
      for (var inddt = 0; inddt < $scope.alldepartmentsAndPersonMessages[indd].persons.length; inddt++) {
        var sender = $scope.alldepartmentsAndPersonMessages[indd].persons[inddt].person;
        // 如果消息列表不为空，就更新此人，否则还是原来这个人
        $scope.alldepartmentsAndPersonMessages[indd].persons[inddt].person = localStorageService.get("messagesByUserID" + sender._id) ? localStorageService.get("messagesByUserID" + sender._id) : $scope.alldepartmentsAndPersonMessages[indd].persons[inddt].person;
      }
    }
    //测试一下加载人员后的单位树
    console.log('通过广播测试一下加载人员消息后');
    var str = JSON.stringify($scope.alldepartmentsAndPersonMessages);
    localStorageService.update("alldepartmentsAndPersonMessages", $scope.alldepartmentsAndPersonMessages);
    console.log(str);
  };
  //得到并刷新部门
  $scope.refreshDepartments = function (curUser) {
    localStorageService.clear("allInvolvedDepartments");
    var cacheDpts = localStorageService.get("allInvolvedDepartments");
    if (!cacheDpts) {
      departmentAndPersonsService.refreshInvolvedDepartmentsList(curUser, $rootScope.applicationServerpath);
    }
  };
  // 得到并刷新部门的人员
  $scope.refreshDepartmentPersons = function (curDid) {

    localStorageService.clear("allPersonsUkSeeInDepartment" + curDid._id);
    var cachePersons = localStorageService.get("allPersonsUkSeeInDepartment" + curDid._id);
    if (!cachePersons) {
      departmentAndPersonsService.loadAllInvolvedChildrenByDid(curDid, $rootScope.applicationServerpath);
    }
  };

  // 刷新指定人员的消息列表
  $scope.refreshPersonMessageList = function (curSender) {
    if (curSender) {
      messageService.initMessageListByPerson(curSender.person, $rootScope.curUser, $rootScope.applicationServerpath);
    }
  };

  // 等到系统用户刷新成功后，开始运行引擎
  $scope.$on('rootUserReady', function (event, data) {
    console.log('engineRun curUser：', data._id);		 //子级能得到值
    $scope.engineStop();
    $scope.engineRun();
  });

  // 如果刷新部门失败，就2秒后再刷新
  $scope.$on('allInvolvedDepartmentsRefreshFail', function (event, data) {
    // console.log('curUser：', $rootScope.curUser);		 //子级能得到值    ;
    setTimeout($scope.refreshDepartments($rootScope.curUser), 2000);
  });

  // 如果可见部门刷新后，进一步刷新部门下属人员
  $scope.$on('allInvolvedDepartmentsRefreshed', function (event, data) {
    console.log('curUser：', $rootScope.curUser);		 //子级能得到值
    var allInvoledDpts = localStorageService.get("allInvolvedDepartments");
    if (allInvoledDpts.length > 0) {
      for (var index = 0; index < allInvoledDpts.length; index++) {
        console.log('curDepartment：', allInvoledDpts[index]);		 //子级能得到值
        // 进一步刷新部门下属人员
        $scope.refreshDepartmentPersons(allInvoledDpts[index]);
      }
    }
  });

// 如果下属人员刷新了，就刷新他们有没有消息列表
  $scope.$on('allPersonsUkSeeInADepartmentRefreshed', function (event, didobj) {
    console.log('curUser：', $rootScope.curUser);		 //子级能得到值
    // "allPersonsUkSeeInDepartment"+didobj._id, didobj.persons
    var allInsidePersons = localStorageService.get("allPersonsUkSeeInDepartment" + didobj._id);
    if (allInsidePersons.length > 0)
      for (var index = 0; index < allInsidePersons.length; index++) {
        $scope.refreshPersonMessageList(allInsidePersons[index]);
      }
  });

  // 如果接到通知，刷新了某人的消息列表
  $scope.$on('messageListRefreshed', function (event, sender) {

    $scope.resembleJsonObj();
  });

  // 如果接到通知，某人的消息列表刷新失败，2秒后接着刷
  $scope.$on('messageListRefreshFail', function (event, sender) {
    setTimeout($scope.refreshPersonMessageList(sender), 2000);
  });

  //                              刷新当前用户
  if (!$scope.alldepartmentsAndPersonMessages) {
    userService.refreshCurUser();
  }

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

  $scope.messages = messageService.getAllMessages();
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
    messageService.updateMessage(message);
  };
  $scope.deleteMessage = function () {
    var index = $scope.popup.index;
    var message = $scope.messages[index];
    $scope.messages.splice(index, 1);
    $scope.popup.optionsPopup.close();
    $scope.popup.isPopup = false;
    messageService.deleteMessageId(message.id);
    messageService.clearMessage(message);
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
    messageService.updateMessage(message);
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
    $scope.messages = messageService.getAllMessages();
    $scope.popup = {
      isPopup: false,
      index: 0
    };
  });
})