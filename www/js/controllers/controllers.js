angular.module('englishLetterByLetter.controllers', [])

.controller('ModesCtrl', function($scope, $rootScope, $window, Utils) {
	$rootScope.topPanelHeigth = 44;
	$rootScope.bottomPanelHeight = 48;
	$rootScope.viewWidth = $window.innerWidth;
	$rootScope.viewHeight = $window.innerHeight;
	$scope.modesHeight = getModesBlockHeight();
	$scope.modesMarginTop = Math.floor(($rootScope.viewHeight - $rootScope.topPanelHeigth - 
		$rootScope.bottomPanelHeight - $scope.modesHeight) / 2);

	Utils.setGameModes();

	function getModesBlockHeight() {
		if ($rootScope.viewHeight < 360) {
			return 144;
		} else if ($rootScope.viewHeight < 430) {
			return 150;
		} else if ($rootScope.viewHeight < 600) {
			return 175;
		} else return 190;
	}
})

.controller('HelpCtrl', function($scope) {});
