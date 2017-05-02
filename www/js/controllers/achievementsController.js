angular.module('englishLetterByLetter')

.controller('AchievementsCtrl', function($scope, $rootScope, Utils, WordsDB) {
	getThemes();
  Utils.setGameModes();

  function getThemes() {
    $scope.themes = [];

    WordsDB.selectThemes().then(function (res) {
      for (var i = 0; i < res.rows.length; i++)
        $scope.themes.push(res.rows.item(i));

      getSubThemes(); 
    }, function (err) {
      console.error(err);
    });
  }

  function getSubThemes() {
    var subThemes = [];

    WordsDB.selectSubThemes().then(function (res) {
      for (var i = 0; i < res.rows.length; i++) {
        var subTheme = res.rows.item(i);

        subTheme.maxScores = {};
        subThemes.push(subTheme);
      }

      getMaxScores(subThemes);

      for (var i = 0; i < $scope.themes.length; i++) {
			   $scope.themes[i].subThemes = [];

        for (var j = 0; j < subThemes.length; j++) {
        	if (subThemes[j].themeId == $scope.themes[i].id) {
        		$scope.themes[i].subThemes.push(subThemes[j]);
        	}
        }
    	}
    }, function (err) {
      console.error(err);
    });
  }

  function getMaxScores(subThemes) {
    WordsDB.selectAllMaxScores().then(function (res) {
      for (var i = 0; i < res.rows.length; i++) {
        for (var j = 0; j < subThemes.length; j++) {
          if (res.rows.item(i).subThemeId === subThemes[j].id) {
            subThemes[j].maxScores[res.rows.item(i).gameModeId] = res.rows.item(i).maxScore;
          }
        }
      }
    }, function (err) {
      console.error(err);
    });
  }

  $scope.$on('$ionicView.enter', function () {
    getSubThemes();
  });

	$scope.updateData = function() {
		WordsDB.updateData().then(function (res) {
        console.log('Data updated');
      }, function (err) {
        console.error(err);
    });
	}
})
