var app = angular.module('app');
		//跟地图有关的服务全部注册出来
    app.factory('LocationService', ['$uibModal', function ($http,$rootScope,$uibModal) {
        var service = {};

        service.showModal = function (point) {

            var modalInstance = $uibModal.open({
                //animation: false,
                templateUrl: 'GdMapModal.html',
                controller: ['$scope', '$uibModalInstance', 'point', controller],
                size: 'lg',
                resolve: {
                    point: function () {
                        return point;
                    },
                }
            });
            return modalInstance;
        }
        
        /***************************************************/
        //service的粒子性服务
        //注意：mvc的解耦
        
        //绘制一个人的点
        //mapObj不同的地图控件,personObj人员对象
        service.drawPerson = function (mapObj,personObj) {
        	
        	}
        	
        //绘制一个人的轨迹
        service.drawPersonTrack = function (mapObj,personObj,timeSpan) {
        	
        	}
        	
       	//绘制当前人员所在的网格区域
       	service.getPersonLocatedGrid = function (mapObj,personObj) {
        	
        	}
        	
        //绘制当前人员所属的网格区域
       	service.getPersonBelongedGrid = function (mapObj,personObj) {
        	
        	}
        		
        //绘制当前人员所属的网格区域
       	service.getPersonLocatedGrid = function (mapObj,personObj) {
        	
        	}
       	

        return service
    }]);