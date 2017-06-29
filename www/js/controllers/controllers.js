angular.module('englishLetterByLetter.controllers', [])

.controller('ModesCtrl', function($scope, $rootScope, $window, Utils) {
	$rootScope.topPanelHeigth = 44;
	$rootScope.bottomPanelHeight = 49;
	$rootScope.viewWidth = $window.innerWidth;
	$rootScope.viewHeight = $window.innerHeight;

	Utils.setGameModes();
})

.controller('HelpCtrl', function($scope) {});
