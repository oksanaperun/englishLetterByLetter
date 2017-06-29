angular.module('englishLetterByLetter')

.controller('AchievementsCtrl', function($ionicPlatform, $scope, $rootScope, Utils, WordsDB) {
  if (window.cordova) {
    document.addEventListener('deviceready', function () {
      getThemes();
      Utils.setGameModes();
    });
  } else {
    $ionicPlatform.ready(function () {
      getThemes();
      Utils.setGameModes();
    });
  }

  function getThemes() {
    $scope.themes = [];

    WordsDB.selectThemes().then(function (res) {
      for (var i = 0; i < res.rows.length; i++) {
        $scope.themes.push(res.rows.item(i));
      }

      getAchievements();
    }, function (err) {
      console.error(err);
    });
  }

  function getAchievements() {
    WordsDB.selectAllAchievements().then(function (res) {
      for (var i = 0; i < res.rows.length; i++) {
        for (var j = 0; j < $scope.themes.length; j++) {
          if (res.rows.item(i).themeId === $scope.themes[j].id) {
            $scope.themes[j].achievements = res.rows.item(i);
          }
        }
      }
    }, function (err) {
      console.error(err);
    });
  }

  $scope.$on('$ionicView.enter', function () {
    getAchievements();
  });

	$scope.updateData = function() {
		WordsDB.updateData().then(function (res) {
        console.log('Data updated');
      }, function (err) {
        console.error(err);
    });
	}
})
