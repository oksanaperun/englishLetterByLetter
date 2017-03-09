angular.module('englishLetterByLetter')

  .controller('WordCtrl', function($scope, $rootScope, $stateParams, $state, $timeout, $ionicPlatform, $ionicPopup, $ionicHistory, $cordovaNativeAudio, Utils, WordsDB) {
    if (window.cordova) {
      document.addEventListener('deviceready', function () {
        manageGameMode();

        var soundFileLocation = 'sounds/' + $scope.word.subThemeId + '/' + $scope.word.name + '.mp3';

        $cordovaNativeAudio.preloadSimple($scope.word.name, soundFileLocation);
      });
    } else {
      $ionicPlatform.ready(function () {
        manageGameMode();
      });
    }

    var currentTimeout = null;

    $scope.modeId = $stateParams.modeId;
    $scope.score = 0;
    $scope.words = [];
    $scope.currentWordIndex = 0;
    $scope.timeModeTimeout = 61;
    $scope.speedModeTimeout = 10;

    function manageGameMode() {
      if ($stateParams.modeId == 1 || $stateParams.modeId == 2) {
        $scope.nextButtonOpacity = 1;
        getWordsBySubThemeId();
      }

      if ($stateParams.modeId == 3) {
        $scope.nextButtonOpacity = 0;
        getWordsByThemeId(); 
      }
    }

    function getWordsBySubThemeId() {
      WordsDB.selectWordsBySubThemeId($stateParams.subThemeId).then(function (res) {
        for (var i = 0; i < res.rows.length; i++)
          $scope.words.push(res.rows.item(i));

        sortWordsRandomly($scope.words, false);

        $scope.word = $scope.words[$scope.currentWordIndex];
        $scope.shuffledName = getShuffledName();
        $scope.composedNameLetters = getInitialComposedName();

        if ($stateParams.modeId == 2) {
          $scope.counter = $scope.timeModeTimeout;
          setTimer();
        }      
      }, function (err) {
        console.error(err);
      });
    }

    function getWordsByThemeId() {
      WordsDB.selectWordsByThemeId($stateParams.themeId).then(function (res) {
        for (var i = 0; i < res.rows.length; i++)
          $scope.words.push(res.rows.item(i));

        sortWordsRandomly($scope.words, true);

        $scope.word = $scope.words[$scope.currentWordIndex];
        $scope.shuffledName = getShuffledName();
        $scope.composedNameLetters = getInitialComposedName();

        $scope.counter = $scope.speedModeTimeout;
        setTimer();
      }, function (err) {
        console.error(err);
      });
    }

    function sortWordsRandomly(arr, sortByLength) {
      arr.sort(function(a, b) {
        if (sortByLength)
          return a.name.length - b.name.length || 0.5 - Math.random();
        else return 0.5 - Math.random();
      });
    }

    function getRandomWord(words) {
      var randomIndex = Math.floor(Math.random() * words.length),
        randomWord = words.splice(randomIndex, 1)[0];

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
      var letterButtons = getLetterButtons(),
        i;

      for (i = 0; i < letterButtons.length; i++) {
        var letterButton = letterButtons[i];

        letterButton.removeAttribute('disabled');
        letterButton.style.opacity = 1;
      }
      for (i = 0; i < $scope.composedNameLetters.length; i++) {
        $scope.composedNameLetters[i].symbol = '';
      }
    }

    $scope.setNextWord = function() {
      $scope.currentWordIndex++;

      if ($scope.currentWordIndex == $scope.words.length) {
        showPopup();
        stopTimer();
      } else {
        $scope.word = $scope.words[$scope.currentWordIndex];
        $scope.shuffledName = getShuffledName();
        $scope.composedNameLetters = getInitialComposedName();
        setInitialState();

        if (window.cordova) {
          var soundFileLocation = 'sounds/' + $scope.word.subThemeId + '/' + $scope.word.name + '.mp3';

          $cordovaNativeAudio.preloadSimple($scope.word.name, soundFileLocation);
        }

        if ($stateParams.modeId == 3) {
          $scope.counter = $scope.speedModeTimeout;
          setTimer();
        }
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
        // TODO: Redirect to tab.subTheme has Back button in header and no data in slider
        //$state.go('tab.subTheme', {modeId: $stateParams.modeId, themeId: $stateParams.themeId});
        // TODO: Redirect to tab.modes has Back button in header
        $state.go('tab.modes');
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
        $scope.counter = $scope.timeModeTimeout;
      }
      if ($stateParams.modeId == 3) {
        console.log('set counter for speed mode');
        $scope.counter = $scope.speedModeTimeout;
      }

      $timeout.cancel(currentTimeout);
    };

    $scope.playSound = function() {
      Utils.playSound($scope.word.name);
    }

    $rootScope.$ionicGoBack = function() {
      $ionicHistory.goBack();
      if ($stateParams.modeId == 2 || $stateParams.modeId == 3) {
        stopTimer();
      }
    };
  });
