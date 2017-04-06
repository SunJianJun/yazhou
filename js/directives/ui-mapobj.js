//
app.directive('gd-map', function ($timeout,$window) {
    return {
        restrict: 'EA',
        // scope: {
        //     point: '=?',
        // },
        template: '<div></div>',
        replace: true,
        link: function (scope, el, attr, ctrl) {

            scope.map = new AMap.Map(el[0], {
                resizeEnable: true,
                zoom: 12
            });

            //自动最大化高度
            var winowHeight = $window.innerHeight; //获取窗口高度
            var headerHeight = 80;
            var footerHeight = 20;
            el.css('min-height',
                (winowHeight - headerHeight - footerHeight) + 'px');
          /*
           if (scope.point.lat && scope.point.lng) {
           var center = [scope.point.lng, scope.point.lat]
           scope.map.setCenter(center)
           scope.marker = new AMap.Marker({ map: scope.map })
           scope.marker.setPosition(center)
           }
           */

            //加入缩放工具栏
            scope.map.addControl(new AMap.ToolBar());
            //加入鹰眼
            scope.map.addControl(new AMap.OverView());

            // scope.map.on('click', function (e) {
            //     scope.$emit('map-click', e)
            //
            //     if (!scope.marker) {
            //         scope.marker = new AMap.Marker({ map: scope.map })
            //     }
            //
            //
            //     scope.marker.setPosition([e.lnglat.getLng(), e.lnglat.getLat()])
            // })
            //
            // scope.$on('setCenter', function (event, center) {
            //     if (!scope.map) return
            //     scope.map.setCenter(center)
            // })

        }
    }
});