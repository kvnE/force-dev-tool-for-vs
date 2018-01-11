// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
var fs = require('fs');
const vscode = require('vscode');
var spawnCMD = require('spawn-command');
var treeKill = require('tree-kill');
var cb = require('./bin/CommandBuilder');
var sh = require('./bin/shell');
var helper = require('./bin/helper');
var process = null;
var commandOutput = null;

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
    console.log('Congratulations, your extension "force-dev-tool-for-vs" is now active!');    
    commandOutput = vscode.window.createOutputChannel('force-dev-tool');
    
    context.subscriptions.push(vscode.commands.registerCommand('extension.login', function () {
        sh.execShellCMD(vscode.workspace.rootPath, cb.buildLogin());
    }));
    context.subscriptions.push(vscode.commands.registerCommand('extension.loginSpecific', function () {
        vscode.window.showQuickPick(getRemotes())
        .then((val) => {
            sh.execShellCMD(vscode.workspace.rootPath, cb.buildLogin(val));
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
                                        sh.execShellCMD(vscode.workspace.rootPath, cb.buildAddRemote(name,username,password,url));
                                    });
                            });
                    });
            });
    }));
    context.subscriptions.push(vscode.commands.registerCommand('extension.changeDefaultRemote', function () {
        vscode.window.showQuickPick(getRemotes())
        .then((val) => {
            sh.execShellCMD(vscode.workspace.rootPath, cb.buildChangeDefaultRemote(val));
        });
    }));
    context.subscriptions.push(vscode.commands.registerCommand('extension.fetch', function () {
        sh.execShellCMD(vscode.workspace.rootPath, cb.buildFetch());        
    }));
    context.subscriptions.push(vscode.commands.registerCommand('extension.fetchSpecific', function () {
        vscode.window.showQuickPick(getRemotes())
        .then((val) => {
            sh.execShellCMD(vscode.workspace.rootPath, cb.buildFetch(val));
        });       
    }));
    context.subscriptions.push(vscode.commands.registerCommand('extension.retrieve', function () {
        sh.execShellCMD(vscode.workspace.rootPath, cb.buildRetrieve());                
    }));
    context.subscriptions.push(vscode.commands.registerCommand('extension.retrieveSpecific', function () {
        vscode.window.showQuickPick(getRemotes())
        .then((val) => {
            sh.execShellCMD(vscode.workspace.rootPath, cb.buildRetrieve(val));
        });       
    }));
    context.subscriptions.push(vscode.commands.registerCommand('extension.test', function () {
        sh.execShellCMD(vscode.workspace.rootPath, cb.buildTestAll());                
    }));
    context.subscriptions.push(vscode.commands.registerCommand('extension.testSpecific', function () {
        vscode.window.showQuickPick(getRemotes())
        .then((val) => {
            sh.execShellCMD(vscode.workspace.rootPath, cb.buildTestAll(val));
        });     
    }));
    context.subscriptions.push(vscode.commands.registerCommand('extension.testClass', function (file) {
        commandOutput.show();
        var path; 
        if(file == null)
        {
            var currentFile = vscode.window.activeTextEditor.document.uri.toString();
            currentFile = currentFile.replace("file://", "");
            var options2 = {
                placeHolder: 'Filename',
                value : currentFile
            };
            vscode.window.showInputBox(options2).then((file) => {
                sh.execShellCMD(vscode.workspace.rootPath, cb.buildTestClass(file));                
            });
        }else{
            path = file.toString();
            path = path.replace("file://", "");
            sh.execShellCMD(vscode.workspace.rootPath, cb.buildTestClass(path));                     
        }
    }));
    context.subscriptions.push(vscode.commands.registerCommand('extension.testClassSpecific', function (file) {
        commandOutput.show();
        var path; 
        vscode.window.showQuickPick(getRemotes())
        .then((val) => {
            if(file == null)
            {
                var currentFile = vscode.window.activeTextEditor.document.uri.toString();
                currentFile = currentFile.replace("file://", "");
                var options2 = {
                    placeHolder: 'Filename',
                    value : currentFile
                };
                vscode.window.showInputBox(options2).then((file) => {
                    sh.execShellCMD(vscode.workspace.rootPath, cb.buildTestClass(file, val));                     
                });
            }else{
                path = file.toString();
                path = path.replace("file://", "");
                sh.execShellCMD(vscode.workspace.rootPath, cb.buildTestClass(path, val));               
            }
        }); 
    }));
    context.subscriptions.push(vscode.commands.registerCommand('extension.packageAll', function () {
        sh.execShellCMD(vscode.workspace.rootPath, cb.buildPackageAll());                
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
                    sh.execShellCMD(vscode.workspace.rootPath, cb.buildCreateDesChangeSet(name,file));                                    
                });
            }else{
                path = file.toString();
                path = path.replace("file://", "");
                sh.execShellCMD(vscode.workspace.rootPath, cb.buildCreateDesChangeSet(name,path));                              
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
                    sh.execShellCMD(vscode.workspace.rootPath, cb.buildCreateChangeSet(name,file));                                    
                });
            }else{
                path = file.toString();
                path = path.replace("file://", "");
                sh.execShellCMD(vscode.workspace.rootPath, cb.buildCreateChangeSet(name,path));                
            }
        });
    }));
    context.subscriptions.push(vscode.commands.registerCommand('extension.checkUncommitted', function () {
        sh.execShellCMD(vscode.workspace.rootPath,  cb.buildCheckUncommitted());                
    }));
    context.subscriptions.push(vscode.commands.registerCommand('extension.exeSOQL', function (file) {
        var editor = vscode.window.activeTextEditor;
        var selection = editor.selection;
        var selectedText = editor.document.getText(selection);
        sh.execShellCMD(vscode.workspace.rootPath, cb.buildSOQL(selectedText));                        
    }));
    context.subscriptions.push(vscode.commands.registerCommand('extension.exeAnonymous', function (text) {
        var editor = vscode.window.activeTextEditor;
        var selection = editor.selection;
        var selectedText = editor.document.getText(selection);
        sh.execShellCMD(vscode.workspace.rootPath, cb.buildAnonymousApex(selectedText));         
    }));
    context.subscriptions.push(vscode.commands.registerCommand('extension.checkClass', function (file) {
        commandOutput.show();
        var path; 
        if(file == null)
        {
            var currentFile = vscode.window.activeTextEditor.document.uri.toString();
            currentFile = currentFile.replace("file://", "");
            var options2 = {
                placeHolder: 'Filename',
                value : currentFile
            };
            vscode.window.showInputBox(options2).then((file) => {
                sh.execShellCMD(vscode.workspace.rootPath, cb.buildCheckClass(file));                                                         
            });
        }else{
            path = file.toString();
            path = path.replace("file://", "");
            sh.execShellCMD(vscode.workspace.rootPath, cb.buildCheckClass(path));                                                         
        }    
    }));
    context.subscriptions.push(vscode.commands.registerCommand('extension.checkClassSpecific', function (file) {
        vscode.window.showQuickPick(getRemotes())
        .then((val) => {
            commandOutput.show();
            var path; 
            if(file == null)
            {
                var currentFile = vscode.window.activeTextEditor.document.uri.toString();
                currentFile = currentFile.replace("file://", "");
                var options2 = {
                    placeHolder: 'Filename',
                    value : currentFile
                };
                vscode.window.showInputBox(options2).then((file) => {
                    sh.execShellCMD(vscode.workspace.rootPath, cb.buildCheckClass(file,val));                                                         
                });
            }else{
                path = file.toString();
                path = path.replace("file://", "");
                sh.execShellCMD(vscode.workspace.rootPath, cb.buildCheckClass(path,val));                                                             
            }    
        });
    }));
    context.subscriptions.push(vscode.commands.registerCommand('extension.deploy', function (file) {
        var path; 
        if(file == null)
        {
            var currentFile = vscode.window.activeTextEditor.document.uri.toString();
            currentFile = currentFile.replace("file://", "");
            var options2 = {
                placeHolder: 'Filename',
                value : currentFile
            };
            vscode.window.showInputBox(options2).then((file) => {
                sh.execShellCMD(vscode.workspace.rootPath, cb.buildDeploy(file));
            });
        }else{
            path = file.toString();
            path = path.replace("file://", "");
            sh.execShellCMD(vscode.workspace.rootPath, cb.buildDeploy(path));
        }
    }));   
    context.subscriptions.push(vscode.commands.registerCommand('extension.deploySpecific', function (file) {
        vscode.window.showQuickPick(getRemotes())
        .then((val) => {
            var path; 
            if(file == null)
            {
                var currentFile = vscode.window.activeTextEditor.document.uri.toString();
                currentFile = currentFile.replace("file://", "");
                var options2 = {
                    placeHolder: 'Filename',
                    value : currentFile
                };
                vscode.window.showInputBox(options2).then((file) => {
                    sh.execShellCMD(vscode.workspace.rootPath, cb.buildDeploy(file, val));                                                         
                });
            }else{
                path = file.toString();
                path = path.replace("file://", "");
                sh.execShellCMD(vscode.workspace.rootPath, cb.buildDeploy(path, val));                                                              
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