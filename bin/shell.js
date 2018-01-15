const vscode = require('vscode');
var spawnCMD = require('spawn-command');
var treeKill = require('tree-kill');
var process = null;
var commandOutput = vscode.window.createOutputChannel('force-dev-tool');

exports.run = function(cmd, cwd) {
    return new Promise((accept, reject) => {
      var opts = {};
      if (vscode.workspace) {
        opts.cwd = cwd;
      }
      process = spawnCMD(cmd, opts);
      function printOutput(data) { commandOutput.append(data.toString()); }
      process.stdout.on('data', printOutput);
      process.stderr.on('data', printOutput);
      process.on('close', (status) => {
        if (status) {
          reject(`Command \`${cmd}\` exited with status code ${status}.`);
        } else {
          accept();
        }
        process = null;
      });
    });
}

exports.exec = function(cmd, cwd) {
    if (!cmd) { return; }
    commandOutput.clear();
    commandOutput.show();
    commandOutput.appendLine(`> ${cmd}`)
    this.run(cmd, cwd).then(() => {
      commandOutput.appendLine(`> Successful.`);
    }).catch((reason) => {
      commandOutput.appendLine(`> ERROR: ${reason}`);
      vscode.window.showErrorMessage(reason, 'Show Output')
        .then((action) => { commandOutput.show(); });
    });
}

exports.term = function() {
    treeKill(process.pid, 'SIGTERM', function(err) {
      if (err) {
        vscode.window.showErrorMessage(`Failed to kill process with PID ${process.pid}.`);
      } else {
        process = null;
      }
    });
}

exports.execShellCMD = function (cwd, cmd) {
    if (process) {
        const msg = 'There is an active running shell command right now. Terminate it before executing another shell command.';
        vscode.window.showWarningMessage(msg, 'Terminate')
        .then((choice) => {
            if (choice === 'Terminate') {
            this.term();
            }
        });
    } else {
        this.exec(cmd, cwd);
    }
}