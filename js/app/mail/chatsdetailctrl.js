app.controller('messageDetailCtrl', [
  '$scope', '$http', '$state', 'localStorageService', 'messageService', '$rootScope', 'departmentAndPersonsService', '$timeout', '$stateParams',
  function ($scope,   $http,   $state,   localStorageService,   messageService,   $rootScope,   departmentAndPersonsService,   $timeout,   $stateParams,sendMessage) {

    console.log('----NO2--------messageDetailCtrl');


    $scope.fold = $stateParams.receiverID || '7';
    console.log('当前聊天对应id--'+$scope.fold);
  console.log($stateParams);



    //滚动条自动滚动到底部
    $scope.scrolldIV=function(){
      var div = document.getElementById('scrolldIV');
      div.scrollTop = div.scrollHeight;
    };
    $scope.unSendMessage={};
    $scope.unSendMessage.text='';
    $scope.messageFirstRun =true;

    //上传之后，得到返回值，给消息对应的字段赋值
    $scope.send_Message=function (fileResponse) {
      // 只要30分钟内获取过位置
      var curlocation=localStorageService.get('curUserRealTimeLocation',30);

      var messageobj = {
        text:$scope.unSendMessage.text,
        video:$scope.unSendMessage.video,
        image:$scope.unSendMessage.image
        // ,
        // location: {geolocation: [116.385029, 39.992495]}
      };
      messageobj.location=curlocation?{geolocation: [curlocation.lontitude,curlocation.latitude]}:null;
      // var senderId = "58cb2031e68197ec0c7b935b";
      // var receiverId = "58c043cc40cbb100091c640d";
      messageService.sendMessage(messageobj,$rootScope.curUser._id,$stateParams.senderId,$rootScope.applicationServer);
      $scope.scrolldIV();
    }



    //刷新处理函数
    $scope.doRefresh = function () {
      $scope.messageNum += 5;
      console.log($scope.messageNum);
      $timeout(function () {
        $scope.messageDetils = messageService.getAmountMessageByBothId($scope.messageNum,
          $stateParams.senderId, $rootScope.curUser._id);
        $scope.$broadcast('scroll.refreshComplete');
        viewScroll.scrollBottom();
      }, 200);
    };

    //刷新消息
    $scope.refreshMessages = function () {

      $scope.curSender= localStorageService.get("messagedetail"+$stateParams.senderId,30);
        console.log($rootScope.curUser);
      if (!$rootScope.curUser) {$rootScope.refreshCurUser();return;};

      //消息详细
      $scope.messageDetils = messageService.getMessageByBothId($stateParams.senderId, $rootScope.curUser._id);
      console.log($rootScope.curUser._id + " messageDetailCtrl $ionicView.beforeEnter " + $stateParams.startTime + '<>' + $scope.messages);
      var curTime=new Date();
startTime=new Date();
      //////////////////////////////////////////////////////////
      //var startTime=new Date(sender.messagestartTime);

      stTime=startTime.formate("yyyy-MM-dd");
      curTime=curTime.formate("yyyy-MM-dd");
      //
      // 如果起止日期是同一天，就把起始日期挪到昨天，这样才能取到今天的消息
      startTime= new Date(startTime.getDate()-10);

      //stTime=stTime==curTime?startTime.formate("yyyy-MM-dd"):stTime;

      if(!$scope.messageDetils){
        messageService.initMessageListInTimeSpanByPersonIds($stateParams.receiverID,$rootScope.curUser._id,stTime,curTime,$rootScope.applicationServerpath);
        return;
      }
      for (var index = 0; index < $scope.messageDetils.length; index++) {
        var item = $scope.messageDetils[index];
        // 设置这个消息状态为已读，发到服务器端
        messageService.readMessageByID(item._id, $rootScope.applicationServer);
      }

      //设置当前显示数量为4
      $scope.messageNum = $scope.messageFirstRun ?4:$scope.messageNum ;
      $scope.messageFirstRun=false;//不是第一次刷新了，可显示消息数量不再直接设为4条
      $scope.messageDetils = messageService.getAmountMessageByBothId($scope.messageNum,
        $stateParams.senderId, $rootScope.curUser._id);
      $timeout(function () {
        viewScroll.scrollBottom();
      }, 0);
    };

    // 等到系统用户刷新成功后，刷新可见部门
    $scope.$on('rootUserReady', function (event, data) {
      $scope.engineStop();
      $scope.engineRun();
    });

    $scope.$on("$ionicView.beforeEnter", $scope.refreshMessages());

    // 如果接到通知，刷新了某人的消息列表
    $scope.$on('bothMessageListRefreshed', function (event, bothid) {
      console.log("on messagesListboth" + bothid + '<>' + bothid.receiver_id + '<>' + bothid.sender_id);
      //如果是当前sender，就加载
      if (bothid.sender_id == $stateParams.senderId && bothid.receiver_id == $rootScope.curUser._id){
        //$scope.refreshMessages();
        $scope.engineStop();
        $scope.engineRun();
      }
    })

    window.addEventListener("native.keyboardshow", function (e) {
        viewScroll.scrollBottom();
      });

    // 图片显示
    $scope.showImage = function(imageUrl) {
      $scope.curImage = imageUrl;
      $scope.showModal('templates/imagehover.html');
    };

    // 视频播放
    $scope.playVideo = function(videoUrl) {
      $scope.curVideo = videoUrl;
      $scope.showModal('templates/videohover.html');
    };

    $scope.showModal = function(templateUrl) {
      $ionicModal.fromTemplateUrl(templateUrl, {
        scope: $scope,
        animation: 'slide-in-up'
      }).then(function(modal) {
        $scope.modal = modal;
        $scope.modal.show();
      });
    }

    // Close the modal
    $scope.closeModal = function() {
      $scope.modal.hide();
      $scope.modal.remove()
    };

    /*********************************/
    //上传之后，得到返回值，给消息对应的字段赋值
    $scope.afterUpload=function (fileResponse) {
      // fileResponse.fileType
      // fileResponse.filename
      switch(fileResponse.fileType)
      {
        case 'video':
          $scope.unSendMessage.video=fileResponse.filename;
          break;
        case 'commentImg':
          $scope.unSendMessage.image=fileResponse.filename;
          break;
        default:
          break;
      }
    }

    // 上传服务器,后面是上传的类型，普通图片commonImge和身份证IDCard
    $scope.uploadimage = function (uri, uploadDir, mimetype) {
      // alert('请在真机环境中使用拍照上传。'+uploadDir)
      //默认是图片

      if (!mimetype) {
        mimetype = "image/jpg";
      }
      // 注意此处设置的fileKey，Express服务端中也需要这个
      var fileURL = uri;
      var options = new FileUploadOptions();
      options.fileKey = "file";
      options.fileName = fileURL.substr(fileURL.lastIndexOf('/') + 1);
      options.mimeType = mimetype;//注意身份证识别只认jpg，而文件上传服务器是根据这里的mimttype确定文件扩展名的，所以从jpeg改为jpg
      options.chunkedMode = true;
      // alert('1。')

      var ft = new FileTransfer();
      $ionicLoading.show({
        template: '上传中...'
      });
      // alert('2。')

      //这里将图片上传到指定网址
      ft.upload(fileURL, uploadDir, function (data) {
        // 设置图片新地址
        var resp = data.response;
        console.log(resp);
        // alert('3。')
//								alert(resp);
        //alert("上传后返回值："+resp+"\n"+(resp.fileType=='IDCard'));
        //必须得parse一下，否则就会变成字符串
        var pit = JSON.parse(resp);
        // alert("上传后返回值："+pit+"\n"+(pit.fileType=='IDCard'));&&pit.fileType=='IDCard'
        if (pit.fileType) {
          // alert("上传后ok");
          //需要将返回值显示出来
          $scope.afterUpload(pit);
        } else {
          $ionicLoading.hide();
        }
      }, function (error) {
        $ionicLoading.hide();
      }, options);
    }
  }
])