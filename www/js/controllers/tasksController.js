angular.module('englishLetterByLetter')

.controller('TasksCtrl', function($ionicPlatform, $scope, $rootScope, Utils, DB) {
  Utils.setHeightAndWidth();
  $scope.data = {};
  $scope.data.currentPage = 0;
  $scope.data.sliderDelegate = null;
  $scope.tasksPageIndex = 0;

  if (window.cordova) {
    document.addEventListener('deviceready', function () {
      getTasks();
    });
  } else {
    $ionicPlatform.ready(function () {
      getTasks();
    });
  }

  function getTasks() {
    $scope.diamondsCount = 0;
    $scope.tasks = [];
    $scope.chunkedTasksPerPage = [];
    $scope.chunkedTasks = [];

    DB.selectTasks().then(function (res) {
      for (var i = 0; i < res.rows.length; i++) {
        var task = res.rows.item(i);

        task.progressPercentage = Math.floor(100 * task.progress / task.count);

        if (task.isDone) $scope.diamondsCount += task.complexity;
        if (!task.isHidden) $scope.tasks.push(task);
      }

      $scope.chunkedTasksPerPage = chunk($scope.tasks, 3);

      for (var i = 0; i < $scope.chunkedTasksPerPage.length; i ++)
        $scope.chunkedTasks.push(chunk($scope.chunkedTasksPerPage[i], 3));

      setupSliderOptions();
    }, function (err) {
      console.error(err);
    });
  }

  function chunk(arr, size) {
    var newArr = [];

    for (var i = 0; i < arr.length; i += size) {
      newArr.push(arr.slice(i, i + size));
    }

    return newArr;
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
            $scope.tasksPageIndex = $scope.data.sliderDelegate.activeIndex;
          });
        });
      }
    });

  $scope.setNextTasksPage = function() {
    $scope.data.sliderDelegate.slideNext();
  };

  $scope.setPreviousTasksPage = function() {
    $scope.data.sliderDelegate.slidePrev();
  };

  $scope.showTaskInfo = function (id) {
    var taskInfo = $scope.tasks[id - 1],
      taskBody = '<div class="task-popup">' +
        '<h4>' + taskInfo.title + '</h4>' +
        '<img class="task-popup-icon" ng-src="img/icons/award_' + taskInfo.complexity + '.png">' +
        '<p>' + taskInfo.description + '</p>' +
        '<h3>' + taskInfo.progress + '/' + taskInfo.count + '</h3>' +
        '</div>';

    Utils.showAlert(taskBody);
  }

  $scope.$on('$ionicView.enter', function () {
    getTasks();
  });
})
