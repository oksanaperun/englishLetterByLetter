angular.module('englishLetterByLetter')

  .controller('ThemeCtrl', function ($scope, $rootScope, $stateParams, $ionicPlatform, Utils, DB, App) {
    $scope.modeId = $stateParams.modeId;
    $scope.data = {};
    $scope.data.currentPage = 0;
    $scope.data.sliderDelegate = null;
    $scope.themeIndex = 0;
    $scope.keyWord = $rootScope.gameModes[$scope.modeId - 1].keyWord;

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

      DB.selectThemes().then(function (res) {
        for (var i = 0; i < res.rows.length; i++) {
          var theme = res.rows.item(i),
            score = theme[$scope.keyWord + 'MaxScore'];

          theme.displayFirstStar = Utils.shouldFirstStarBeDisplayed(score);
          theme.displaySecondStar = Utils.shouldSecondStarBeDisplayed(score);
          theme.displayThirdStar = Utils.shouldThirdStarBeDisplayed(score);

          $scope.themes.push(theme);
        }

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

    $scope.$watch('data.sliderDelegate', function (newVal, oldVal) {
      if (newVal != null) {
        $scope.data.sliderDelegate.on('slideChangeEnd', function () {
          $scope.data.currentPage = $scope.data.sliderDelegate.activeIndex;

          $scope.$apply(function () {
            $scope.themeIndex = $scope.data.sliderDelegate.activeIndex;
          });
        });
      }
    });

    $scope.setNextTheme = function () {
      $scope.data.sliderDelegate.slideNext();
    };

    $scope.setPreviousTheme = function () {
      $scope.data.sliderDelegate.slidePrev();
    };

    $scope.$on('$ionicView.enter', function () {
      var currentTheme = $scope.themes[$scope.themeIndex],
        newScoreData = App.getNewScoreData();

      if (newScoreData.modeId == $scope.modeId && newScoreData.themeId == currentTheme.id &&
        newScoreData.score > currentTheme[$scope.keyWord + 'MaxScore']) {
        currentTheme.displayFirstStar = newScoreData.displayFirstStar;
        currentTheme.displaySecondStar = newScoreData.displaySecondStar;
        currentTheme.displayThirdStar = newScoreData.displayThirdStar;
      }
    });
  });
