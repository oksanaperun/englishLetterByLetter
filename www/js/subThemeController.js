angular.module('englishLetterByLetter')

  .controller('SubThemeCtrl', function($scope, $rootScope, $stateParams, $ionicPlatform, Utils, WordsDB) {
    if (window.cordova) {
      document.addEventListener('deviceready', function () {
        getSubThemes();
      });
    } else {
      $ionicPlatform.ready(function () {
        getSubThemes();
      });
    }

    $scope.modeId = $stateParams.modeId;
    $scope.themeId = $stateParams.themeId;
    $scope.data = {};
    $scope.data.currentPage = 0;
    $scope.data.sliderDelegate = null;

    function getSubThemes() {
      $scope.subThemes = [];

      WordsDB.selectSubThemesByThemeId($stateParams.themeId).then(function (res) {
        for (var i = 0; i < res.rows.length; i++)
          $scope.subThemes.push(res.rows.item(i));

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
    }

    $scope.$watch('data.sliderDelegate', function(newVal, oldVal) {
      if (newVal != null) {
        $scope.data.sliderDelegate.on('slideChangeEnd', function() {
          $scope.data.currentPage = $scope.data.sliderDelegate.activeIndex;
        });
      }
    });

    $scope.setNextSubTheme = function() {
      $scope.data.sliderDelegate.slideNext();
    };

    $scope.setPreviousSubTheme = function() {
      $scope.data.sliderDelegate.slidePrev();
    };
  });
