﻿/**
 * Upyun认证数据
 */
app.factory('Upyun', function ($http) {
  return {
    token: function (name, size) {
      return $http.jsonp("http://transfer.impress.pw/upyun?callback=JSON_CALLBACK", {
        cache: false
      });
    }
  }
});
app.factory('localToolService', function ($http, localStorageService, $rootScope) {
  return {
    //根据多个接口传回的用户数据，刷新缓存中用户信息
    insertAPerson: function (newPerson) {
      if (!(newPerson && newPerson._id))return;
      // 这是得到缓存中的消息记录数据
      var thisPerson = localStorageService.get("PersonInfo_" + newPerson._id, 60 * 24);
      if (!thisPerson) thisPerson = newPerson;
      else {
        thisPerson = {};
        //合并新老消息记录
        /*for in 可以用于数组或者对象*/
        for (var name in newPerson) {
          thisPerson[name] = newPerson[name];
        }
        // var names=JSON.stringify(thisPerson);
        //console.log("已更新的人员insertAPerson："+names);
      }
      if (!thisPerson.images) thisPerson.images = {};
      // console.log('信息插入头像')
      thisPerson.images.coverSmall = $rootScope.applicationServerpath + 'person/personPic?pid=' + newPerson._id;
      // $rootScope.getUserPicById(newPerson._id);
      localStorageService.update("PersonInfo_" + newPerson._id, thisPerson);
      return thisPerson;
    },
    // 读一个消息，提交服务器，把消息状态变为已读
    readMessageByID: function (messageID, applicationServer) {
      //保存提交到服务器
      $http({
        method: 'POST',
        url: applicationServer + 'message/readtMessage',
        //params:{personid:curUserId},
        data: {
          messID: messageID
        },
        headers: {'Content-Type': 'application/json;charset=utf-8'},
        dataType: 'JSON'
      })
        .success(function (data, status, headers, config) {
          //alert("用户定位点修改成功！");
          // curUser=$scope.curUser;
          // $scope.resMsg=data;
          // //console.log(data+"<loadAllInvolvedChildrenByDid>"+status);
          if (status == 200) {
            //其实也可以得到部门，但是部门暂时没有用

            //如果人员关联的消息数量不为0
            if (data) {
              // 广播用户发来的消息查询成功
              $rootScope.$broadcast('readMessage', data);
            }
          } else {
            // 广播用户发来的消息列表刷新失败
            $rootScope.$broadcast('readMessageFail', data);
          }
          ;
        }).error(function (data, status, headers, config) {

      });
    },
    //根据接收者和发送者的id，插入一条聊天记录
    insertANewMessageToMessageList: function (sender_id, receiver_id, newMessage) {
      if (!(newMessage && newMessage.create_date)) {
        return
      }
      ;
      // 把时间格式化一下
      newMessage.create_date = new Date(newMessage.create_date).formate('yyyy-MM-dd hh:mm:ss');
      // 这是得到缓存中的消息记录数据
      var messageDetils = localStorageService.get("messagesListboth" + sender_id + '_' + receiver_id, 60 * 24);
      if (!messageDetils) messageDetils = new Array();

      // 将缓存中的消息记录按生产时间排序
      // messageDetils.sort(function(a,b){
      //   return Date.parse(a.create_date) - Date.parse(b.create_date);//时间正序
      // });
      var isExisted = false;
      //合并新老消息记录
      if (messageDetils && messageDetils.length > 0) {
        for (var index = 0; index < messageDetils.length; index++) {
          if (messageDetils[index]._id == newMessage._id) {
            isExisted = true;
          }
        }
        // if((Date.parse(messageDetils[index].create_date)- Date.parse(data[0].create_date))>0){
        //   messageDetils.slice(index,messageDetils.length)
        //   break;
        // }
      }
      if (!isExisted) {
        messageDetils.push(newMessage);
      }
      // 将缓存中的消息记录按生产时间排序
      messageDetils.sort(function (a, b) {
        return Date.parse(a.create_date) - Date.parse(b.create_date);//时间正序
      });

      //插入的时候就发送到服务器说这条消息已读
      // if ($rootScope.curUser && $rootScope.curUser._id && receiver_id == $rootScope.curUser._id && newMessage.status == 0)//表示未读,而且是发给本人的，才标志已读
      //     this.readMessageByID(newMessage._id, $rootScope.applicationServer);
      localStorageService.update("messagesListboth" + sender_id + '_' + receiver_id, messageDetils);
    },
    //根据接收者和发送者的id，插入一条提示记录
    insertANewMessageToMessageprompt: function (sender_id, receiver_id, newMessage) {
      if (!(newMessage && newMessage.create_date)) {return;}
      // 把时间格式化一下
      newMessage.create_date = new Date(newMessage.create_date).formate('yyyy-MM-dd hh:mm:ss');
      // 这是得到缓存中的消息记录数据
      var messageDetils = localStorageService.get("messagespromptboth"+receiver_id, 60 * 24);
      if (!messageDetils) messageDetils = new Array();
      // 将缓存中的消息记录按生产时间排序
      // messageDetils.sort(function(a,b){
      //   return Date.parse(a.create_date) - Date.parse(b.create_date);//时间正序
      // });
      var isExisted = false;
      //合并新老消息记录
      if (messageDetils && messageDetils.length > 0) {
        for (var index = 0; index < messageDetils.length; index++) {
          if (messageDetils[index]._id == newMessage._id) {
            isExisted = true;
          }
        }
      }
      if (!isExisted) {
        messageDetils.push(newMessage);
      }
      // 将缓存中的消息记录按生产时间排序
      messageDetils.sort(function (a, b) {
        return Date.parse(a.create_date) - Date.parse(b.create_date);//时间正序
      });
      // console.log("messagespromptboth"+ '_' + receiver_id)
      localStorageService.update("messagespromptboth" + receiver_id, messageDetils);
    },
    //根据当前用户，插入一条相关部门
    insertADepartmentToInvolveDepartments: function (newDepartment) {
      console.log("根据当前用户，插入一条相关部门：" + JSON.stringify(newDepartment) + '<1>alldepartments:');
      if (!(newDepartment && newDepartment.create_date))return;
      console.log("根据当前用户，插入一条相关部门：" + newDepartment + '<2>alldepartments:');
      // 把时间格式化一下
      newDepartment.create_date = new Date(newDepartment.create_date).formate('yyyy-MM-dd hh:mm:ss');
      // 这是得到缓存中的消息记录数据
      var alldepartments = localStorageService.get("allInvolvedDepartments", 60 * 24);
      if (!alldepartments) alldepartments = new Array();

      console.log("根据当前用户，插入一条相关部门：" + newDepartment + '<>alldepartments:' + alldepartments);
      var isExisted = false;
      //合并新老消息记录
      if (alldepartments && alldepartments.length > 0) {
        for (var index = 0; index < alldepartments.length; index++) {
          if (alldepartments[index]._id == newDepartment._id) {
            alldepartments[index] = newDepartment;
            isExisted = true;
          }
        }
      }
      if (!isExisted) {
        alldepartments.push(newDepartment);
      }
      // 将缓存中的消息记录按生产时间排序
      alldepartments.sort(function (a, b) {
        return a.path.length - b.path.length;//根据树路径字符串长度排序，就是层级顺序了
      });
      localStorageService.update("allInvolvedDepartments", alldepartments);

      console.log("根据当前用户，插入部门update：" + '<>alldepartments:' + alldepartments);
    },
    getGridarea: function () {

    }
  }
})
// html5本地缓存数据的使用，本质是减少数据库io，减少服务器负担，没有必要实时更新的数据都缓存到本地
app.factory('localStorageService', [function () {
  return {
    // 根据键 获取一个值，所有的缓存数据都是这么获取
    get: function localStorageServiceGet(key, expireTime, defaultValue) {
      // 我们自行指定一个过期时间，下面这个是3分钟
      // var exp=1000*60*60;
      // console.log(key, '.. ' + expireTime, '分钟后过期');
      var exp = 1000 * 60;
      if (expireTime) exp = exp * expireTime;
      var stored = localStorage.getItem(key);
      try {
        stored = angular.fromJson(stored);
        // var dataObj = JSON.parse(data);
        if (new Date().getTime() - stored.time > exp) {
          console.log('信息已过期:' + key);
          stored = null;
          //alert("信息已过期")
        } else {
          //console.log("data="+dataObj.data);
          //console.log(JSON.parse(dataObj.data));
          stored = stored.data;
        }
      } catch (error) {
        stored = null;
      }
      if (defaultValue && stored === null) {
        stored = defaultValue;
      }
      return stored;
    },
    // 根据键  更新一个键值对，所有的缓存数据都是这么设置
    update: function localStorageServiceUpdate(key, value) {
      if (value) {
        var curTime = new Date().getTime();
        localStorage.setItem(key, JSON.stringify({data: value, time: curTime}));
        // if(key.slice(0,10)=="PersonInfo"){debugger;}
        // localStorage.setItem(key, angular.toJson(value));
      }
    },
    // 根据键 删除一个值      ，所有的缓存数据都是这么删除，当然过期之后也取不到值
    clear: function localStorageServiceClear(key) {
      localStorage.removeItem(key);
    }
  };
}]);

