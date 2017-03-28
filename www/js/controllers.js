angular.module('englishLetterByLetter.controllers', [])

.controller('ModesCtrl', function($scope, $rootScope, Utils) {
  Utils.setGameModes();
})

.controller('StatsCtrl', function($scope, $rootScope, Utils, WordsDB) {
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
        	subThemes.push(res.rows.item(i));
        }

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

	$scope.updateData = function() {
		WordsDB.updateData().then(function (res) {
        console.log('Data updated');
      }, function (err) {
        console.error(err);
    });
	}
})

.controller('HelpCtrl', function($scope) {});
