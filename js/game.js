$(function() {
	var game = {
		//
		hero:{
			height: 128,
			width: 58,
			jump: 100,
			speed: 50,
			skin: 'hero-idle',
			walk: 'hero-walk',
			jump: 'hero-jump',
			crouch: 'hero-crouch',
			jumpHeight: 70,
			blastTeir1: 1000,
			blastTeir2: 3500,
			blastTeir3: 3000,
			blastTeir4: 4000,
		},
		monsters: {
			painElemental:{
				height: 80,
				width: 90,
				skin: 'painElemental',
				death: 'painElemental-death'
			}
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
			this.jumpAnimation = new TimelineMax();
			this.painElementalIdleAnimation = '';
			this.powerFrameIntro = new TimelineMax();
			this.painElementalDeath = new TimelineMax();
			this.blastLevel = 0; 
		},
		setupArrays: function(){
			
		},
		setupElements: function(){
			this.$hero = '';
			this.charged = {};
			//monsters
			this.painElemental = '';
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
			//build painElemental monster
			game.painElemental = $('<div></div>')
				.attr({class : game.monsters.painElemental.skin})
				.css({
				  "position": "absolute", 
				  "top": game.environment.ground,
				  "right": 0,
				  "width": game.monsters.painElemental.width,
				  "height": game.monsters.painElemental.height,
				  "background-repeat": "no-repeat"
				});
				game.$painElemental = $("." + game.monsters.painElemental.skin);
			//build hero frame
			heroFrame = $('<span></span>')
				.attr({class: 'heroFrame'})
				.css({ 
				  //marginLeft": -game.hero.width
				});
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
			//run hero idle sprite
			setTimeout(function(){
				game.idleAnimation = TweenMax.to( $("#hero"), 0.9, { backgroundPosition:"-224px 0", ease:SteppedEase.config(3), repeat:-1, paused:false});
			},100)
			//run painElemental idle sprite
			setTimeout(function(){
				var painElementalIdleAnimation = new TimelineMax({onComplete:complete, onCompleteParams:['{self}']});
				game.painElementalIdleAnimation = painElementalIdleAnimation;
				game.painElementalIdleAnimation.to( $(".painElemental"), 1, { top:"-=10px", ease: Power0.easeNone})
												.to($(".painElemental"), 1, {top:"+=10px", ease: Power0.easeNone});
												
				function complete(painElementalIdleAnimation) {
				  game.painElementalIdleAnimation.restart(); // 0 sets the playhead at the end of the animation
				}								
			},100)
			
			//render Hero
			$('#environment').append(hero);
			//render painElemental
			$('#environment').append(game.painElemental);
			//render HeroFrame
			$('#environment #hero').append(heroFrame);
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
				game.heroWalk();
				game.heroLeft();
				break;
		
				case 38: // up
				console.log("up");
				//Call Jump Function
				game.heroJump();
				break;
		
				case 39: // right
				console.log("right");
				game.heroWalk();
				game.heroRight();
				break;
		
				case 40: // down
				console.log("down");
				game.heroCrouch();
				break;
				
				case 70: // "F" Fire!!
				console.log("Fire!!");
				if(game.blastLevel > 0){
					//disable this button
				}else{
					game.fireBall(e);
				}
				break;
		
				default: return; // exit this handler for other keys
			}
			e.preventDefault(); // prevent the default action (scroll / move caret)
		},
		keyUpFunc: function(e){
			//var charged = game.charged;
			/*if ( !game.charged[e.which] ) return;*/
			var duration = ( e.timeStamp - game.charged[e.which] ) / 1000;
			console.log(e.which  + ' was pressed for ' + duration + ' seconds');
			game.charged[e.which] = 0;
			
			//pause all sprite animation
			game.spritesStop();
			// if we were initially walking. run the idle animation
			if(e.which == 39 || e.which == 37){
				//move the skin to idle
				game.heroInactive();
			}
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
			console.log("game.blastLevel: " + game.blastLevel);
			//reset the charge animations
			game.powerFrameIntro.pause();
			if(game.blastLevel == 0){
				//animate the powerFrame out Early
				TweenMax.to($('.powerFrame'), 0.2, {opacity: 0, width: "180px", height: "180px", margin: "0 0 0 -58",
				backgroundColor: "rgba(255, 255, 255, 0)" /*boxShadow: "inset 0px 0px 10px 10px rgb(164, 255, 245)"*/});
				TweenMax.to($('.heroFrame'), 0.2, {opacity: 0});
			}else{
				//animate the powerFrame out after Blast
				TweenMax.to($('.powerFrame'), 0.2, {opacity: 0,
				background: "transparent" /*boxShadow: "inset 0px 0px 10px 10px rgb(164, 255, 245)"*/});
				game.blastLevel = 0;
				//animate the heroFrame out after Blast
				TweenMax.to($('.heroFrame'), 0.2, {opacity: 0});
			}
			$('.powerFrame').attr('class','powerFrame');
			
		},
		heroWalk: function(){
			//pause all sprites
			game.spritesStop();
			//move the skin to walk
			$('#hero').attr('class', game.hero.walk);
			//run walk animation
			game.idleAnimation.play();
		},
		heroJump: function(){
			console.log("heroJump entered ");
			//stop all sprites
			game.spritesStop();
			//move the skin to jump
			$('#hero').attr('class', game.hero.jump);
			//animate jump
			/*game.jumpAnimation.play();
			game.jumpAnimation.to( $("#hero"), 0.9, { backgroundPosition:"-411px 0", ease:SteppedEase.config(6), repeat:-1, paused:false});*/
			$('#hero').animate({
				top: game.hero.jumpHeight + 'px'
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
		heroCrouch: function(){
			$('#hero').attr('class', game.hero.crouch);
		},
		
		//Monsters
		monsterDeath: function(){
			console.log("monsterDeath");
			$('.painElemental').attr('class', game.monsters.painElemental.death);
			game.painElementalIdleAnimation.pause();
			game.painElementalDeath.to( $(".painElemental-death"), 1.3, { backgroundPosition:"-426px 0", ease:SteppedEase.config(4), paused:false});
			game.painElementalDeath.play();
			//respawn the monster
			setTimeout(function(){
				console.log("monster Removal");
				$('.painElemental-death').remove(); //remove the current monster
				$('#environment').append(game.painElemental); //append a new one
				$('.painElemental-death').attr('class', game.monsters.painElemental.skin); // reset the skin to default
				game.painElementalDeath.pause(0, true);
			},2500);
			
			//run painElemental idle sprite
			setTimeout(function(){
				$('.painElemental').css('backgroundPosition','0px 0px'); //reset it's bg position
				var painElementalIdleAnimation = new TimelineMax({onComplete:complete, onCompleteParams:['{self}']});
				game.painElementalIdleAnimation = painElementalIdleAnimation;
				game.painElementalIdleAnimation.to( $(".painElemental"), 1, { top:"-=10px", ease: Power0.easeNone})
												.to($(".painElemental"), 1, {top:"+=10px", ease: Power0.easeNone});
												
				function complete(painElementalIdleAnimation) {
				  game.painElementalIdleAnimation.restart(); // 0 sets the playhead at the end of the animation
				}								
			},2700);
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
			
			//pause other sprites
			game.spritesStop();
			//add the charge image
			$('#hero').attr('class','hero-charge-t0');
			//animate the powerFrame in
			game.powerFrameIntro = new TimelineMax();
			
			game.powerFrameIntro.to($('.powerFrame'), 0.5, {
					opacity: 1, width: "30px", height: "30px", 
					margin: "40 0 0 5", borderColor: "white", boxShadow: "inset 0px 0px 10px 10px rgba(164, 255, 245, 0.5)"
					})
				//level 1 Charge Animation	
				.to($('.powerFrame'), 1.5, {boxShadow: "0px 0px 10px 10px rgba(204, 35, 25, 0.5)",
					backgroundColor: "rgba(255, 35, 25, 0.6)", borderColor: "rgba(255,255,255,0.3)",
					width: "40px", height: "40px", margin: "35 0 0 0"}, "+=0.5")
				//level 2 Charge Animation
				.to($('.powerFrame'), 1.5, {boxShadow: "0px 0px 10px 10px rgba(255, 255, 255, 0.5)",
					backgroundColor: "rgba(155, 135, 225, 0.6)", borderColor: "rgba(255,255,255,0.3)",
					width: "50px", height: "50px", margin: "30 0 0 -5"}, "+=0")
				.to($('.heroFrame'), 0.1, {opacity: 1}, "-=1.5")
				.to($('.heroFrame'), 0.1, {opacity: 0}, "-=1.4")
				.to($('.heroFrame'), 0.1, {opacity: 1}, "-=1")
				.to($('.heroFrame'), 0.1, {opacity: 0}, "-=0.8")
				.to($('.heroFrame'), 0.1, {opacity: 1})
				.to($('.heroFrame'), 0.1, {opacity: 0})
				.to($('.heroFrame'), 1, {opacity: 1});
			
			game.fireBallTimer = setTimeout(function(){
					//level 1 Charge
					game.blastLevel = 1;
					game.fireBallTimer = setTimeout(function(){
						//level 2 Charge
						game.blastLevel = 2;
					}, 1500);
				}, 1000);		
		},
		fireBallBlastHandler: function(){
			
			if(game.blastLevel > 0){
				//set arrtibutes that will apply to any case
				$('#hero').attr('class','hero-blast');
				$('.powerFrame').attr('class','powerFrame powerFrame-t1');
				var blastFrame = $('.blastFrame');
				var heroFrame = $('.heroFrame');
				var blastTeir = new TimelineMax({onComplete:game.heroInactive});
				//check which level the blast is
				switch(game.blastLevel) {
					case 1: // call blast lvl 1
					TweenMax.to($('.powerFrame'), 0.5, {opacity: 0});
					blastFrame.attr('class', 'blastFrame hero-blast-t1');
					game.powerFrameIntro.pause(0, true);
					blastTeir.to(blastFrame, 1, {opacity: 0.5})
						.to(blastFrame, 0.3, {backgroundColor: "white", opacity: 0});
						//This is enough to instantly kill the monster
						game.monsterDeath();
					break;
			
					case 2: // call blast lvl 2
					console.log("blast lvl 2");
					TweenMax.to($('.powerFrame'), 0.5, {opacity: 0});
					blastFrame.attr('class', 'blastFrame hero-blast-t2');
					blastTeir.to(blastFrame, 1.5, {opacity: 0.8})
						.to(blastFrame, 0.3, {backgroundColor: "white", opacity: 0});
					//This is enough to instantly kill the monster
					game.monsterDeath();
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
			game.jumpAnimation.pause();
		}
	} //game obj
	game.init();
	window.game = game;
});