//当前用户服务，各个页面都需要获取当前用户，虽然有全局变量$rootScope.curUser，但是有时还需要刷新，这个服务就负责跟服务器交互，刷新当前用户
app.factory("userService", ['localStorageService', '$http', '$rootScope', function (localStorageService, $http, $rootScope) {
  return {
    // 根据手机唯一的uuid获取用户
    setUserByUUid: function (uuid, applicationServer) {

      console.log("setUserByUUid手机uuid：" + uuid + '<>applicationServer:' + applicationServer);
      $http({
        method: 'POST',
        url: applicationServer + 'person/getPersonByUUId',
        data: {"mobileUUid": uuid},
        //params:[data:$scope.movieTestData ],
        headers: {'Content-Type': 'application/json;charset=utf-8'},
        dataType: 'JSON'
      })
        .success(function (data, status, headers, config) {
          // alert("用户修改成功！"+status);
          //curUser=$scope.curUser;
          //$scope.resMsg=data;
          if (status == 200) {
            if (data.err) {
              //广播用户查询失败
              $rootScope.$broadcast('curUserRefreshFail', null);
              // alert("查询出错："+data.err);
            } else if (data.name) {
              localStorageService.update("curUser", data);
              // 广播用户查询成功
              $rootScope.$broadcast('curUserReady', data);
              // var isBase=validator.isBase64(data.images.coverSmall); //=> true

            }
          } else {
            alert("网络异常，请稍后重试：" + status);
          }
        }).error(function (data, status, headers, config) {
      });
    },
    getWorkmatesByUserId: function (userid, applicationServer) {
      console.log("getWorkmatesByUserId：" + userid + '<>applicationServer:' + applicationServer);
      $http({
        method: 'POST',
        url: applicationServer + 'person/getWorkmatesByUserId',
        data: {"userid": userid},
        //params:[data:$scope.movieTestData ],
        headers: {'Content-Type': 'application/json;charset=utf-8'},
        dataType: 'JSON'
      })
        .success(function (data, status, headers, config) {
          if (status == 200) {
            if (!data) {
              //广播用户查询同事失败
              $rootScope.$broadcast('getWorkmatesByUserIdFail', null);
              //alert("查询出错："+data.err);
            } else {
              //alert("查询成功");
              // data.forEach(function (val, key) {
              //   val.name += ' (测试人员)';
              // })
              localStorageService.update("workmates", data);
              // 广播用户查询同事成功
              $rootScope.$broadcast('getWorkmatesByUserIdOk', data);
              // var isBase=validator.isBase64(data.images.coverSmall); //=> true
            }
          } else {
            alert("网络异常，请稍后重试：" + status);
          }
        }).error(function (data, status, headers, config) {
      });
    },
    getLatestLocationByUserId: function (userid, applicationServer) {
      $http({
        method: 'POST',
        url: applicationServer + 'person/getPersonLatestPosition',
        data: {"personID": userid},
        //params:[data:$scope.movieTestData ],
        headers: {'Content-Type': 'application/json;charset=utf-8'},
        dataType: 'JSON'
      })
        .success(function (data, status, headers, config) {
          if (status == 200) {
            // console.log("getLatestLocationByUserId：" + data);
            if (!data) {
              // 要保存一个获取定位点的时间值
              localStorageService.update("LatestLocation_" + userid, {
                Location: null,
                getDate: new Date()
              });
              //广播用户查询同事定位点失败
              $rootScope.$broadcast('getLatestLocationByUserIdFail', null);
              // alert("查询出错："+data.err);
            } else {
              //console.log(data);
              // console.log("getLatestLocationByUserId Location："+data.geolocation+'<>getDate:'+new Date());
              // 要保存一个获取定位点的时间值
              localStorageService.update("LatestLocation_" + userid, {
                Location: data.geolocation,
                getDate: new Date(),
                positioningdate: data.positioningdate
              });
              // 广播用户查询同事成功
              $rootScope.$broadcast('getLatestLocationByUserIdOk', {
                _id: userid,
                Location: data.geolocation,
                getDate: new Date(),
                positioningdate: data.positioningdate
              });
              // var isBase=validator.isBase64(data.images.coverSmall); //=> true
            }
          } else {
            alert("网络异常，请稍后重试：" + status);
          }
          ;
        }).error(function (data, status, headers, config) {
      });
    }
    ,
    getPersonPositionInTimespan: function (personid, startTime, endTime, applicationServer) {
      console.log("getWorkmatesByUserId：" + userid + '<>applicationServer:' + applicationServer);
      $http({
        method: 'POST',
        url: applicationServer + 'person/getWorkmatesByUserId',
        data: {"userid": userid},
        //params:[data:$scope.movieTestData ],
        headers: {'Content-Type': 'application/json;charset=utf-8'},
        dataType: 'JSON'
      })
        .success(function (data, status, headers, config) {
          if (status == 200) {
            if (!data) {
              //广播用户查询同事失败
              $rootScope.$broadcast('getWorkmatesByUserIdFail', null);
              // alert("查询出错："+data.err);
            } else {
              localStorageService.update("workmates", data);
              // 广播用户查询同事成功
              $rootScope.$broadcast('getWorkmatesByUserIdOk', data);
              // var isBase=validator.isBase64(data.images.coverSmall); //=> true
            }
          } else {
            alert("网络异常，请稍后重试：" + status);
          }
          ;
        }).error(function (data, status, headers, config) {
      });
    }
    ,
    refreshCurUser: function () {
      if ($rootScope.curUser) {
        localStorageService.update('curUser', $rootScope.curUser, 24 * 60);
        return $rootScope.curUser;
      }
      console.log("$rootScope.curUser" + "<>" + $rootScope.curUser);
      $rootScope.curUser = localStorageService.get('curUser');
      console.log("当前用户curUser：" + $rootScope.curUser.name + '<>id:' + $rootScope.curUser._id);
      return $rootScope.curUser;

    }
  }
}]);
//地图服务
app.factory('gridmapService', ['$http', '$rootScope', 'localStorageService',
  function ($http, $rootScope, localStorageService){
  return {
    spotareagrid: function (callback) {//加载多边形绘制区域图层
      var spotarea = localStorageService.get('spotarea', 60 * 1);
      console.log('从服务获取')

      if (!spotarea) {
        console.log('缓存没有，获取')
        $http(
          {
            method: 'POST',
            url: $rootScope.applicationServerpath + 'spotarea/getNewestSpotarea'
          }
        ).then(function (resp) {
          //console.log(resp);
          console.log('从服务器获取数据！');
          if (resp.data) {
            var newspot = $rootScope.parseGeojsonFromDb(resp.data);
            // 将所有网格区域存到缓存中
          }
          localStorageService.update('spotarea', newspot);
          //console.log('服务器返回数据');
        });
      }else {
        console.log(spotarea)
        callback(spotarea)
      }
    },
    getdarpmenteventposition:function(department,currentperson,applicationServer){
      console.log(department)
      var event = localStorageService.get('darpmenteventposition_'+currentperson, 60);
      if (!event) {
        console.log('缓存没有,获取');
        $http(
            {
              method: 'POST',
              url:applicationServer + 'maproute/geteventposition',
              data:{departmentID:department}
            }
        ).then(function (resp) {
          //console.log(resp.data.success);
          console.log('从服务器获取数据！');
          if (resp.data.success) {
            localStorageService.update('darpmenteventposition_'+currentperson,resp.data.success);
            $rootScope.$broadcast('darpmenteventposition',resp.data.success);
          }else{
            console.log(resp.data)
          }
        });
      }else {
        $rootScope.$broadcast('darpmenteventposition',event);
      }
    },
    geteventlaseperson:function(eventID){//人员统计接口
      $http({
        method: 'POST',
        url: $rootScope.applicationServerpath + 'mobilegrid/geteventlaseperson',
        data:{eventID:eventID}
      }).then(function (resp){
        if(resp.data.success){
          console.log(resp.data.success)
        }else{
          console.log(resp.data.error)
        }
      })
    }
  }
}]);
//日期服务
app.factory('dateService', [function () {
  return {
    handleMessageDate: function (messages) {
      var i = 0,
        length = 0,
        messageDate = {},
        nowDate = {},
        weekArray = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"],
        diffWeekValue = 0;
      //console.log(messages.length);
      if (messages) {
        //nowDate = this.getNowDate();
        var oldDate = new Date(messages);
        var newDate = new Date();
        var dayDifference = (newDate - oldDate) / 1000 / 60 / 60 / 24;
        //console.log(dayDifference);
        if (dayDifference > 365) {
          return oldDate.formate("yyyy年M月d日");
        }
        if (dayDifference >= 7) {
          return oldDate.formate("M月d日");
        }
        if (dayDifference < 7) {
          return ('周' + oldDate.getDay());
        }

        /*
         length = messages.length;
         for (i = 0; i < length; i++) {
         messageDate = this.getMessageDate(messages[i]);
         if(!messageDate){
         return null;
         }
         if (nowDate.year - messageDate.year > 0) {
         messages[i].lastMessage.time = messageDate.year + "";
         continue;
         }
         if (nowDate.month - messageDate.month >= 0 ||
         nowDate.day - messageDate.day > nowDate.week) {
         messages[i].lastMessage.time = messageDate.month +
         "月" + messageDate.day + "日";
         continue;
         }
         if (nowDate.day - messageDate.day <= nowDate.week &&
         nowDate.day - messageDate.day > 1) {
         diffWeekValue = nowDate.week - (nowDate.day - messageDate.day);
         messages[i].lastMessage.time = weekArray[diffWeekValue];
         continue;
         }
         if (nowDate.day - messageDate.day === 1) {
         messages[i].lastMessage.time = "昨天";
         continue;
         }
         if (nowDate.day - messageDate.day === 0) {
         messages[i].lastMessage.time = messageDate.hour + ":" + messageDate.minute;
         continue;
         }
         }
         //console.log(messages);
         return messageDate;
         */
      } else {
        console.log("messages is null");
        return null;
      }

    },
    getNowDate: function () {
      var nowDate = {};
      var date = new Date();
      nowDate.year = date.getFullYear();
      nowDate.month = date.getMonth();
      nowDate.day = date.getDate();
      nowDate.week = date.getDay();
      nowDate.hour = date.getHours();
      nowDate.minute = date.getMinutes();
      nowDate.second = date.getSeconds();
      return nowDate;
    },
    getMessageDate: function (message) {
      var messageDate = {};
      var messageTime = "";
      //2015-10-12 15:34:55
      var reg = /(^\d{4})-(\d{1,2})-(\d{1,2})\s(\d{1,2}):(\d{1,2}):(\d{1,2})/g;
      var result = new Array();
      if (message) {
        console.log(message.create_date);
        messageTime = message.create_date;
        result = reg.exec(messageTime);
        if (!result) {
          console.log("result is null");
          return null;
        }
        messageDate.year = parseInt(result[1]);
        messageDate.month = parseInt(result[2]);
        messageDate.day = parseInt(result[3]);
        messageDate.hour = parseInt(result[4]);
        messageDate.minute = parseInt(result[5]);
        messageDate.second = parseInt(result[6]);
        // console.log(messageDate);
        return messageDate;
      } else {
        console.log("message is null");
        return null;
      }
    }
  };
}]);

