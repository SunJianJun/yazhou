angular.module('app')
  .directive('umeditor', ['$location', '$anchorScroll', function($location, $anchorScroll) {
    return {
      restrict: 'AC',
      replace:true,
      link: function() {
                    //实例化编辑器
                    console.log('配置umeditor')
                    var um = UM.getEditor('myEditor');
                    um.addListener('blur', function () {
                        console.log('编辑器失去焦点了')
//                        $('#focush2').html('编辑器失去焦点了')
                    });
                    um.addListener('focus', function () {
                        console.log('编辑器获取焦点')
//                        $('#focush2').html('')
                    });
      }
    };
  }]);