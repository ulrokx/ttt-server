"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
process.env.DEBUG = "socket.io*";
const http_1 = require("http");
const socket_io_1 = require("socket.io");
const game_1 = require("./events/game");
const main = async () => {
    let port = process.env.PORT;
    if (port == null || port == "") {
        port = 4000;
    }
    const httpServer = (0, http_1.createServer)();
    const io = new socket_io_1.Server(httpServer, {
        cors: {
            origin: "*",
            methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE"],
        },
    });
    let connections = [];
    io.on("connection", (s) => {
        connections.push(s.id);
        s.on("game:join", (arg) => (0, game_1.joinGame)(arg, s, io));
        s.on("disconnect", (arg) => (0, game_1.leaveGame)(arg, s, io));
        s.on("clientmove", (arg) => (0, game_1.gameMove)(arg, s, io));
        s.on("messagesend", (arg) => (0, game_1.sendMessage)(arg, s, io));
        s.on("game:again", (arg) => (0, game_1.playAgain)(arg, s, io));
    });
    httpServer.listen(port, () => {
        console.log(`server listenging on port ${port}`);
    });
};
main();
//# sourceMappingURL=index.js.map