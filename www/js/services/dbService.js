angular.module('englishLetterByLetter')

  .factory('DB', function ($cordovaSQLite, $rootScope) {
    return {
      initDatabase: function () {
        //console.log('Connecting to DB');
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
      selectUserSettings: function () {
        var query = "SELECT * FROM user_settings";
        //console.log('select user settings');
        return $cordovaSQLite.execute($rootScope.db, query);
      },
      updateAutoGoNextInUserSettings: function (isAutoGoNext) {
        var query = "UPDATE user_settings SET isAutoGoNext = ?";
        isAutoGoNext = isAutoGoNext ? 1 : 0;
        //console.log('update user settings: isAutoGoNext');
        return $cordovaSQLite.execute($rootScope.db, query, [isAutoGoNext]);
      },
      updateSoundsInUserSettings: function (isSoundsOn) {
        var query = "UPDATE user_settings SET isSoundsOn = ?";
        isSoundsOn = isSoundsOn ? 1 : 0;
        //console.log('update user settings: isSoundsOn');
        return $cordovaSQLite.execute($rootScope.db, query, [isSoundsOn]);
      },
      selectThemes: function () {
        var query = "SELECT T.id, T.name, A.wordsMaxScore, A.phrasesMaxScore, A.questionsMaxScore " +
          "FROM themes as T " +
          "LEFT JOIN achievements as A ON T.id = A.themeId";
        //console.log('select themes');
        return $cordovaSQLite.execute($rootScope.db, query);
      },
      selectWordsByThemeId: function (themeId) {
        var query = "SELECT id, name, translation, description, themeId, hasSound FROM words WHERE themeId = ?";
       //console.log('select words by theme id');
        return $cordovaSQLite.execute($rootScope.db, query, [themeId]);
      },
      selectPhrasesByThemeId: function (themeId) {
        var query = "SELECT id, name, translation, themeId FROM phrases WHERE themeId = ?";
        //console.log('select phrases by theme id');
        return $cordovaSQLite.execute($rootScope.db, query, [themeId]);
      },
      selectAchievements: function () {
        var query = "SELECT * FROM achievements";
        //console.log('select all achievements');
        return $cordovaSQLite.execute($rootScope.db, query);
      },
      selectAchievementsByThemeId: function (themeId) {
        var query = "SELECT * FROM achievements WHERE themeId = ?";
        //console.log('select achievements by theme id');
        return $cordovaSQLite.execute($rootScope.db, query, [themeId]);
      },
      updateAchievementsByThemeId: function (themeId, keyWord, achievements) {
        var query = "UPDATE achievements SET " +
          keyWord + "GameCount = " + achievements.gameCount + ", " +
          keyWord + "Count = " + achievements.itemsCount + ", " +
          keyWord + "MaxScore = " + achievements.maxScore + ", " +
          keyWord + "WinCount = " + achievements.winCount + ", " +
          "questionsMinTime = " + achievements.questionsMinTime + ", " +
          "questionsTimeWinCount = " + achievements.questionsTimeWinCount +
          " WHERE themeId = " + themeId;
        //console.log(query);
        return $cordovaSQLite.execute($rootScope.db, query);
      },
      selectTasks: function () {
        var query = "SELECT * FROM tasks";
        //console.log('select tasks');
        return $cordovaSQLite.execute($rootScope.db, query);
      },
      updateTask: function (id, progress, isDone) {
        var query = "UPDATE tasks SET progress = ?, isDone = ? WHERE id = ?";
        //console.log('update task');
        return $cordovaSQLite.execute($rootScope.db, query, [progress, isDone, id]);
      },
      updateData: function () {
        //var query = "CREATE TABLE themes ( 'id' INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT UNIQUE, 'name' TEXT NOT NULL UNIQUE )";
        //var query = "CREATE TABLE words ( 'id' INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT UNIQUE, 'name' TEXT NOT NULL, 'translation' TEXT NOT NULL, description TEXT, 'themeId' INTEGER NOT NULL, 'hasSound' INTEGER DEFAULT 1, FOREIGN KEY('themeId') REFERENCES 'themes'('id') )";
        //var query = "CREATE TABLE phrases ( 'id' INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT UNIQUE, 'name' TEXT NOT NULL, 'translation' TEXT NOT NULL, 'themeId' INTEGER NOT NULL, FOREIGN KEY('themeId') REFERENCES 'themes'('id') )";
        //var query = "CREATE TABLE achievements ( 'themeId' INTEGER NOT NULL DEFAULT 0 UNIQUE, 'wordsGameCount' INTEGER NOT NULL DEFAULT 0, 'wordsCount' INTEGER NOT NULL DEFAULT 0, 'wordsMaxScore' INTEGER NOT NULL DEFAULT 0, 'wordsWinCount' INTEGER NOT NULL DEFAULT 0, 'phrasesGameCount' INTEGER NOT NULL DEFAULT 0, 'phrasesCount' INTEGER NOT NULL DEFAULT 0, 'phrasesMaxScore' INTEGER NOT NULL DEFAULT 0, 'phrasesWinCount' INTEGER NOT NULL DEFAULT 0, 'questionsGameCount' INTEGER NOT NULL DEFAULT 0, 'questionsCount' INTEGER NOT NULL DEFAULT 0, 'questionsMaxScore' INTEGER NOT NULL DEFAULT 0, 'questionsWinCount' INTEGER NOT NULL DEFAULT 0, 'questionsMinTime' INTEGER NOT NULL DEFAULT 1000000, 'questionsTimeWinCount' INTEGER NOT NULL DEFAULT 0 )";
        //var query = "CREATE TABLE tasks ( 'id' INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT UNIQUE, 'title' TEXT UNIQUE, 'description' TEXT UNIQUE, 'complexity' INTEGER, 'count', 'progress' INTEGER DEFAULT 0, 'isDone' INTEGER DEFAULT 0, 'taskType' INTEGER, 'keyWord' INTEGER, 'conditionType' INTEGER)";
        //var query = "CREATE TABLE user_settings ( isAutoGoNext integer not null, isSoundsOn integer not null )";
        //var query = "INSERT INTO themes (name) VALUES ('Фруктовий сад'), ('Городина та прянощі'), ('Сніданок та випічка'), ('Страви та напої'), ('Солодощі')";
        //var query = "INSERT INTO words (name, translation, themeId) VALUES ('apple','яблуко',1),('apricot','абрикос',1),('avocado','авокадо',1),('banana','банан',1),('cherry','вишня',1)";
        //var query = "INSERT INTO words (name, translation, themeId) VALUES ('date','фінік',1),('fig','інжир',1),('grape','виноград',1),('kiwi_fruit','ківі',1),('lemon','лимон',1)";
        //var query = "INSERT INTO words (name, translation, themeId) VALUES ('lime','лайм',1),('mango','манго',1),('melon','диня',1),('peach','персик',1),('pear','груша',1)";
        //var query = "INSERT INTO words (name, translation, themeId) VALUES ('onion','цибуля',2),('pea','горох',2),('potato','картопля',2),('sweet_potato','батат',2)";
        //var query = "UPDATE words SET name = 'sweet_potato' WHERE id = 19";
        //var query = "INSERT INTO phrases (name, translation, themeId) VALUES ('canned_peach', 'консервований персик', 1), ('citrus_fruit', 'цитрусові фрукти', 1), ('bunch_of_grapes', 'гроно винограду', 1), ('bundle_of_bananas', 'в’язка бананів', 1), ('dried_apricots', 'курага', 1), ('fresh_from_the_garden', 'свіжозібраний, прямо з саду', 1), ('out_of_season_fruit', 'несезонні фрукти', 1)";
        //var query = "INSERT INTO achievements (themeId) VALUES (1), (2), (3), (4), (5)"
        //var query = "INSERT INTO tasks (title, description, complexity, count, taskType, keyWord, conditiontype) VALUES ('Title 1', 'Some description 1', 1, 15, 1, null, null), ('Title 2', 'Some description 2', 1, 75, 2, 'words', null), ('Title 3', 'Some description 3', 1, 50, 2, 'phrases', null), ('Title 4', 'Some description 4', 1, 50, 2, 'questions', null), ('Title 5', 'Some description 5', 2, 50, 3, 'words', 1), ('Title 6', 'Some description 6', 2, 75, 3, 'words', 2), ('Title 7', 'Some description 7', 2, 1, 4, 'words', null), ('Title 8', 'Some description 8', 2, 1, 4, 'phrases', null), ('Title 9', 'Some description 9', 2, 1, 4, 'questions', null), ('Title 10', 'Some description 10', 2, 1, 4, 'questionsTime', null)";
        //var query = "INSERT INTO tasks (title, description, complexity, count, taskType, keyWord, conditiontype) VALUES ('Title 11', 'Some description 11', 3, 5, 5, 'words', null), ('Title 12', 'Some description 12', 3, 10, 4, 'words', null), ('Title 13', 'Some description 13', 3, 15, 3, 'phrases', 3), ('Title 14', 'Some description 14', 3, 25, 3, 'phrases', 4), ('Title 15', 'Some description 15', 3, 5, 5, 'phrases', null), ('Title 16', 'Some description 16', 3, 10, 4, 'phrases', null), ('Title 17', 'Some description 17', 3, 5, 5, 'questions', null), ('Title 18', 'Some description 18', 3, 10, 4, 'questions', null), ('Title 19', 'Some description 19', 3, 5, 5, 'questionsTime', null), ('Title 20', 'Some description 20', 3, 10, 4, 'questionsTime', null)";
        //var query = "INSERT INTO user_settings (isAutoGoNext, isSoundsOn) VALUES (1, 1)";
        //var query = "UPDATE words SET description = 'Рослина сімейства бобових, плоди якої нагадують оптичні лінзи'";
        //var query = "UPDATE achievements SET questionsGameCount = 1 WHERE themeId = 1";
        //var query = "UPDATE tasks SET progress = 14, isDone = 0 WHERE id = 1";
        return $cordovaSQLite.execute($rootScope.db, query);
      }
    }
  })
