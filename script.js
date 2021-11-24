const Game = (() => {

    const Tokens = {
        Circle: 'Circle',
        Cross: 'Cross'
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
    
        reset();
        return {reset, set_cell, get_cell, get_board};
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