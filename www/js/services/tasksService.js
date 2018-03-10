angular.module('englishLetterByLetter')

	.factory('Tasks', function ($rootScope, $timeout, App, DB, Utils) {
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

			Utils.showAlert(popupBody);
			if ($rootScope.userSettings.isSoundsOn) Utils.playSound('complete');
		}

		function manageTasks(tasks, achievements, params) {
			for (var i = 0; i < tasks.length; i++)
				taskMappingPerType(tasks[i], achievements, params)
		}

		function taskMappingPerType(task, achievements, params) {
			switch (task.taskType) {
				case 1:
					handleGamesCountTask(task, achievements);
					break;
				case 2:
					handleItemsCountTask(task, achievements);
					break;
				case 3:
					handleItemsWithConditionCountTask(task, params);
					break;
				case 4:
					handleWinsCountTask(task, achievements);
					break;
				case 5:
					handleWinPerThemeTask(task, achievements);
					break;
				default:
					throw new Error('Task type [' + task.type + '] is not supported');
			}
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

		function handleItemsCountTask(task, achievements) {
			if (!task.isDone) {
				var itemsCount = 0;

				for (var i = 0; i < achievements.length; i++)
					itemsCount += achievements[i][task.keyWord + 'Count'];

				var progress = itemsCount > task.count ? task.count : itemsCount,
					isDone = progress === task.count;

				updateTask(task.id, progress, isDone);
				if (isDone) showTaskIsDonePopup(task);
			}
		}

		function handleItemsWithConditionCountTask(task, params) {
			if (!task.isDone) {
				var itemsCount = task.progress + params[conditionTypeMapping(task.conditionType)],
					progress = itemsCount > task.count ? task.count : itemsCount,
					isDone = progress === task.count;

				updateTask(task.id, progress, isDone);
				if (isDone) showTaskIsDonePopup(task);
			}
		}

		function conditionTypeMapping(conditionType) {
			switch (conditionType) {
				case 1:
					return 'wordsCountWithLength7';
				case 2:
					return 'wordsCountStartingWithLetter';
				case 3:
					return 'phrasesCountWithThreeWords';
				case 4:
					return 'phrasesCountStartingWithLetter';
				default:
					throw new Error('Task condition type [' + conditionType + '] is not supported');
			}
		}

		function handleWinsCountTask(task, achievements) {
			if (!task.isDone) {
				var winsCount = 0;

				for (var i = 0; i < achievements.length; i++)
					winsCount += achievements[i][task.keyWord + 'WinCount'];

				var progress = winsCount > task.count ? task.count : winsCount,
					isDone = progress === task.count;

				updateTask(task.id, progress, isDone);
				if (isDone) showTaskIsDonePopup(task);
			}
		}

		function handleWinPerThemeTask(task, achievements) {
			if (!task.isDone) {
				var winPerTheme = 0;

				for (var i = 0; i < achievements.length; i++)
					if (achievements[i][task.keyWord + 'WinCount'] > 0) winPerTheme++;

				updateTask(task.id, winPerTheme, winPerTheme === task.count);
				if (winPerTheme === task.count) showTaskIsDonePopup(task);
			}
		}
	})
	