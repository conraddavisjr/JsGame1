$(function() {
	var game = {
		//
		hero:{
			height: 128,
			width: 58,
			jump: 100,
			speed: 50,
			skin: 'hero-idle',
			blastTeir1: 1000,
			blastTeir2: 3500,
			blastTeir3: 3000,
			blastTeir4: 4000,
		},
		environment:{
			skin: 'black',
			ground: 250,
			height: 10,
			width: 90 + '%'
		},
		// bindings
		init : function(){
			this.setupVars();
			this.setupArrays();
			this.setupElements();
			this.renderGame();
			this.bindEvents();
		},
		setupVars: function(){
			this.duration = 0;
			this.lastKeyUpAt = 0;
			this.chargeLevel = 0;
			this.fireBallTimer = '';
			this.idleAnimation = '';
			this.blastLevel = 0; 
		},
		setupArrays: function(){
			
		},
		setupElements: function(){
			this.$hero = '';
			this.charged = {};
		},
		renderGame: function(){
			//build environment
			ground = $('<div></div>')
				.attr('id','ground')
				.css({
				  "position": "absolute",  
				  "background-color": game.environment.skin,
				  "height": game.environment.height,
				  "width": game.environment.width,
				  "top": game.environment.ground + game.hero.height
				});
			;
			//build Hero
			hero = $('<div></div>')
				.attr({id : 'hero', class : game.hero.skin})
				.css({
				  "position": "absolute", 
				  "height": game.hero.height,
				  "width": game.hero.width,
				  "top": game.environment.ground
				});
				game.$hero = $('#hero');
			;
			//build blast frame
			blastFrame = $('<span></span>')
				.attr({class: 'blastFrame'})
				.css({ 
				  "height": game.hero.height
				});
			;
			//build power frame
			powerFrame = $('<span></span>')
				.attr({class: 'powerFrame'})
				.css({ 
				  "marginLeft": -game.hero.width
				});
			;
			//run idle sprite
			setTimeout(function(){
				game.idleAnimation = TweenMax.to( $("#hero"), 0.9, { backgroundPosition:"-224px 0", ease:SteppedEase.config(3), repeat:-1, paused:false});
			},100)
			
			//render Hero
			$('#environment').append(hero);
			//render BlastFrame
			$('#environment #hero').append(blastFrame);
			//render powerFrame
			$('#environment #hero').append(powerFrame);
			//render ground
			$('#environment').append(ground);
		},
		bindEvents: function(){
			$(window).keydown(this.keyDownFunc);
			$(window).keyup(this.keyUpFunc);
		},
		keyDownFunc: function(e) {
			//movement functionality
			//console.log('e: ' + e.which);
			switch(e.which) {
				case 37: // left
				console.log("LEFT");
				game.heroInactive();
				game.heroLeft();
				break;
		
				case 38: // up
				console.log("up");
				//Call Jump Function
				game.heroInactive();
				game.heroJump();
				break;
		
				case 39: // right
				console.log("right");
				game.heroInactive();
				game.heroRight();
				break;
		
				case 40: // down
				console.log("down");
				game.heroInactive();
				break;
				
				case 70: // "F" Fire!!
				console.log("Fire!!");
				game.fireBall(e);
				break;
		
				default: return; // exit this handler for other keys
			}
			e.preventDefault(); // prevent the default action (scroll / move caret)
		},
		keyUpFunc: function(e){
			//var charged = game.charged;
			if ( !game.charged[e.which] ) return;
			var duration = ( e.timeStamp - game.charged[e.which] ) / 1000;
			console.log(e.which  + ' was pressed for ' + duration + ' seconds');
			game.charged[e.which] = 0;
			
			//handle what we do with the blast
			game.fireBallBlastHandler();
		
		},
		heroInactive: function(){
			//stop the blast charger
			clearTimeout(game.fireBallTimer);
			
			//reset the hero to their default state
			TweenMax.to($('#hero'), 0.5, {
				backgroundColor: game.hero.skin
			});
			//move the skin to idle
			$('#hero').attr('class', game.hero.skin);
			//run idle sprite
			game.idleAnimation.play();
			
			//animate the powerFrame out
			var powerFrameIntro = TweenMax.to($('.powerFrame'), 0.2, {opacity: 0, width: "180px", height: "180px", margin: "0 0 0 -58",
			backgroundColor: "rgba(255, 255, 255, 0)" /*boxShadow: "inset 0px 0px 10px 10px rgb(164, 255, 245)"*/});
		},
		heroJump: function(){
			console.log("heroJump entered ");
			$('#hero').animate({
				top: game.hero.jump + 'px'
			}, 150, function(){
				//gravity - fall
				console.log("calling gravity");
				game.gravity();
			});
		},
		heroLeft: function(){
			$('#hero').animate({
				left: "-=" + game.hero.speed
			}, 50);
		},
		heroRight: function(){
			$('#hero').animate({
				left: "+=" + game.hero.speed
			}, 50);
		},
		gravity: function(){
			console.log("gravity called");
			$('#hero').animate({
				top: game.environment.ground + 'px'
			}, 300);
		},
		fireBall: function(e){
			//start charge timer
			if ( game.charged[e.which] ) return;
				game.charged[e.which] = e.timeStamp;
				game.duration = ( e.timeStamp - game.charged[e.which] ) / 1000;
				console.log("duration: " + game.duration);
			
			TweenMax.to($('#hero'), 2, {backgroundColor: "blue"});
			
			//pause other sprites
			game.spritesStop();
			//add the charge image
			$('#hero').attr('class','hero-charge-t0');
			//animate the powerFrame in
			var powerFrameIntro = new TimelineMax();
			
			powerFrameIntro.to($('.powerFrame'), 0.5, {
					opacity: 1, width: "30px", height: "30px", 
					margin: "40 0 0 5", borderColor: "white", boxShadow: "inset 0px 0px 10px 10px rgba(164, 255, 245, 0.5)"
					})
				.to($('.powerFrame'), 1.5, {boxShadow: "0px 0px 10px 10px rgba(204, 35, 25, 0.5)",
					backgroundColor: "rgba(255, 35, 25, 0.6)", borderColor: "rgba(255,255,255,0.3)",
					width: "40px", height: "40px", margin: "35 0 0 0"}, "+=0.5");
			
			game.fireBallTimer = setTimeout(function(){
					TweenMax.to($('#hero'), 1, {backgroundColor: "green"});
					game.blastLevel = 1;
					game.fireBallTimer = setTimeout(function(){
						TweenMax.to($('#hero'), 1, {backgroundColor: "orange"});
					}, 1500);
				}, 1000);		
		},
		fireBallBlastHandler: function(){
			
			if(game.blastLevel > 0){
				//check which level it is
				switch(game.blastLevel) {
					case 1: // call blast lvl 1
					console.log("blast lvl 1");
					$('#hero').attr('class','hero-blast-t1');
					$('.powerFrame').attr('class','powerFrame powerFrame-t1');
					var blastTeir1 = new TimelineMax({onComplete:game.heroInactive});
					var blastFrame = $('.blastFrame');
					blastTeir1.to(blastFrame, 1, {backgroundColor: "orange", opacity: 0.5})
						.to(blastFrame, 0.3, {backgroundColor: "red"})
						.to(blastFrame, 0.3, {backgroundColor: "teal"})
						.to(blastFrame, 0.3, {backgroundColor: "white", opacity: 0});
					game.blastLevel = 0;
					break;
			
					case 2: // call blast lvl 2
					console.log("blast lvl 2");
					break;
			
					case 3: // call blast lvl 3
					console.log("blast lvl 3");
					break;
		
					default: return; // exit this handler
				}
			}else{
				//no blast, return to idle
				game.heroInactive();
			}			
		},
		chargeTimer: function(e){
			console.log("chargeTimer called");
			if(game.duration > 2){
				console.log("duration is ABOVE 2 Secs");
			}
			game.duration = ( e.timeStamp - game.charged[e.which] ) / 1000; 
		},
		spritesStop: function(){
			//pause all sprites
			game.idleAnimation.pause();
		}
	} //game obj
	game.init();
	window.game = game;
});