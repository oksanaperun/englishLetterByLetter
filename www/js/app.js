angular.module('englishLetterByLetter', ['ionic', 'ngCordova', 'englishLetterByLetter.controllers', 'englishLetterByLetter.services'])

.run(function($ionicPlatform, WordsDB) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      cordova.plugins.Keyboard.disableScroll(true);

    }
    if (window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleDefault();
    }

    WordsDB.initDatabase();
  }); 
})

.config(function($stateProvider, $urlRouterProvider, $ionicConfigProvider) {

  // Ionic uses AngularUI Router which uses the concept of states
  // Learn more here: https://github.com/angular-ui/ui-router
  // Set up the various states which the app can be in.
  // Each state's controller can be found in controllers.js
  $stateProvider

  // setup an abstract state for the tabs directive
    .state('tab', {
    url: '/tab',
    abstract: true,
    templateUrl: 'templates/tabs.html'
  })

  // Each tab has its own nav history stack:

  .state('tab.achievements', {
    url: '/achievements',
    views: {
      'tab-achievements': {
        templateUrl: 'templates/tab-achievements.html',
        controller: 'AchievementsCtrl'
      }
    }
  })

  .state('tab.modes', {
    url: '/modes',
    views: {
      'tab-modes': {
        templateUrl: 'templates/tab-modes.html',
        controller: 'ModesCtrl'
      }
    }
  })
    .state('tab.theme', {
      url: '/modes/:modeId/theme',
      views: {
        'tab-modes': {
          templateUrl: 'templates/theme.html',
          controller: 'ThemeCtrl'
        }
      }
    })
      .state('tab.word', {
        url: '/modes/:modeId/theme/:themeId/word',
        views: {
          'tab-modes': {
            templateUrl: 'templates/word.html',
            controller: 'WordCtrl'
          }
        }
      })

  .state('tab.help', {
    url: '/help',
    views: {
      'tab-help': {
        templateUrl: 'templates/tab-help.html',
        controller: 'HelpCtrl'
      }
    }
  });

  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/tab/modes');

  $ionicConfigProvider.tabs.position('bottom');
});
