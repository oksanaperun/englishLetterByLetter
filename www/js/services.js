angular.module('englishLetterByLetter.services', [])

.factory('Utils', function ($cordovaNativeAudio) {
    return {
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
        $cordovaNativeAudio.play(sound);
      }
  	}
 })

.factory('WordsDB', function() {

});
