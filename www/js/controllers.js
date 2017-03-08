angular.module('englishLetterByLetter.controllers', [])

.controller('ModesCtrl', function($scope, $rootScope) {
  $rootScope.gameModes = [
    {id: 1, name: 'Гра без обмежень', iconClass: 'ion-ios-game-controller-b-outline'},
  	{id: 2, name: 'Гра на час', iconClass: 'ion-ios-timer-outline'},
  	{id: 3, name: 'Гра на швидкість', iconClass: 'ion-ios-speedometer-outline'}
  ];
})

.controller('StatsCtrl', function($scope, $rootScope, WordsDB) {
	$scope.updateData = function() {
		WordsDB.updateData().then(function (res) {
        console.log('Data updated');
      }, function (err) {
        console.error(err);
    });
	}
})

.controller('HelpCtrl', function($scope) {});
