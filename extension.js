import { request } from 'https';

// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
var fs = require('fs');
const vscode = require('vscode');
var spawnCMD = require('spawn-command');
var treeKill = require('tree-kill');
var cb = require('./bin/CommandBuilder');
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
function getRemotes(){
    var configFile = vscode.workspace.rootPath + '/config/.orgs.json';
    if (fs.existsSync(configFile)) {
        var file = fs.readFileSync(configFile);
        var data = JSON.parse(file.toString());
        var options = [];
        for (var key in data.remotes) {
            options.push(key);
        };
        return options;
    }else
    {
        console.log('File does not exists.');
        return null;
    }
}
function activate(context) {
    commandOutput = vscode.window.createOutputChannel('force-dev-tool');
    
    context.subscriptions.push(vscode.commands.registerCommand('extension.login', function () {
        execShellCMD(vscode.workspace.rootPath, cb.buildLogin());
    }));
    context.subscriptions.push(vscode.commands.registerCommand('extension.loginSpecific', function () {
        vscode.window.showQuickPick(getRemotes())
        .then((val) => {
            execShellCMD(vscode.workspace.rootPath, cb.buildLogin(val));
        });
    }));
    context.subscriptions.push(vscode.commands.registerCommand('extension.addDefaultRemote', function () {
        vscode.window.showInputBox({prompt: 'Name:'})
            .then((name) => {
                vscode.window.showInputBox({prompt: 'Username:'})
                    .then((username) => {
                        vscode.window.showInputBox({prompt: 'Password:'})
                            .then((password) => {
                                vscode.window.showInputBox({prompt: 'URL:', value: "https://test.salesforce.com"})
                                    .then((url) => {
                                        execShellCMD(vscode.workspace.rootPath, cb.buildAddRemote(name,username,password,url));
                                    });
                            });
                    });
            });
    }));
    context.subscriptions.push(vscode.commands.registerCommand('extension.changeDefaultRemote', function () {
        vscode.window.showQuickPick(getRemotes())
        .then((val) => {
            execShellCMD(vscode.workspace.rootPath, cb.buildChangeDefaultRemote(val));
        });
    }));
    context.subscriptions.push(vscode.commands.registerCommand('extension.fetch', function () {
        execShellCMD(vscode.workspace.rootPath, cb.buildFetch());        
    }));
    context.subscriptions.push(vscode.commands.registerCommand('extension.fetchSpecific', function () {
        vscode.window.showQuickPick(getRemotes())
        .then((val) => {
            execShellCMD(vscode.workspace.rootPath, cb.buildFetch(val));
        });       
    }));
    context.subscriptions.push(vscode.commands.registerCommand('extension.retrieve', function () {
        execShellCMD(vscode.workspace.rootPath, cb.buildRetrieve());                
    }));
    context.subscriptions.push(vscode.commands.registerCommand('extension.retrieveSpecific', function () {
        vscode.window.showQuickPick(getRemotes())
        .then((val) => {
            execShellCMD(vscode.workspace.rootPath, cb.buildRetrieve(val));
        });       
    }));
    context.subscriptions.push(vscode.commands.registerCommand('extension.test', function () {
        execShellCMD(vscode.workspace.rootPath, cb.buildTestAll());                
    }));
    context.subscriptions.push(vscode.commands.registerCommand('extension.testSpecific', function () {
        vscode.window.showQuickPick(getRemotes())
        .then((val) => {
            execShellCMD(vscode.workspace.rootPath, cb.buildTestAll(val));
        });     
    }));
    context.subscriptions.push(vscode.commands.registerCommand('extension.testClass', function (file) {
        commandOutput.show();
        var path; 
        if(file == null)
        {
            var options2 = {
                placeHolder: 'Filename',
            };
            vscode.window.showInputBox(options2).then((file) => {
                execShellCMD(vscode.workspace.rootPath, cb.buildTestClassCommand(file));                
            });
        }else{
            path = file.toString();
            path = path.replace("file://", "");
            execShellCMD(vscode.workspace.rootPath, cb.uildTestClassCommand(path));                     
        }
    }));
    context.subscriptions.push(vscode.commands.registerCommand('extension.testClassSpecific', function (file) {
        commandOutput.show();
        var path; 
        vscode.window.showQuickPick(getRemotes())
        .then((val) => {
            if(file == null)
            {
                var options2 = {
                    placeHolder: 'Filename',
                };
                vscode.window.showInputBox(options2).then((file) => {
                    execShellCMD(vscode.workspace.rootPath, cb.buildTestClassCommand(file, val));                     
                });
            }else{
                path = file.toString();
                path = path.replace("file://", "");
                execShellCMD(vscode.workspace.rootPath, cb.buildTestClassCommand(path, val));               
            }
        }); 
    }));
    context.subscriptions.push(vscode.commands.registerCommand('extension.packageAll', function () {
        execShellCMD(vscode.workspace.rootPath, cb.buildPackageAll());                
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
                    execShellCMD(vscode.workspace.rootPath, cb.buildCreateDesChangeSetCommand(name,file));                                    
                });
            }else{
                path = file.toString();
                path = path.replace("file://", "");
                execShellCMD(vscode.workspace.rootPath, cb.buildCreateDesChangeSetCommand(name,path));                              
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
                    execShellCMD(vscode.workspace.rootPath, cb.buildCreateChangeSetCommand(name,file));                                    
                });
            }else{
                path = file.toString();
                path = path.replace("file://", "");
                execShellCMD(vscode.workspace.rootPath, cb.buildCreateChangeSetCommand(name,path));                
            }
        });
    }));
    context.subscriptions.push(vscode.commands.registerCommand('extension.checkUncommitted', function () {
        execShellCMD(vscode.workspace.rootPath,  cb.buildCheckUncommitted());                
    }));
    context.subscriptions.push(vscode.commands.registerCommand('extension.exeSOQL', function (file) {
        var editor = vscode.window.activeTextEditor;
        var selection = editor.selection;
        var selectedText = editor.document.getText(selection);
        execShellCMD(vscode.workspace.rootPath, cb.buildSOQL(selectedText));                        
    }));
    context.subscriptions.push(vscode.commands.registerCommand('extension.exeAnonymous', function (text) {
        var editor = vscode.window.activeTextEditor;
        var selection = editor.selection;
        var selectedText = editor.document.getText(selection);
        execShellCMD(vscode.workspace.rootPath, cb.buildAnonymousApex(selectedText));         
    }));
    context.subscriptions.push(vscode.commands.registerCommand('extension.checkClass', function (file) {
        commandOutput.show();
        var path; 
        if(file == null)
        {
            var options2 = {
                placeHolder: 'Filename',
            };
            vscode.window.showInputBox(options2).then((file) => {
                execShellCMD(vscode.workspace.rootPath, cb.buildCheckClassCommand(file));                                                         
            });
        }else{
            path = file.toString();
            path = path.replace("file://", "");
            execShellCMD(vscode.workspace.rootPath, cb.buildCheckClassCommand(path));                                                         
        }    
    }));
    context.subscriptions.push(vscode.commands.registerCommand('extension.checkClassSpecific', function (file) {
        vscode.window.showQuickPick(getRemotes())
        .then((val) => {
            commandOutput.show();
            var path; 
            if(file == null)
            {
                var options2 = {
                    placeHolder: 'Filename',
                };
                vscode.window.showInputBox(options2).then((file) => {
                    execShellCMD(vscode.workspace.rootPath, cb.buildCheckClassCommand(file,val));                                                         
                });
            }else{
                path = file.toString();
                path = path.replace("file://", "");
                execShellCMD(vscode.workspace.rootPath, cb.buildCheckClassCommand(path,val));                                                             
            }    
        });
    }));
    context.subscriptions.push(vscode.commands.registerCommand('extension.deploy', function (file) {
        var path; 
        if(file == null)
        {
            var options2 = {
                placeHolder: 'Filename',
            };
            vscode.window.showInputBox(options2).then((file) => {
                execShellCMD(vscode.workspace.rootPath, cb.buildDeployCommand(file));
            });
        }else{
            path = file.toString();
            path = path.replace("file://", "");
            execShellCMD(vscode.workspace.rootPath, cb.buildDeployCommand(path));
        }
    }));   
    context.subscriptions.push(vscode.commands.registerCommand('extension.deploySpecific', function (file) {
        vscode.window.showQuickPick(getRemotes())
        .then((val) => {
            commandOutput.show();
            var path; 
            if(file == null)
            {
                var options2 = {
                    placeHolder: 'Filename',
                };
                vscode.window.showInputBox(options2).then((file) => {
                    execShellCMD(vscode.workspace.rootPath, cb.buildDeployCommand(file, val));                                                         
                });
            }else{
                path = file.toString();
                path = path.replace("file://", "");
                execShellCMD(vscode.workspace.rootPath, cb.buildDeployCommand(path, val));                                                              
            }
        });
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