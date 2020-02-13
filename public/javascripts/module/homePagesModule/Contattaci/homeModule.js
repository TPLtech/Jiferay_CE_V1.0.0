angular.module('ContattaciModule', [])
    .config(function($stateProvider) {
        $stateProvider.state('Contattaci', {
            //url: '/Contattaci',
            controller: 'ContattaciController',
            templateUrl: '/javascripts/module/homePagesModule/Contattaci/homeModule.html',
            jp_app_name: 'comeContattarci',
            Jp_app_version: 'v1.0.0',
            Jp_app_menu: 'Contattaci'
        });
    });

angular.module('ContattaciModule')
    .controller('ContattaciController', function($scope,$http) {

        $scope.sendMail =function () {
  
            console.log("sono nel send mail");
             $http.post('/infoMail', {
                          email: "info@tplinfo.com", // questo è il test alla homepage
                          subject: $scope.Memail, // Subject line
                          text: "Oggetto: " + $scope.Moggetto + " <br> " + "Nome: " + $scope.Mnome + " <br> " + "Telefono: " + $scope.Mtelefono + " <br> " + "Aienda: " + $scope.Mazienda + " <br> " + "Richiesta: " + $scope.Mrich , // plain text body
                      }).then(function(response) {
                          console.log("mail inviata:" + response.data);
                              alert("Mail inviata con Successo!");
                      }, function(err) {
                          console.log("/mailer errore post:  " + JSON.stringify(err));
                          //gestire caso utente gia creato
                          $scope.error = true;
          
                      });
          
          };
    
 });