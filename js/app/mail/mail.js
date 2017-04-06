app.controller('MailListCtrl', ['$scope','$http',  '$stateParams','$rootScope', 'messageService',function ($scope, $http,  $stateParams,$rootScope,messageService){

  $scope.fold = $stateParams.fold || '7';
  console.log('当前聊天对应id--'+$stateParams.fold);

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
  }
  /*********************************/
  $scope.afterUpload=function (fileResponse) {
    // fileResponse.fileType
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


}
]);

//angular.module('app').directive('labelColor', function () {
//  return function (scope, $el, attrs) {
//    $el.css({'color': attrs.color});
//  }
//});
