// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
var KiteConnect = require("kiteconnect").KiteConnect;
const vscode = require('vscode');

const config = vscode.workspace.getConfiguration('vscode-kite')

var kc = new KiteConnect(config['api_key']);


// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
function activate(context) {

    // Use the console to output diagnostic information (console.log) and errors (console.error)
    // This line of code will only be executed once when your extension is activated
    console.log('Congratulations, your extension "vscode-kite" is now active!');
    console.log("Kite instance:", kc)
    kc.setAccessToken(config['access_token'])
    // The command has been defined in the package.json file
    // Now provide the implementation of the command with  registerCommand
    // The commandId parameter must match the command field in package.json
    let disposable = vscode.commands.registerCommand('extension.initializeKite', function () {
        // The code you place here will be executed every time your command is executed
        for (let s of config['symbols']) {
            kc.quote(config['exchange'], s)
            .then(function(response) {
                console.log(response)
                vscode.window.showInformationMessage(`${s} LTP: ${response.data['last_price']} `);
            }).catch(function(err) {
                console.log(err)
            });
        }
        // Display a message box to the user
    });

    context.subscriptions.push(disposable);
}
exports.activate = activate;

// this method is called when your extension is deactivated
function deactivate() {
}
exports.deactivate = deactivate;