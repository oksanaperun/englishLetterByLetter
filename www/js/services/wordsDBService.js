angular.module('englishLetterByLetter')

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
        var query = "SELECT T.id, T.name, A.wordsMaxScore, A.phrasesMaxScore, A.questionsMaxScore " +
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
      selectTasks: function () {
        var query = "SELECT * FROM tasks";
        console.log('select tasks');
        return $cordovaSQLite.execute($rootScope.db, query);
      },
      updateData: function () {
        //var query = "CREATE TABLE themes ( 'id' INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT UNIQUE, 'name' TEXT NOT NULL UNIQUE )";
        //var query = "CREATE TABLE words ( 'id' INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT UNIQUE, 'name' TEXT NOT NULL, 'translation' TEXT NOT NULL, description TEXT, 'themeId' INTEGER NOT NULL, 'hasSound' INTEGER DEFAULT 1, FOREIGN KEY('themeId') REFERENCES 'themes'('id') )";
        //var query = "CREATE TABLE phrases ( 'id' INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT UNIQUE, 'name' TEXT NOT NULL, 'translation' TEXT NOT NULL, 'themeId' INTEGER NOT NULL, FOREIGN KEY('themeId') REFERENCES 'themes'('id') )";
        //var query = "CREATE TABLE achievements ( 'themeId' INTEGER NOT NULL DEFAULT 0 UNIQUE, 'wordsGameCount' INTEGER NOT NULL DEFAULT 0, 'wordsCount' INTEGER NOT NULL DEFAULT 0, 'wordsMaxScore' INTEGER NOT NULL DEFAULT 0, 'wordsMaxScoreCount' INTEGER NOT NULL DEFAULT 0, 'phrasesGameCount' INTEGER NOT NULL DEFAULT 0, 'phrasesCount' INTEGER NOT NULL DEFAULT 0, 'phrasesMaxScore' INTEGER NOT NULL DEFAULT 0, 'phrasesMaxScoreCount' INTEGER NOT NULL DEFAULT 0, 'questionsGameCount' INTEGER NOT NULL DEFAULT 0, 'questionsCount' INTEGER NOT NULL DEFAULT 0, 'questionsMaxScore' INTEGER NOT NULL DEFAULT 0, 'questionsMaxScoreCount' INTEGER NOT NULL DEFAULT 0, 'questionsMinTime' INTEGER NOT NULL DEFAULT 1000000, 'questionsMinTimeCount' INTEGER NOT NULL DEFAULT 0 )";
        //var query = "CREATE TABLE tasks ( 'id' INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT UNIQUE, 'title' TEXT UNIQUE, 'description' TEXT UNIQUE, 'complexity' INTEGER, 'required', 'progress' INTEGER DEFAULT 0, 'isDone' INTEGER DEFAULT 0 )";
        //var query = "INSERT INTO themes (name) VALUES ('Фрукти, ягоди та горіхи'), ('Овочі, трави та прянощі'), ('Молоко, борошно та крупи'), ('Страви та напої'), ('Солодощі')";
        //var query = "INSERT INTO words (name, translation, themeId) VALUES ('apple','яблуко',1),('apricot','абрикос',1),('avocado','авокадо',1),('banana','банан',1),('cherry','вишня',1)";
        //var query = "INSERT INTO words (name, translation, themeId) VALUES ('date','фінік',1),('fig','інжир',1),('grape','виноград',1),('kiwi_fruit','ківі',1),('lemon','лимон',1)";
        //var query = "INSERT INTO words (name, translation, themeId) VALUES ('lime','лайм',1),('mango','манго',1),('melon','диня',1),('peach','персик',1),('pear','груша',1)";
        //var query = "INSERT INTO words (name, translation, themeId) VALUES ('onion','цибуля',2),('pea','горох',2),('potato','картопля',2),('sweet_potato','батат',2)";
        //var query = "UPDATE words SET name = 'sweet_potato' WHERE id = 19";
        //var query = "INSERT INTO phrases (name, translation, themeId) VALUES ('canned_fruit', 'консервовані фрукти', 1), ('citrus_fruit', 'цитрусові фрукти', 1), ('bunch_of_grapes', 'гроно винограду', 1)";
        //var query = "INSERT INTO achievements (themeId) VALUES (1), (2), (3), (4), (5)"
        //var query = "INSERT INTO tasks (title, description, complexity, required) VALUES ('Title 1', 'Some description 1', 1, 5), ('Title 2', 'Some description 2', 2, 10), ('Title 3', 'Some description 3', 1, 5), ('Title 4', 'Some description 4', 1, 5), ('Title 5', 'Some description 5', 2, 10)";
        //var query = "UPDATE words SET description = 'Солодка картопля' WHERE id = 19";
        return $cordovaSQLite.execute($rootScope.db, query);
      }
    }
})
