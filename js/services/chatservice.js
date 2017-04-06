var app = angular.module('app');
		//跟聊天有关的服务全部注册出来
    app.factory('ChatService', ['$uibModal', function ($http,$rootScope,$uibModal) {
        var service = {};

        service.showModal = function () {};
        
        /***************************************************/
        //service的粒子性服务
        //注意：mvc的解耦
        
        //获得 聊天对象
        // chatID聊天号码
        service.getChat = function (chatID,callback) {
        	
        	}

        //获得一个 聊天所涉及人员
        service.getPersonsByChatID = function ( chatID,callback) {
        	
        	}
        	
       	//获得当前 聊天 指定时间段聊天记录，一般有1周、3天和1天
       	service.getChatDocsInTimeSpan = function ( chatID,callback) {
        	
        	}
        	
        //得到当前 聊天的最新记录，最新的10条记录
       	service.getLastChatDocs = function ( chatID,callback) {
        	
        	}
        		
        //得到当前 聊天一段时间内的位置点
       	service.getPersonLocatedGrid = function ( chatID,timeSpan,callback) {
        	
        	}
        	
        //得到当前 聊天收到的工作消息
       	service.getPersonLocatedGrid = function ( chatID,timeSpan,callback) {
        	
        	}
        	        	
        //得到当前 聊天收到的工作消息
       	service.getPersonLocatedGrid = function ( chatID,timeSpan,callback) {
        	
        	}
        	
        	
        return service
    }]);