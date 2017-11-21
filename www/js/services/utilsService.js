angular.module('englishLetterByLetter')

.factory('Utils', function ($rootScope, $ionicPopup, $ionicHistory, $window, $cordovaNativeAudio) {
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
      showAlert: function (alertBody, params, callbackFunction) {
        var alertPopup = $ionicPopup.alert({
              title: '',
              template: alertBody,
              buttons: [
              {
                text: 'Ок',
                type: 'button-positive',
                onTap: function (e) {
                  console.log('Ok is tapped');
                  if (callbackFunction) callbackFunction(params);
                }
              }
            ]
            });

        alertPopup.then(function (res) {
        });
      },
      showConfirmLeaveGamePopup: function () {
        var popupBody = '<div class="confirm-popup">' +
            '<h3>Увага!</h3>' +
            '<h4>Ви дійсно бажаєте залишити поточну гру?</h4>' +
            '<h4>Отримані результати буде втрачено.</h4>' +
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
      },
      playSound: function(sound) {
        if (window.cordova) {
          $cordovaNativeAudio.play(sound);
        }
      }
  	}
 })