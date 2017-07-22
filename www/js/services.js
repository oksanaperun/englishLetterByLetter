angular.module('englishLetterByLetter.services', [])

.factory('Utils', function ($cordovaNativeAudio, $rootScope, $ionicPopup, $ionicHistory) {
    return {
      setGameModes: function() {
        $rootScope.gameModes = [
          {id: 1, name: 'Слова'},
          {id: 2, name: 'Фрази'},
          {id: 3, name: 'Вікторина'}
        ];
      },
      getNextIndex: function(currentIndex, length) {
      	if (currentIndex == length - 1) {
        	return 0;
      	} else {
        	return currentIndex + 1;
      	}
      },
      getPreviousIndex: function(currentIndex, length) {
      	if (currentIndex == 0) {
        	return length - 1;
      	} else {
        	return currentIndex - 1;
      	}
      },
      playSound: function (sound) {
        if (window.cordova) {
          $cordovaNativeAudio.play(sound);
        }
      },
      showConfirmLeaveGamePopup: function () {
        var popupBody = '<div class="confirm-popup">' +
            '<p>Ви дійсно бажаєте залишити поточну гру? Отримані результати буде втрачено.</p>' +
            '</div>',
          сonfirmLeaveGamePopup = $ionicPopup.confirm({
            title: 'УВАГА!',
            template: popupBody,
            buttons: [
              {text: 'Ні'},
              {
                text: 'Так',
                type: 'button-positive',
                onTap: function (e) {
                  $ionicHistory.goBack();
                }
              }
            ]
          });

        сonfirmLeaveGamePopup.then(function (res) {
        });
      },
      shouldFirstStarBeDisplayed: function (score) {
        return score > 0;
      },
      shouldSecondStarBeDisplayed: function (modeId, score) {
        if (modeId == 1) {
          return score > 10;
        } else return score > 5;
      },
      shouldThirdStarBeDisplayed: function (modeId, score) {
        if (modeId == 1) {
          return score > 20;
        } else return score > 10;
      }
  	}
 })

.factory('WordsDB', function($cordovaSQLite, $rootScope) {
    return {
      initDatabase: function () {
        console.log('Connecting to DB');
        if (window.cordova) {
          $rootScope.db = window.sqlitePlugin.openDatabase({
            name: 'englishLetterByLetter.db',
            location: 'default',
            createFromLocation: 1
          });
        } else {
          $rootScope.db = window.openDatabase('englishLetterByLetter.db', '1', 'words database', 256 * 256 * 100); // browser
        }
      },
      selectThemes: function () {
        var query = "SELECT T.id, T.name, A.maxScore1, A.maxScore2, A.maxScore3 " +
          "FROM themes as T " +
          "LEFT JOIN achievements as A ON T.id = A.themeId";
        console.log('select themes');
        return $cordovaSQLite.execute($rootScope.db, query);
      },
      selectWordsByThemeId: function (themeId) {
        var query = "SELECT id, name, translation, description, themeId, hasSound FROM words WHERE themeId = ?";
        console.log('select words by theme id');
        return $cordovaSQLite.execute($rootScope.db, query, [themeId]);
      },
      selectPhrasesByThemeId: function (themeId) {
        var query = "SELECT id, name, translation, themeId FROM phrases WHERE themeId = ?";
        console.log('select phrases by theme id');
        return $cordovaSQLite.execute($rootScope.db, query, [themeId]);
      },
      selectAllAchievements: function () {
        var query = "SELECT * FROM achievements";
        console.log('select all achievements');
        return $cordovaSQLite.execute($rootScope.db, query);
      },
      selectAchievementsByThemeId: function (themeId) {
        var query = "SELECT * FROM achievements WHERE themeId = ?";
        console.log('select achievements by theme id');
        return $cordovaSQLite.execute($rootScope.db, query, [themeId]);
      },
      updateAchievement: function (themeId, achievement, newValue) {
        var query = "UPDATE achievements SET " + achievement + " = ? WHERE themeId = ?";
        console.log('update achievement');
        return $cordovaSQLite.execute($rootScope.db, query, [newValue, themeId]);
      },
      updateData: function () {
        //var query = "CREATE TABLE 'themes' ( 'id' INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT UNIQUE, 'name' TEXT NOT NULL UNIQUE )";
        //var query = "CREATE TABLE 'words' ( 'id' INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT UNIQUE, 'name' TEXT NOT NULL, 'translation' TEXT NOT NULL, description TEXT, 'themeId' INTEGER NOT NULL, FOREIGN KEY('themeId') REFERENCES 'themes'('id') )";
        //var query = "CREATE TABLE 'phrases' ( 'id' INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT UNIQUE, 'name' TEXT NOT NULL, 'translation' TEXT NOT NULL, 'themeId' INTEGER NOT NULL, FOREIGN KEY('themeId') REFERENCES 'themes'('id') )";
        //var query = "CREATE TABLE achievements ( 'id' INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT UNIQUE, 'themeId' INTEGER NOT NULL DEFAULT 0 UNIQUE, 'minTime1' INTEGER NOT NULL DEFAULT 1000000, 'maxScore1' INTEGER NOT NULL DEFAULT 0, 'minTime2' INTEGER NOT NULL DEFAULT 1000000, 'maxScore2' INTEGER NOT NULL DEFAULT 0, 'minTime3' INTEGER NOT NULL DEFAULT 1000000, 'maxScore3' INTEGER NOT NULL DEFAULT 0 )";
        //var query = "CREATE TABLE awards ('id' INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT UNIQUE, 'title' TEXT, 'description' TEXT, 'isEarned' INTEGER DEFAULT 0)";
        //var query = "INSERT INTO themes (name) VALUES ('Фрукти, ягоди та горіхи'), ('Овочі, трави та прянощі'), ('Молоко, борошно та крупи'), ('Страви та солодощі')";
        //var query = "INSERT INTO words (name, translation, themeId) VALUES ('apple','яблуко',1),('apricot','абрикос',1),('avocado','авокадо',1),('banana','банан',1),('cherry','вишня',1)";
        //var query = "INSERT INTO words (name, translation, themeId) VALUES ('date','фінік',1),('fig','інжир',1),('grape','виноград',1),('kiwi_fruit','ківі',1),('lemon','лимон',1)";
        //var query = "INSERT INTO words (name, translation, themeId) VALUES ('lime','лайм',1),('mango','манго',1),('melon','диня',1),('peach','персик',1),('pear','груша',1)";
        //var query = "INSERT INTO words (name, translation, themeId) VALUES ('onion','цибуля',2),('pea','горох',2),('potato','картопля',2),('sweet_potato','батат',2)";
        //var query = "UPDATE words SET name = 'sweet_potato' WHERE id = 19";
        //var query = "INSERT INTO phrases (name, translation, themeId) VALUES ('canned_fruit', 'консервовані фрукти', 1), ('citrus_fruit', 'цитрусові фрукти', 1), ('bunch_of_grapes', 'гроно винограду', 1)";
        //var query = "INSERT INTO achievements (themeId) VALUES (1), (2), (3), (4)"
        //var query = "INSERT INTO awards (title, description) VALUES ('Title 1', 'Some description 1'), ('Title 2', 'Some description 2'), ('Title 3', 'Some description 3')";
        //var query = "UPDATE words SET description = 'Солодка картопля' WHERE id = 19";
        return $cordovaSQLite.execute($rootScope.db, query);
      }
    }
});
