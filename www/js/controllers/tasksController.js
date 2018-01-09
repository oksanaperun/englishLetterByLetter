angular.module('englishLetterByLetter')

  .controller('TasksCtrl', function ($ionicPlatform, $scope, $rootScope, Utils, DB) {
    $scope.data = {};
    $scope.data.currentPage = 0;
    $scope.data.sliderDelegate = null;
    $scope.tasksPageIndex = 0;

    if (window.cordova) {
      document.addEventListener('deviceready', function () {
        setProgress();
        setupSliderOptions();
      });
    } else {
      $ionicPlatform.ready(function () {
        setProgress();
        setupSliderOptions();
      });
    }

    function setProgress() {
      $scope.stars = [];

      for (var i = 0; i < $rootScope.chunkedTasks.length; i++)
        for (var j = 0; j < $rootScope.chunkedTasks[i].length; j++)
          for (var k = 0; k < $rootScope.chunkedTasks[i][j].length; k++) {
            var task = $rootScope.chunkedTasks[i][j][k];

            $scope.stars.push({
              complexity: task.complexity,
              isDone: task.isDone
            });
          }
    }

    function setupSliderOptions() {
      $scope.data.sliderOptions = {
        loop: false,
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
            $scope.tasksPageIndex = $scope.data.sliderDelegate.activeIndex;
          });
        });
      }
    });

    $scope.setNextTasksPage = function () {
      $scope.data.sliderDelegate.slideNext();
    };

    $scope.setPreviousTasksPage = function () {
      $scope.data.sliderDelegate.slidePrev();
    };

    $scope.showTaskInfo = function (id) {
      var taskInfo = Utils.getTaskById(id),
        taskBody = '<div class="task-popup">' +
          '<h4>' + taskInfo.title + '</h4>' +
          '<img class="task-popup-icon" ng-src="img/icons/complexity_' + taskInfo.complexity + '.png">' +
          '<p>' + taskInfo.description + '</p>' +
          '<h3>' + taskInfo.progress + '/' + taskInfo.count + '</h3>' +
          '</div>';

      Utils.showAlert(taskBody);
    }

    $scope.$on('$ionicView.enter', function () {
      setProgress();
    });
  })
