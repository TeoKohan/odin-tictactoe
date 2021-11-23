const Game = (() => {

    const Tokens = {
        Circle: 'Circle',
        Cross: 'Cross'
    };

    let Player = (token, link) => { 
        const get_token = () => token;
        const get_link = () => link;
        return { get_token, get_link };
    };

    const players = [Player(Tokens.Circle, './images/circle.png'), Player(Tokens.Cross, './images/cross.png')];

    const Gameboard = (() => {
        let Board = [[null, null, null], [null, null, null], [null, null, null]];
    
        const set_cell = function (n, m, v) {
            Board[n][m] = v;
        }
        const get_cell = function (n, m) {
            return Board[n][m];
        }
        const get_board = function () {
            return Board;
        }
    
        return {set_cell, get_cell, get_board};
    }
    )();

    let turn = 0;
    let G = Gameboard;

    cells = document.querySelectorAll('.cell');
    for (let i = 0; i < 9; ++i)
        cells[i].addEventListener('click', e => {
            console.log('click');
            let player = players[(turn++)%2];
            let [n, m] = [i%3, Math.floor(i/3)];

            if (!G.get_cell(n, m)) {
                G.set_cell(n, m, player.get_token());
                let img = cells[i].querySelector('img');
                img.setAttribute('src', player.get_link());
                img.style.display = 'block'; 
            }
        });
}
)();

game = Game;