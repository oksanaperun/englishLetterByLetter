angular.module('englishLetterByLetter')

	.factory('Firework', function ($timeout) {
		return {
			init: function () {
				var canvas = document.getElementById('canvas'),
					context = canvas.getContext('2d'),
					cw = window.innerWidth,
					ch = window.innerHeight,
					myReq,
					fireworks = [],
					particles = [],
					hue = 120,
					timerTotal = 80,
					timerTick = 0;

				canvas.width = cw;
				canvas.height = ch;

				var requestAnimFrame = window.requestAnimationFrame || window.webkitRequestAnimationFrame ||
					window.mozRequestAnimationFrame || function (callback) {
						window.setTimeout(callback, 1000 / 60);
					},
					cancelAnimFrame = window.cancelAnimationFrame || window.webkitCancelAnimationFrame ||
						window.webkitCancelRequestAnimationFrame || window.mozCancelAnimationFrame || function (callback) {
							window.clearTimeout(callback);
						};

				loop();
				$timeout(function () {
					cancelAnimFrame(myReq);
					canvas.style.display = 'none';
				}, 10000);

				function loop() {
					myReq = requestAnimFrame(loop);

					hue = 50; // random(0, 360);

					context.globalCompositeOperation = 'destination-out';
					// decrease the alpha property to create more prominent trails
					context.fillStyle = 'rgba(0, 0, 0, 0.5)';
					context.fillRect(0, 0, cw, ch);
					context.globalCompositeOperation = 'lighter';

					var i = fireworks.length;
					while (i--) {
						fireworks[i].draw();
						fireworks[i].update(i);
					}

					var i = particles.length;
					while (i--) {
						particles[i].draw();
						particles[i].update(i);
					}

					if (timerTick >= timerTotal) {
						fireworks.push(new Firework(cw / 2, ch, random(0, cw), random(0, ch / 2)));
						timerTick = 0;
					} else {
						timerTick++;
					}
				}

				function random(min, max) {
					return Math.random() * (max - min) + min;
				}

				function calculateDistance(p1x, p1y, p2x, p2y) {
					var xDistance = p1x - p2x,
						yDistance = p1y - p2y;
					return Math.sqrt(Math.pow(xDistance, 2) + Math.pow(yDistance, 2));
				}

				function Firework(sx, sy, tx, ty) {
					// actual coordinates
					this.x = sx;
					this.y = sy;
					// starting coordinates
					this.sx = sx;
					this.sy = sy;
					// target coordinates
					this.tx = tx;
					this.ty = ty;
					// distance from starting point to target
					this.distanceToTarget = calculateDistance(sx, sy, tx, ty);
					this.distanceTraveled = 0;
					// track the past coordinates of each firework to create a trail effect, increase the coordinate count to create more prominent trails
					this.coordinates = [];
					this.coordinateCount = 3;
					// populate initial coordinate collection with the current coordinates
					while (this.coordinateCount--) {
						this.coordinates.push([this.x, this.y]);
					}
					this.angle = Math.atan2(ty - sy, tx - sx);
					this.speed = 2;
					this.acceleration = 3.55;
					this.brightness = random(50, 70);
					// circle target indicator radius
					this.targetRadius = 1;
				}

				Firework.prototype.update = function (index) {
					// remove last item in coordinates array
					this.coordinates.pop();
					// add current coordinates to the start of the array
					this.coordinates.unshift([this.x, this.y]);

					// cycle the circle target indicator radius
					if (this.targetRadius < 8) {
						this.targetRadius += 0.3;
					} else {
						this.targetRadius = 1;
					}

					// speed up the firework
					this.speed *= this.acceleration;

					// get the current velocities based on angle and speed
					var vx = Math.cos(this.angle) * this.speed,
						vy = Math.sin(this.angle) * this.speed;
					// how far will the firework have traveled with velocities applied?
					this.distanceTraveled = calculateDistance(this.sx, this.sy, this.x + vx, this.y + vy);

					// if the distance traveled, including velocities, is greater than the initial distance to the target, then the target has been reached
					if (this.distanceTraveled >= this.distanceToTarget) {
						createParticles(this.tx, this.ty);
						// remove the firework, use the index passed into the update function to determine which to remove
						fireworks.splice(index, 1);
					} else {
						// target not reached, keep traveling
						this.x += vx;
						this.y += vy;
					}
				}

				Firework.prototype.draw = function () {
					context.beginPath();
					// move to the last tracked coordinate in the set, then draw a line to the current x and y
					context.moveTo(this.coordinates[this.coordinates.length - 1][0], this.coordinates[this.coordinates.length - 1][1]);
					context.lineTo(this.x, this.y);
					context.strokeStyle = 'hsl(' + hue + ', 100%, ' + this.brightness + '%)';
					context.stroke();

					context.beginPath();
					// draw the target for this firework with a pulsing circle
					context.arc(this.tx, this.ty, this.targetRadius, 0, Math.PI * 2);
					context.stroke();
				}

				function Particle(x, y) {
					this.x = x;
					this.y = y;
					// track the past coordinates of each particle to create a trail effect, increase the coordinate count to create more prominent trails
					this.coordinates = [];
					this.coordinateCount = 5;
					while (this.coordinateCount--) {
						this.coordinates.push([this.x, this.y]);
					}
					// set a random angle in all possible directions, in radians
					this.angle = random(0, Math.PI * 2);
					this.speed = random(1, 10);
					// friction will slow the particle down
					this.friction = 0.99;
					// gravity will be applied and pull the particle down
					this.gravity = 1;
					// set the hue to +- random number of the overall hue variable
					this.hue = random(hue - 20, hue + 20);
					this.brightness = random(50, 80);
					this.alpha = 1;
					// set how fast the particle fades out
					this.decay = random(0.015, 0.03);
				}

				Particle.prototype.update = function (index) {
					// remove last item in coordinates array
					this.coordinates.pop();
					// add current coordinates to the start of the array
					this.coordinates.unshift([this.x, this.y]);
					// slow down the particle
					this.speed *= this.friction;
					// apply velocity
					this.x += Math.cos(this.angle) * this.speed;
					this.y += Math.sin(this.angle) * this.speed + this.gravity;
					// fade out the particle
					this.alpha -= this.decay;

					// remove the particle once the alpha is low enough, based on the passed in index
					if (this.alpha <= this.decay) {
						particles.splice(index, 1);
					}
				}

				Particle.prototype.draw = function () {
					context.beginPath();
					// move to the last tracked coordinates in the set, then draw a line to the current x and y
					context.moveTo(this.coordinates[this.coordinates.length - 1][0], this.coordinates[this.coordinates.length - 1][1]);
					context.lineTo(this.x, this.y);
					context.strokeStyle = 'hsla(' + this.hue + ', 100%, ' + this.brightness + '%, ' + this.alpha + ')';
					context.stroke();
				}

				function createParticles(x, y) {
					// increase the particle count for a bigger explosion, beware of the canvas performance hit with the increased particles though
					var particleCount = 35;
					while (particleCount--) {
						particles.push(new Particle(x, y));
					}
				}
			}
		}
	})
