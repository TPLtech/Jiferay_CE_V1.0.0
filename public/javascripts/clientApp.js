angular.module('appModule', [
'ui.router'
,'headerModule'
,'footerModule'
,'loginModule'
,'signupModule'
,'persPageModule'
,'homeModule'
,'chiSiamoModule'
,'ContattaciModule'
,'contentModule'
,'reslangModule'
,'cmdParamsModule'
,'noteLegaliModule'
,'forgotPWDModule'
,'forgotUserModule'
,'serviziModule'
,'progettiModule'

])
    .config(function($stateProvider, $urlRouterProvider) {
        $urlRouterProvider.otherwise("/");
        $stateProvider.state('start', {
            url: '/',
            templateUrl: '/javascripts/module/homePagesModule/home/homeModule.html',
            controller: 'homeController'
        });
    });
