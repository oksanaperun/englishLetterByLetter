angular.module('englishLetterByLetter')

  .factory('Utils', function ($rootScope, $ionicPopup, $ionicHistory, $window, $cordovaNativeAudio, DB) {
    return {
      setGameModes: function () {
        $rootScope.gameModes = [
          { id: 1, name: 'Слова', keyWord: 'words' },
          { id: 2, name: 'Фрази', keyWord: 'phrases' },
          { id: 3, name: 'Вікторина', keyWord: 'questions' }
        ];
      },
      setHeightAndWidth: function () {
        $rootScope.topPanelHeigth = 44;
        $rootScope.bottomPanelHeight = 49;
        $rootScope.viewWidth = $window.innerWidth;
        $rootScope.viewHeight = $window.innerHeight;
      },
      setUserSettings: function () {
        DB.selectUserSettings().then(function (res) {
          $rootScope.userSettings = res.rows.item(0);
        }, function (err) {
          console.error(err);
        });
      },
      setTasks: function () {
        $rootScope.chunkedTasks = [];
        var tasks = [];

        DB.selectTasks().then(function (res) {
          for (var i = 0; i < res.rows.length; i++) {
            var task = res.rows.item(i);

            task.progressPercentage = Math.floor(0.7692 * 100 * task.progress / task.count);
            tasks.push(task);
          }

          var chunkedTasksPerPage = chunk(tasks, 3);

          for (var i = 0; i < chunkedTasksPerPage.length; i++)
            $rootScope.chunkedTasks.push(chunk(chunkedTasksPerPage[i], 3));
        }, function (err) {
          console.error(err);
        });
      },
      getTaskById: function (id) {
        for (var i = 0; i < $rootScope.chunkedTasks.length; i++)
          for (var j = 0; j < $rootScope.chunkedTasks[i].length; j++)
            for (var k = 0; k < $rootScope.chunkedTasks[i][j].length; k++)
              if ($rootScope.chunkedTasks[i][j][k].id == id)
                return $rootScope.chunkedTasks[i][j][k];
      },
      getNextIndex: function (currentIndex, length) {
        if (currentIndex == length - 1) {
          return 0;
        } else {
          return currentIndex + 1;
        }
      },
      getPreviousIndex: function (currentIndex, length) {
        if (currentIndex == 0) {
          return length - 1;
        } else {
          return currentIndex - 1;
        }
      },
      showAlert: function (alertBody, params, callbackFunction) {
        var alertPopup = $ionicPopup.alert({
          title: '',
          template: alertBody,
          buttons: [
            {
              text: 'Ок',
              type: 'button-positive',
              onTap: function (e) {
                if (callbackFunction) callbackFunction(params);
              }
            }
          ]
        });

        alertPopup.then(function (res) {
        });
      },
      showConfirm: function (confirmBody, callbackFunction) {
        var сonfirmPopup = $ionicPopup.confirm({
          title: 'УВАГА!',
          template: confirmBody,
          buttons: [
            { text: 'Ні' },
            {
              text: 'Так',
              type: 'button-positive',
              onTap: function (e) {
                if (callbackFunction) callbackFunction();
              }
            }
          ]
        });

        сonfirmPopup.then(function (res) {
        });
      },
      shouldFirstStarBeDisplayed: function (score) {
        return score >= 5;
      },
      shouldSecondStarBeDisplayed: function (score) {
        return score >= 10;
      },
      shouldThirdStarBeDisplayed: function (score) {
        return score >= 15;
      },
      playSound: function (sound) {
        if (window.cordova && $rootScope.userSettings.isSoundsOn)
          $cordovaNativeAudio.play(sound);
      }
    }

    function chunk(arr, size) {
      var newArr = [];

      for (var i = 0; i < arr.length; i += size) {
        newArr.push(arr.slice(i, i + size));
      }

      return newArr;
    }
  })