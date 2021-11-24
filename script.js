const Game = (() => {

    const Tokens = {
        Circle: 'Circle',
        Cross: 'Cross',
        None: 'None'
    };

    let Player = (token, link) => { 
        const get_token = () => token;
        const get_link = () => link;
        let next_player = undefined;

        return { get_token, get_link, next_player};
    };

    const Gameboard = (() => {
        let Board;
    
        const reset = function () {
            Board = [[null, null, null], [null, null, null], [null, null, null]];
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
        const end = function () {
            const flat_board = [].concat(...Board);

            for(let i = 0; i < 3; ++i)
                if ([flat_board[i*3], flat_board[i*3+1], flat_board[i*3+2]].every( v => v == flat_board[i*3]) && flat_board[i*3] != null ||
                    [flat_board[i], flat_board[i+3], flat_board[i+6]].every( v => v == flat_board[i]) && flat_board[i] != null)
                    return flat_board[i*4];

            if ([flat_board[0], flat_board[4], flat_board[8]].every( v => v == flat_board[0]) && flat_board[0] != null ||
                [flat_board[2], flat_board[4], flat_board[6]].every( v => v == flat_board[2]) && flat_board[2] != null)
                return flat_board[4];

            return flat_board.every( v => v !== null) ? Tokens.None : null;
        }
    
        reset();
        return {reset, set_cell, get_cell, get_board, end};
    }
    )();

    let players = 
        [Player(Tokens.Circle, './images/circle.png'),
         Player(Tokens.Cross, './images/cross.png')];
    players[0].next_player = players[1];
    players[1].next_player = players[0];
    let active_player = players[0];

    let header = document.querySelector('header');
    let text = document.querySelector('header .info');

    function update () {
        if (G.end() != null) {
            console.log('win' + G.end());
            active_player = null;
        }
        text.textContent = 'Active Player: ' + (active_player?.get_token() ?? '');
        header.classList = [active_player?.get_token() ?? 'Neutral'];
    }

    let G = Gameboard;

    cells = document.querySelectorAll('.cell');
    for (let i = 0; i < 9; ++i)
        cells[i].addEventListener('click', e => {
            if (!active_player)
                return;
            let [n, m] = [i%3, Math.floor(i/3)];
            if (!G.get_cell(n, m)) {
                G.set_cell(n, m, active_player.get_token());
                let img = cells[i].querySelector('img');
                img.setAttribute('src', active_player.get_link());
                img.style.display = 'block'; 
                active_player = active_player.next_player;
                update();
            }
        });

    update();
}
)();

game = Game;