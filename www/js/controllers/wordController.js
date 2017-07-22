angular.module('englishLetterByLetter')

  .controller('WordCtrl', function($scope, $rootScope, $stateParams, $state, $timeout, $ionicPlatform, $ionicPopup, $ionicHistory, $cordovaNativeAudio, Utils, WordsDB) {
    var maxWordsNumberInAGame = 15,
      currentTimeout = null,
      tabs = getTabsElement();

    $scope.modeId = $stateParams.modeId;
    $scope.score = 0;
    $scope.composedWordsCount = 0;
    $scope.currentIndex = 0;
    $scope.isComposed = false;
    $scope.words = [];
    $scope.phrases = [];
    $scope.displayCorrectLogo = false;
    $scope.correctText = 'правильно';
    tabs.style.display = 'none';

    if (window.cordova) {
      document.addEventListener('deviceready', function () {
        setSize();
        manageGameMode();
      });
    } else {
      $ionicPlatform.ready(function () {
        setSize();
        manageGameMode();
      });
    } 

    $rootScope.$ionicGoBack = function() {
      if ($ionicHistory.backView().stateName === 'tab.theme') {
        Utils.showConfirmLeaveGamePopup();
      } else {
        $ionicHistory.goBack();
      }
    };

    $scope.$on('$destroy', function() {
      stopTimer();
      tabs.style.display = '';
    });

    $scope.playSound = function() {
      Utils.playSound($scope.word.name);
    }

    $scope.moveLetter = function(letter, letterIndex) {
      var letterButtons = getLetterButtons(),
        composedLetterButtons = getComposedLetterButtons(),
        firstSpaceIndex = getFirstFreeLetterInComposedName();

      if (firstSpaceIndex > -1) {
        letterButtons[letterIndex].setAttribute('disabled', 'disabled');
        letterButtons[letterIndex].style.opacity = 0;
        $scope.composedNameLetters[firstSpaceIndex].symbol = letter;
        $scope.composedNameLetters[firstSpaceIndex].originalLetterIndex = letterIndex;
        composedLetterButtons[firstSpaceIndex].classList.add('decorated-button');
      }
    };

    $scope.moveLetterBack = function(letterIndex) {
      var letterButtons = getLetterButtons(),
        composedLetterButtons = getComposedLetterButtons(),
        originalLetterIndex = $scope.composedNameLetters[letterIndex].originalLetterIndex;

      if (originalLetterIndex > -1) {
        letterButtons[originalLetterIndex].removeAttribute('disabled');
        letterButtons[originalLetterIndex].style.opacity = 1;
        $scope.composedNameLetters[letterIndex].symbol = '?';
        $scope.composedNameLetters[letterIndex].originalLetterIndex = -1;
        composedLetterButtons[letterIndex].classList.remove('decorated-button');
      }
    };

    $scope.checkComposedWord = function() {
      $scope.composedName = '';
      var nameToCompare = $scope.modeId == 2 ? $scope.phrase.name : $scope.word.name;

      for (var i = 0; i < $scope.composedNameLetters.length; i++)
        if ($scope.composedNameLetters[i].symbol != '?')
          $scope.composedName += $scope.composedNameLetters[i].symbol;

      if ($scope.composedName === nameToCompare) {
        handleCorrectComposedWord();
      }
    };

    $scope.clearComposedWord = function() {
      var letterButtons = getLetterButtons(),
        composedLetterButtons = getComposedLetterButtons(),
        i;

      for (i = 0; i < letterButtons.length; i++) {
        var letterButton = letterButtons[i];

        letterButton.removeAttribute('disabled');
        letterButton.style.opacity = 1;
      }
      for (i = 0; i < $scope.composedNameLetters.length; i++) {
        if (!$scope.composedNameLetters[i].isDefault && $scope.composedNameLetters[i].symbol != '_') {
          $scope.composedNameLetters[i].symbol = '?';
          composedLetterButtons[i].classList.remove('decorated-button');
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
          setWordData();
        } else {
          setPhraseData();
        }

        $scope.isComposed = false;
        setInitialState();
      }
    }

    function setNextWordAutomatically(composedWordIndex) {
      $timeout(function () {
        if ($scope.currentIndex == composedWordIndex) {
          angular.element(getNextButton()).triggerHandler('click');
        }
      }, 1000);
    }

    function setSize() {
      var marginRight = 4;

      $scope.blockWidth = 750 > $rootScope.viewWidth ? $rootScope.viewWidth : 750;
      $scope.blockMarginLeft = $scope.blockWidth == 750 ? -Math.floor($scope.blockWidth / 2) : 0;
      $scope.blockMarginTop =  $rootScope.viewHeight >= 500 ? -Math.floor($rootScope.viewHeight / 3) : 0;
      $scope.wordHeaderBlockHeight = $stateParams.modeId == 3 ? 75 : 60;
      $scope.wordBodyButtonMarginTop = $stateParams.modeId == 1 ? '55%' : ($stateParams.modeId == 3 ? '25%' : '0px');
      $scope.letterWidth = Math.floor($scope.blockWidth / 12) - marginRight;
      $scope.letterHeight = Math.floor($scope.letterWidth / 1.07);
    }

    function manageGameMode() {
      $scope.counter = 0;
      $scope.counterInMinutes = 0;

      if ($stateParams.modeId == 1) {
        getWordsByThemeId();
      }

      if ($stateParams.modeId == 2) {
        $scope.hasSound = 0;
        getPhrasesByThemeId(); 
      }

      if ($stateParams.modeId == 3) {
        $scope.hasSound = 0;
        getWordsByThemeId();
        setTimer();
      }

      getAchievements();
    }

    function getWordsByThemeId() {
      var allThemeWords = [];

      WordsDB.selectWordsByThemeId($stateParams.themeId).then(function (res) {
        for (var i = 0; i < res.rows.length; i++)
          allThemeWords.push(res.rows.item(i));

        sortWordsRandomly(allThemeWords, false);

        $scope.words = allThemeWords.slice(0, maxWordsNumberInAGame);
        setWordData();
      }, function (err) {
        console.error(err);
      });
    }

    function getPhrasesByThemeId() {
      var allThemePhrases = [];

      WordsDB.selectPhrasesByThemeId($stateParams.themeId).then(function (res) {
        for (var i = 0; i < res.rows.length; i++)
          allThemePhrases.push(res.rows.item(i));

        sortWordsRandomly(allThemePhrases, false);

        $scope.phrases = allThemePhrases.slice(0, maxWordsNumberInAGame);
        setPhraseData();
      }, function (err) {
        console.error(err);
      });
    }

    function getAchievements() {
      WordsDB.selectAchievementsByThemeId($stateParams.themeId).then(function (res) {
        $scope.achievements = res.rows.item(0);
      }, function (err) {
        console.error(err);
      });
    }

    function updateAchievement(achievement, newValue) {
      WordsDB.updateAchievement($stateParams.themeId, achievement, newValue).then(function (res) {
      }, function (err) {
        console.error(err);
      });
    }

    function setWordData() {
      $scope.word = $scope.words[$scope.currentIndex];
      $scope.shuffledName = getShuffledName($scope.word.name);
      $scope.composedNameLetters = getInitialComposedName($scope.word.name);

      if ($stateParams.modeId == 1) {
        $scope.hasSound = $scope.word.hasSound;

        if (window.cordova && $scope.hasSound) {
          var soundFileLocation = 'sounds/' + $scope.word.themeId + '/' + $scope.word.name + '.mp3';

          $cordovaNativeAudio.preloadSimple($scope.word.name, soundFileLocation);
        }
      }
    }

    function setPhraseData() {
      $scope.phrase = $scope.phrases[$scope.currentIndex];
      $scope.shuffledName = getShuffledName($scope.phrase.name);
      $scope.composedNameLetters = getInitialComposedName($scope.phrase.name);
      openDefaultLettersInComposedName($scope.phrase.name);
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
        randomLetter1 = $scope.modeId != 1 || nameWithoutUnderScore.length > 11 ? '' : getRandomLetter(),
        randomLetter2 = $scope.modeId != 1 || nameWithoutUnderScore.length > 10 ? '' : getRandomLetter(),
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
          symbol: name[i] == '_' ? '_' : '?',
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

        while ($scope.composedNameLetters[randomIndex].symbol != '?') {
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

    function getFirstFreeLetterInComposedName() {
      for (var i = 0; i < $scope.composedNameLetters.length; i++) {
        if ($scope.composedNameLetters[i].symbol == '?')
          return i;
      }
 
      return -1;
    }

    function handleCorrectComposedWord() {
      if ($scope.modeId == 1) {
        $scope.score += getScore($scope.word.name.length);
      } else $scope.score++;

      if ($scope.modeId == 3) {
        setNextWordAutomatically($scope.currentIndex);
      }

      $scope.composedWordsCount++;
      $scope.isComposed = true;
      $scope.displayCorrectLogo = true;
      setCorrectComposedWordStyle();
      hideCorrectComposedWordLogo();
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
      var composedLetterButtons = getComposedLetterButtons(),
        letterButtonsBlock = getLetterButtonsBlock(),
        clearButton = getClearButton();

      for (var i = 0; i < composedLetterButtons.length; i++) {
        var button = composedLetterButtons[i];

        button.setAttribute('disabled', 'disabled');
      }

      letterButtonsBlock.style.display = 'none';
      clearButton.setAttribute('disabled', 'disabled');
      clearButton.style.opacity = 0.7;
    }

    function hideCorrectComposedWordLogo() {
      $timeout(function () {
        $scope.displayCorrectLogo = false;
      }, 1000);
    }

    function setInitialState() {
      var letterButtons = getLetterButtons(),
        composedLetterButtons = getComposedLetterButtons(),
        letterButtonsBlock = getLetterButtonsBlock(),
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
        composedLetterButton.classList.remove('decorated-button');
      }

      letterButtonsBlock.style.display = 'block';
      clearButton.removeAttribute('disabled');
      clearButton.style.opacity = 1;
    }

    function showEndGamePopup() {
      var displayFirstStar = Utils.shouldFirstStarBeDisplayed($scope.score) ? 'block' : 'none',
        displaySecondStar = Utils.shouldSecondStarBeDisplayed($stateParams.modeId, $scope.score) ? 'block' : 'none',
        displayThirdStar = Utils.shouldThirdStarBeDisplayed($stateParams.modeId, $scope.score) ? 'block' : 'none',
        popupBody = '<div class="achievement-popup">' +
          '<div class="popup-stars-block">' +
          '<img class="popup-empty-star" ng-src="img/icons/star_frame.png">' +
          '<img id="popupFirstStar" style="display: ' + displayFirstStar + ';" ng-src="img/icons/star_colored.png">' +
          '<img class="popup-empty-star" ng-src="img/icons/star_frame.png">' +
          '<img id="popupSecondStar" style="display: ' + displaySecondStar + ';" ng-src="img/icons/star_colored.png">' +
          '<img class="popup-empty-star" ng-src="img/icons/star_frame.png">' +
          '<img id="popupThirdStar" style="display: ' + displayThirdStar + ';" ng-src="img/icons/star_colored.png">' +
          '</div>' +
          '<p>Рахунок: ' + $scope.score + '</p>' +
          '<p>Кращий рахунок: ' + $scope.achievements['maxScore' + $stateParams.modeId] + '</p>' +
          '</div>',
        endGamePopup = $ionicPopup.alert({
          title: 'КІНЕЦЬ ГРИ',
          template: popupBody
        });

      endGamePopup.then(function (res) {
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
      $scope.counterInMinutes = Math.floor($scope.counter / 60);
      currentTimeout = $timeout(setTimer, 1000);
    };
 
    function stopTimer() {
      $scope.$broadcast('timer-stopped', $scope.counter);
      $scope.gameTime = $scope.counter;
      $scope.counter = 0;
      $scope.counterInMinutes = 0;
      $timeout.cancel(currentTimeout);
    };

    function getTabsElement() {
      return document.getElementsByClassName('tabs')[0];
    }

    function getLetterButtonsBlock() {
      return document.getElementsByClassName('letter-buttons-block')[0];
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

    function getNextButton() {
      return document.getElementsByClassName('next-button')[0];
    }
  });
