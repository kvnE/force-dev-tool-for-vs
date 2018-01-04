// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require('vscode');

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
function activate(context) {
    var term = null;
    // Use the console to output diagnostic information (console.log) and errors (console.error)
    // This line of code will only be executed once when your extension is activated
    console.log('Congratulations, your extension "force-dev-tool-for-vs" is now active!');

    // The command has been defined in the package.json file
    // Now provide the implementation of the command with  registerCommand
    // The commandId parameter must match the command field in package.json
    context.subscriptions.push(vscode.commands.registerCommand('extension.sayHello', function () {
        // The code you place here will be executed every time your command is executed
        // Display a message box to the user
        vscode.window.showInformationMessage('Hello World to force!');
    }));
    
    context.subscriptions.push(vscode.commands.registerCommand('extension.login', function () {
        if(term == null){
            term = vscode.window.createTerminal(`Force-dev-tool Terminal`);
        } 
        /*
        vscode.window.showQuickPick(['option 1', 'option 2', 'option 3'])
        .then(val => {
            vscode.window.showInformationMessage('You picked ' + val)
            term.show();
            term.sendText("force-dev-tool login");
        });*/
    }));
    context.subscriptions.push(vscode.commands.registerCommand('extension.fetch', function () {
        if(term == null){
            term = vscode.window.createTerminal(`Force-dev-tool Terminal`);
        } 
        term.show();
        term.sendText("force-dev-tool fetch");
    }));
    context.subscriptions.push(vscode.commands.registerCommand('extension.retrieve', function () {
        if(term == null){
            term = vscode.window.createTerminal(`Force-dev-tool Terminal`);
        } 
        term.show();
        term.sendText("force-dev-tool retrieve");
    }));
    context.subscriptions.push(vscode.commands.registerCommand('extension.packageAll', function () {
        if(term == null){
            term = vscode.window.createTerminal(`Force-dev-tool Terminal`);
        } 
        term.show();
        term.sendText("force-dev-tool package -a");
    }));
    context.subscriptions.push(vscode.commands.registerCommand('extension.check', function () {
        if(term == null){
            term = vscode.window.createTerminal(`Force-dev-tool Terminal`);
        } 
        term.show();
        term.sendText("Checking your changes since the last commit agains your org. ");
        term.sendText("git diff | force-dev-tool changeset create foo2");
        term.sendText("force-dev-tool deploy -d ./config/deployments/foo2 -c");        
        term.sendText("rm -R ./config/deployments/foo2");
    }));
}
exports.activate = activate;

// this method is called when your extension is deactivated
function deactivate() {
}
exports.deactivate = deactivate;