/*******************************************
 *       
 *                 ∪・ω・∪
 *               FLAPPY DOGE 
 *                    x
 *                KABOOM.js
 * 
 *******************************************/

/*…*…*…*…*…*…*…*…*…*…*…*…*…*…*…*…*…*…*…*…*…*/
//                                         //
//  initialize canvas and kaboom context   //
//                                         //
/*…*…*…*…*…*…*…*…*…*…*…*…*…*…*…*…*…*…*…*…*…*/
 kaboom({
    global: true,            // import all kaboom functions to global namespace
    fullscreen: true, 
    clearColor: [0, 0, 0, 1] // background color
});

/*…*…*…*…*…*…*…*…*…*…*…*…*…*…*…*…*…*…*…*…*…*/
//                                         //
//  load assets into asset manager         //
//                                         //
/*…*…*…*…*…*…*…*…*…*…*…*…*…*…*…*…*…*…*…*…*…*/
loadRoot("resources/");
loadSprite("bg", "images/bg.png");
loadSprite("doge", "images/doge.png");
loadSprite("pipe", "images/pipe.png");

loadSound("score", "sounds/score.mp3");
loadSound("wooosh", "sounds/wooosh.mp3");
loadSound("hit", "sounds/hit.mp3");

/*…*…*…*…*…*…*…*…*…*…*…*…*…*…*…*…*…*…*…*…*…*/
//                                         //
//  define main scene                      //
//                                         //
/*…*…*…*…*…*…*…*…*…*…*…*…*…*…*…*…*…*…*…*…*…*/
scene("main", () => {

    const JUMP_FORCE = 320;
    const PIPE_OPEN = height() / 5;
	const PIPE_MIN_HEIGHT = 200;
    const SPEED = 300;
    const CEILING = -120;

    let score = 0;

    // draw background on the bottom, ui on top, layer "obj" is default
    layers([
        "bg",
        "obj",
        "ui",
    ], "obj");
    
/*…*…*…*…*…*…*…*…*…*…*…*…*…*…*…*…*…*…*…*…*…*/
//                                         //
//  components                             //
//                                         //
/*…*…*…*…*…*…*…*…*…*…*…*…*…*…*…*…*…*…*…*…*…*/
    
    add([
        sprite("bg"),
        scale(width() / 240, height() / 240),
        layer("bg"),
    ]);

	const doge = add([
		sprite("doge"),
		pos(width() / 4, 0),
		body(), // component for falling / jumping
        scale(2,2)
	]);

	const scoreLabel = add([
		text(score, 50),
		layer("ui"),
		origin("center"),
		pos(width() / 2, height() / 10),
	]);
    
/*…*…*…*…*…*…*…*…*…*…*…*…*…*…*…*…*…*…*…*…*…*/
//                                         //
//  events                                 //
//                                         //
/*…*…*…*…*…*…*…*…*…*…*…*…*…*…*…*…*…*…*…*…*…*/

	keyPress("space", () => {
		doge.jump(JUMP_FORCE);
        play("wooosh");
	});

    mouseClick(() => {
        doge.jump(JUMP_FORCE);
        play("wooosh");
    });

	action("pipe", (p) => {
		p.move(-SPEED, 0);

        // check if doge passed the pipe
		if (p.pos.x + p.width <= doge.pos.x && p.passed === false) {
			addScore();
            p.passed = true;
		}

        if (p.pos.x < -width() / 2) {
			destroy(p);
		}
	});

	loop((height()/3) / SPEED, () => {
		spawnPipe();
	});

	doge.collides("pipe", () => {
		go("death", score);
        play("hit");
	});

    // check for fall death
	doge.action(() => {
		if (doge.pos.y >= height() || doge.pos.y <= CEILING) {
			// switch to "death" scene
			go("death", score);
		}
	});

/*…*…*…*…*…*…*…*…*…*…*…*…*…*…*…*…*…*…*…*…*…*/
//                                         //
//  functions                              //
//                                         //
/*…*…*…*…*…*…*…*…*…*…*…*…*…*…*…*…*…*…*…*…*…*/

    function spawnPipe() {
		// calculate pipe positions
		const h1 = rand(PIPE_MIN_HEIGHT, height() - PIPE_MIN_HEIGHT - PIPE_OPEN);
		const h2 = h1 + PIPE_OPEN;

		add([
			sprite("pipe"),
			origin("botleft"),
			pos(width(), h1),
            scale(2, 5),
            "pipe"
		]);

		add([
			sprite("pipe"),
			origin("botleft"),
			pos(width(), h2),
            scale(2, -5),
            "pipe",
            { passed: false, }
		]);
	}

	function addScore() {
		score++;
		scoreLabel.text = score;
        play("score");
	}

});

/*…*…*…*…*…*…*…*…*…*…*…*…*…*…*…*…*…*…*…*…*…*/
//                                         //
//  death scene                            //
//                                         //
/*…*…*…*…*…*…*…*…*…*…*…*…*…*…*…*…*…*…*…*…*…*/

scene("death", (score) => {

    add([
		text(`GAME OVER`, 50),
		pos(width() / 2, height() / 4),
		origin("center"),
	]);

	add([
		text(`SCORE:` + score, 30),
		pos(width() / 2, height() / 3),
		origin("center"),
	]);

    // try again button background
    const bg = add([
		pos(width() / 2, height() / 2),
		rect(width() / 4, 100),
		origin("center"),
		color(1, 1, 1),
	]);

    // try again button text
	add([
		text("TRY AGAIN", 20),
		pos(width() / 2, height() / 2),
		origin("center"),
		color(1, 0, 0),
	]);

	bg.action(() => {
		if (bg.isHovered()) {
			bg.color = rgb(0.8, 0.8, 0.8);
			if (mouseIsClicked()) {
				go("main");
			}
		} else {
			bg.color = rgb(1, 1, 1);
		}
	});

    // doge falling down
    add([
		sprite("doge"),
		pos(width() / 2, 0),
		body()
	]);

});

// switch to main scene
go("main");