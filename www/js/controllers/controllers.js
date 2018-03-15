angular.module('englishLetterByLetter.controllers', [])

	.controller('ModesCtrl', function ($scope, $rootScope, Utils) {
		Utils.setGameModes();
		Utils.setHeightAndWidth();

		$scope.modesHeight = getModesBlockHeight();
		$scope.modesMarginTop = Math.floor(($rootScope.viewHeight - $rootScope.topPanelHeigth -
			$rootScope.bottomPanelHeight - $scope.modesHeight) / 2);
		$rootScope.hintCounter = null;

		function getModesBlockHeight() {
			if ($rootScope.viewHeight < 360) {
				return 160;
			} else if ($rootScope.viewHeight < 430) {
				return 190;
			} else return 220;
		}
	})

	.controller('SettingsCtrl', function ($ionicPlatform, $scope, $rootScope, $timeout, DB, Utils, WordsTmpl) {
		if (window.cordova) {
			document.addEventListener('deviceready', function () {
				loadAndSetupData();
			});
		} else {
			$ionicPlatform.ready(function () {
				loadAndSetupData();
			});
		}

		function loadAndSetupData() {
			if (!$rootScope.userSettings)
				Utils.setUserSettings();

			if ($rootScope.userSettings) {
				setupData();
			} else {
				Object.defineProperty($rootScope, 'userSettings', {
					configurable: true,
					enumerable: true,
					writeable: true,
					get: function () {
						return this._userSettings;
					},
					set: function (val) {
						this._userSettings = val;
						setupData();
					}
				});
			};
		}

		function setupData() {
			$scope.autoGoNext = !!$rootScope.userSettings.isAutoGoNext;
			$scope.soundsMode = !!$rootScope.userSettings.isSoundsOn;
		}

		$scope.updateAutoGoNext = function (isAutoGoNext) {
			DB.updateAutoGoNextInUserSettings(isAutoGoNext).then(function (res) {
				$scope.autoGoNext = isAutoGoNext;
				$rootScope.userSettings.isAutoGoNext = isAutoGoNext;
			}, function (err) {
				console.error(err);
			});
		};

		$scope.updateSounds = function (isSoundsOn) {
			DB.updateSoundsInUserSettings(isSoundsOn).then(function (res) {
				$scope.soundsMode = isSoundsOn;
				$rootScope.userSettings.isSoundsOn = isSoundsOn;
			}, function (err) {
				console.error(err);
			});
		};

		// $scope.updateData = function () {
		// 	DB.updateData().then(function (res) {
		// 		console.log('Data updated');
		// 	}, function (err) {
		// 		console.error(err);
		// 	});
		// }
	});
