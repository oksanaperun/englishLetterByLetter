angular.module('englishLetterByLetter.controllers', [])

	.controller('ModesCtrl', function ($scope, $rootScope, Utils) {
		Utils.setGameModes();
		Utils.setHeightAndWidth();
		$scope.modesHeight = getModesBlockHeight();
		$scope.modesMarginTop = Math.floor(($rootScope.viewHeight - $rootScope.topPanelHeigth -
			$rootScope.bottomPanelHeight - $scope.modesHeight) / 2);

		function getModesBlockHeight() {
			if ($rootScope.viewHeight < 360) {
				return 160;
			} else if ($rootScope.viewHeight < 430) {
				return 190;
			} else return 220;
		}
	})

	.controller('HelpCtrl', function ($scope, $rootScope, $timeout, DB, Utils, Firework, WordsTmpl) {
		$scope.updateData = function () {
			DB.updateData().then(function (res) {
				console.log('Data updated');
			}, function (err) {
				console.error(err);
			});
		}
	});
