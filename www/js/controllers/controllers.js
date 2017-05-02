angular.module('englishLetterByLetter.controllers', [])

.controller('ModesCtrl', function($scope, $rootScope, Utils) {
  Utils.setGameModes();
})

.controller('HelpCtrl', function($scope) {});
