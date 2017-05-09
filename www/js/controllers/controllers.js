angular.module('englishLetterByLetter.controllers', [])

.controller('ModesCtrl', function($scope, $rootScope, $window, Utils) {
	var topPanelHeigth = 44,
		bottomPanelHeight = 49;

	$rootScope.viewWidth = $window.innerWidth;
	$rootScope.viewHeight = $window.innerHeight - topPanelHeigth - bottomPanelHeight;

	Utils.setGameModes();
})

.controller('HelpCtrl', function($scope) {});
