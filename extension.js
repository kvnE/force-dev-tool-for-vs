// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require('vscode');
var spawnCMD = require('spawn-command');
var treeKill = require('tree-kill');
var process = null;
var commandOutput = null;

function run(cmd, cwd) {
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

function exec(cmd, cwd) {
    if (!cmd) { return; }
    commandOutput.clear();
    commandOutput.show();
    commandOutput.appendLine(`> Running command \`${cmd}\`...`)
    run(cmd, cwd).then(() => {
      commandOutput.appendLine(`> Command ran successfully.`);
    }).catch((reason) => {
      commandOutput.appendLine(`> ERROR: ${reason}`);
      vscode.window.showErrorMessage(reason, 'Show Output')
        .then((action) => { commandOutput.show(); });
    });
}

function term() {
    treeKill(process.pid, 'SIGTERM', function(err) {
      if (err) {
        vscode.window.showErrorMessage(`Failed to kill process with PID ${process.pid}.`);
      } else {
        process = null;
      }
    });
}

function execShellCMD(cwd, cmd) {
    if (process) {
        const msg = 'There is an active running shell command right now. Terminate it before executing another shell command.';
        vscode.window.showWarningMessage(msg, 'Terminate')
        .then((choice) => {
            if (choice === 'Terminate') {
            term();
            }
        });
    } else {
        exec(cmd, cwd);
    }
}
function activate(context) {
    console.log('Congratulations, your extension "force-dev-tool-for-vs" is now active!');
    commandOutput = vscode.window.createOutputChannel('force-dev-tool');
    
    context.subscriptions.push(vscode.commands.registerCommand('extension.login', function () {
        execShellCMD(vscode.workspace.rootPath, "force-dev-tool login");
    }));
    context.subscriptions.push(vscode.commands.registerCommand('extension.fetch', function () {
        execShellCMD(vscode.workspace.rootPath, "force-dev-tool fetch");        
    }));
    context.subscriptions.push(vscode.commands.registerCommand('extension.retrieve', function () {
        execShellCMD(vscode.workspace.rootPath, "force-dev-tool retrieve");                
    }));
    context.subscriptions.push(vscode.commands.registerCommand('extension.test', function () {
        execShellCMD(vscode.workspace.rootPath, "force-dev-tool test");                
    }));
    context.subscriptions.push(vscode.commands.registerCommand('extension.packageAll', function () {
        execShellCMD(vscode.workspace.rootPath, "force-dev-tool package -a");                
    }));
    context.subscriptions.push(vscode.commands.registerCommand('extension.destructive', function (file) {
        var options = {
            placeHolder: 'Changeset Name',
        };
        vscode.window.showInputBox(options).then((name) => {
            commandOutput.show();
            var path; 
            if(file == null)
            {
                var options2 = {
                    placeHolder: 'Filename',
                };
                vscode.window.showInputBox(options2).then((file) => {
                    execShellCMD(vscode.workspace.rootPath, 'echo "" | force-dev-tool changeset create ' + name + ' --destructive ' + file );                                    
                });
            }else{
                path = file.toString();
                path = path.replace("file://", "");
                execShellCMD(vscode.workspace.rootPath, 'echo "" | force-dev-tool changeset create ' + name + ' --destructive ' + path);                                
            }
            
        });
    }));
    context.subscriptions.push(vscode.commands.registerCommand('extension.changeset', function (file) {
        
        var options = {
            placeHolder: 'Changeset Name.',
        };
        vscode.window.showInputBox(options).then((name) => {
            commandOutput.show();

            var path; 
            if(file == null)
            {
                var options2 = {
                    placeHolder: 'Filename',
                };
                vscode.window.showInputBox(options2).then((file) => {
                    execShellCMD(vscode.workspace.rootPath, 'echo "" | force-dev-tool changeset create ' + name + ' -f ' + file);                                    
                });
            }else{
                path = file.toString();
                path = path.replace("file://", "");
                execShellCMD(vscode.workspace.rootPath, 'echo "" | force-dev-tool changeset create ' + name + ' -f ' + path);                
            }
        });
    }));
    context.subscriptions.push(vscode.commands.registerCommand('extension.createDiffChangeset', function () {
        var options = {
            placeHolder: 'Changeset Name.',
        };
        vscode.window.showInputBox(options).then((name) => {
            execShellCMD(vscode.workspace.rootPath, "git diff | force-dev-tool changeset create -f " + name);                
        });
    }));
    context.subscriptions.push(vscode.commands.registerCommand('extension.check', function () {
        execShellCMD(vscode.workspace.rootPath, "git diff | force-dev-tool changeset create tempChangeSet -f ; force-dev-tool deploy -d config/deployments/tempChangeSet/ -c");                
    }));
    context.subscriptions.push(vscode.commands.registerCommand('extension.deploy', function (file) {
            commandOutput.show();

            var path; 
            if(file == null)
            {
                var options2 = {
                    placeHolder: 'Filename',
                };
                vscode.window.showInputBox(options2).then((file) => {
                    execShellCMD(vscode.workspace.rootPath, 'echo "" | force-dev-tool changeset create tempChangeSet -f ' + file +' && force-dev-tool deploy -d config/deployments/tempChangeSet/' );                                                         
                });
            }else{
                path = file.toString();
                path = path.replace("file://", "");
                execShellCMD(vscode.workspace.rootPath, 'echo "" | force-dev-tool changeset create tempChangeSet -f ' + path +' && force-dev-tool deploy -d config/deployments/tempChangeSet/' );                                                         
            }
        }));    
}
exports.activate = activate;

// this method is called when your extension is deactivated
function deactivate() {
    if (process) {
        treeKill(process.pid, 'SIGTERM', function(err) {
          if (err) {
            treeKill(process.pid, 'SIGKILL');
          }
          process = null;
        });
    }
}
exports.deactivate = deactivate;