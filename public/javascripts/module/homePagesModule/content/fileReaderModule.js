//Questo file contiene tutte le funzioni necessarie alla funzione $scope.loadFileAsText (in ./contentModule/homeModule.js) per caricare il testo nella textarea

(function(module) {

  var fileReader = function($q) {

    var onLoad = function(reader, deferred, scope) {
      return function() {
        scope.$apply(function() {
          deferred.resolve(reader.result);
        });
      };
    };

    var onError = function(reader, deferred, scope) {
      return function() {
        scope.$apply(function() {
          deferred.reject(reader.result);
        });
      };
    };

    var getReader = function(deferred, scope) {
      var reader = new FileReader();
      reader.onload = onLoad(reader, deferred, scope);
      reader.onerror = onError(reader, deferred, scope);
      return reader;
    };

    var readAsText = function(file, scope) {
      var deferred = $q.defer();

      var reader = getReader(deferred, scope);
      reader.readAsText(file);

      return deferred.promise;
    };

    return {
      readAsText: readAsText
    };
  };

  module.factory("fileReader", ["$q", fileReader]);

}(angular.module("contentModule")));