//部门和人员服务，包括获取当前用户所在的部门，获取这些部门内部的所有人员等等
// 可以为定位、聊天提供数据支撑
app.factory('departmentAndPersonsService', ['localStorageService', 'dateService', '$http', '$rootScope', 'userService', '$q',
  function (localStorageService, dateService, $http, $rootScope, userService, $q) {
    return {

      // 刷新部门下属人员
      loadAllInvolvedChildrenByDid: function (didobj, applicationServer) {

        console.log(didobj + "<loadAllInvolvedChildrenByDid>" + applicationServer);
        //传过来的是部门对象
        if (didobj) {
          //保存提交到服务器
          $http({
            method: 'POST',
            url: applicationServer + 'department/getAllpersonsByDepartIdOneStep',
            //params:{personid:curUserId},
            data: {_id: didobj._id},
            headers: {'Content-Type': 'application/json;charset=utf-8'},
            dataType: 'JSON'
          })
            .success(function (data, status, headers, config) {
              //alert("用户定位点修改成功！");
              // curUser=$scope.curUser;
              // $scope.resMsg=data;
              console.log(data + "<loadAllInvolvedChildrenByDid>" + status);
              if (status == 200) {
                //其实也可以得到部门，但是部门暂时没有用

                //如果人员关联的单位下属人员不为空
                if (data.persons && data.persons.length > 0) {
                  // 继续列出来
                  didobj.persons = new Array();
                  for (var index = 0; index < data.persons.length; index++) {
                    console.log("下属人员：" + data.persons[index]);
                    didobj.persons.push(data.persons[index]);
                  }
                  //更新对应单位的人员，并且缓存起来
                  localStorageService.update("allPersonsUkSeeInDepartment" + didobj._id, didobj.persons);

                  console.log("allPersonsUkSeeInADepartmentRefreshed：" + didobj);
                  //广播用户涉及部门刷新成功
                  $rootScope.$broadcast('allPersonsUkSeeInADepartmentRefreshed', didobj);
                }
              } else {
                //广播用户涉及部门刷新失败
                $rootScope.$broadcast('allPersonsUkSeeInADepartmentRefreshFail', didobj);
              }
              ;
            }).error(function (data, status, headers, config) {

          });
        }
      },
      // 刷新部门下属人员
      loadAllInvolvedChildrenByDidSyn: function (didobj, applicationServer) {
        var deferred = $q.defer(); // 声明延后执行，表示要去监控后面的执行
        console.log(didobj + "<loadAllInvolvedChildrenByDidSyn>" + applicationServer);
        //传过来的是部门对象
        if (didobj) {
          //保存提交到服务器
          $http({
            method: 'POST',
            url: applicationServer + 'department/getAllpersonsByDepartIdOneStep',
            //params:{personid:curUserId},
            data: {_id: didobj._id},
            headers: {'Content-Type': 'application/json;charset=utf-8'},
            dataType: 'JSON'
          })
            .success(function (data, status, headers, config) {
              //alert("用户定位点修改成功！");
              // curUser=$scope.curUser;
              // $scope.resMsg=data;
              console.log(data + "<loadAllInvolvedChildrenByDid>" + status);
              if (status == 200) {
                //其实也可以得到部门，但是部门暂时没有用

                //如果人员关联的单位下属人员不为空
                if (data.persons && data.persons.length > 0) {

                  deferred.resolve(data);  // 声明执行成功，即http请求数据成功，可以返回数据了

                }
              } else {
                deferred.reject(data);   // 声明执行失败，即服务器返回错误
              }
              ;
            }).error(function (data, status, headers, config) {
            deferred.reject(data);   // 声明执行失败，即服务器返回错误
          });
        }
        return deferred.promise;
      },
      // 根据一个单位对象，获取这个单位内部的所有人员
      refreshPersonsUksee: function (group) {
        if (group && group.length > 0) {
          for (var index = 0; index < group.length; index++) {
            console.log('加载以下单位的人员：');
            console.log(group[index]);
            $scope.loadAllInvolvedChildrenByDid(group[index]);
          }

        } else {
          return;
        }
      },

      // 刷新用户当前可选单位，一个人可以在多个单位兼职，所以获取单位列表是后续操作的基础
      refreshInvolvedDepartmentsListSyn: function (curUser, applicationServer) {
        if (curUser && curUser._id) {
          var deferred = $q.defer(); // 声明延后执行，表示要去监控后面的执行
          console.log(curUser + "<>" + curUser._id + "<>");
          //保存提交到服务器
          $http({
            method: 'POST',
            url: applicationServer + 'department/getAllInvolvedDepartmentsByUserid',
            //params:{personid:curUserId},
            data: {_id: curUser._id},
            headers: {'Content-Type': 'application/json;charset=utf-8'},
            dataType: 'JSON'
          })
            .success(function (data, status, headers, config) {
              //alert("用户定位点修改成功！");
              // curUser=$scope.curUser;
              // $scope.resMsg=data;
              console.log(data);
              if (status == 200) {
                //说明服务器端获得当前用户所在部门成功
                //如果人员关联的单位不为空
                if (data.length > 0) {
                  var allInvolvedDepartments = new Array();
                  // 继续列出来
                  for (var index = 0; index < data.length; index++) {
                    console.log(data[index] + "部门id" + data[index].department);
                    allInvolvedDepartments.push(data[index].department);
                    // $scope.loadAllInvolvedChildrenByDid(data[index].department._id);
                  }
                  deferred.resolve(allInvolvedDepartments);  // 声明执行成功，即http请求数据成功，可以返回数据了

                }
              } else {

                deferred.reject(data);   // 声明执行失败，即服务器返回错误
              }
              ;
            }).error(function (data, status, headers, config) {
            // console.log(data+"<>"+data.length+"<>"+status);
            deferred.reject(data);   // 声明执行失败，即服务器返回错误

          });
        }
        return deferred.promise;
      },
      // 刷新用户当前可选单位，一个人可以在多个单位兼职，所以获取单位列表是后续操作的基础
      refreshInvolvedDepartmentsList: function (curUser, applicationServer) {
        if (curUser && curUser._id) {

          console.log(curUser + "<>" + curUser._id + "<>");
          //保存提交到服务器
          $http({
            method: 'POST',
            url: applicationServer + 'department/getAllInvolvedDepartmentsByUserid',
            //params:{personid:curUserId},
            data: {_id: curUser._id},
            headers: {'Content-Type': 'application/json;charset=utf-8'},
            dataType: 'JSON'
          })
            .success(function (data, status, headers, config) {
              //alert("用户定位点修改成功！");
              // curUser=$scope.curUser;
              // $scope.resMsg=data;
              console.log(data + "<>" + data.length + "<>" + status);
              if (status == 200) {
                //说明服务器端获得当前用户所在部门成功
                //如果人员关联的单位不为空
                if (data.length > 0) {
                  var allInvolvedDepartments = new Array();
                  // 继续列出来
                  for (var index = 0; index < data.length; index++) {
                    console.log(data[index] + "部门id" + data[index].department);
                    allInvolvedDepartments.push(data[index].department);
                    // $scope.loadAllInvolvedChildrenByDid(data[index].department._id);
                  }
                  localStorageService.update("allInvolvedDepartments", allInvolvedDepartments);
                  console.log("广播allInvolvedDepartments：" + allInvolvedDepartments);

                  //广播用户涉及部门刷新成功
                  $rootScope.$broadcast('allInvolvedDepartmentsRefreshed', allInvolvedDepartments);
                  // 把刷好的单位返给外部函数，已废弃，有了广播不需要callback了
                  // if(callback)callback(allInvolvedDepartments);
                  //刷新相关部门的人员列表
                  // $scope.refreshPersonsUksee($scope.alldepartments);
                }
              } else {
                //广播用户涉及部门刷新失败
                $rootScope.$broadcast('allInvolvedDepartmentsRefreshFail', null);
              }
              ;
            }).error(function (data, status, headers, config) {
            // console.log(data+"<>"+data.length+"<>"+status);

          });
        }
      },
      //获取到部门内所有的职务
      getpersontitleTodepartment:function(department,applicationServer,callback){

        $http({
          method: "POST",
          url: $rootScope.applicationServerpath + 'personadminroute/getpersontitleTodepartment',//获取到部门内所有的职务
          data: {departmentID:department}
        }).then(function (resp) {
          if(resp.data.success){
            callback(resp.data.success)
          }else{
            console.log(resp.data.error)
          }
        })
      },
      //获得人员的职务名称
      getpersontitle:function (title,applicationServer,callback) {
        $http({
          method: "POST",
          url: $rootScope.applicationServerpath + 'personadminroute/getpersontitle',
          data: {title:title}
        }).then(function (titresp) {
          if(titresp.data.success) {
            callback(titresp.data.success);
          }else{
            console.log(titresp.data.error)
          }
        })
      },
      //删除一个部门职务
      deletedepartmenttitle:function (title,applicationServer,callback) {
        $http({
          method: "POST",
          url: $rootScope.applicationServerpath + 'personadminroute/deletetitle',
          data: {titleID:title}
        }).then(function (resp) {
            if(resp.data.success){
              callback(resp.data.success)
            }else{
              console.log(resp.data.error)
            }
        })
      },
      //获得所有部门
      getAllDepartments:function (applicationServer,callback) {
        $http({
          method: 'POST',
          url: applicationServer + 'personadminroute/getAllDepartments'
        }).success(function(resp){
          if(resp.success){
            callback(resp.success);
          }else{
            console.log(resp.data)
          }
        })
      }

    }
  }]);
