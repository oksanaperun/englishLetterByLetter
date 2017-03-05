angular.module('englishLetterByLetter.controllers', [])

.controller('ModesCtrl', function($scope, $rootScope) {
  $rootScope.gameModes = [
    {id: 1, name: 'Гра без обмежень', iconClass: 'ion-ios-game-controller-b-outline'},
  	{id: 2, name: 'Гра на час', iconClass: 'ion-ios-timer-outline'},
  	{id: 3, name: 'Гра на швидкість', iconClass: 'ion-ios-speedometer-outline'}
  ];
})

.controller('StatsCtrl', function($scope) {})

.controller('HelpCtrl', function($scope) {});
