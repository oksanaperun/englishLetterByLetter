angular.module('englishLetterByLetter')

  .controller('WordCtrl', function($scope, $rootScope, $stateParams, $state, $timeout, $ionicPlatform, $ionicPopup, $ionicHistory, $cordovaNativeAudio, Utils, WordsDB) {
    setSize();

    if (window.cordova) {
      document.addEventListener('deviceready', function () {
        manageGameMode();

        if ($scope.word && ($stateParams.modeId == 1 || $stateParams.modeId == 3)) {
          var soundFileLocation = 'sounds/' + $scope.word.subThemeId + '/' + $scope.word.name + '.mp3';

          $cordovaNativeAudio.preloadSimple($scope.word.name, soundFileLocation);
        }
      });
    } else {
      $ionicPlatform.ready(function () {
        manageGameMode();
      });
    }

    var maxWordsNumberInAGame = 20,
      currentTimeout = null;

    $scope.modeId = $stateParams.modeId;
    $scope.score = 0;
    $scope.composedWordsCount = 0;
    $scope.counter = 0;
    $scope.currentIndex = 0;
    $scope.isComposed = false;
    $scope.words = [];
    $scope.phrases = [];

    function manageGameMode() {
      if ($stateParams.modeId == 1 || $stateParams.modeId == 3) {
        $scope.playSoundIconOpacity = 1;
        getWordsBySubThemeId();
      }

      if ($stateParams.modeId == 2) {
        $scope.playSoundIconOpacity = 0;
        getPhrasesBySubThemeId(); 
      }

      getAchievements();
      setTimer();
    }

    function getWordsBySubThemeId() {
      var allSubThemeWords = [];

      WordsDB.selectWordsBySubThemeId($stateParams.subThemeId).then(function (res) {
        for (var i = 0; i < res.rows.length; i++)
          allSubThemeWords.push(res.rows.item(i));

        sortWordsRandomly(allSubThemeWords, false);

        $scope.words = allSubThemeWords.slice(0, maxWordsNumberInAGame);
        $scope.word = $scope.words[$scope.currentIndex];
        $scope.shuffledName = getShuffledName($scope.word.name);
        $scope.composedNameLetters = getInitialComposedName($scope.word.name);    
      }, function (err) {
        console.error(err);
      });
    }

    function getPhrasesBySubThemeId() {
      var allSubThemePhrases = [];

      WordsDB.selectPhrasesBySubThemeId($stateParams.subThemeId).then(function (res) {
        for (var i = 0; i < res.rows.length; i++)
          allSubThemePhrases.push(res.rows.item(i));

        sortWordsRandomly(allSubThemePhrases, false);

        $scope.phrases = allSubThemePhrases.slice(0, maxWordsNumberInAGame);
        $scope.phrase = $scope.phrases[$scope.currentIndex];
        $scope.shuffledName = getShuffledName($scope.phrase.name);
        $scope.composedNameLetters = getInitialComposedName($scope.phrase.name);
        openDefaultLettersInComposedName($scope.phrase.name);
      }, function (err) {
        console.error(err);
      });
    }

    function getAchievements() {
      WordsDB.selectAchievementsBySubThemeId($stateParams.subThemeId).then(function (res) {
        $scope.achievements = res.rows.item(0);
      }, function (err) {
        console.error(err);
      });
    }

    function updateAchievement(achievement, newValue) {
      WordsDB.updateAchievement($stateParams.subThemeId, achievement, newValue).then(function (res) {
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

    function getRandomLetter() {
      var alphabet = 'abcdefghijklmnopqrstuvwxyz',
        randomIndex = Math.floor(Math.random() * alphabet.length);

      return alphabet.charAt(randomIndex);
    }

    function getShuffledName(name) {
      var nameWithoutUnderScore = name.replace('_', ''), 
        randomLetter1 = nameWithoutUnderScore.length > 11 ? '' : getRandomLetter(),
        randomLetter2 = nameWithoutUnderScore.length > 10 ? '' : getRandomLetter(),
        nameWithRandomLetters = randomLetter1 + nameWithoutUnderScore + randomLetter2,
        shuffledNameArray = getShuffledArray(nameWithRandomLetters.split('')),
        shuffledName = shuffledNameArray.toString().replace(/,/g, '');

      if (shuffledName.indexOf(nameWithoutUnderScore) > -1) {
        return getShuffledName(name);
      }

      return shuffledName;
    }

    function getShuffledArray(arr) {
      return arr.sort(function() {return 0.5 - Math.random()});
    }

    function getInitialComposedName(name) {
      var composedName = [];

      for (var i = 0; i < name.length; i++) {
        var composedNameLetter = {
          symbol: name[i] == '_' ? '_' : '',
          originalLetterIndex: -1,
          isDefault: false
        }
        
        composedName.push(composedNameLetter);
      }

      return composedName;
    }

    function openDefaultLettersInComposedName(name) {
      var letterCountToDisplay = Math.floor(name.replace('_', '').length / 2);

      for (var j = 0; j < letterCountToDisplay; j++) {
        var randomIndex = getRandomIndexExcludingUnderscore(name);

        while ($scope.composedNameLetters[randomIndex].symbol != '') {
            randomIndex = getRandomIndexExcludingUnderscore(name);
        }

        $scope.composedNameLetters[randomIndex].symbol = name[randomIndex];
        $scope.composedNameLetters[randomIndex].isDefault = true;
        $scope.shuffledName = $scope.shuffledName.replace(name[randomIndex], '');
      }
    }

    function getRandomIndexExcludingUnderscore(name) {
      var index = Math.floor(Math.random() * name.length);

      if (name[index] == '_')
        return getRandomIndexExcludingUnderscore(name);
      else return index;
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
      var nameToCompare = $scope.modeId == 2 ? $scope.phrase.name : $scope.word.name;

      for (var i = 0; i < $scope.composedNameLetters.length; i++)
        if ($scope.composedNameLetters[i].symbol != '')
          $scope.composedName += $scope.composedNameLetters[i].symbol;

      if ($scope.composedName === nameToCompare) {
        handleCorrectComposedWord();
      }
    };

    function handleCorrectComposedWord() {
      if ($scope.modeId == 1 || $scope.modeId == 3) {
        $scope.score += getScore($scope.word.name.length);
      } else $scope.score++;

      $scope.composedWordsCount++;
      $scope.isComposed = true;
      setCorrectComposedWordStyle();
    }

    function getScore(wordsLength) {
        if (wordsLength <= 6)
          return 1;
        if (wordsLength > 6 && wordsLength <= 9)
          return 2;
        if (wordsLength > 9)
          return 3;
    };

    function setCorrectComposedWordStyle() {
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
        if (!$scope.composedNameLetters[i].isDefault && $scope.composedNameLetters[i].symbol != '_') {
          $scope.composedNameLetters[i].symbol = '';
        }  
      }
    }

    $scope.setNextWord = function() {
      $scope.currentIndex++;

      if ($scope.currentIndex == $scope.words.length || $scope.currentIndex == $scope.phrases.length) {
        stopTimer();
        showEndGamePopup();
      } else {
        if ($scope.modeId == 1 || $scope.modeId == 3) {
          $scope.word = $scope.words[$scope.currentIndex];
          $scope.shuffledName = getShuffledName($scope.word.name);
          $scope.composedNameLetters = getInitialComposedName($scope.word.name);

          if (window.cordova) {
            var soundFileLocation = 'sounds/' + $scope.word.subThemeId + '/' + $scope.word.name + '.mp3';

            $cordovaNativeAudio.preloadSimple($scope.word.name, soundFileLocation);
          }
        } else {
          $scope.phrase = $scope.phrases[$scope.currentIndex];
          $scope.shuffledName = $scope.phrase.name;
          $scope.composedNameLetters = getInitialComposedName($scope.phrase.name);
          openDefaultLettersInComposedName($scope.phrase.name);
        }

        $scope.isComposed = false;
        setInitialState();
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

    function showEndGamePopup() {
      var popupBody = '<div class="achievement-popup">' +
          '<p>Цього разу Ви закінчили гру</p>' +
          '<p>з рахунком ' + $scope.score + ' очок</p>' +
          '<p>за ' + $scope.gameTime + ' секунд</p>' +
          '</div>',
        achievementPopup = $ionicPopup.alert({
          title: 'КІНЕЦЬ ГРИ',
          template: popupBody
        });

      achievementPopup.then(function (res) {
        var maxScoreAchievement = 'maxScore' + $stateParams.modeId,
          minTimeAchievement = 'minTime' + $stateParams.modeId,
          scoreAchievement = $scope.achievements[maxScoreAchievement] < $scope.score,
          timeAchievement = ($scope.composedWordsCount == $scope.words.length || $scope.composedWordsCount == $scope.phrases.length) && 
            ($scope.achievements[minTimeAchievement] > $scope.gameTime);

        if (scoreAchievement || timeAchievement) {
          if (scoreAchievement) {
             updateAchievement(maxScoreAchievement, $scope.score);
          }
          if (timeAchievement) {
             updateAchievement(minTimeAchievement, $scope.gameTime);
          }
          showNewRecordPopup(scoreAchievement, timeAchievement);
        } else $ionicHistory.goBack();
      });
    }

    function showNewRecordPopup(scoreAchievement, timeAchievement) {
      var beginHTML = '<div class="achievement-popup">' +
          '<p>Ви встановили новий рекорд:</p>',
        scoreAchievementHTML = scoreAchievement ? '<h5><i class="icon ion-ios-star-outline"></i> ' + $scope.score + ' очок</h5>' : '',
        timeAchievementHTML = timeAchievement ? '<h5><i class="icon ion-ios-timer-outline"></i> ' + $scope.gameTime + ' секунд</h5>' : '',
        endHTML = '</div>',
        popupBody = beginHTML + scoreAchievementHTML + timeAchievementHTML + endHTML,
        achievementPopup = $ionicPopup.alert({
          title: 'ВІТАЄМО!',
          template: popupBody
        });

      achievementPopup.then(function (res) {
        $ionicHistory.goBack();
      });
    }

    function setTimer() {
      $scope.counter++;
      console.log('$scope.counter=' + $scope.counter);
      currentTimeout = $timeout(setTimer, 1000);
    };
 
    function stopTimer() {
      $scope.$broadcast('timer-stopped', $scope.counter);
      $scope.gameTime = $scope.counter;
      $scope.counter = 0;
      $timeout.cancel(currentTimeout);
    };

    $rootScope.$ionicGoBack = function() {
      stopTimer();
      $ionicHistory.goBack();
    };

   /* var go = false;

    $rootScope.$on('$stateChangeStart', function(evt, toState, toParams, fromState, fromParams) {
      if(!go) {
      evt.preventDefault();

      var popupBody = '<div class="leave-popup">' +
          '<p>Якщо залишити гру зараз,</p>' +
          '<p>то Ваші поточні результати будуть втрачені.</p>' +
          '<p>Ви дійсно бажаєте завершити гру?</p>' +
          '</div>';

        $ionicPopup.confirm({
          title: '',
          template: popupBody,
          cancelText:'Ні',
          okText:'Так'
        }).then(function(result) {
          if(result) {
            go = true;
            stopTimer();
            $state.go(toState, toParams);
          }
        });
      }
    });*/

    $scope.playSound = function() {
      Utils.playSound($scope.word.name);
    }

    function setSize() {
      var marginRight = 4;

      $scope.blockWidth = 750 > $rootScope.viewWidth ? $rootScope.viewWidth : 750;
      $scope.blockMarginLeft = $scope.blockWidth == 750 ? -Math.floor($scope.blockWidth / 2) : 0;
      $scope.blockMarginTop =  $rootScope.viewHeight >= 500 ? -Math.floor($rootScope.viewHeight / 3) : 0;
      $scope.letterWidth = Math.floor($scope.blockWidth / 12) - marginRight;
    }
  });
