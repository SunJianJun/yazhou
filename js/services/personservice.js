var app = angular.module('app');
		//跟地图有关的服务全部注册出来
    app.factory('PersonService', ['$uibModal', function ($uibModal) {
        var service = {};

        service.showModal = function () {};
        
        /***************************************************/
        //service的粒子性服务
        //注意：mvc的解耦
        
        //获得人员对象
        //idNum身份证号码
        service.getPerson = function (idNum,callback) {
        	
        	}
        	
        //获得一个人所属部门
        service.getPersonBelongedDepartment = function (idNum,callback) {
        	
        	}
        	
       	//获得当前人员所属部门的全部同事
       	service.getPersonsInSameDepartment = function (idNum,callback) {
        	
        	}
        	
        //得到当前人员的最后一个位置
       	service.getLastPostion = function (idNum,callback) {
        	
        	}
        		
        //得到当前人员一段时间内的位置点
       	service.getPersonLocatedGrid = function (idNum,timeSpan,callback) {
        	
        	}
        	
        //得到当前人员收到的工作消息
       	service.getPersonLocatedGrid = function (idNum,timeSpan,callback) {
        	
        	}
        	        	
        //得到当前人员收到的工作消息
       	service.getPersonLocatedGrid = function (idNum,timeSpan,callback) {
        	
        	}
        	
        	
        return service
    }]);