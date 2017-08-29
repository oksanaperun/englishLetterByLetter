angular.module('englishLetterByLetter')

  .controller('WordCtrl', function($scope, $rootScope, $stateParams, $state, $timeout, $ionicPlatform, 
    $ionicPopup, $ionicHistory, $cordovaNativeAudio, Utils, DB, WordsTmpl, WordsUtils) {
    var maxWordsNumberInAGame = 15,
      maxLettersCountInARow = 13,
      currentTimeout = null;

    $scope.modeId = $stateParams.modeId;
    $scope.score = $scope.composedWordsCount = $scope.currentIndex = 0;
    $scope.isComposed = $scope.displayCorrectLogo = false;
    $scope.words = [];
    $scope.phrases = [];
    $scope.correctText = 'правильно';

    WordsTmpl.hideTabs();

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

    function setSize() {
      var marginRight = 4;

      $scope.blockWidth = 750 > $rootScope.viewWidth ? $rootScope.viewWidth : 750;
      $scope.blockMarginLeft = $scope.blockWidth == 750 ? -Math.floor($scope.blockWidth / 2) : 0;
      $scope.blockMarginTop =  $rootScope.viewHeight >= 500 ? -Math.floor($rootScope.viewHeight / 3) : 0;
      $scope.wordHeaderBlockHeight = $stateParams.modeId == 3 ? 75 : 60;
      $scope.wordBodyButtonMarginTop = $stateParams.modeId == 1 ? '55%' : ($stateParams.modeId == 3 ? '25%' : '0px');
      $scope.letterWidth = Math.floor($scope.blockWidth / maxLettersCountInARow) - marginRight;
      $scope.letterHeight = Math.floor($scope.letterWidth / 1.07);
    }

    function manageGameMode() {
      $scope.counter = 0;
      $scope.counterInMinutes = 0;

      if ($stateParams.modeId == 1 || $stateParams.modeId == 3) {
        getWordsByThemeId();
      }

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

    $rootScope.$ionicGoBack = function() {
      if ($ionicHistory.backView().stateName === 'tab.theme') {
        Utils.showConfirmLeaveGamePopup();
      } else {
        $ionicHistory.goBack();
      }
    };

    $scope.$on('$destroy', function() {
      stopTimer();
      WordsTmpl.displayTabs();
    });

    $scope.playSound = function() {
      WordsUtils.playSound($scope.word.name);
    }

    $scope.moveLetter = function(letter, letterIndex) {
      var firstSpaceIndex = WordsUtils.getFirstUnknownLetter($scope.composedNameLetters);

      if (firstSpaceIndex > -1) {
        WordsTmpl.moveLetter(letterIndex, firstSpaceIndex);
        $scope.composedNameLetters[firstSpaceIndex].symbol = letter;
        $scope.composedNameLetters[firstSpaceIndex].originalLetterIndex = letterIndex;
      }
    };

    $scope.moveLetterBack = function(letterIndex) {
      var originalLetterIndex = $scope.composedNameLetters[letterIndex].originalLetterIndex;

      if (originalLetterIndex > -1) {
        WordsTmpl.moveLetterBack(letterIndex, originalLetterIndex);
        $scope.composedNameLetters[letterIndex].symbol = '?';
        $scope.composedNameLetters[letterIndex].originalLetterIndex = -1;
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
      WordsTmpl.clearComposedWord();

      for (var i = 0; i < $scope.composedNameLetters.length; i++) {
        var isLetterUnknown = !$scope.composedNameLetters[i].isDefault && $scope.composedNameLetters[i].symbol != '_';

        if (isLetterUnknown) {
          $scope.composedNameLetters[i].symbol = '?';
        }  
      }
    }

    $scope.setNextWord = function() {
      $scope.currentIndex++;

      if ($scope.currentIndex == $scope.words.length || $scope.currentIndex == $scope.phrases.length) {
        stopTimer();
        showEndGamePopup();
      } else {
        handleNextWord();
      }
    }

    function handleNextWord() {
      if ($scope.modeId == 1 || $scope.modeId == 3) {
        setWordData();
      } else {
        setPhraseData();
      }

      $scope.isComposed = false;
      WordsTmpl.setInitialState();
    }

    function setNextWordAutomatically(composedWordIndex) {
      $timeout(function () {
        if ($scope.currentIndex == composedWordIndex) {
          WordsTmpl.triggerClickOnNextButton();
        }
      }, 1000);
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

    function setWordData() {
      $scope.word = $scope.words[$scope.currentIndex];
      $scope.shuffledName = WordsUtils.getShuffledName($scope.modeId, maxLettersCountInARow, $scope.word.name);
      $scope.composedNameLetters = WordsUtils.getInitialComposedName($scope.word.name);

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
      $scope.shuffledName = WordsUtils.getShuffledName($scope.modeId, maxLettersCountInARow, $scope.phrase.name);
      $scope.composedNameLetters = WordsUtils.getInitialComposedName($scope.phrase.name);
      openDefaultLettersInComposedName($scope.phrase.name);
    }

    function openDefaultLettersInComposedName(name) {
      var letterCountToDisplay = Math.floor(name.replace('_', '').length / 2);

      for (var j = 0; j < letterCountToDisplay; j++) {
        var randomIndex = WordsUtils.getRandomIndexExcludingUnderscore(name);

        while ($scope.composedNameLetters[randomIndex].symbol != '?') {
            randomIndex = WordsUtils.getRandomIndexExcludingUnderscore(name);
        }

        $scope.composedNameLetters[randomIndex].symbol = name[randomIndex];
        $scope.composedNameLetters[randomIndex].isDefault = true;
        $scope.shuffledName = $scope.shuffledName.replace(name[randomIndex], '');
      }
    }

    function handleCorrectComposedWord() {
      $scope.score++;

      if ($scope.modeId == 3) {
        setNextWordAutomatically($scope.currentIndex);
      }

      $scope.composedWordsCount++;
      $scope.isComposed = $scope.displayCorrectLogo = true;
      WordsTmpl.setCorrectComposedWordStyle();
      hideCorrectComposedWordLogo();
    }

    function hideCorrectComposedWordLogo() {
      $timeout(function () {
        $scope.displayCorrectLogo = false;
      }, 1000);
    }

    function showEndGamePopup() {
      var keyWord = $rootScope.gameModes[$scope.modeId - 1].keyWord,
          maxScoreAchievement = keyWord + 'MaxScore',
          minTimeAchievement = keyWord + 'MinTime',
          scoreAchievement = $scope.achievements[maxScoreAchievement] < $scope.score,
          timeAchievement = ($scope.composedWordsCount == $scope.words.length || $scope.composedWordsCount == $scope.phrases.length) && 
            ($scope.achievements[minTimeAchievement] > $scope.gameTime);

      WordsUtils.showEndGamePopup({
          score: $scope.score,
          bestScore: $scope.achievements[maxScoreAchievement],
          scoreRecord: scoreAchievement ? $scope.score : false,
          gameTimeRecord: timeAchievement ? $scope.gameTime : false,
          themeId: $stateParams.themeId,
          keyWord: keyWord
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
  });
