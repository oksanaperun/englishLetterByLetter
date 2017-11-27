angular.module('englishLetterByLetter.services', [])

  .factory('App', function (Utils) {
    var newScoreData = {};

    return {
      setNewScoreData: function (modeId, themeId, score) {
        newScoreData.modeId = modeId;
        newScoreData.themeId = themeId;
        newScoreData.score = score;
        newScoreData.displayFirstStar = Utils.shouldFirstStarBeDisplayed(score);
        newScoreData.displaySecondStar = Utils.shouldSecondStarBeDisplayed(score);
        newScoreData.displayThirdStar = Utils.shouldThirdStarBeDisplayed(score);
      },
      getNewScoreData: function () {
        return newScoreData;
      },
      getCheerfulWord: function () {
        var words = ['Молодець', 'Дивовижно', 'Чудово', 'Блискуче', 'Так тримати'],
          randomIndex = Math.floor(Math.random() * words.length);

        return words[randomIndex];
      }
    }
  });
