const Links = {
    'Circle': './images/circle.png',
    'Cross' : './images/cross.png',
}

const Tokens = {
    Circle: 'Circle',
    Cross : 'Cross',
    None  : 'None'
};

const GameState = {
    Menu    : 'Menu',
    Progress: 'Progress', 
    Finish  : 'Finish'
}

const Outcomes = {
    Win :  10,
    Tie :   0,
    Lose: -10
}

let Player = (token, name, cpu) => { 
    const get_token = () => token;
    const get_name  = () => name;
    const is_cpu    = () => cpu;
    let next_player = undefined;

    return {get_token, get_name, is_cpu, next_player};
};

const Game = (() => {
    'use strict';

    const Gameboard = (() => {
        let Board;

        const reset = function () {
            Board = [[Tokens.None, Tokens.None, Tokens.None],
                     [Tokens.None, Tokens.None, Tokens.None], 
                     [Tokens.None, Tokens.None, Tokens.None]];
        }
        const set_cell = function (n, m, v) {
            Board[n][m] = v;
        }
        const get_cell = function (n, m) {
            return Board[n][m];
        }
        const get_board = function () {
            return Board;
        }
        const empty = function () {
            const flat_board = [].concat(...Board);
            return flat_board.every( v => v === Tokens.None);
        }
        const state = function () {
            const flat_board = [].concat(...Board);

            //Vertical or Horizontal Win
            for(let i = 0; i < 3; ++i)
                if ([flat_board[i*3], flat_board[i*3+1], flat_board[i*3+2]].every( v => v == flat_board[i*3]) && flat_board[i*3] != Tokens.None ||
                          [flat_board[i], flat_board[i+3], flat_board[i+6]].every( v => v == flat_board[i])   && flat_board[i]   != Tokens.None)
                    return flat_board[i*4];

            //Diagonal Win
            if ([flat_board[0], flat_board[4], flat_board[8]].every( v => v == flat_board[0]) && flat_board[0] != Tokens.None ||
                [flat_board[2], flat_board[4], flat_board[6]].every( v => v == flat_board[2]) && flat_board[2] != Tokens.None)
                return flat_board[4];

            return flat_board.every( v => v !== Tokens.None) ? Tokens.None : null;
        }
        
        reset();
        return {reset, set_cell, get_cell, get_board, empty, state};
    })();

    let game_state = GameState.Menu;
    let players;
    let current_player = null;

    const moves = [ [0, 0], [0, 1], [0, 2],
                    [1, 0], [1, 1], [1, 2],
                    [2, 0], [2, 1], [2, 2],
                  ];
    
    let playable = () => moves.filter(cell => Gameboard.get_cell(...cell) == Tokens.None);
    
    function naive () {
        return playable()[Math.floor(Math.random() * playable().length)];
    };

    function minimax (player) {
        let state = Gameboard.state();
        if (state != null) {
            if (state == current_player.get_token())
                return {move: undefined, value: Outcomes.Win};        // 1
            if (state == Tokens.None)
                return {move: undefined, value: Outcomes.Tie};        // 0

            return {move: undefined, value: Outcomes.Lose};           //-1
        }

        const modes = {
            MAX: (a, b) => a >= b,
            MIN: (a, b) => a <= b
        }

        let moves = playable().map((move) => {
            Gameboard.set_cell(...move, player.get_token());    //place the piece in the board
            const move_result = minimax(player.next_player);    //minimax new board
            Gameboard.set_cell(...move, Tokens.None);           //return to previous state
            return {cell: move, value: move_result.value};          
        });

        //Are we maximizing or minimizing score?
        const operation = player.get_token() == current_player.get_token() ? modes.MAX : modes.MIN;
        state = moves.reduce((previous, move) => 
                operation(move.value, previous.value) ?
                    {cell: [...move.cell], value: move.value} : previous);
        return state;
    };

    function computerplay () {
        let play;
        //hardcode first move
        if (Gameboard.empty())
            play = ([{cell: [0, 0]}, {cell: [2, 0]}, {cell: [0, 2]}, {cell: [2, 2]}])[Math.floor(Math.random() * 4)];
        else
            play = minimax(current_player);
        playcell(...play.cell);
    }

    function playcell (n, m) {
        if (game_state == GameState.Progress && (current_player?.is_cpu() || Gameboard.get_cell(n, m) == Tokens.None)) {
            Gameboard.set_cell(n, m, current_player.get_token());
            if (Gameboard.state() == null)
                current_player = current_player.next_player;
            update();
            return true;
        }
        return false;
    };
    
    function get_current_player () {
        return current_player;
    }

    function get_game_state () {
        return game_state;
    }

    function reset() {
        if (players) {
            Gameboard.reset();
            body.classList = [];
            current_player = Math.random() > 0.5 ? players[0] : players[1];
            update();
            game_state = GameState.Progress;
        }
    };

    let start_game = function (P) {
        players = P;
        reset();
    };

    function update () {
        if (Gameboard.state() != null) {
            if (Gameboard.state() == Tokens.None)
                current_player = null;
            game_state = GameState.Finish;
        }
        else if (current_player?.is_cpu())
            computerplay();
    };

    update();
    return {start_game, reset, get_cell: Gameboard.get_cell, playcell, get_current_player, get_game_state};
}
)();

//New game modal open/close
const modal = document.querySelector('.modal');
const newgame = document.querySelector('#newgame');
newgame.addEventListener('click', () => modal.style.display = 'flex');
window.addEventListener('click', (e) => { if (e.target == modal) modal.style.display = "none"; });

//Restart
const restart = document.querySelector('#restart');
restart.addEventListener('click', () => {
    Game.reset();
    update_board();
});

//New game form
const form = document.getElementById('game');
form.addEventListener('submit', (e) => {
    let players = 
        [Player(Tokens.Circle, form.elements['circlename'].value, form.elements['circleCPU'].checked),
         Player(Tokens.Cross,  form.elements['crossname'].value,  form.elements['crossCPU'].checked)];
    players[0].next_player = players[1];
    players[1].next_player = players[0];
    Game.start_game(players);
    update_board();
    modal.style.display = "none";
    e.preventDefault(); //Don't submit the form
});

//Board interactivity
cells = document.querySelectorAll('.cell');
for (let i = 0; i < 9; ++i)
    cells[i].addEventListener('click', e => {
        let [n, m] = [i%3, Math.floor(i/3)];
        if (Game.playcell(n, m))
            update_board();
    });

//Rendering functions
function set_cellimg(cell, token) {
    const img = cell.querySelector('.cellimg');
    if (token != Tokens.None) {
        img.setAttribute('src', Links[token]);
        img.style.display = 'block'; 
    }
    else
        img.style.display = 'none';
}

function update_board() {
    for (let i = 0; i < 9; ++i)
        set_cellimg(cells[i], Game.get_cell(i%3, Math.floor(i/3)));
    update_display();
}

let header = document.querySelector('header');
let body = document.querySelector('body');
let text = document.querySelector('header .info');

function update_display () {
    const style = Game.get_current_player()?.get_token() ?? Tokens.None;
    header.classList = [style];
    switch (Game.get_game_state()) {
        case GameState.Menu:
            text.textContent = 'Please start a new game';
            body.classList = [];
            break;
        case GameState.Progress:
            text.textContent = `It's ${Game.get_current_player().get_name()}s turn.`;
            body.classList = [];
            break;
        case GameState.Finish:
            text.textContent = Game.get_current_player() === null ? 
                    `It's a tie!` : `${Game.get_current_player().get_name()} wins!`;
            body.classList = [style];
            break;
    }
};

update_board();