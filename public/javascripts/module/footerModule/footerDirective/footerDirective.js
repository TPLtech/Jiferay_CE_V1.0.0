'use strict';
angular.module('footerModule')
.directive('footerDirective', [function(){
	return {
		restrict: 'E',
		templateUrl: '/javascripts/module/footerModule/footerDirective/footerDirective.html',
		replace: true,
		controller: 'footerController'
	};
}]);
