angular.module('englishLetterByLetter')

  .controller('ThemeCtrl', function($scope, $rootScope, $stateParams, Utils) {
    var themes = [
        {id: 1, name: 'Їжа та напої'}, 
        {id: 2, name: 'Дім'},
        {id: 3, name: 'Людина'}
      ];

    $scope.modeId = $stateParams.modeId;
    $scope.themes = themes;
    $scope.data = {};
    $scope.data.currentPage = 0;

    setupSlider();

    $scope.setNextTheme = function() {
      $scope.data.sliderDelegate.slideNext();
    };

    $scope.setPreviousTheme = function() {
      $scope.data.sliderDelegate.slidePrev();
    };

    $scope.setThemeName = function() {
      $rootScope.themeName = $scope.theme.name;
    };

    function setupSlider() {
      //some options to pass to our slider
      $scope.data.sliderOptions = {
        loop: true,
        initialSlide: 0,
        direction: 'horizontal', //or vertical
        speed: 300 //0.3s transition
      };

      //create delegate reference to link with slider
      $scope.data.sliderDelegate = null;

      //watch our sliderDelegate reference, and use it when it becomes available
      $scope.$watch('data.sliderDelegate', function(newVal, oldVal) {
        if (newVal != null) {
          $scope.data.sliderDelegate.on('slideChangeEnd', function() {
            $scope.data.currentPage = $scope.data.sliderDelegate.activeIndex;
          });
        }
      });
    };
  });
