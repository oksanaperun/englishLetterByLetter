angular.module('englishLetterByLetter')

  .controller('WordCtrl', function ($scope, $rootScope, $stateParams, $state, $timeout, $ionicPlatform,
    $ionicPopup, $ionicHistory, $cordovaNativeAudio, Utils, DB, WordsTmpl, WordsUtils, App) {
    var maxWordsNumberInAGame = 15,
      maxLettersCountInARow = 13,
      currentTimeout = null,
      wordsCountWithLength7 = 0,
      wordsCountStartingWithLetter = 0,
      phrasesCountWithThreeWords = 0,
      phrasesCountStartingWithLetter = 0;

    $scope.modeId = $stateParams.modeId;
    $scope.score = $scope.currentIndex = 0;
    $scope.isComposed = $scope.displayCorrectLogo = false;
    $scope.words = [];
    $scope.phrases = [];
    $scope.correctText = 'правильно';

    WordsTmpl.hideTabs();

    if (window.cordova) {
      document.addEventListener('deviceready', function () {
        setSize();
        preloadSounds();
        manageGameMode();
      });
    } else {
      $ionicPlatform.ready(function () {
        setSize();
        manageGameMode();
      });
    }

    function setSize() {
      var marginRight = $rootScope.viewHeight >= 360 ? 4 : 2;

      $scope.blockWidth = 750 > $rootScope.viewWidth ? $rootScope.viewWidth : 750;
      $scope.blockMarginLeft = $scope.blockWidth == 750 ? -Math.floor($scope.blockWidth / 2) : 0;
      $scope.blockMarginTop = $rootScope.viewHeight >= 500 ? -Math.floor($rootScope.viewHeight / 3) : 0;
      $scope.wordBodyButtonMarginTop = $stateParams.modeId == 1 ? '55%' : ($stateParams.modeId == 3 ? '25%' : '0px');
      $scope.letterWidth = Math.floor(($scope.blockWidth - 10) / maxLettersCountInARow) - marginRight;
      $scope.letterHeight = Math.floor($scope.letterWidth / 1.07);
    }

    function manageGameMode() {
      $scope.counter = $scope.counterInMinutes = 0;

      if ($stateParams.modeId == 1 || $stateParams.modeId == 3)
        getWordsByThemeId();
      if ($stateParams.modeId == 2) {
        $scope.hasSound = 0;
        getPhrasesByThemeId();
      }
      if ($stateParams.modeId == 3) {
        $scope.hasSound = 0;
        setTimer();
      }

      getAchievements();
    }

    function preloadSounds() {
      $cordovaNativeAudio.preloadSimple('correct', 'sounds/correct.mp3');
      $cordovaNativeAudio.preloadSimple('end', 'sounds/end.mp3');
      $cordovaNativeAudio.preloadSimple('record', 'sounds/record.mp3');
      $cordovaNativeAudio.preloadSimple('complete', 'sounds/complete.mp3');
      $cordovaNativeAudio.preloadComplex('hint', 'sounds/hint.mp3', 1, 1, 0);
    }

    $rootScope.$ionicGoBack = function () {
      if ($ionicHistory.backView().stateName === 'tab.theme') {
        WordsUtils.showConfirmLeavePopup();
      } else $ionicHistory.goBack();
    };

    $scope.$on('$destroy', function () {
      stopTimer();
      WordsTmpl.displayTabs();
    });

    $scope.$watch('$root.hintCounter', function () {
      $scope.hintBlockStyle = {
        'background-image': WordsTmpl.getHintBlockBackgroundImage(),
        'opacity': $rootScope.hintCounter == 0 ? 1 : 0.5
      };
    });

    $scope.playSound = function () {
      Utils.playSound($scope.word.name);
    }

    $scope.moveLetter = function (letter, letterIndex) {
      moveLetter(letter, letterIndex, false);
    };

    function moveLetter(letter, letterIndex, isHint) {
      var firstSpaceIndex = WordsUtils.getFirstUnknownLetter($scope.composedNameLetters);

      if (firstSpaceIndex > -1) {
        WordsTmpl.moveLetter(letterIndex, firstSpaceIndex, isHint);

        $scope.composedNameLetters[firstSpaceIndex].symbol = letter;
        $scope.composedNameLetters[firstSpaceIndex].originalLetterIndex = letterIndex;

        if (isHint && $rootScope.userSettings.isSoundsOn)
          Utils.playSound('hint');
      }
    }

    $scope.moveLetterBack = function (letterIndex) {
      moveLetterBack(letterIndex);
    };

    function moveLetterBack(letterIndex) {
      var originalLetterIndex = $scope.composedNameLetters[letterIndex].originalLetterIndex;

      if (originalLetterIndex > -1) {
        WordsTmpl.moveLetterBack(letterIndex, originalLetterIndex);
        $scope.composedNameLetters[letterIndex].symbol = '?';
        $scope.composedNameLetters[letterIndex].originalLetterIndex = -1;
      }
    }

    $scope.checkComposedWord = function () {
      $scope.composedName = '';
      var nameToCompare = $scope.modeId == 2 ? $scope.phrase.name : $scope.word.name;

      for (var i = 0; i < $scope.composedNameLetters.length; i++)
        if ($scope.composedNameLetters[i].symbol != '?')
          $scope.composedName += $scope.composedNameLetters[i].symbol;

      if ($scope.composedName === nameToCompare)
        handleCorrectComposedWord();
    };

    $scope.clearComposedWord = function () {
      WordsTmpl.clearComposedWord();

      for (var i = 0; i < $scope.composedNameLetters.length; i++) {
        var isLetterUnknown = !$scope.composedNameLetters[i].isDefault && $scope.composedNameLetters[i].symbol != '_';

        if (isLetterUnknown)
          $scope.composedNameLetters[i].symbol = '?';
      }
    }

    $scope.setNextWord = function () {
      $scope.currentIndex++;

      if ($scope.currentIndex == $scope.words.length || $scope.currentIndex == $scope.phrases.length)
        endGame();
      else handleNextWord();
    }

    function handleNextWord() {
      if ($scope.modeId == 1 || $scope.modeId == 3) setWordData();
      else setPhraseData();

      $scope.isComposed = false;
      WordsTmpl.setInitialState();
    }

    function setNextWordAutomatically(composedWordIndex) {
      $timeout(function () {
        if ($scope.currentIndex == composedWordIndex)
          WordsTmpl.triggerClickOnNextButton();
      }, 600);
    }

    function getWordsByThemeId() {
      var allThemeWords = [];

      DB.selectWordsByThemeId($stateParams.themeId).then(function (res) {
        for (var i = 0; i < res.rows.length; i++)
          allThemeWords.push(res.rows.item(i));

        WordsUtils.sortWordsRandomly(allThemeWords, false);
        $scope.words = allThemeWords.slice(0, maxWordsNumberInAGame);
        setWordData();
      }, function (err) {
        console.error(err);
      });
    }

    function getPhrasesByThemeId() {
      var allThemePhrases = [];

      DB.selectPhrasesByThemeId($stateParams.themeId).then(function (res) {
        for (var i = 0; i < res.rows.length; i++)
          allThemePhrases.push(res.rows.item(i));

        WordsUtils.sortWordsRandomly(allThemePhrases, false);
        $scope.phrases = allThemePhrases.slice(0, maxWordsNumberInAGame);
        setPhraseData();
      }, function (err) {
        console.error(err);
      });
    }

    function getAchievements() {
      DB.selectAchievementsByThemeId($stateParams.themeId).then(function (res) {
        $scope.achievements = res.rows.item(0);
      }, function (err) {
        console.error(err);
      });
    }

    function updateAchievements(keyWord, achievements) {
      DB.updateAchievementsByThemeId($stateParams.themeId, keyWord, achievements).then(function (res) {
      }, function (err) {
        console.error(err);
      });
    }

    function setWordData() {
      $scope.word = $scope.words[$scope.currentIndex];
      $scope.shuffledName = WordsUtils.getShuffledName($scope.modeId, maxLettersCountInARow, $scope.word.name);
      $scope.composedNameLetters = WordsUtils.getInitialComposedName($scope.word.name);
      var previousWord = $scope.words[$scope.currentIndex - 1];

      if ($stateParams.modeId == 1) {
        $scope.hasSound = $scope.word.hasSound;

        if (window.cordova && $scope.hasSound) {
          var soundFileLocation = 'sounds/' + $scope.word.themeId + '/' + $scope.word.name + '.mp3';

          $cordovaNativeAudio.preloadSimple($scope.word.name, soundFileLocation);
        }
        if (window.cordova && previousWord && previousWord.hasSound) {
          $cordovaNativeAudio.unload(previousWord.name);
        }
      }
    }

    function setPhraseData() {
      $scope.phrase = $scope.phrases[$scope.currentIndex];
      $scope.shuffledName = WordsUtils.getShuffledName($scope.modeId, maxLettersCountInARow, $scope.phrase.name);
      $scope.phrase.name = WordsUtils.getAlignedPhraseName($scope.phrase.name, maxLettersCountInARow);
      $scope.composedNameLetters = WordsUtils.getInitialComposedName($scope.phrase.name);
      openDefaultLettersInComposedName($scope.phrase.name);
    }

    function openDefaultLettersInComposedName(name) {
      var letterCountToDisplay = Math.floor(name.replace(/_/g, '').length / 2);

      for (var i = 0; i < letterCountToDisplay; i++) {
        var randomIndex, symbol;

        do {
          randomIndex = WordsUtils.getRandomIndex(name);
          symbol = $scope.composedNameLetters[randomIndex].symbol;
        } while (symbol != '?')

        $scope.composedNameLetters[randomIndex].symbol = name[randomIndex];
        $scope.composedNameLetters[randomIndex].isDefault = true;
        $scope.shuffledName = $scope.shuffledName.replace(name[randomIndex], '');
      }
    }

    function handleCorrectComposedWord() {
      $scope.score++;
      $scope.isComposed = $scope.displayCorrectLogo = true;
      WordsTmpl.setCorrectComposedWordStyle();
      hideCorrectComposedWordLogo();
      if ($rootScope.userSettings.isSoundsOn) Utils.playSound('correct');
      if ($scope.modeId == 1) manageMode1Achievements();
      if ($scope.modeId == 2) manageMode2Achievements();
      if ($rootScope.userSettings.isAutoGoNext) setNextWordAutomatically($scope.currentIndex);
    }

    function manageMode1Achievements() {
      if ($scope.word.name.length == 7) wordsCountWithLength7++;
      if ($scope.word.name.charAt(0) == 'c') wordsCountStartingWithLetter++;
    }

    function manageMode2Achievements() {
      if ($scope.phrase.name.split('_').length == 3) phrasesCountWithThreeWords++;
      if ($scope.phrase.name.charAt(0) == 's') phrasesCountStartingWithLetter++;
    }

    function hideCorrectComposedWordLogo() {
      $timeout(function () {
        $scope.displayCorrectLogo = false;
      }, 300);
    }

    function endGame() {
      var keyWord = $rootScope.gameModes[$scope.modeId - 1].keyWord,
        gameTime = $scope.counter,
        isWin = $scope.modeId != 2 ? $scope.score == $scope.words.length : $scope.score == $scope.phrases.length,
        isTimeWin = isWin ? (gameTime <= 120 && gameTime > 0 ? true : false) : false,
        isScoreRecord = $scope.achievements[keyWord + 'MaxScore'] < $scope.score,
        isTimeRecord = isTimeWin ? $scope.achievements.questionsMinTime > gameTime : false,
        maxScore = isScoreRecord ? $scope.score : $scope.achievements[keyWord + 'MaxScore'],
        minTime = isTimeRecord ? gameTime : $scope.achievements.questionsMinTime;

      stopTimer();
      App.setNewScoreData($scope.modeId, $stateParams.themeId, $scope.score);

      updateAchievements(keyWord, {
        gameCount: $scope.achievements[keyWord + 'GameCount'] + 1,
        itemsCount: $scope.achievements[keyWord + 'Count'] + $scope.score,
        maxScore: maxScore,
        winCount: $scope.achievements[keyWord + 'WinCount'] + (isWin ? 1 : 0),
        questionsMinTime: minTime,
        questionsTimeWinCount: $scope.achievements.questionsTimeWinCount + (isTimeWin ? 1 : 0)
      });

      WordsUtils.showEndGamePopup({
        themeName: $rootScope.themeName,
        score: $scope.score,
        bestScore: maxScore,
        scoreRecord: isScoreRecord ? $scope.score : null,
        timeRecord: isTimeRecord ? gameTime : null,
        wordsCountWithLength7: wordsCountWithLength7,
        wordsCountStartingWithLetter: wordsCountStartingWithLetter,
        phrasesCountWithThreeWords: phrasesCountWithThreeWords,
        phrasesCountStartingWithLetter: phrasesCountStartingWithLetter
      });
    }

    function setTimer() {
      $scope.counter++;
      $scope.counterInMinutes = Math.floor($scope.counter / 60);
      currentTimeout = $timeout(setTimer, 1000);
    };

    function stopTimer() {
      $scope.$broadcast('timer-stopped', $scope.counter);
      $scope.counter = 0;
      $scope.counterInMinutes = 0;
      $timeout.cancel(currentTimeout);
    };

    var delayOnLetterMove = 300;

    $scope.fixAndCompose = function () {
      if ($rootScope.hintCounter == 0 && !$scope.isComposed) {
        $rootScope.hintCounter++;
        Utils.setHintTimer();
        WordsTmpl.disableAllLetterButtons();

        var originalName = $scope.modeId == 2 ? $scope.phrase.name : $scope.word.name,
          issuesCount = WordsUtils.getUnknownAndWrongComposedLettersCount($scope.composedNameLetters, originalName),
          wrongComposedLetterIndexes = WordsUtils.getAllWrongComposedLetterIndexes($scope.composedNameLetters, originalName),
          wrongComposedLettersCount = wrongComposedLetterIndexes.length,
          issuesFixCount = issuesCount + wrongComposedLettersCount + 1.5;

        for (var i = 0; i < wrongComposedLettersCount; i++)
          moveWrongComposedLetterBack(i, wrongComposedLetterIndexes[i]);

        $timeout(function () {
          var unknownLetters = WordsUtils.getAllUnknownLetters($scope.composedNameLetters, originalName);

          for (var i = 0; i < unknownLetters.length; i++)
            moveLetterToComposedLettersBlock(i, unknownLetters[i]);
        }, delayOnLetterMove * wrongComposedLettersCount);

        $timeout(function () {
          handleCorrectComposedWord();
        }, delayOnLetterMove * issuesFixCount);
      }
    }

    function moveWrongComposedLetterBack(index, wrongComposedLetterIndex) {
      $timeout(function () {
        moveLetterBack(wrongComposedLetterIndex);
      }, delayOnLetterMove * index);
    }

    function moveLetterToComposedLettersBlock(index, unknownLetter) {
      $timeout(function () {
        var letterToMoveIndex = getLetterIndexInLetterButtonsBlock(unknownLetter);

        moveLetter(unknownLetter, letterToMoveIndex, true);
      }, delayOnLetterMove * index);
    }

    function getLetterIndexInLetterButtonsBlock(letter) {
      var letterIndex = -1,
        usedLetterIndexesInShuffledName = [];

      for (var i = 0; i < $scope.composedNameLetters.length; i++)
        if ($scope.composedNameLetters[i].originalLetterIndex > -1)
          usedLetterIndexesInShuffledName.push($scope.composedNameLetters[i].originalLetterIndex);

      for (var i = 0; i < $scope.shuffledName.length; i++)
        if ($scope.shuffledName[i] == letter && usedLetterIndexesInShuffledName.indexOf(i) == -1) {
          letterIndex = i;
          break;
        }

      return letterIndex;
    }
  });
