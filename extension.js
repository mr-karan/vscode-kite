// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
var KiteConnect = require("kiteconnect").KiteConnect;
const vscode = require('vscode');

const config = vscode.workspace.getConfiguration('vscode-kite')

const kc = new KiteConnect(config['api_key']);
kc.setAccessToken(config['access_token'])


// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
function activate(context) {

    // Use the console to output diagnostic information (console.log) and errors (console.error)
    // This line of code will only be executed once when your extension is activated
    console.log('Congratulations, your extension "vscode-kite" is now active!');
    console.log("Kite instance:", kc)


    // The command has been defined in the package.json file
    // Now provide the implementation of the command with  registerCommand
    // The commandId parameter must match the command field in package.json
    let quote = vscode.commands.registerCommand('extension.getQuote', function (stock) {
        // The code you place here will be executed every time your command is executed
        vscode.window.showInformationMessage(stock);
        for (let s of config['symbols']) {
            kc.quote(config['exchange'], s)
            .then(function(response) {
                console.log(response)
                let open = response.data.ohlc['open']
                let close= response.data.ohlc['close']
                let ltp = response.data['last_price']
                let high = response.data.ohlc['high']
                let low = response.data.ohlc['low']
                // vscode.window.setStatusBarMessage("LOL");
                vscode.window.showInformationMessage(`${s} LTP: ${ltp} Open: ${open} High: ${high} Low: ${low} Close: ${close}`);
            }).catch(function(err) {
                vscode.window.showErrorMessage(err);
            });
        }
        // Display a message box to the user
    });
    let margin = vscode.commands.registerCommand('extension.fetchMargin', function () {
        // vscode.window.setStatusBarMessage("ROFL");
        // The code you place here will be executed every time your command is executed
            kc.margins("equity")
            .then(function(response) {
                console.log("Margin:", response)
                vscode.window.showInformationMessage(`Margin: ${response.data['net']} `);
            }).catch(function(err) {
                vscode.window.showInformationMessage(err);
            });
        
    });
    context.subscriptions.push(margin);
    context.subscriptions.push(quote);

}
exports.activate = activate;

// this method is called when your extension is deactivated
function deactivate() {
}
exports.deactivate = deactivate;