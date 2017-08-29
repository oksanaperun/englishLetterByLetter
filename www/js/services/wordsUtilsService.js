angular.module('englishLetterByLetter')

.factory('WordsUtils', function ($rootScope, $cordovaNativeAudio, $ionicHistory, Utils, DB, WordsTmpl) {
    return {
      getInitialComposedName: function(name) {
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
      },
      getFirstUnknownLetter: function(letters) {
        for (var i = 0; i < letters.length; i++) {
          if (letters[i].symbol == '?')
            return i;
        }
 
        return -1;
      },
      sortWordsRandomly: function(arr, sortByLength) {
        arr.sort(function(a, b) {
          if (sortByLength)
            return a.name.length - b.name.length || 0.5 - Math.random();
          else return 0.5 - Math.random();
        });
      },
      getShuffledName: function(modeId, maxLettersCountInARow, name) {
        var nameWithoutUnderScore = name.replace('_', ''),
            shuffledName = getShuffledName(modeId, maxLettersCountInARow, name);

        if (shuffledName.indexOf(nameWithoutUnderScore) > -1) {
          return getShuffledName(modeId, maxLettersCountInARow, name);
        }

        return shuffledName;
      },
      getRandomIndexExcludingUnderscore: function(name) {
        var index = getRandomIndexExcludingUnderscore(name);

        if (name[index] == '_')
          return getRandomIndexExcludingUnderscore(name);
        else return index;
      },
      playSound: function(sound) {
        if (window.cordova) {
          $cordovaNativeAudio.play(sound);
        }
      },
      showEndGamePopup: function(params) {
        var popupBody = WordsTmpl.getEndGamePopupBody(params.score, params.bestScore);

        Utils.showAlert(popupBody, manageGameEnd(params));
      }
  	}

    function getShuffledName(modeId, maxLettersCountInARow, name) {
      var nameWithoutUnderScore = name.replace('_', ''),
          lettersCount = nameWithoutUnderScore.length,
          shouldBeRandomLetter1 = modeId != 1 || lettersCount > maxLettersCountInARow - 2,
          shouldBeRandomLetter2 = modeId != 1 || lettersCount > maxLettersCountInARow - 1,
          randomLetter1 = shouldBeRandomLetter1 ? '' : getRandomLetter(),
          randomLetter2 = shouldBeRandomLetter2 ? '' : getRandomLetter(),
          nameWithRandomLetters = randomLetter1 + nameWithoutUnderScore + randomLetter2,
          shuffledNameArray = getShuffledArray(nameWithRandomLetters.split('')),
          shuffledName = shuffledNameArray.toString().replace(/,/g, '');

      return shuffledName;
    }

    function getRandomLetter() {
      var alphabet = 'abcdefghijklmnopqrstuvwxyz',
          randomIndex = Math.floor(Math.random() * alphabet.length);

      return alphabet.charAt(randomIndex);
    }

    function getShuffledArray(arr) {
      return arr.sort(function() {return 0.5 - Math.random()});
    }

    function getRandomIndexExcludingUnderscore(name) {
      var index = Math.floor(Math.random() * name.length);

      return index;
    }

    function manageGameEnd(params) {
      if (params.scoreRecord || params.gameTimeRecord) {
        manageAchievements(params);
        showNewRecordPopup(params);
      } else $ionicHistory.goBack();
    }

    function manageAchievements(params) {
      if (params.score) {
        updateAchievement(params.themeId, params.keyWord + 'MaxScore', params.scoreRecord);
      }
      if (params.gameTime) {
        updateAchievement(params.themeId, params.keyWord + 'MinTime', params.gameTimeRecord);
      }
    }

    function updateAchievement(themeId, achievement, newValue) {
      DB.updateAchievement(themeId, achievement, newValue).then(function (res) {
      }, function (err) {
        console.error(err);
      });
    }

    function showNewRecordPopup(params) {
      var popupBody = WordsTmpl.getNewRecordPopupBody(params);

      Utils.showAlert(popupBody, $ionicHistory.goBack());
    }
 })