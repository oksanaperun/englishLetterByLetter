angular.module('englishLetterByLetter')

  .factory('WordsTmpl', function ($rootScope, App, Utils) {
    return {
      hideTabs: function () {
        var tabs = getTabsElement();

        tabs.style.display = 'none';
      },
      displayTabs: function () {
        var tabs = getTabsElement();

        tabs.style.display = '';
      },
      moveLetter: function (letterIndex, firstSpaceIndex, isHint) {
        var letterButton = getLetterButtonByIndex(letterIndex),
          composedLetterButton = getComposedLetterButtonByIndex(firstSpaceIndex);

        letterButton.setAttribute('disabled', 'disabled');
        letterButton.style.opacity = 0;
        composedLetterButton.classList.add('decorated-button');
        if (isHint) composedLetterButton.classList.add('hint-letter-button');
      },
      moveLetterBack: function (letterIndex, originalLetterIndex) {
        var letterButton = getLetterButtonByIndex(originalLetterIndex),
          composedLetterButton = getComposedLetterButtonByIndex(letterIndex);

        letterButton.removeAttribute('disabled');
        letterButton.style.opacity = 1;
        composedLetterButton.classList.remove('decorated-button');
      },
      clearComposedWord: function () {
        removeComposedLetterButtonsDecoration();
        enableLetterButtons();
      },
      setCorrectComposedWordStyle: function () {
        disableComposedLetterButtons();
        hideLetterButtonsBlock();
        disableClearButton();
      },
      setInitialState: function () {
        enableComposedLetterButtons();
        removeComposedLetterButtonsDecoration();
        enableLetterButtons();
        displayLetterButtonsBlock();
        enableClearButton();
      },
      triggerClickOnNextButton: function () {
        angular.element(getNextButton()).triggerHandler('click');
      },
      getConfirmLeavePopupBody: function () {
        return getConfirmLeavePopupBody();
      },
      getEndGamePopupBody: function (score, bestScore) {
        return getEndGamePopupBody(score, bestScore);
      },
      getNewRecordPopupBody: function (params) {
        return getNewRecordPopupBody(params);
      },
      disableAllLetterButtons: function () {
        disableComposedLetterButtons();
        disableLetterButtons();
      },
      getHintBlockBackgroundImage: function () {
        var backgroundImage = 'none;',
          halfCircleDegree = $rootScope.webkitPrefix ? 0 : 90,
          halfCircle = $rootScope.webkitPrefix + 'linear-gradient(' + halfCircleDegree + 'deg, #fde2c5 50%, transparent 50%)',
          degree;

        if ($rootScope.hintCounter > 1 && $rootScope.hintCounter <= 30) {
          degree = $rootScope.webkitPrefix ? (360 - $rootScope.hintCounter * 6) : ($rootScope.hintCounter * 6 + 90);
          backgroundImage = $rootScope.webkitPrefix + 'linear-gradient(' + degree + 'deg, transparent 50%, #fde2c5 50%), ' + halfCircle;
        }
        if ($rootScope.hintCounter > 30 && $rootScope.hintCounter < 60) {
          degree = $rootScope.webkitPrefix ? (540 - $rootScope.hintCounter * 6) : ($rootScope.hintCounter * 6 - 90);
          backgroundImage = $rootScope.webkitPrefix + 'linear-gradient(' + degree + 'deg, transparent 50%, #bb6e39 50%), ' + halfCircle;
        }

        return backgroundImage;
      }
    }

    function enableComposedLetterButtons() {
      var composedLetterButtons = getComposedLetterButtons();

      for (var i = 0; i < composedLetterButtons.length; i++)
        composedLetterButtons[i].removeAttribute('disabled');
    }

    function disableComposedLetterButtons() {
      var composedLetterButtons = getComposedLetterButtons();

      for (var i = 0; i < composedLetterButtons.length; i++)
        composedLetterButtons[i].setAttribute('disabled', 'disabled');
    }

    function removeComposedLetterButtonsDecoration() {
      var composedLetterButtons = getComposedLetterButtons();

      for (var i = 0; i < composedLetterButtons.length; i++) {
        composedLetterButtons[i].classList.remove('decorated-button');
        composedLetterButtons[i].classList.remove('hint-letter-button');
      }
    }

    function disableLetterButtons() {
      var letterButtons = getLetterButtons();

      for (var i = 0; i < letterButtons.length; i++)
        letterButtons[i].setAttribute('disabled', 'disabled');
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
      clearButton.style.opacity = 0.5;
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

    function getLetterButtonByIndex(index) {
      return document.getElementsByClassName('letter-button')[index];
    }

    function getComposedLetterButtons() {
      return document.getElementsByClassName('composed-letter-button');
    }

    function getComposedLetterButtonByIndex(index) {
      return document.getElementsByClassName('composed-letter-button')[index];
    }

    function getClearButton() {
      return document.getElementsByClassName('clear-button')[0];
    }

    function getNextButton() {
      return document.getElementsByClassName('next-button')[0];
    }

    function getConfirmLeavePopupBody() {
      return '<div class="confirm-popup">' +
        '<h3>Увага!</h3>' +
        '<h4>Ви дійсно бажаєте залишити поточну гру?</h4>' +
        '<h4>Отримані результати буде втрачено.</h4>' +
        '</div>';
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
        '<h4 class="achievement-popup-score">Поточний рахунок: ' + score + '</h4>' +
        '<h4 class="achievement-popup-best-score">Кращий рахунок: ' + bestScore + '</h4>' +
        '</div>';
    }

    function getNewRecordPopupBody(params) {
      var beginHTML = '<div class="record-popup">' +
        '<h3>' + App.getCheerfulWord() + '!</h3>' +
        '<h4>Новий рекорд по темі<br><span>“' +
        params.themeName + '”</span></h4><div class="record-block">',
        scoreAchievementHTML = params.scoreRecord ?
          '<h4 class="record"><img class="star-icon" ng-src="img/icons/record_star.png"><span>' +
          params.scoreRecord + '</span> ' + getEndTextForScoreRecord(params.scoreRecord) + '</h4>' : '',
        timeAchievementHTML = params.timeRecord ?
          '<h4 class="record"><img class="clock-icon" ng-src="img/icons/record_clock.png">' +
          '<span>' + Math.floor(params.timeRecord / 60) + '</span> хв' +
          '<span>' + params.timeRecord % 60 + '</span> с</h4>' : '',
        endHTML = '</div></div>';

      return beginHTML + scoreAchievementHTML + timeAchievementHTML + endHTML;
    }

    function getEndTextForScoreRecord(score) {
      if (score >= 5 && score <= 20) {
        return 'очок';
      }
      else switch (score % 10) {
        case 1:
          return 'очко';
        case 2:
        case 3:
        case 4:
          return 'очка';
        default:
          return 'очок';
      }
    }
  })
