// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
var KiteConnect = require("kiteconnect").KiteConnect;
const vscode = require('vscode');
const config = vscode.workspace.getConfiguration('vscode-kite')
var kc = new KiteConnect(config['api_key']);
const KiteTicker = require("kiteconnect").KiteTicker;

function fetchMargin() {
    kc.margins("equity")
    .then(function(response) {
        vscode.window.showInformationMessage(`Margin: ${response.data['net']} `);
    }).catch(function(err) {
        // Something went wrong.
        vscode.window.showErrorMessage(err.message)
    });
}
function setTick(ticks) {
    let ltp_s = `Ticks : ${ticks[0]['LastTradedPrice']}`;
    console.log(ltp_s);
    console.log(ticks)
}

function subscribe() {
    let items = config['live_stocks'];
    console.log(items)
	ticker.subscribe(items);
	ticker.setMode(ticker.modeLTP, items);
}

function activate(context) {
    let login = vscode.commands.registerCommand('extension.initializeKite', function () {
        console.log("Request is: ", config['request_token'])
        console.log("Secret is: ", config['api_secret'])
        console.log("API Key: ", config['api_key'])
        kc.requestAccessToken(config['request_token'], config['api_secret'])
        .then(function(response) {
            vscode.window.showInformationMessage("Logged In");
            // let ticker = new KiteTicker(config['api_key'], response['user_id'], response['public_token']);

        })
        .catch(function(err) {
            console.log("something is wrong", err)
            vscode.window.showErrorMessage(err.message);
        })
    
    });

    let quote = vscode.commands.registerCommand('extension.getQuote', function (stock) {
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
                vscode.window.showInformationMessage(`${s} LTP: ${ltp} Open: ${open} High: ${high} Low: ${low} Close: ${close}`);
            }).catch(function(err) {
                vscode.window.showErrorMessage(err.message);
            });
        }
    });
    let stream = vscode.commands.registerCommand('extension.streamData', function () {
        ticker.connect();
        ticker.on("tick", setTick);
        ticker.on("connect", subscribe);
    });

    let margin = vscode.commands.registerCommand('extension.fetchMargin', function () {
        fetchMargin()
        
    });
    context.subscriptions.push(margin);
    context.subscriptions.push(login);
    context.subscriptions.push(quote);
    context.subscriptions.push(stream);

}
exports.activate = activate;

function deactivate() {
}
exports.deactivate = deactivate;