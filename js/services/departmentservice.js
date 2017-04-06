var app = angular.module('app');
		//跟地图有关的服务全部注册出来
    app.factory('DepartmentService', ['$uibModal', function ($http,$rootScope,$uibModal) {
        var service = {};

        service.showModal = function () {};
        
        /***************************************************/
        //service的粒子性服务
        //注意：mvc的解耦
        
        //获得部门对象
        //idNum身份证号码
        service.getDepartment = function (idNum,callback) {
        	
        	}
        	
        //获得一个部门所属部门
        service.getParentDepartment = function (idNum,callback) {
        	
        	}
        	
       	//获得当前部门所属部门的全部同事
       	service.getDepartmentsInSameDepartment = function (idNum,callback) {
        	
        	}
        	
        //得到当前部门的最后一个位置
       	service.getLastPostion = function (idNum,callback) {
        	
        	}
        		
        //得到当前部门一段时间内的位置点
       	service.getDepartmentLocatedGrid = function (idNum,timeSpan,callback) {
        	
        	}
        	
        //得到当前部门收到的工作消息
       	service.getDepartmentLocatedGrid = function (idNum,timeSpan,callback) {
        	
        	}
        	        	
        //得到当前部门收到的工作消息
       	service.getDepartmentLocatedGrid = function (idNum,timeSpan,callback) {
        	
        	}
        	
        	
        return service
    }]);