angular.module('englishLetterByLetter')

  .controller('ThemeCtrl', function($scope, $rootScope, $stateParams, $ionicPlatform, Utils, WordsDB) {
    if (window.cordova) {
      document.addEventListener('deviceready', function () {
        getThemes();
      });
    } else {
      $ionicPlatform.ready(function () {
        getThemes();
      });
    }

    $scope.modeId = $stateParams.modeId;
    $scope.data = {};
    $scope.data.currentPage = 0;
    $scope.data.sliderDelegate = null;
    $scope.themeIndex = 0;

    function getThemes() {
      $scope.themes = [];

      WordsDB.selectThemes().then(function (res) {
        for (var i = 0; i < res.rows.length; i++)
          $scope.themes.push(res.rows.item(i));

        setupSliderOptions();
      }, function (err) {
        console.error(err);
      });
    }

    function setupSliderOptions() {
      $scope.data.sliderOptions = {
        loop: true,
        initialSlide: 0,
        direction: 'horizontal',
        speed: 300 
      };
    };

    $scope.$watch('data.sliderDelegate', function(newVal, oldVal) {
      if (newVal != null) {
        $scope.data.sliderDelegate.on('slideChangeEnd', function() {
          $scope.data.currentPage = $scope.data.sliderDelegate.activeIndex;
        });
      }
    });

    $scope.setNextTheme = function() {
      $scope.data.sliderDelegate.slideNext();
      $scope.themeIndex = $scope.data.currentPage + 1;
    };

    $scope.setPreviousTheme = function() {
      $scope.data.sliderDelegate.slidePrev();
      $scope.themeIndex = $scope.data.currentPage - 1;
    };

    $scope.setThemeName = function(themeName) {
      $rootScope.themeName = themeName;
    };
  });
