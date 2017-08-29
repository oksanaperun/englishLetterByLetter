angular.module('englishLetterByLetter')

.factory('Utils', function ($cordovaNativeAudio, $rootScope, $ionicPopup, $ionicHistory, $window) {
    return {
      setGameModes: function() {
        $rootScope.gameModes = [
          {id: 1, name: 'Слова', keyWord: 'words'},
          {id: 2, name: 'Фрази', keyWord: 'phrases'},
          {id: 3, name: 'Вікторина', keyWord: 'questions'}
        ];
      },
      setHeightAndWidth: function() {
        $rootScope.topPanelHeigth = 44;
        $rootScope.bottomPanelHeight = 49;
        $rootScope.viewWidth = $window.innerWidth;
        $rootScope.viewHeight = $window.innerHeight;
      },
      getNextIndex: function(currentIndex, length) {
      	if (currentIndex == length - 1) {
        	return 0;
      	} else {
        	return currentIndex + 1;
      	}
      },
      getPreviousIndex: function(currentIndex, length) {
      	if (currentIndex == 0) {
        	return length - 1;
      	} else {
        	return currentIndex - 1;
      	}
      },
      sortWordsRandomly: function(arr, sortByLength) {
        arr.sort(function(a, b) {
          if (sortByLength)
            return a.name.length - b.name.length || 0.5 - Math.random();
          else return 0.5 - Math.random();
        });
      },
      getRandomLetter: function() {
        var alphabet = 'abcdefghijklmnopqrstuvwxyz',
          randomIndex = Math.floor(Math.random() * alphabet.length);

        return alphabet.charAt(randomIndex);
      },
      getShuffledArray: function(arr) {
        return arr.sort(function() {return 0.5 - Math.random()});
      },
      playSound: function (sound) {
        if (window.cordova) {
          $cordovaNativeAudio.play(sound);
        }
      },
      showAlert: function (alertBody, callbackFunction) {
        var alertPopup = $ionicPopup.alert({
             title: '',
             template: alertBody
            });

        alertPopup.then(function (res) {
          if (callbackFunction) callbackFunction();
        });
      },
      showConfirmLeaveGamePopup: function () {
        var popupBody = '<div class="confirm-popup">' +
            '<p>Ви дійсно бажаєте залишити поточну гру? Отримані результати буде втрачено.</p>' +
            '</div>',
          сonfirmLeaveGamePopup = $ionicPopup.confirm({
            title: 'УВАГА!',
            template: popupBody,
            buttons: [
              {text: 'Ні'},
              {
                text: 'Так',
                type: 'button-positive',
                onTap: function (e) {
                  $ionicHistory.goBack();
                }
              }
            ]
          });

        сonfirmLeaveGamePopup.then(function (res) {
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
      }
  	}
 })