angular.module('englishLetterByLetter')

  .controller('WordCtrl', function($scope, $rootScope, $stateParams, $state, $timeout, $ionicPopup, $ionicHistory, $cordovaNativeAudio, Utils) {
    var allWords = [
      {id: 1, name: 'apple', translation: 'яблуко', themeId: 1},
      {id: 2, name: 'apricot', translation: 'абрикос', themeId: 1},
      {id: 3, name: 'avocado', translation: 'авокадо', themeId: 1},
      {id: 4, name: 'banana', translation: 'банан', themeId: 1},
      {id: 5, name: 'cherry', translation: 'вишня', themeId: 1},
      {id: 6, name: 'date', translation: 'фінік', themeId: 1},
      {id: 7, name: 'fig', translation: 'інжир', themeId: 1},
      {id: 8, name: 'grape', translation: 'виноград', themeId: 1},
      {id: 9, name: 'kiwi_fruit', translation: 'ківі', themeId: 1},
      {id: 10, name: 'lemon', translation: 'лимон', themeId: 1},
      {id: 11, name: 'lime', translation: 'лайм', themeId: 1},
      {id: 12, name: 'mango', translation: 'манго', themeId: 1},
      {id: 13, name: 'melon', translation: 'диня', themeId: 1},
      {id: 14, name: 'peach', translation: 'персик', themeId: 1},
      {id: 15, name: 'pear', translation: 'груша', themeId: 1},
      {id: 16, name: 'blackberry', translation: 'ожина', themeId: 1},
      {id: 17, name: 'blueberry', translation: 'чорниця', themeId: 1},
      {id: 18, name: 'lemonade', translation: 'лимонад', themeId: 2},
      {id: 19, name: 'cocoa', translation: 'какао', themeId: 2},
      {id: 20, name: 'coffee', translation: 'кава', themeId: 2},
      {id: 21, name: 'sweet potato', translation: 'батат', themeId: 3},
      {id: 22, name: 'potato', translation: 'картопля', themeId: 3},
      {id: 23, name: 'onion', translation: 'цибуля', themeId: 3},
      {id: 24, name: 'peas', translation: 'горох', themeId: 3}
    ]; // load words from selected theme and remove setThemeWords() function

    var speedModeMaxNameLength = 6,
      timeModeTimeout = 61,
      currentTimeout = null;

    $scope.modeId = $stateParams.modeId;
    $scope.speedModeTimeout = 10;
    $scope.score = 0;
    manageGameMode();

    if ($scope.words) {
      $scope.word = getRandomWord();
      $scope.shuffledName = getShuffledName();
      $scope.composedNameLetters = getInitialComposedName();

      if (window.cordova) {
        document.addEventListener('deviceready', function () {
          var soundFileLocation = 'sounds/' + $scope.word.themeId + '/' + $scope.word.name + '.mp3';

          $cordovaNativeAudio.preloadSimple($scope.word.name, soundFileLocation);
        });
      }
    }

    function manageGameMode() {
      if ($stateParams.modeId == 1) {
        $scope.nextButtonOpacity = 1;
        setThemeWords();
      }

      if ($stateParams.modeId == 2) {
        $scope.nextButtonOpacity = 1;
        setThemeWords();
        $scope.counter = timeModeTimeout;
        setTimer();
      }

      if ($stateParams.modeId == 3) {
        $scope.nextButtonOpacity = 0;
        setThemeWordsForSpeedMode();
        $scope.counter = $scope.speedModeTimeout;
        setTimer();
      }
    }

    function setThemeWords() {
      if ($stateParams.subThemeId == 0) {
        $scope.words = allWords.slice();
      } else {
          $scope.words = [];

          for (var i = 0; i < allWords.length; i++) {
            if (allWords[i].themeId == $stateParams.subThemeId) {
              $scope.words.push(allWords[i]);
            }
          }
        }
   }

    function setThemeWordsForSpeedMode() {
      $scope.words = [];

      for (var i = 0; i < allWords.length; i++) {
        if (allWords[i].themeId == $stateParams.themeId && allWords[i].name.length <= speedModeMaxNameLength) {
          $scope.words.push(allWords[i]);
        }
      }
    }

    function getRandomWord() {
      var randomIndex = Math.floor(Math.random() * $scope.words.length),
        randomWord = $scope.words.splice(randomIndex, 1)[0];

      return randomWord;
    }

    function getRandomLetter() {
      var alphabet = 'abcdefghijklmnopqrstuvwxyz',
        randomIndex = Math.floor(Math.random() * alphabet.length);

      return alphabet.charAt(randomIndex);
    }

    function getShuffledName() {
      var nameWithoutUnderScore = $scope.word.name.replace('_', ''), 
        randomLetter1 = nameWithoutUnderScore.length > 11 ? '' : getRandomLetter(),
        randomLetter2 = nameWithoutUnderScore.length > 10 ? '' : getRandomLetter(),
        nameWithRandomLetters = randomLetter1 + nameWithoutUnderScore + randomLetter2,
        shuffledNameArray = getShuffledArray(nameWithRandomLetters.split('')),
        shuffledName = shuffledNameArray.toString().replace(/,/g, '');

      if (shuffledName.indexOf(nameWithoutUnderScore) > -1) {
        return getShuffledName();
      }

      return shuffledName;
    }

    function getShuffledArray(arr) {
      return arr.sort(function() {return 0.5 - Math.random()});
    }

    function getInitialComposedName() {
      var composedName = [];

      for (var i = 0; i < $scope.word.name.length; i++) {
        if ($scope.word.name[i] === '_') {
          composedName.push({
            symbol: ' ',
            originalLetterIndex: -1
          });
        }
        else {
          composedName.push({
            symbol: '',
            originalLetterIndex: -1
          });
        }
      }

      return composedName;
    }

    function getLetterButtons() {
      return document.getElementsByClassName('letter-button');
    }

    function getComposedLetterButtons() {
      return document.getElementsByClassName('composed-letter-button');
    }

    function getClearButton() {
      return document.getElementsByClassName('clear-button')[0];
    }

    $scope.moveLetter = function(letter, letterIndex) {
      var letterButtons = getLetterButtons(),
        firstSpaceIndex = getFirstSpaceInComposedName();

      if (firstSpaceIndex > -1) {
        letterButtons[letterIndex].setAttribute('disabled', 'disabled');
        letterButtons[letterIndex].style.opacity = 0;
        $scope.composedNameLetters[firstSpaceIndex].symbol = letter;
        $scope.composedNameLetters[firstSpaceIndex].originalLetterIndex = letterIndex;
      }
    };

    function getLettersWithSpaceCount() {
      var letterWithSpaceCount = 0;

      $scope.composedNameLetters.forEach(function(letter) {
        if (letter.symbol === '') {
          letterWithSpaceCount++;
        }
      });

      return letterWithSpaceCount;
    }

    function getFirstSpaceInComposedName() {
      for (var i = 0; i < $scope.composedNameLetters.length; i++) {
        if ($scope.composedNameLetters[i].symbol == '')
          return i;
      }
 
      return -1;
    }

    $scope.moveLetterBack = function(letterIndex) {
      var letterButtons = getLetterButtons(),
        originalLetterIndex = $scope.composedNameLetters[letterIndex].originalLetterIndex;

      if (originalLetterIndex > -1) {
        letterButtons[originalLetterIndex].removeAttribute('disabled');
        letterButtons[originalLetterIndex].style.opacity = 1;
        $scope.composedNameLetters[letterIndex].symbol = '';
        $scope.composedNameLetters[letterIndex].originalLetterIndex = -1;
      }
    };

    $scope.checkComposedWord = function() {
      $scope.composedName = '';

      for (var i = 0; i < $scope.composedNameLetters.length; i++)
        if ($scope.composedNameLetters[i].symbol != '')
          $scope.composedName += $scope.composedNameLetters[i].symbol;

      if ($scope.composedName === $scope.word.name.replace('_', ' ')) {
        $scope.score++;
        manageCorrectComposedWord();

        if ($stateParams.modeId == 3) {
          stopTimer();
        }

        if ($stateParams.modeId == 2 || $stateParams.modeId == 3) {
          $scope.setNextWord();
        }
      }
    };

    function manageCorrectComposedWord() {
      var buttons = getComposedLetterButtons();

      for (var i = 0; i < buttons.length; i++) {
        var button = buttons[i];

        button.setAttribute('disabled', 'disabled');
        button.style.borderColor = 'green';
      }

      var clearButton = getClearButton();

      clearButton.setAttribute('disabled', 'disabled');
    }

    $scope.clearComposedWord = function() {
      var letterButtons = getLetterButtons();

      for (var i = 0; i < letterButtons.length; i++) {
        letterButtons[i].style.opacity = 1;
        $scope.composedNameLetters[i].symbol = '';
     }
    }

    $scope.setNextWord = function() {
      if ($scope.words.length > 0) {
        $scope.word = getRandomWord();
        $scope.shuffledName = getShuffledName();
        $scope.composedNameLetters = getInitialComposedName();
        setInitialState();

        if (window.cordova) {
          var soundFileLocation = 'sounds/' + $scope.word.themeId + '/' + $scope.word.name + '.mp3';

          $cordovaNativeAudio.preloadSimple($scope.word.name, soundFileLocation);
        }

        if ($stateParams.modeId == 3) {
          $scope.counter = $scope.speedModeTimeout;
          setTimer();
        }
      } else {
        showPopup();
        stopTimer();
      }
    }

    function setInitialState() {
      var letterButtons = getLetterButtons(),
        composedLetterButtons = getComposedLetterButtons(),
        clearButton = getClearButton();

      for (var i = 0; i < letterButtons.length; i++) {
        var letterButton = letterButtons[i];

        letterButton.removeAttribute('disabled');
        letterButton.style.opacity = 1;
      }

      for (var i = 0; i < composedLetterButtons.length; i++) {
        var composedLetterButton = composedLetterButtons[i];

        composedLetterButton.removeAttribute('disabled');
        composedLetterButton.style.borderColor = 'black';
      }

      clearButton.removeAttribute('disabled');
    }

    function showPopup() {
      var popupBody = '<div class="achievement-popup">' +
          '<p>Ваш рахунок:</p>' +
          '<h5>' + $scope.score + '</h5>' +
          '</div>',
        achievementPopup = $ionicPopup.alert({
          title: 'ГРУ ЗАВЕРШЕНО',
          template: popupBody
        });

      achievementPopup.then(function (res) {
        $state.go('tab.themes', {modeId: $scope.modeId}); // TODO: Redirect to tab.modes has Back button in header
      });
    }

    function setTimer() {
      if ($scope.counter == 0) {
        $scope.$broadcast('timer-stopped', 0);
        $timeout.cancel(currentTimeout);
        showPopup();

        return;
      }

      $scope.counter--;
      console.log('$scope.counter=' + $scope.counter);
      currentTimeout = $timeout(setTimer, 1000);
    };

    function stopTimer() {
      $scope.$broadcast('timer-stopped', $scope.counter);

      if ($stateParams.modeId == 2) {
        console.log('set counter for time mode');
        $scope.counter = timeModeTimeout;
      }
      if ($stateParams.modeId == 3) {
        console.log('set counter for speed mode');
        $scope.counter = $scope.speedModeTimeout;
      }

      $timeout.cancel(currentTimeout);
    };

    $scope.playSound = function() {
      if (window.cordova) {
        Utils.playSound($scope.word.name);
      }
    }

    $rootScope.$ionicGoBack = function() {
      $ionicHistory.goBack();
      if ($stateParams.modeId == 2 || $stateParams.modeId == 3) {
        stopTimer();
      }
    };
  });
