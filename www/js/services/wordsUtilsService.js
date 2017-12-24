angular.module('englishLetterByLetter')

.factory('WordsUtils', function ($rootScope, $ionicHistory, Utils, DB, WordsTmpl, Tasks) {
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
      getRandomIndex: function(name) {
        var index = Math.floor(Math.random() * name.length);

        return index;
      },
      getAlignedPhraseName: function(name, maxNumber) {
        var charToCheck = name.charAt(maxNumber),
            alignedName;

        if (name.length > maxNumber && charToCheck != '_') {
          var subName = name.substr(0, maxNumber),
            lastSeparatorIndex = subName.lastIndexOf('_'),
            numberToAlignLeft = numberToAlignRight = 0;

          subName = subName.substr(0, lastSeparatorIndex),
          numberToAlignLeft = Math.floor((maxNumber - subName.length) / 2);
          numberToAlignRight = maxNumber - subName.length - numberToAlignLeft;
          alignedName = Array(numberToAlignLeft + 1).join('_') + subName +  Array(numberToAlignRight + 1).join('_') + name.substr(lastSeparatorIndex + 1);
        } else if (charToCheck == '_') 
            alignedName = name.substr(0, maxNumber) + name.substr(maxNumber + 1);
          else alignedName = name;

        return alignedName;
      },
      showConfirmLeavePopup: function() {
        var popupBody = WordsTmpl.getConfirmLeavePopupBody();

        Utils.showConfirm(popupBody, $ionicHistory.goBack);
      },
      showEndGamePopup: function(params) {
        var popupBody = WordsTmpl.getEndGamePopupBody(params.score, params.bestScore);

        Utils.showAlert(popupBody, params, showNewRecordPopup);
        if (window.cordova) Utils.playSound('end');
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

    function showNewRecordPopup(params) {
      if (params.scoreRecord || params.timeRecord) {
        var popupBody = WordsTmpl.getNewRecordPopupBody(params);

        Utils.showAlert(popupBody, params, manageTasksAndGoBack);
        if (window.cordova) Utils.playSound('record');
      } else manageTasksAndGoBack(params);
    }

    function manageTasksAndGoBack(params) {
      Tasks.manageTasks(params);
      $ionicHistory.goBack();
    }
 })