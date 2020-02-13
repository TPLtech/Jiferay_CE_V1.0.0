angular.module('signupModule', ['ui.router'])
  .config(function($stateProvider, $urlRouterProvider) {
    $stateProvider.state('signup', {
      //url: '/signup',
      controller: 'signupController',
      templateUrl: '/javascripts/module/homePagesModule/signup/homeModule.html',
      jp_app_name: 'registrazione',
      Jp_app_version: 'v1.0.0',
      Jp_app_menu: 'signup'
    });
  });

angular.module('signupModule')
  .controller('signupController', function($rootScope, $scope, $state, $http) {
    $scope.text = "Io sono Signup";


    $scope.postsignup = function() {
      $scope.err = false;
      console.log("post signup");
      if ($scope.errUsername == false || $scope.errEmail == false || $scope.errTelefono == false) {
        if ($scope.password == $scope.RE_password) {
          $http.post('/signupV2', {
            username: $scope.username,
            password: $scope.password,
            email: $scope.email,
            number: $scope.number,
            IMEI: "0"
          }).then(function(response) {
            if (response.data == "ko_sign") {
              console.log("errore ko_username");
              $scope.err = true;
            }
            else {
              console.log("signup eseguito");

              $state.go('home');
            }
          }, function(err) {
            console.log("errore post signup:  " + JSON.stringify(err));

            //gestire caso utente gia creato
            $scope.error = true;

          });
        }
        else {
          console.log("controllare password e RE_password");
        }
      }
      else {
        $scope.err = true;
      }
    }; //postsignup



    $scope.controlloUsername = function() {
      $scope.errUsername = false;
      $scope.vUsername = false;
      console.log("controlloUsername------------" + $rootScope.nomeClub);
      var cmdSql = {
        param0: 'mysql',
        param1: 'select',
        param2: 'SELECT username FROM users;',
        param3: '.',
        param4: '.',
        param5: '.',
      };
      console.log('cmdSql ', cmdSql.param2);
      $http.post('/ajax_mysql', cmdSql)
        .then(function(response) {
          if ($scope.username == null || $scope.username == "")
            $scope.vUsername = true;
          for (var i = 0; i < response.data.length; i++) {
            if (response.data[i].username.toUpperCase() == $scope.username.toUpperCase()) {
              $scope.errUsername = true;
            }
          }
        }, function(err) {
          console.log("//////////////////////////////////////errore:  " + JSON.stringify(err));
        });
    };



    $scope.controlloMail = function() {
      $scope.errEmail = false;
      $scope.vEmail = false;
      console.log("controlloMail------------" + $rootScope.nomeClub);
      var cmdSql = {
        param0: 'mysql',
        param1: 'select',
        param2: 'SELECT email FROM users;',
        param3: '.',
        param4: '.',
        param5: '.',
      };
      console.log('cmdSql ', cmdSql.param2);
      $http.post('/ajax_mysql', cmdSql)
        .then(function(response) {
          if ($scope.email == null || $scope.email == "")
            $scope.vEmail = true;
          for (var i = 0; i < response.data.length; i++) {
            if (response.data[i].email.toUpperCase() == $scope.email.toUpperCase()) {
              $scope.errEmail = true;
            }
          }
        }, function(err) {
          console.log("//////////////////////////////////////errore:  " + JSON.stringify(err));
        });
    };



    $scope.controlloTelefono = function() {
      $scope.errTelefono = false;
      $scope.vTelefono = false;
      console.log("controlloMail------------" + $rootScope.nomeClub);
      var cmdSql = {
        param0: 'mysql',
        param1: 'select',
        param2: 'SELECT number FROM users;',
        param3: '.',
        param4: '.',
        param5: '.',
      };
      console.log('cmdSql ', cmdSql.param2);
      $http.post('/ajax_mysql', cmdSql)
        .then(function(response) {
          if ($scope.number == null || $scope.number == "")
            $scope.vTelefono = true;
          for (var i = 0; i < response.data.length; i++) {
            if (response.data[i].number.toUpperCase() == $scope.number.toUpperCase()) {
              $scope.errTelefono = true;
            }
          }
        }, function(err) {
          console.log("//////////////////////////////////////errore:  " + JSON.stringify(err));
        });
    };

    $scope.controlloPsw = function() {
      $scope.vPsw = false;
      if ($scope.password == null || $scope.password == "")
        $scope.vPsw = true;
    }
    
    $scope.controlloRePsw = function() {
      $scope.errPsw = false;
      if ($scope.password != $scope.RE_password)
        $scope.errPsw = true;
    }

  });
