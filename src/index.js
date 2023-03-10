import WaitEventsPlugin from 'phaser3-rex-plugins/plugins/waitevents-plugin.js';

var config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 300 },
            debug: false
        }
    },
    plugins: {
        global: [{
            key: 'rexWaitEvents',
            plugin: WaitEventsPlugin,
            start: true
        },
            // ...
        ]
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

var game = new Phaser.Game(config);


function preload() {
    this.load.audio('hitSound', ['assets/Hit_Thump.mp3'])
    this.load.image('sky', 'assets/sky.png');
    this.load.image('ground', 'assets/platform.png');
    this.load.image('star', 'assets/star.png');
    this.load.image('bomb', 'assets/bomb.png');
    this.load.spritesheet('dude',
        'assets/dude.png',
        { frameWidth: 32, frameHeight: 48 }
    );
}
var platforms;
var player1;
var cursors;/*
var score = 0;*/
var infoText;
//var bombs;
var player2;
var battleTimer = 0;
var turn = 'left';
var returnPlayers = false;
var notAttacking = false;
var leftPlayerAttackPool = [
    ["regularHit", ["2", 2500, 0]],
    ["jumpAttack", ["2", 2500, 100]],
    ["chargedAttack", ["2", 2500, 1000]]
];
var chosenAttack = -1;
var attackPhase = 0;
var timeCheck = 0;
var inAttackAnimation = false;


function create() {
    
    
    cursors = this.input.keyboard.createCursorKeys();
    this.add.image(400, 300, 'sky');

    platforms = this.physics.add.staticGroup();

    platforms.create(400, 568, 'ground').setScale(2).refreshBody();

    /*platforms.create(600, 400, 'ground');
    platforms.create(50, 250, 'ground');
    platforms.create(750, 220, 'ground');*/
    player1 = this.physics.add.sprite(100, 350, 'dude');
    player2 = this.physics.add.sprite(670, 350, 'dude');
    player1.setCollideWorldBounds(true);
    player2.setCollideWorldBounds(true);
    //player.body.setGravityY(150);
    /*stars = this.physics.add.group({
        key: 'star',
        repeat: 11,
        setXY: { x: 12, y: 0, stepX: 70 }
    });

    stars.children.iterate(function (child) {

        child.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8));

    });
    bombs = this.physics.add.group();
    */
    infoText = this.add.text(16, 16, 'Turn: ' + turn + '(' + battleTimer + ')', { fontSize: '32px', fill: '#000' });

    this.anims.create({
        key: 'left',
        frames: this.anims.generateFrameNumbers('dude', { start: 0, end: 3 }),
        frameRate: 10,
        repeat: -1
    });
    
    this.anims.create({
        key: 'turn',
        frames: [{ key: 'dude', frame: 4 }],
        frameRate: 20
    });

    this.anims.create({
        key: 'right',
        frames: this.anims.generateFrameNumbers('dude', { start: 5, end: 8 }),
        frameRate: 10,
        repeat: -1
    });

    this.physics.add.collider(player1, platforms);
    this.physics.add.collider(player2, platforms);
    /*this.physics.add.collider(stars, platforms);
    this.physics.add.collider(bombs, platforms);
    this.physics.add.collider(player, bombs, hitBomb, null, this);*/
    this.physics.add.overlap(player1, player2, calculateAttack, null, this);
    player1.anims.play('turn', true)
    player2.anims.play('turn', true)
}

function update() {
    battleTimer += 1;
    infoText.setText('Turn: ' + turn + '(' + battleTimer + ')')
    if (battleTimer >= 200) {
        triggerAttack();

    }
    if (returnPlayers == true) {
        if (turn == 'left') {
            //Left player return
            player1.anims.play('left', true)
            player1.setVelocityX(-250);
            if (player1.x < 100) {
                player1.setVelocityX(0);
                player1.setPosition(100, 513);
                
                returnPlayers = false;
                notAttacking = true;
            }
            battleTimer = 0;
            if (notAttacking) {
                player1.anims.play('turn', true)
                turn = 'right';
            }
            

        }
        else {
            //Right player return
            player2.anims.play('right', true)
            player2.setVelocityX(250);
            if (player2.x > 670) {
                player2.setVelocityX(0);
                player2.setPosition(670, 513);
                
                returnPlayers = false;
                notAttacking = true;
            }
            battleTimer = 0;
            if (notAttacking) {
                player2.anims.play('turn', true)
                turn = 'left';
            }
        }
        
        
        
        
    }
    if (inAttackAnimation = true) {
        if (game.time.now - timeCheck > leftPlayerAttackPool[chosenAttack][attackPhase][2]) {
            //n seconds have elapsed, so safe to do something
            if (attackPhase < leftPlayerAttackPool[chosenAttack].length) {
                attackPhase++
                startMovement(leftPlayerAttackPool[chosenAttack], attackPhase);
            }
            else {
                inAttackAnimation = false;
            }
        } else {
            //still waiting
        }
    }/*
    else if (cursors.right.isDown) {
        player.setVelocityX(160);

        player.anims.play('right', true);
    }
    else {
        player.setVelocityX(0);

        player.anims.play('turn');
    }

    if (cursors.up.isDown && player.body.touching.down) {
        player.setVelocityY(-400);
    }*/
}

/*function collectStar(player, star) {
    star.disableBody(true, true);

    score += 10;
    scoreText.setText('Score: ' + score);

    if (stars.countActive(true) === 0) {
        stars.children.iterate(function (child) {

            child.enableBody(true, child.x, 0, true, true);

        });

        var x = (player.x < 400) ? Phaser.Math.Between(400, 800) : Phaser.Math.Between(0, 400);

        var bomb = bombs.create(x, 16, 'bomb');
        bomb.setBounce(1);
        bomb.setCollideWorldBounds(true);
        bomb.setVelocity(Phaser.Math.Between(-200, 200), 20);

    }
}

function hitBomb(player, bomb) {
    this.physics.pause();

    player.setTint(0xff0000);

    player.anims.play('turn');

    gameOver = true;
}*/

function triggerAttack() {
    //Attack
    if (turn == 'left') {
        //Left player attack, set animations and such
        //choose random index of leftPlayerAttackPool, store it in chosenAttack
        chosenAttack = getRandomInt(leftPlayerAttackPool.length);
        attackPhase = 1;
        startMovement(leftPlayerAttackPool[chosenAttack], attackPhase);
        inAttackAnimation = true;
        player1.anims.play('right', true)
    }
    else {
        //Right player attack, set animations and such
        player2.setVelocityX(-250);
        player2.anims.play('left', true)
    }
}

function calculateAttack() {
    var hitSound = this.sound.add('hitSound');
    var clearTints = this.plugins.get('rexWaitEvents').add(function () {
        player1.clearTint();
        player2.clearTint();
    })
    notAttacking = false;
    hitSound.play();
    if (turn == 'left') {
        //Left player attack, calculate damage
        player2.setTint(0xff0000);
        this.time.delayedCall(60, clearTints.waitCallback());
    }
    else {
        //Right player attack, calculate damage
        player1.setTint(0xff0000);
        this.time.delayedCall(60, clearTints.waitCallback());
    }
    player1.setVelocityX(0);
    player2.setVelocityX(0);
    returnPlayers = true;
}

function getRandomInt(max) {
    return Math.floor(Math.random() * max);
}


function startMovement(movement, phase) {
    switch (movement[phase][0]) {
        case "1":
            break;
        case "2":
            player1.setVelocityX(leftPlayerAttackPool[chosenAttack][phase][1]);
            break;

    }
    timeCheck = game.time.now;
}