//人员和位置服务
app.factory('personLocationsService', ['localStorageService', 'dateService', '$http', 'userService',
  function (localStorageService, dateService, $http, userService) {
    return {}
  }
]);
// 消息服务
app.factory('messageService', ['localStorageService', 'dateService', '$http', '$rootScope',
  function (localStorageService, dateService, $http, $rootScope) {
    return {
      // initFromDepartMent: function(departMessages){
      //   var oldmessageUserIDs=localStorageService.get("messageUserIDs");
      //
      //   for(var index=0;index<departMessages.length;index++){
      //     var curDpt=departMessages[index];
      //     var persons=curDpt.persons;
      //     var messageID ;
      //     for(var indexdd=0;indexdd<persons.length;indexdd++){
      //       var curperson=persons[indexdd].person;
      //       messageID=localStorageService.get("message_"+curperson._id);
      //
      //       if(oldmessageUserIDs && oldmessageUserIDs.length>0){
      //         var isExistpsed=false;
      //         for(var jddd=0;jddd< oldmessageUserIDs.length;jddd++){
      //           if(oldmessageUserIDs[jddd]._id==curperson._id){
      //             isExistpsed=true;
      //           }
      //         }
      //         if(!isExistpsed){
      //           oldmessageUserIDs.push({_id:curperson._id,name:curperson.name});
      //         }
      //       }else{
      //         oldmessageUserIDs=new Array();
      //         oldmessageUserIDs.push({_id:curperson._id,name:curperson.name});
      //       }
      //
      //       for(var indexddx=0;indexddx<curperson.unreadmessages.length;indexddx++){
      //         // messageDate = dateService.getMessageDate(messages[i]);
      //         if(messageID && messageID.length>0){
      //           var isExisted=false;
      //           for(var jdd=0;jdd< messageID.length;jdd++){
      //             if(messageID[jdd]._id==curperson.unreadmessages[indexddx]._id){
      //               isExisted=true;
      //             }
      //           }
      //           if(!isExisted){
      //             messageID.push(curperson.unreadmessages[indexddx]);
      //           }
      //         }else{
      //           messageID=new Array();
      //           messageID.push(curperson.unreadmessages[indexddx]);
      //         }
      //       }
      //       localStorageService.update("message_" + curperson._id, messageID);
      //       localStorageService.update("messageUserIDs", oldmessageUserIDs);
      //     }
      //   }
      // },
      // 读一个消息，提交服务器，把消息状态变为已读
      readMessageByID: function (messageID, applicationServer) {
        //保存提交到服务器
        $http({
          method: 'POST',
          url: applicationServer + 'message/readtMessage',
          //params:{personid:curUserId},
          data: {
            messID: messageID
          },
          headers: {'Content-Type': 'application/json;charset=utf-8'},
          dataType: 'JSON'
        })
          .success(function (data, status, headers, config) {
            //alert("用户定位点修改成功！");
            // curUser=$scope.curUser;
            // $scope.resMsg=data;
            // console.log(data+"<loadAllInvolvedChildrenByDid>"+status);
            if (status == 200) {
              //其实也可以得到部门，但是部门暂时没有用

              //如果人员关联的消息数量不为0
              if (data) {
                // 广播用户发来的消息查询成功
                $rootScope.$broadcast('readMessage', data);
              }
            } else {
              // 广播用户发来的消息列表刷新失败
              $rootScope.$broadcast('readMessageFail', data);
            }
            ;
          }).error(function (data, status, headers, config) {

        });
      },
      //读一个系统消息，同时修改本地缓存 messagespromptboth
      readMessagepromptByID: function (messageID, applicationServer) {
        //保存提交到服务器
        $http({
          method: 'POST',
          url: applicationServer + 'message/readtMessage',
          //params:{personid:curUserId},
          data: {
            messID: messageID
          },
          headers: {'Content-Type': 'application/json;charset=utf-8'},
          dataType: 'JSON'
        })
          .success(function (data, status, headers, config) {
              if (data) {
                var mes=localStorageService.get('messagespromptboth'+$rootScope.curUser._id,30)
                if(mes){
                  for(var i=0;i<mes.length;i++){
                    if(mes[i]._id==messageID){
                      mes.splice(i,1)
                    }
                  }
                  localStorageService.update('messagespromptboth'+$rootScope.curUser._id,mes)
                }
              }else{
                console.log(mes);
              }
          }).error(function (data, status, headers, config) {

        });
      },

      sendMessage: function (messageJson, senderID, receiverID, applicationServer) {
        //保存提交到服务器
        $http({
          method: 'POST',
          url: applicationServer + 'message/sendAMessage',
          //params:{personid:curUserId},
          data: {
            'messageObj': messageJson,
            'senderID': senderID,
            'receiverID': receiverID
          },
          headers: {'Content-Type': 'application/json;charset=utf-8'},
          dataType: 'JSON'
        })
          .success(function (data, status, headers, config) {
            if (status == 200) {
              //其实也可以得到部门，但是部门暂时没有用

              //返回值是新消息
              if (data) {
                // 广播用户发消息成功
                $rootScope.$broadcast('sendMessageOK', data);
              }
            } else {
              // 广播用户发消息失败
              $rootScope.$broadcast('sendMessageFail', data);
            }
            ;
          }).error(function (data, status, headers, config) {

        });
      },
      //根据接收者和发送者的id，以及时间段，获取这段时间的聊天记录
      initMessageListInTimeSpanByPersonIds: function (sender_id, receiver_id, startTime, lastTime, applicationServer, callback) {
        console.log(receiver_id + " initMessageListInTimeSpanByPersonIds " + sender_id + "<>startTime" + startTime + "<>lastTime" + lastTime);
        //保存提交到服务器
        $http({
          method: 'POST',
          url: applicationServer + 'message/getMessagesInATimeSpanFromWho',
          //params:{personid:curUserId},
          data: {
            receiverID: receiver_id,
            senderID: sender_id,
            startTime: startTime,
            lastTime: lastTime,
            type: 'message'
          },
          headers: {'Content-Type': 'application/json;charset=utf-8'},
          dataType: 'JSON'
        })
          .success(function (data, status, headers, config) {
            //alert("用户定位点修改成功！");
            // curUser=$scope.curUser;
            // $scope.resMsg=data;
            console.log(data)
            // console.log(data+"<loadAllInvolvedChildrenByDid>"+status);
            if (status == 200) {
              //如果人员关联的消息数量不为0
              if (data.length > 0) {
                for (var index = 0; index < data.length; index++) {
                  var item = data[index];
                  // 把时间格式化一下
                  item.create_date = new Date(item.create_date).formate('yyyy-MM-dd hh:mm:ss');
                }
                localStorageService.update("messagesListboth" + sender_id + '_' + receiver_id, data);

                var strdd = JSON.stringify(data);
                console.log('<initMessageListInTimeSpanByPersonIds>' + strdd);
                // 广播用户发来的消息查询成功
                $rootScope.$broadcast('bothMessageListRefreshed', {
                  sender_id: sender_id,
                  receiver_id: receiver_id
                });
              }
            } else {
              // 广播用户发来的消息列表刷新失败
              $rootScope.$broadcast('bothMessageListRefreshFail', data);
            }
            ;
          }).error(function (data, status, headers, config) {

        });
      }
      ,
      // 根据发送者和接收者的id，得到他们最近的未读消息摘要
      initMessageListByPersonIds: function (sender_id, receiver_id, applicationServer, callback) {
        console.log(receiver_id + "去服务器刷新 initMessageListByPersonIds " + sender_id);
        //保存提交到服务器
        $http({
          method: 'POST',
          url: applicationServer + 'message/getMyNewestMessageFromWho',
          //params:{personid:curUserId},
          data: {
            receiverID: receiver_id,
            senderID: sender_id,
            isAbstract: true
          },
          headers: {'Content-Type': 'application/json;charset=utf-8'},
          dataType: 'JSON'
        })
          .success(function (data, status, headers, config) {
            //alert("用户定位点修改成功！");
            // curUser=$scope.curUser;
            // $scope.resMsg=data;
            // console.log(data+"<loadAllInvolvedChildrenByDid>"+status);
            if (status == 200) {
              //其实也可以得到部门，但是部门暂时没有用

              //如果人员关联的消息数量不为0
              if (data.sender && data.count > 0) {
                // 继续列出来
                // sender.messageabstract=data.abstract; 文字摘要
                // sender.messagecount=data.count; 未读消息总数
                // sender.messagelastTime=data.lastTime; 最近一条消息的时间
                localStorageService.update("messagesByUserID" + sender_id, data);

                var strdd = JSON.stringify(data);
                console.log('<initMessageListByPersonIds>' + strdd);
                // 广播用户发来的消息查询成功
                $rootScope.$broadcast('messageListRefreshed', data);
              }
            } else {
              // 广播用户发来的消息列表刷新失败
              $rootScope.$broadcast('messageListRefreshFail', data);
            }
            ;
          }).error(function (data, status, headers, config) {

        });
      }
      ,
      // 原来的初始化不是用我们的json，根据发送者和接收者的整个对象，得到他们最近的未读消息摘要
      initMessageListByPerson: function (sender, receiver, applicationServer, callback) {

        console.log(receiver + "去服务器刷新 initMessageListByPerson " + sender);
        // var strdd = JSON.stringify(sender);
        //   console.log(sender.name+'<initMessageListByPerson>'+ strdd);//images.coverSmall
        //保存提交到服务器
        $http({
          method: 'POST',
          url: applicationServer + 'message/getMyNewestMessageFromWho',
          //params:{personid:curUserId},
          data: {
            receiverID: receiver._id,
            senderID: sender._id,
            isAbstract: true
          },
          headers: {'Content-Type': 'application/json;charset=utf-8'},
          dataType: 'JSON'
        })
          .success(function (data, status, headers, config) {
            //alert("用户定位点修改成功！");
            // curUser=$scope.curUser;
            // $scope.resMsg=data;
            // console.log(data+"<loadAllInvolvedChildrenByDid>"+status);
            if (status == 200) {
              //其实也可以得到部门，但是部门暂时没有用

              //如果人员关联的消息数量不为0
              if (data.sender && data.count > 0) {
                // 继续列出来
                sender.messageabstract = data.abstract;
                sender.messagecount = data.count;
                sender.messagelastTime = data.lastTime;

                sender.messagestartTime = data.startTime;
                // sender.unreadmessages=data.unreadmessages;
                localStorageService.update("messagesByUserID" + sender._id, sender);

                // 广播用户发来的消息查询成功
                $rootScope.$broadcast('messageListRefreshed', sender);
              }
            } else {
              sender.messageabstract = '没有消息。。。';
              sender.messagecount = 0;
              localStorageService.update("messagesByUserID" + sender._id, sender);
              // 广播用户发来的消息列表刷新失败
              $rootScope.$broadcast('messageListRefreshFail', sender);
            }
            ;
          }).error(function (data, status, headers, config) {

        });

      },
      getAllMessages: function () {

        var messages = new Array();
        var i = 0;
        var messageID = localStorageService.get("messageUserIDs");
        var length = 0;
        var message = null;
        if (messageID) {
          length = messageID.length;

          for (; i < length; i++) {
            message = localStorageService.get("message_" + messageID[i]._id);
            if (message) {
              messages.push(message);
            }
          }
          dateService.handleMessageDate(messages);
          return messages;
        }
        return null;

      },
      getMessageByBothId: function (senderid, reciverId) {
        //两个人的聊天记录有唯一的缓存
        return localStorageService.get("messagesListboth" + senderid + '_' + reciverId, 24 * 60);
      },
      // 根据需要的数量，从缓存聊天记录中取出指定num条，进行数据返回，进一步进行显示
      getAmountMessageByBothId: function (num, senderid, reciverId) {
        var messages = [];
        var message = localStorageService.get("messagesListboth" + senderid + '_' + reciverId, 24 * 60);
        var length = 0;
        if (num < 0 || !message) return;
        length = message.length;
        if (num < length) {
          messages = message.splice(length - num, length);
          return messages;
        } else {
          return message;
        }
      },
      readAbnormal:function(abnormalID,messID,curUserID,decision,callback){
        $http({
         method: 'POST',
         url: $rootScope.applicationServerpath + 'message/readtAbnormalMessage',//人员统计接口
          data:{
            abnormalID:abnormalID,
            messID:messID,
            curUserID:curUserID,
            decision:decision
          }
        }).then(function (resp) {
         console.log('返回数据')
         console.log(resp.data)
          if(resp.data){
            var mes=localStorageService.get('messagespromptboth'+curUserID,24*60)
            if(mes) {
              for (var i = 0; i < mes.length; i++) {
                if (mes[i]._id == messID) {
                  mes.splice(i, 1)
                }
              }
              localStorageService.update('messagespromptboth' + curUserID, mes);
              $rootScope.promptboth=mes;
            }
            callback(resp.data)
          }
        })
      }
    };
  }
]);

