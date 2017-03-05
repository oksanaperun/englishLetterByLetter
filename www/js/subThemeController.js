angular.module('englishLetterByLetter')

  .controller('SubThemeCtrl', function($scope, $rootScope, $stateParams, Utils) {
    var allSubThemes = [
        {id: 1, name: 'Фрукти і ягоди', themeId: 1},
        {id: 2, name: 'Овочі, трави та спеції', themeId: 1},
        {id: 3, name: 'Прохолоджуючі та гарячі напої', themeId: 1},
        {id: 4, name: 'Меблі', themeId: 2},
        {id: 5, name: 'Посуд', themeId: 2}
      ];

    $scope.modeId = $stateParams.modeId;
    $scope.themeId = $stateParams.themeId;
    $scope.data = {};
    $scope.data.currentPage = 0;

    setSubThemes();
    setupSlider();

    function setSubThemes() {
      $scope.subThemes = [];

      for (var i = 0; i < allSubThemes.length; i ++) {
        if (allSubThemes[i].themeId == $scope.themeId) {
          $scope.subThemes.push(allSubThemes[i]);
        }
      }
    }

    $scope.setNextSubTheme = function() {
      $scope.data.sliderDelegate.slideNext();
    };

    $scope.setPreviousSubTheme = function() {
      $scope.data.sliderDelegate.slidePrev();
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
