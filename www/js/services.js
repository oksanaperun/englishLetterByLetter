angular.module('englishLetterByLetter.services', [])

.factory('Utils', function ($cordovaNativeAudio, $rootScope) {
    return {
      setGameModes: function() {
        $rootScope.gameModes = [
          {id: 1, name: 'Слова', iconClass: 'ion-ios-book'},
          {id: 2, name: 'Фрази', iconClass: 'ion-ios-chatboxes'},
          {id: 3, name: 'Вікторина', iconClass: 'ion-ios-lightbulb'}
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
      }
  	}
 })

.factory('WordsDB', function($cordovaSQLite, $rootScope) {
    return {
      initDatabase: function () {
        //console.log('Connecting to DB');
        if (window.cordova) {
          $rootScope.db = window.sqlitePlugin.openDatabase({
            name: "englishLetterByLetter.db",
            location: 'default',
            createFromLocation: 1
          });
        } else {
          $rootScope.db = window.openDatabase('englishLetterByLetter.db', '1', 'words database', 256 * 256 * 100); // browser
        }
      },
      selectThemes: function () {
        var query = "SELECT id, name FROM themes";
        console.log('select themes');
        return $cordovaSQLite.execute($rootScope.db, query);
      },
      selectSubThemes: function () {
        var query = "SELECT id, name, themeId FROM sub_themes";
        console.log('select sub themes');
        return $cordovaSQLite.execute($rootScope.db, query);
      },
      selectSubThemesByThemeId: function (themeId) {
        var query = "SELECT id, name FROM sub_themes WHERE themeId = ?";
        console.log('select sub themes by theme id');
        return $cordovaSQLite.execute($rootScope.db, query, [themeId]);
      },
      selectWordsByThemeId: function (themeId) {
        var query = "SELECT W.id, W.name, W.translation, W.description, W.subThemeId " +
          "FROM words AS W LEFT JOIN sub_themes AS ST ON W.subThemeId = ST.id " +
          "WHERE ST.themeId = ?";
        console.log('select words theme id');
        return $cordovaSQLite.execute($rootScope.db, query, [themeId]);
      },
      selectWordsBySubThemeId: function (subThemeId) {
        var query = "SELECT id, name, translation, description, subThemeId FROM words WHERE subThemeId = ?";
        console.log('select words by sub theme id');
        return $cordovaSQLite.execute($rootScope.db, query, [subThemeId]);
      },
      selectPhrasesBySubThemeId: function (subThemeId) {
        var query = "SELECT id, name, translation, subThemeId FROM phrases WHERE subThemeId = ?";
        console.log('select phrases by sub theme id');
        return $cordovaSQLite.execute($rootScope.db, query, [subThemeId]);
      },
      updateData: function () {
        //var query = "CREATE TABLE 'themes' ( 'id' INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT UNIQUE, 'name' TEXT NOT NULL UNIQUE )";
        //var query = "CREATE TABLE 'sub_themes' ( 'id' INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT UNIQUE, 'name' TEXT NOT NULL UNIQUE, 'themeId' INTEGER NOT NULL, FOREIGN KEY('themeId') REFERENCES 'themes'('id') )";
        //var query = "CREATE TABLE 'words' ( 'id' INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT UNIQUE, 'name' TEXT NOT NULL, 'translation' TEXT NOT NULL, 'subThemeId' INTEGER NOT NULL, FOREIGN KEY('subThemeId') REFERENCES 'sub_themes'('id') )";
        //var query = "CREATE TABLE 'phrases' ( 'id' INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT UNIQUE, 'name' TEXT NOT NULL, 'translation' TEXT NOT NULL, 'subThemeId' INTEGER NOT NULL, FOREIGN KEY('subThemeId') REFERENCES 'sub_themes'('id') )";
        //var query = "INSERT INTO themes (name) VALUES ('Їжа та напої'), ('Дім'), ('Людина')";
        //var query = "INSERT INTO sub_themes (name, themeId) VALUES ('Фрукти і ягоди', 1), ('Овочі, трави та спеції', 1), ('Прохолоджуючі та гарячі напої', 1)";
        //var query = "INSERT INTO sub_themes (name, themeId) VALUES ('Меблі', 2), ('Посуд', 2)";
        //var query = "INSERT INTO words (name, translation, subThemeId) VALUES ('apple','яблуко',1),('apricot','абрикос',1),('avocado','авокадо',1),('banana','банан',1),('cherry','вишня',1)";
        //var query = "INSERT INTO words (name, translation, subThemeId) VALUES ('date','фінік',1),('fig','інжир',1),('grape','виноград',1),('kiwi_fruit','ківі',1),('lemon','лимон',1)";
        //var query = "INSERT INTO words (name, translation, subThemeId) VALUES ('lime','лайм',1),('mango','манго',1),('melon','диня',1),('peach','персик',1),('pear','груша',1)";
        //var query = "INSERT INTO words (name, translation, subThemeId) VALUES ('onion','цибуля',2),('pea','горох',2),('potato','картопля',2),('sweet_potato','батат',2)";
        //var query = "INSERT INTO words (name, translation, subThemeId) VALUES ('cocoa','какао',3),('coffee','кава',3),('lemonade','лимонад',3)";
        //var query = "UPDATE words SET name = 'sweet_potato' WHERE id = 19";
        //var query = "INSERT INTO phrases (name, translation, subThemeId) VALUES ('canned_fruit', 'консервовані фрукти', 1), ('luscious_fruit', 'солодкі фрукти', 1), ('seedless_grapes', 'виноград без кісточок', 1)";
        return $cordovaSQLite.execute($rootScope.db, query);
      }
    }
});
