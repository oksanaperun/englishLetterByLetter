angular.module('englishLetterByLetter')

.factory('WordsTmpl', function(Utils) {
	return {
    hideTabs: function() {
      var tabs = getTabsElement();

      tabs.style.display = 'none';
    },
    displayTabs: function() {
      var tabs = getTabsElement();

      tabs.style.display = '';
    },
		moveLetter: function(letterIndex, firstSpaceIndex) {
			var letterButtons = getLetterButtons(),
        	composedLetterButtons = getComposedLetterButtons();

      letterButtons[letterIndex].setAttribute('disabled', 'disabled');
      letterButtons[letterIndex].style.opacity = 0;
      composedLetterButtons[firstSpaceIndex].classList.add('decorated-button');
		},
    moveLetterBack: function(letterIndex, originalLetterIndex) {
      var letterButtons = getLetterButtons(),
          composedLetterButtons = getComposedLetterButtons();

      letterButtons[originalLetterIndex].removeAttribute('disabled');
      letterButtons[originalLetterIndex].style.opacity = 1;
      composedLetterButtons[letterIndex].classList.remove('decorated-button');
    },
    clearComposedWord: function() {
      removeComposedLetterButtonsDecoration();
      enableLetterButtons();
    },
    setCorrectComposedWordStyle: function() {
      disableComposedLetterButtons();
      hideLetterButtonsBlock();
      disableClearButton();
    },
    setInitialState: function() {
      enableComposedLetterButtons();
      removeComposedLetterButtonsDecoration();
      enableLetterButtons();
      displayLetterButtonsBlock();
      enableClearButton();
    },
    triggerClickOnNextButton: function() {
      angular.element(getNextButton()).triggerHandler('click');
    },
    getEndGamePopupBody: function(score, bestScore) {
      return getEndGamePopupBody(score, bestScore);
    },
    getNewRecordPopupBody: function(params) {
      return getNewRecordPopupBody(params);
    }
	}

  function enableComposedLetterButtons() {
    var composedLetterButtons = getComposedLetterButtons();

    for (var i = 0; i < composedLetterButtons.length; i++) {
      var composedLetterButton = composedLetterButtons[i];

      composedLetterButton.removeAttribute('disabled');
    }
  }

  function disableComposedLetterButtons() {
    var composedLetterButtons = getComposedLetterButtons();

    for (var i = 0; i < composedLetterButtons.length; i++) {
      var composedLetterButton = composedLetterButtons[i];

      composedLetterButton.setAttribute('disabled', 'disabled');
    }
  }

  function removeComposedLetterButtonsDecoration() {
    var composedLetterButtons = getComposedLetterButtons();

    for (var i = 0; i < composedLetterButtons.length; i++) {
      var composedLetterButton = composedLetterButtons[i];

      composedLetterButton.classList.remove('decorated-button');
    }
  }

  function enableLetterButtons() {
    var letterButtons = getLetterButtons();

    for (var i = 0; i < letterButtons.length; i++) {
      var letterButton = letterButtons[i];

      letterButton.removeAttribute('disabled');
      letterButton.style.opacity = 1;
    }
  }

  function displayLetterButtonsBlock() {
    var letterButtonsBlock = getLetterButtonsBlock();

    letterButtonsBlock.style.display = 'block';
  }

  function hideLetterButtonsBlock() {
    var letterButtonsBlock = getLetterButtonsBlock();

    letterButtonsBlock.style.display = 'none';
  }

  function enableClearButton() {
    var clearButton = getClearButton();

    clearButton.removeAttribute('disabled');
    clearButton.style.opacity = 1;
  }

  function disableClearButton() {
    var clearButton = getClearButton();

    clearButton.setAttribute('disabled', 'disabled');
    clearButton.style.opacity = 0.7;
  }

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

  function getEndGamePopupBody(score, bestScore) {
      var displayFirstStar = Utils.shouldFirstStarBeDisplayed(score) ? 'block' : 'none',
        displaySecondStar = Utils.shouldSecondStarBeDisplayed(score) ? 'block' : 'none',
        displayThirdStar = Utils.shouldThirdStarBeDisplayed(score) ? 'block' : 'none';

      return '<div class="achievement-popup">' +
        '<div class="popup-stars-block">' +
        '<img class="popup-empty-star" ng-src="img/icons/star_frame.png">' +
        '<img id="popupFirstStar" style="display: ' + displayFirstStar + ';" ng-src="img/icons/star_colored.png">' +
        '<img class="popup-empty-star" ng-src="img/icons/star_frame.png">' +
        '<img id="popupSecondStar" style="display: ' + displaySecondStar + ';" ng-src="img/icons/star_colored.png">' +
        '<img class="popup-empty-star" ng-src="img/icons/star_frame.png">' +
        '<img id="popupThirdStar" style="display: ' + displayThirdStar + ';" ng-src="img/icons/star_colored.png">' +
        '</div>' +
        '<p>Рахунок: ' + score + '</p>' +
        '<p>Кращий рахунок: ' + bestScore + '</p>' +
        '</div>';
    }

    function getNewRecordPopupBody(params) {
      var beginHTML = '<div class="achievement-popup">' +
          '<p>Ви встановили новий рекорд:</p>',
        scoreAchievementHTML = params.scoreRecord ? '<h5><i class="icon ion-ios-star-outline"></i> ' +
          params.scoreRecord + ' очок</h5>' : '',
        timeAchievementHTML = params.gameTimeRecord ? '<h5><i class="icon ion-ios-timer-outline"></i> ' +
          params.gameTimeRecord + ' секунд</h5>' : '',
        endHTML = '</div>';

      return beginHTML + scoreAchievementHTML + timeAchievementHTML + endHTML;
    }
})
