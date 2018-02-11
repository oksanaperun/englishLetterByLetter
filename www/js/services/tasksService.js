angular.module('englishLetterByLetter')

	.factory('Tasks', function ($rootScope, $timeout, $cordovaNativeAudio, App, DB, Utils) {
		return {
			manageTasks: function (params) {
				getDataAndManageTasks(params);
			}
		}

		function getDataAndManageTasks(params) {
			var achievements = [];

			DB.selectAchievements().then(function (res) {
				for (var i = 0; i < res.rows.length; i++)
					achievements.push(res.rows.item(i));

				getAndManageTasks(achievements, params);
			}, function (err) {
				console.error(err);
			});
		}

		function getAndManageTasks(achievements, params) {
			var tasks = [];

			DB.selectTasks().then(function (res) {
				for (var i = 0; i < res.rows.length; i++)
					tasks.push(res.rows.item(i));

				manageTasks(tasks, achievements, params);
			}, function (err) {
				console.error(err);
			});
		}

		function updateTask(id, progress, isDone) {
			var task = Utils.getTaskById(id);

			task.progress = progress;
			task.progressPercentage = Math.floor(0.7692 * 100 * task.progress / task.count);
			task.isDone = isDone ? 1 : 0;

			DB.updateTask(id, progress, isDone ? 1 : 0).then(function (res) {
			}, function (err) {
				console.error(err);
			});
		}

		function showTaskIsDonePopup(task) {
			var popupBody = '<div class="task-done-popup">' +
				'<h3>' + App.getCheerfulWord() + '!</h3>' +
				'<h4>Виконано завдання</h4>' +
				'<h4 class="task-done-popup-title">“' + task.title + '”</h4>' +
				'<img class="task-done-complexity-icon" ng-src="img/icons/complexity_' + task.complexity + '.png">' +
				'</div>';

			if (window.cordova) {
				$cordovaNativeAudio.preloadSimple('complete', 'sounds/complete.mp3');
				Utils.playSound('complete');
			}
			Utils.showAlert(popupBody);
		}

		function manageTasks(tasks, achievements, params) {
			handleGamesCountTask(tasks[0], achievements);
			handleWordsTasks(tasks, achievements, params);
			handlePhrasesTasks(tasks, achievements, params);
			handleQuestionsTasks(tasks, achievements)
		}

		function handleWordsTasks(tasks, achievements, params) {
			var keyWord = $rootScope.gameModes[0].keyWord;

			handleItemsCountTask(keyWord, tasks[1], achievements);
			handleItemsWithConditionCountTask(keyWord, tasks[2], params.wordsCountWithLength7);
			handleItemsWithConditionCountTask(keyWord, tasks[3], params.wordsCountStartingWithLetter);
			handleWinsCountTask(keyWord, tasks[4], achievements);
			handleWinPerThemeTask(keyWord, tasks[5], achievements);
			handleWinsCountTask(keyWord, tasks[6], achievements);
		}

		function handlePhrasesTasks(tasks, achievements, params) {
			var keyWord = $rootScope.gameModes[1].keyWord;

			handleItemsCountTask(keyWord, tasks[7], achievements);
			handleItemsWithConditionCountTask(keyWord, tasks[8], params.phrasesCountWithThreeWords);
			handleItemsWithConditionCountTask(keyWord, tasks[9], params.phrasesCountStartingWithLetter);
			handleWinsCountTask(keyWord, tasks[10], achievements);
			handleWinPerThemeTask(keyWord, tasks[11], achievements);
			handleWinsCountTask(keyWord, tasks[12], achievements);
		}

		function handleQuestionsTasks(tasks, achievements) {
			var keyWord = $rootScope.gameModes[2].keyWord;

			handleItemsCountTask(keyWord, tasks[13], achievements);
			handleWinsCountTask(keyWord, tasks[14], achievements);
			handleWinPerThemeTask(keyWord, tasks[15], achievements);
			handleWinsCountTask(keyWord, tasks[16], achievements);
			handleWinsCountTask(keyWord + 'Time', tasks[17], achievements);
			handleWinsCountTask(keyWord + 'Time', tasks[18], achievements);
			handleWinsCountTask(keyWord + 'Time', tasks[19], achievements);
		}

		function handleGamesCountTask(task, achievements) {
			if (!task.isDone) {
				var countPerMode = task.count / 3,
					wordsGameCount = phrasesGameCount = questionsGameCount = 0;

				for (var i = 0; i < achievements.length; i++) {
					wordsGameCount += achievements[i].wordsGameCount;
					phrasesGameCount += achievements[i].phrasesGameCount;
					questionsGameCount += achievements[i].questionsGameCount;
				}

				wordsGameCount = wordsGameCount > countPerMode ? countPerMode : wordsGameCount;
				phrasesGameCount = phrasesGameCount > countPerMode ? countPerMode : phrasesGameCount;
				questionsGameCount = questionsGameCount > countPerMode ? countPerMode : questionsGameCount;

				var progress = wordsGameCount + phrasesGameCount + questionsGameCount,
					isDone = progress === task.count;

				updateTask(task.id, progress, isDone);
				if (isDone) showTaskIsDonePopup(task);
			}
		}

		function handleItemsCountTask(keyWord, task, achievements) {
			if (!task.isDone) {
				var itemsCount = 0;

				for (var i = 0; i < achievements.length; i++)
					itemsCount += achievements[i][keyWord + 'Count'];

				var progress = itemsCount > task.count ? task.count : itemsCount,
					isDone = progress === task.count;

				updateTask(task.id, progress, isDone);
				if (isDone) showTaskIsDonePopup(task);
			}
		}

		function handleItemsWithConditionCountTask(keyWord, task, currentGameCount) {
			if (!task.isDone) {
				var itemsCount = task.progress + currentGameCount,
					progress = itemsCount > task.count ? task.count : itemsCount,
					isDone = progress === task.count;

				updateTask(task.id, progress, isDone);
				if (isDone) showTaskIsDonePopup(task);
			}
		}

		function handleWinsCountTask(keyWord, task, achievements) {
			if (!task.isDone) {
				var winsCount = 0;

				for (var i = 0; i < achievements.length; i++)
					winsCount += achievements[i][keyWord + 'WinCount'];

				var progress = winsCount > task.count ? task.count : winsCount,
					isDone = progress === task.count;

				updateTask(task.id, progress, isDone);
				if (isDone) showTaskIsDonePopup(task);
			}
		}

		function handleWinPerThemeTask(keyWord, task, achievements) {
			if (!task.isDone) {
				var winPerTheme = 0;

				for (var i = 0; i < achievements.length; i++)
					if (achievements[i][keyWord + 'WinCount'] > 0) winPerTheme++;

				updateTask(task.id, winPerTheme, winPerTheme === task.count);
				if (winPerTheme === task.count) showTaskIsDonePopup(task);
			}
		}
	})

