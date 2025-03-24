let move_speed = 3, gravity = 0.5;
let bird = document.querySelector('.bird');
let img = document.getElementById('bird-1');
let sound_point = new Audio('sounds effect/point.mp3');
let sound_die = new Audio('sounds effect/die.mp3');

let bird_props = bird.getBoundingClientRect();
let background = document.querySelector('.background').getBoundingClientRect();

let score_val = document.querySelector('.score_val');
let message = document.querySelector('.message');
let score_title = document.querySelector('.score_title');
let best_score_val = document.querySelector('.best_score_val');
let game_state = 'Start';
let isPaused = false;

img.style.display = 'none';
message.classList.add('messageStyle');


let best_score = localStorage.getItem('best_score') || 0;
best_score_val.innerHTML = best_score;

document.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && game_state === 'Start') {
        startGame();
    } else if (e.key === 'P' && game_state === 'Play') {
        pauseGame();
    } else if (e.key === 'R' && game_state === 'Pause') {
        resumeGame();
    }
});

function startGame() {
    document.querySelectorAll('.pipe_sprite').forEach((e) => e.remove());
    img.style.display = 'block';
    bird.style.top = '40vh';
    game_state = 'Play';
    isPaused = false;
    message.innerHTML = '';
    score_title.innerHTML = 'Score: ';
    score_val.innerHTML = '0';
    message.classList.remove('messageStyle');
    document.querySelector('.heading').style.display = 'none';
    play();
}

function play() {
    function move() {
        if (game_state !== 'Play' || isPaused) return;

        document.querySelectorAll('.pipe_sprite').forEach((element) => {
            let pipe_sprite_props = element.getBoundingClientRect();
            bird_props = bird.getBoundingClientRect();

            if (pipe_sprite_props.right <= 0) {
                element.remove();
            } else {
                if (bird_props.left < pipe_sprite_props.left + pipe_sprite_props.width &&
                    bird_props.left + bird_props.width > pipe_sprite_props.left &&
                    bird_props.top < pipe_sprite_props.top + pipe_sprite_props.height &&
                    bird_props.top + bird_props.height > pipe_sprite_props.top) {
                    game_state = 'End';
                    img.style.display = 'none';
                    sound_die.play();
                    updateBestScore(parseInt(score_val.innerHTML));
                    showGameOverModal(parseInt(score_val.innerHTML));
                    return;
                } else {
                    if (pipe_sprite_props.right < bird_props.left &&
                        pipe_sprite_props.right + move_speed >= bird_props.left &&
                        element.increase_score === '1') {
                        score_val.innerHTML = +score_val.innerHTML + 1;
                        sound_point.play();
                    }
                    element.style.left = pipe_sprite_props.left - move_speed + 'px';
                }
            }
        });

        if (!isPaused) {
            requestAnimationFrame(move);
        }
    }
    requestAnimationFrame(move);

    let bird_dy = 0;

    function apply_gravity() {
        if (game_state !== 'Play' || isPaused) return;

        bird_dy += gravity;

        document.addEventListener('keydown', (e) => {
            if ((e.key === 'ArrowUp' || e.key === ' ') && !isPaused) {
                img.src = 'images/Bird-2.png';
                bird_dy = -7.6;
            }
        });

        document.addEventListener('keyup', (e) => {
            if ((e.key === 'ArrowUp' || e.key === ' ') && !isPaused) {
                img.src = 'images/Bird.png';
            }
        });

        if (bird_props.top <= 0 || bird_props.bottom >= background.bottom) {
            game_state = 'End';
            message.style.left = '28vw';
            window.location.reload();
            message.classList.remove('messageStyle');
            return;
        }

        bird.style.top = bird_props.top + bird_dy + 'px';
        bird_props = bird.getBoundingClientRect();

        if (!isPaused) {
            requestAnimationFrame(apply_gravity);
        }
    }
    requestAnimationFrame(apply_gravity);

    let pipe_separation = 0;
    let pipe_gap = 35;

    function create_pipe() {
        if (game_state !== 'Play' || isPaused) return;

        if (pipe_separation > 115) {
            pipe_separation = 0;
            let pipe_posi = Math.floor(Math.random() * 43) + 8;

            let pipe_sprite_inv = document.createElement('div');
            pipe_sprite_inv.className = 'pipe_sprite';
            pipe_sprite_inv.style.top = pipe_posi - 70 + 'vh';
            pipe_sprite_inv.style.left = '100vw';
            document.body.appendChild(pipe_sprite_inv);

            let pipe_sprite = document.createElement('div');
            pipe_sprite.className = 'pipe_sprite';
            pipe_sprite.style.top = pipe_posi + pipe_gap + 'vh';
            pipe_sprite.style.left = '100vw';
            pipe_sprite.increase_score = '1';
            document.body.appendChild(pipe_sprite);
        }
        pipe_separation++;

        if (!isPaused) {
            requestAnimationFrame(create_pipe);
        }
    }
    requestAnimationFrame(create_pipe);
}

function pauseGame() {
    isPaused = true;
    game_state = 'Pause';

    // Display pause message
    const pauseMsg = document.createElement('div');
    pauseMsg.id = 'pauseMessage';
    pauseMsg.innerHTML = 'Paused';
    pauseMsg.style.position = 'fixed';
    pauseMsg.style.top = '50%';
    pauseMsg.style.left = '50%';
    pauseMsg.style.transform = 'translate(-50%, -50%)';
    pauseMsg.style.fontSize = '5rem';
    pauseMsg.style.color = '#fff';
    pauseMsg.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
    pauseMsg.style.padding = '20px';
    pauseMsg.style.zIndex = '999';
    pauseMsg.style.borderRadius = '10px';
    document.body.appendChild(pauseMsg);
}

function resumeGame() {
    isPaused = false;
    game_state = 'Play';

    // Remove pause message
    const pauseMsg = document.getElementById('pauseMessage');
    if (pauseMsg) pauseMsg.remove();

    // Resume game loops
    play();
}

// Update Best Score
function updateBestScore(score) {
    if (score > best_score) {
        best_score = score;
        localStorage.setItem('best_score', best_score);
        best_score_val.innerHTML = best_score;
    }
}

function showGameOverModal(score) {
    const modal = document.getElementById('gameOverModal');
    const finalScore = document.getElementById('finalScore');
    const bestScoreDisplay = document.getElementById('bestScore');

    finalScore.innerHTML = `Your Score: ${score}`;
    bestScoreDisplay.innerHTML = `Best Score: ${best_score}`;
    modal.style.display = 'block';
}

function replayGame() {
    document.getElementById('gameOverModal').style.display = 'none';
    document.querySelectorAll('.pipe_sprite').forEach((e) => e.remove());
    bird.style.top = '40vh';
    score_val.innerHTML = '0';
    game_state = 'Play';
    isPaused = false;
    play();
}

