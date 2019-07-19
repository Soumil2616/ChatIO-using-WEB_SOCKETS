var express = require("express"),
  app = express(),
  server = require("http").createServer(app),
  io = require("socket.io").listen(server);
usernames = [];

server.listen(process.env.PORT || 2016);
console.log("server running...");

app.get("/", function(req, res) {
  res.sendFile(__dirname + "/index.html");
});

io.sockets.on("connection", function(socket) {
  console.log("socket connected...");

  socket.on("new user", function(data, callback) {
    if (usernames.indexOf(data) != -1) {
      callback(false);
    } else {
      callback(true);
      socket.usernames = data;
      usernames.push(socket.username);
      updateUsernames();
    }
  });

  //update usernames
  function updateUsernames() {
    io.sockets.emit("usernames", usernames);
  }
  // send message
  socket.on("send message", function(data) {
    io.sockets.emit("new message", { msg: data, user: socket.usernames });
  });

  //disconnect
  socket.on("disconect", function(data) {
    if (!socket.username) {
      return;
    }
    usernames.splice(usernames.indexOf(socket.username), 1);
    updateUsernames();
  });
});
