"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.playAgain = exports.sendMessage = exports.gameMove = exports.leaveGame = exports.joinGame = void 0;
const crypto_1 = require("crypto");
let games = {};
let users = [];
let waitingQ = [];
const joinGame = (arg, s, io) => {
    console.log("joined:", arg.nick);
    if (games.hasOwnProperty(arg.room)) {
        if (games[arg.room].length == 1) {
            s.join(arg.room);
            games[arg.room].push(arg.nick);
            users.push(s.id);
            s.emit("game:join:good", {
                msg: `you, ${arg.nick}, join ${arg.room}, game will start`,
                position: 1,
                username: arg.nick,
            });
            io.in(arg.room).emit("game:users:list", {
                list: games[arg.room],
                auth: "true",
            });
            const startingPlayer = (0, crypto_1.randomInt)(0, 2);
            io.in(arg.room).emit("game", {
                first: startingPlayer,
                start: true,
                move: "x",
            });
        }
        else {
            s.emit("game:join:good", {
                msg: `this room, ${arg.room} is full`,
                position: null,
            });
            s.emit("game:users:list", {
                list: [],
                auth: "false",
            });
        }
    }
    else {
        games[arg.room] = [];
        games[arg.room].push(arg.nick);
        s.join(arg.room);
        s.emit("game:join:good", {
            msg: `you, ${arg.nick}, joined room ${arg.room} first member`,
            position: 0,
            username: arg.nick,
        });
        io.in(arg.room).emit("game:users:list", {
            list: games[arg.room],
            auth: "true",
        });
    }
    console.log("rooms:", s.rooms);
    console.log("users", games[arg.room]);
};
exports.joinGame = joinGame;
const leaveGame = (arg, s, io) => {
    let leaveRoom = "";
    console.log("closig");
    users = users.filter((id) => id !== s.id);
    s.rooms.forEach((i) => {
        if (i !== s.id) {
            leaveRoom = i;
            delete games[i];
        }
    });
    s.emit("game:users:list", {
        list: games[leaveRoom],
        auth: "true",
    });
};
exports.leaveGame = leaveGame;
const gameMove = (arg, s, io) => {
    s.rooms.forEach((room) => {
        if (games.hasOwnProperty(room)) {
            s.to(room).emit("servermove", { id: arg.id });
        }
    });
};
exports.gameMove = gameMove;
const sendMessage = (arg, s, io) => {
    s.rooms.forEach((room) => {
        if (games.hasOwnProperty(room)) {
            s.to(room).emit("messagerec", { msg: arg.msg, sender: arg.sender });
        }
    });
};
exports.sendMessage = sendMessage;
const playAgain = (arg, s, io) => {
    s.rooms.forEach((room) => {
        if (waitingQ.includes(room) && room !== s.id) {
            const startingPlayer = (0, crypto_1.randomInt)(0, 2);
            io.in(room).emit("playagain", { first: startingPlayer });
            return;
        }
        else {
            waitingQ.push(room);
        }
    });
};
exports.playAgain = playAgain;
//# sourceMappingURL=game.js.map