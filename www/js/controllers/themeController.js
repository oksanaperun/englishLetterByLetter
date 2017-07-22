angular.module('englishLetterByLetter')

  .controller('ThemeCtrl', function($scope, $rootScope, $stateParams, $ionicPlatform, Utils, WordsDB) {
    $scope.modeId = $stateParams.modeId;
    $scope.data = {};
    $scope.data.currentPage = 0;
    $scope.data.sliderDelegate = null;
    $scope.themeIndex = 0;

    if (window.cordova) {
      document.addEventListener('deviceready', function () {
        getThemes();
      });
    } else {
      $ionicPlatform.ready(function () {
        getThemes();
      });
    }

    function getThemes() {
      $scope.themes = [];

      WordsDB.selectThemes().then(function (res) {
        for (var i = 0; i < res.rows.length; i++)
          $scope.themes.push(res.rows.item(i));

        setupStars();
        setupSliderOptions();
      }, function (err) {
        console.error(err);
      });
    }

    function setupStars() {
      var score = $scope.themes[$scope.themeIndex]['maxScore' + $scope.modeId];

      $scope.displayFirstStar = Utils.shouldFirstStarBeDisplayed(score);
      $scope.displaySecondStar = Utils.shouldSecondStarBeDisplayed($scope.modeId, score);
      $scope.displayThirdStar = Utils.shouldThirdStarBeDisplayed($scope.modeId, score);
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

          $scope.$apply(function () {
            $scope.themeIndex = $scope.data.sliderDelegate.activeIndex;
            setupStars();
          });
        });
      }
    });

    $scope.setNextTheme = function() {
      $scope.data.sliderDelegate.slideNext();
    };

    $scope.setPreviousTheme = function() {
      $scope.data.sliderDelegate.slidePrev();
    };
  });