app.factory('ChatService', ['localStorageService', 'localToolService', 'dateService', '$http', '$rootScope', 'Upload', '$timeout', '$q', function (localStorageService, localToolService, dateService, $http, $rootScope, Upload, $timeout, $q) {
  //跟聊天有关的服务全部注册出来
  var service = {};

  service.showModal = function () {

  };

  /***************************************************/
  //service的粒子性服务
  //注意：mvc的解耦

  //获得 聊天对象
  // chatID聊天号码
  service.getChat = function (chatID, callback) {

  }

  //获得一个 聊天所涉及人员
  service.getPersonsByChatID = function (chatID, callback) {

  }

  //获得当前 聊天 指定时间段聊天记录，一般有1周、3天和1天
  service.getChatDocsInTimeSpan = function (chatID, callback) {

  }

  //得到当前 聊天的最新记录，最新的10条记录
  service.getLastChatDocs = function (chatID, callback) {

  }

  //得到当前 聊天一段时间内的位置点
  service.getPersonLocatedGrid = function (chatID, timeSpan, callback) {

  }

  //得到当前 聊天收到的工作消息
  service.getPersonLocatedGrid = function (chatID, timeSpan, callback) {

  }

  //得到当前 聊天收到的工作消息
  service.getPersonLocatedGrid = function (chatID, timeSpan, callback) {

  }

  service.uploadVideoFile = function (file, errFiles, callback) {
    if (file) {
      file.upload = Upload.upload({
        url: $rootScope.applicationServerpath + "fileupload/video",
        data: {"file": file, fileKey: "file"}
      });
      console.log('开始上传文件');

      file.upload.then(function (response) {
        $timeout(function () {
          file.result = response.data;
          if (response.data) {
            console.log('上传文件返回信息：' + JSON.stringify(response.data));
            if (callback) {
              callback(response.data);
            }
          }
          else
            console.log('上传文件失败：' + JSON.stringify(response.data));
        });
      }, function (response) {
        if (response.status > 0)
          var errorMsg = response.status + ': ' + response.data;
      }, function (evt) {
        file.progress = Math.min(100, parseInt(100.0 *
          evt.loaded / evt.total));
      });
    }
  }


  service.uploadImagefile = function (file, errFiles, callback,format) {
    if (file) {
      file.upload = Upload.upload({
        url: $rootScope.applicationServerpath + "fileupload/photo",
        data: {"file": file,fileKey: "file"}
      });
      console.log('开始上传文件');

      file.upload.then(function (response) {
        $timeout(function () {
          file.result = response.data;
          response.data.filename=response.data.filename.replace(response.data.filename.slice(-3),format)
          if (response.data) {
            console.log('上传文件返回信息：' + JSON.stringify(response.data));
            if (callback) {
              callback(response.data);
            }
          }
          else
            console.log('上传文件失败：' + JSON.stringify(response.data));
        });
      }, function (response) {
        if (response.status > 0)
          var errorMsg = response.status + ': ' + response.data;
      }, function (evt) {
        file.progress = Math.min(100, parseInt(100.0 *
          evt.loaded / evt.total));
      });
    }
  }

  service.uploadPic = function (uri, uploadDir, mimetype) {
    var uploadDir = $rootScope.applicationServer + "/filedirectupload/photo";
    // uploadDir=$rootScope.applicationServer+"/filedirectupload/photo";
    // uploadDir=$rootScope.applicationServer+"/filedirectupload/IDCard";
    // mimetype="video/mp4";
    // mimetype="audio/m4a";
    //默认是图片
    // if(!mimetype){mimetype="image/jpg";}
    // 注意此处设置的fileKey，Express服务端中也需要这个
    var fileURL = uri;
    var options = new FileUploadOptions();
    options.fileKey = "file";
    options.fileName = fileURL.substr(fileURL.lastIndexOf('/') + 1);
    options.mimeType = mimetype;//注意身份证识别只认jpg，而文件上传服务器是根据这里的mimttype确定文件扩展名的，所以从jpeg改为jpg
    options.chunkedMode = true;


    var ft = new FileTransfer();


    //这里将图片上传到指定网址
    ft.upload(fileURL, uploadDir, function (data) {
      // 设置图片新地址
      var resp = data.response;
      console.log(resp);
//								alert(resp);
      alert("上传后返回值：" + resp + "\n" + (resp.fileType == 'IDCard'));
      //必须得parse一下，否则就会变成字符串
      var pit = JSON.parse(resp);
      alert("上传后返回值：" + pit + "\n" + (pit.fileType == 'IDCard'));
      if (pit.fileType && pit.fileType == 'IDCard') {
        alert("上传后ok");
        $scope.processIDcard(pit.filename);

      }
      $ionicLoading.hide();
    }, function (error) {
//								alert(error);
      $ionicLoading.hide();
    }, options);


  }

  // 消息服务
  service.readMessageByID = function (messageID, applicationServer) {
    //保存提交到服务器
    $http({
      method: 'POST',
      url: applicationServer + 'message/readtMessage',
      //params:{personid:curUserId},
      data: {
        messID: messageID
      },
      headers: {'Content-Type': 'application/json;charset=utf-8'},
      dataType: 'JSON'
    })
      .success(function (data, status, headers, config) {
        //alert("用户定位点修改成功！");
        // curUser=$scope.curUser;
        // $scope.resMsg=data;
        // //console.log(data+"<loadAllInvolvedChildrenByDid>"+status);
        if (status == 200) {
          //其实也可以得到部门，但是部门暂时没有用

          //如果人员关联的消息数量不为0
          if (data) {
            // 广播用户发来的消息查询成功
            $rootScope.$broadcast('readMessage', data);
          }
        } else {
          // 广播用户发来的消息列表刷新失败
          $rootScope.$broadcast('readMessageFail', data);
        }
      }).error(function (data, status, headers, config) {

    });
  }

  service.sendMessage = function (messageJson, senderID, receiverID, applicationServer) {
    //保存提交到服务器
    $http({
      method: 'POST',
      url: applicationServer + 'message/sendAMessage',
      //params:{personid:curUserId},
      data: {
        'messageObj': messageJson,
        'senderID': senderID,
        'receiverID': receiverID
      },
      headers: {'Content-Type': 'application/json;charset=utf-8'},
      dataType: 'JSON'
    })
      .success(function (data, status, headers, config) {
        if (status == 200) {
          //其实也可以得到部门，但是部门暂时没有用

          //返回值是新消息
          if (data) {
            //console.log("发送消息到服务器成功："+JSON.stringify(data));
            // 广播用户发消息成功
            $rootScope.$broadcast('sendMessageOK', data);
          }
        } else {
          // 广播用户发消息失败
          $rootScope.$broadcast('sendMessageFail', data);
        }
      }).error(function (data, status, headers, config) {

    });
  }


  // 原来的初始化不是用我们的json，根据发送者和接收者的整个对象，得到他们最近的未读消息摘要
  service.initMessageListByPersonIDs = function (senderID, receiverID, applicationServer, callback) {
    var deferred = $q.defer(); // 声明延后执行，表示要去监控后面的执行
    console.log(receiver + "去服务器刷新 initMessageListByPerson " + sender);
    // var strdd = JSON.stringify(sender);
    //   console.log(sender.name+'<initMessageListByPerson>'+ strdd);//images.coverSmall
    //保存提交到服务器
    $http({
      method: 'POST',
      url: applicationServer + 'message/getMyNewestMessageFromWho',
      //params:{personid:curUserId},
      data: {
        receiverID: receiver._id,
        senderID: sender._id,
        isAbstract: true
      },
      headers: {'Content-Type': 'application/json;charset=utf-8'},
      dataType: 'JSON'
    })
      .success(function (data, status, headers, config) {
        //alert("用户定位点修改成功！");
        // curUser=$scope.curUser;
        // $scope.resMsg=data;
        // console.log(data+"<loadAllInvolvedChildrenByDid>"+status);
        if (status == 200) {
          //其实也可以得到部门，但是部门暂时没有用

          //如果人员关联的消息数量不为0
          if (data.sender && data.count > 0) {

            deferred.resolve(data);  // 声明执行成功，即http请求数据成功，可以返回数据了
            // 继续列出来
            // sender.messageabstract = data.abstract;
            // sender.messagecount = data.count;
            // sender.messagelastTime = data.lastTime;
            //
            // sender.messagestartTime = data.startTime;

          }
        }
      }).error(function (data, status, headers, config) {
      deferred.reject(data);   // 声明执行失败，即服务器返回错误
    });

    return deferred.promise;   // 返回承诺，这里并不是最终数据，而是访问最终数据的API
  }


  // 原来的初始化不是用我们的json，根据发送者和接收者的整个对象，得到他们最近的未读消息摘要
  service.initMessageListByPerson = function (sender, receiver, applicationServer, callback) {
    var deferred = $q.defer(); // 声明延后执行，表示要去监控后面的执行
    console.log(receiver + "去服务器刷新 initMessageListByPerson " + sender);
    // var strdd = JSON.stringify(sender);
    //   console.log(sender.name+'<initMessageListByPerson>'+ strdd);//images.coverSmall
    //保存提交到服务器
    $http({
      method: 'POST',
      url: applicationServer + 'message/getMyNewestMessageFromWho',
      //params:{personid:curUserId},
      data: {
        receiverID: receiver._id,
        senderID: sender._id,
        isAbstract: true
      },
      headers: {'Content-Type': 'application/json;charset=utf-8'},
      dataType: 'JSON'
    })
      .success(function (data, status, headers, config) {
        //alert("用户定位点修改成功！");
        // curUser=$scope.curUser;
        // $scope.resMsg=data;
        // console.log(data+"<loadAllInvolvedChildrenByDid>"+status);
        if (status == 200) {
          //其实也可以得到部门，但是部门暂时没有用

          //如果人员关联的消息数量不为0
          if (data.sender && data.count > 0) {

            deferred.resolve(data);  // 声明执行成功，即http请求数据成功，可以返回数据了
            // 继续列出来
            sender.messageabstract = data.abstract;
            sender.messagecount = data.count;
            sender.messagelastTime = data.lastTime;

            sender.messagestartTime = data.startTime;
            // sender.unreadmessages=data.unreadmessages;
            localStorageService.update("messagesByUserID" + sender._id, sender);

            // 广播用户发来的消息查询成功
            $rootScope.$broadcast('messageListRefreshed', sender);
          }
        } else {
          sender.messageabstract = '没有消息。。。';
          sender.messagecount = 0;
          localStorageService.update("messagesByUserID" + sender._id, sender);
          // 广播用户发来的消息列表刷新失败
          $rootScope.$broadcast('messageListRefreshFail', sender);
        }
      }).error(function (data, status, headers, config) {
      deferred.reject(data);   // 声明执行失败，即服务器返回错误
    });

    return deferred.promise;   // 返回承诺，这里并不是最终数据，而是访问最终数据的API
  }

  //根据接收者和发送者的id，以及时间段，获取这段时间的聊天记录
  service.initMessageListInTimeSpanByPersonIds = function (sender_id, receiver_id, startTime, lastTime, applicationServer, callback) {
    //console.log(receiver_id+" initMessageListInTimeSpanByPersonIds "+sender_id+"<>startTime"+startTime+"<>lastTime"+lastTime);
    //保存提交到服务器
    $http({
      method: 'POST',
      url: applicationServer + 'message/getMessagesInATimeSpanFromWho',
      //params:{personid:curUserId},
      data: {
        receiverID: receiver_id,
        senderID: sender_id,
        startTime: startTime,
        lastTime: lastTime
      },
      headers: {'Content-Type': 'application/json;charset=utf-8'},
      dataType: 'JSON'
    })
      .success(function (data, status, headers, config) {
        //alert("用户定位点修改成功！");
        // curUser=$scope.curUser;
        // $scope.resMsg=data;
        // //console.log(data+"<loadAllInvolvedChildrenByDid>"+status);
        if (status == 200) {
          //如果人员关联的消息数量不为0
          if (data.length > 0) {
            for (var index = 0; index < data.length; index++) {
              localToolService.insertANewMessageToMessageList(sender_id, receiver_id, data[index]);
            }
          } else {
            // localStorageService.update("messagesListboth" + sender_id+'_'+receiver_id,data);
          }
          // var strdd = JSON.stringify(data);
          // //console.log('<initMessageListInTimeSpanByPersonIds>'+ strdd);
          // 广播用户发来的消息查询成功
          $rootScope.$broadcast('bothMessageListRefreshed', {sender_id: sender_id, receiver_id: receiver_id});
        } else {
          // 广播用户发来的消息列表刷新失败
          $rootScope.$broadcast('bothMessageListRefreshFail', data);
        }
      }).error(function (data, status, headers, config) {

    });
  }

  // 根据发送者和接收者的id，得到他们最近的未读消息摘要
  service.refreshMessageListByPersonIdsSyn = function (sender_id, receiver_id, applicationServer) {
    // console.log(receiver_id+"去服务器刷新 refreshMessageListByPersonIdsSyn "+sender_id);
    var deferred = $q.defer(); // 声明延后执行，表示要去监控后面的执行
    //保存提交到服务器
    $http({
      method: 'POST',
      url: applicationServer + 'message/getMyNewestMessageFromWho',
      //params:{personid:curUserId},
      data: {
        receiverID: receiver_id,
        senderID: sender_id,
        isAbstract: true
      },
      headers: {'Content-Type': 'application/json;charset=utf-8'},
      dataType: 'JSON'
    })
      .success(function (data, status, headers, config) {
        //alert("用户定位点修改成功！");
        // curUser=$scope.curUser;
        // $scope.resMsg=data;
        // //console.log(data+"<loadAllInvolvedChildrenByDid>"+status);
        if (status == 200) {
          //其实也可以得到部门，但是部门暂时没有用

          //如果人员关联的消息数量不为0
          if (data.sender && data.count > 0) {
            // 继续列出来
            // sender.messageabstract=data.abstract; 文字摘要
            // sender.messagecount=data.count; 未读消息总数
            // sender.messagelastTime=data.lastTime; 最近一条消息的时间

            // console.log(data+"<refreshMessageListByPersonIdsSyn未读消息>"+status);
            deferred.resolve(data);  // 声明执行成功，即http请求数据成功，可以返回数据了
          }
        } else {
          deferred.reject(data);   // 声明执行失败，即服务器返回错误
        }
        ;
      }).error(function (data, status, headers, config) {
      deferred.reject(data);   // 声明执行失败，即服务器返回错误

    });

    return deferred.promise;   // 返回承诺，这里并不是最终数据，而是访问最终数据的API
  }

  service.getAllUnreadMessagesSyn = function (receiver_id, applicationServer) {
    console.log(receiver_id + "去服务器刷新所有未读消息 getAllUnreadMessagesSyn " + receiver_id);
    var deferred = $q.defer(); // 声明延后执行，表示要去监控后面的执行
    //保存提交到服务器
    $http({
      method: 'POST',
      url: applicationServer + 'message/getAllUnreadMessages',
      //params:{personid:curUserId},
      data: {
        receiverID: receiver_id
      },
      headers: {'Content-Type': 'application/json;charset=utf-8'},
      dataType: 'JSON'
    })
      .success(function (data, status, headers, config) {
        //alert("用户定位点修改成功！");
        // curUser=$scope.curUser;
        // $scope.resMsg=data;
        console.log(data);
        if (status == 200) {
          //其实也可以得到部门，但是部门暂时没有用

          // console.log("\n"+JSON.stringify(data)+"<消息>"+data.length);
          //如果人员关联的消息数量不为0
          if (data && data.length > 0) {
            // 继续列出来
            // sender.messageabstract=data.abstract; 文字摘要
            // sender.messagecount=data.count; 未读消息总数
            // sender.messagelastTime=data.lastTime; 最近一条消息的时间

            console.log("\n" + data + "<未读消息>" + data.length);
            //如果人员关联的消息数量不为0

            for (var index = 0; index < data.length; index++) {
              if (data[index].type == 'message') {
                localToolService.insertANewMessageToMessageList(data[index].sender, receiver_id, data[index]);
              } else {
                localToolService.insertANewMessageToMessageprompt(data[index].sender, receiver_id, data[index]);
              }
            }
            deferred.resolve(data);  // 声明执行成功，即http请求数据成功，可以返回数据了
          }
        } else {
          deferred.reject(data);   // 声明执行失败，即服务器返回错误
        }
      }).error(function (data, status, headers, config) {
      deferred.reject(data);   // 声明执行失败，即服务器返回错误

    });

    return deferred.promise;   // 返回承诺，这里并不是最终数据，而是访问最终数据的API
  }

  // 根据发送者和接收者的id，得到他们最近的未读消息摘要
  service.refreshMessageListByPersonIds = function (sender_id, receiver_id, applicationServer, callback) {
    console.log(receiver_id + "去服务器刷新 refreshMessageListByPersonIds " + sender_id);
    //保存提交到服务器
    $http({
      method: 'POST',
      url: applicationServer + 'message/getMyNewestMessageFromWho',
      //params:{personid:curUserId},
      data: {
        receiverID: receiver_id,
        senderID: sender_id,
        isAbstract: true
      },
      headers: {'Content-Type': 'application/json;charset=utf-8'},
      dataType: 'JSON'
    })
      .success(function (data, status, headers, config) {
        //alert("用户定位点修改成功！");
        // curUser=$scope.curUser;
        // $scope.resMsg=data;
        // //console.log(data+"<loadAllInvolvedChildrenByDid>"+status);
        if (status == 200) {
          //其实也可以得到部门，但是部门暂时没有用

          //如果人员关联的消息数量不为0
          if (data.sender && data.count > 0) {
            // 继续列出来
            // sender.messageabstract=data.abstract; 文字摘要
            // sender.messagecount=data.count; 未读消息总数
            // sender.messagelastTime=data.lastTime; 最近一条消息的时间
            localStorageService.update("messagesAbstractBySenderID" + sender_id, data);

            var strdd = JSON.stringify(data);
            //console.log('<服务器取回的某人的消息列表initMessageListByPersonIds>'+ strdd);
            // 广播用户发来的消息查询成功,附带参数是sender_id，说明是谁的消息列表
            $rootScope.$broadcast('messageListRefreshed', sender_id);
          }
        } else {
          // 广播用户发来的消息列表刷新失败
          $rootScope.$broadcast('messageListRefreshFail', sender_id);
        }
      }).error(function (data, status, headers, config) {

    });
  }
  // 原来的初始化不是用我们的json，根据发送者和接收者的整个对象，得到他们最近的未读消息摘要
  service.refreshMessageListByPerson = function (sender, receiver, applicationServer, callback) {

    //console.log(receiver+"去服务器刷新 initMessageListByPerson "+sender);
    // var strdd = JSON.stringify(sender);
    //   //console.log(sender.name+'<initMessageListByPerson>'+ strdd);//images.coverSmall
    //保存提交到服务器
    $http({
      method: 'POST',
      url: applicationServer + 'message/getMyNewestMessageFromWho',
      //params:{personid:curUserId},
      data: {
        receiverID: receiver._id,
        senderID: sender._id,
        isAbstract: true
      },
      headers: {'Content-Type': 'application/json;charset=utf-8'},
      dataType: 'JSON'
    })
      .success(function (data, status, headers, config) {
        //alert("用户定位点修改成功！");
        // curUser=$scope.curUser;
        // $scope.resMsg=data;
        // //console.log(data+"<loadAllInvolvedChildrenByDid>"+status);
        if (status == 200) {
          //其实也可以得到部门，但是部门暂时没有用

          //如果人员关联的消息数量不为0
          if (data.sender && data.count > 0) {
            // 继续列出来
            sender.messageabstract = data.abstract;
            sender.messagecount = data.count;
            sender.messagelastTime = data.lastTime;

            sender.messagestartTime = data.startTime;
            // sender.unreadmessages=data.unreadmessages;
            localStorageService.update("messagesAbstractBySenderID" + sender._id, sender);

            // 广播用户发来的消息查询成功
            $rootScope.$broadcast('messageListRefreshed', sender);
          }
        } else {
          sender.messageabstract = '没有消息。。。';
          sender.messagecount = 0;
          localStorageService.update("messagesAbstractBySenderID" + sender._id, sender);
          // 广播用户发来的消息列表刷新失败
          $rootScope.$broadcast('messageListRefreshFail', sender);
        }
        ;
      }).error(function (data, status, headers, config) {

    });

  },
    service.getAllMessages = function () {

      var messages = new Array();
      var i = 0;
      var messageID = localStorageService.get("messageUserIDs");
      var length = 0;
      var message = null;
      if (messageID) {
        length = messageID.length;

        for (; i < length; i++) {
          message = localStorageService.get("message_" + messageID[i]._id);
          if (message) {
            messages.push(message);
          }
        }
        dateService.handleMessageDate(messages);
        return messages;
      }
      return null;

    }
  service.getMessageByBothId = function (senderid, reciverId) {
    //两个人的聊天记录有唯一的缓存
    return localStorageService.get("messagesListboth" + senderid + '_' + reciverId, 60 * 24);
  }
  // 根据需要的数量，从缓存聊天记录中取出指定num条，进行数据返回，进一步进行显示
  service.getAmountMessageByBothId = function (num, senderid, reciverId) {
    var messages = [];
    var message = localStorageService.get("messagesListboth" + senderid + '_' + reciverId, 24 * 60);
    var length = 0;
    if (num < 0 || !message) return;
    length = message.length;
    if (num < length) {
      messages = message.splice(length - num, length);
      return messages;
    } else {
      return message;
    }
  }


  return service
}]);