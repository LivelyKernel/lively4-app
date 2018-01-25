var express = require("express");
var app = express();
const { spawn } = require('child_process');

var runningProcesses = {};

function makeId() {
  var text = "";
  var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for (var i = 0; i < 20; i++)
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  return text;
}

app.get("/kill/*", function(req, res) {
  let id = req.params[0];
  runningProcesses[id]["process"].kill();
  res.send("killed");
});

app.get("/stdout/*", function(req, res) { 
  let id = req.params[0];
  let result = runningProcesses[id]["stdout"].splice(0, runningProcesses[id]["stdout"].length)
  res.send(result);
});

app.get("/stderr/*", function(req, res) { 
  let id = req.params[0];
  let result = runningProcesses[id]["stderr"].splice(0, runningProcesses[id]["stderr"].length)
  res.send(result);
});

app.get("/end/*", function(req, res) { 
  let id = req.params[0];
  if (runningProcesses[id]["end"]) {
    delete runningProcesses[id];
    res.send(true);
  } else {
    res.send(false);
  }
});

app.get("/new/*", function(req, res){ 
  let cmd = req.params[0];
  console.log('spawn: ' + cmd);
  let proc = spawn(cmd.split(" ")[0], cmd.split(" ").slice(1));
  let id = makeId();
  runningProcesses[id] = {"stdout": [], "stderr": [], "end": false};
  runningProcesses[id]["process"] = proc;

  proc.stdout.on('data', function (data) {
    runningProcesses[id]["stdout"].push(data.toString());
  });
  proc.stderr.on('data', function (data) {
    runningProcesses[id]["stderr"].push(data.toString());
  });
  proc.on('close', function () {
    runningProcesses[id]["end"] = true;
    console.log("end");
    console.log(runningProcesses);
  })
  res.send(id);
});

var port = process.env.PORT || 5000;
app.listen(port, function() {
 console.log("Listening on " + port);
});
