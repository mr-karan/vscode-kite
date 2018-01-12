const vscode = require('vscode');
const KiteTicker = require("kiteconnect").KiteTicker;
const KiteConnect = require("kiteconnect").KiteConnect;
let config = vscode.workspace.getConfiguration('vscode-kite');
let kc = new KiteConnect(config['api_key']);
let store = require('store')


function refresh(){
    config = vscode.workspace.getConfiguration('vscode-kite')
}

function fetchMargin() {
    kc.margins("equity")
    .then(function(response) {
        vscode.window.showInformationMessage(`Margin: ${response.data['net']} `);
    }).catch(function(err) {
        vscode.window.showErrorMessage(err.message)
    });
}

function fetchQuote(tradingSymbol) {
    kc.quote(config['exchange'], tradingSymbol)
    .then(function(response) {
        let open = response.data.ohlc['open']
        let close= response.data.ohlc['close']
        let ltp = response.data['last_price']
        let high = response.data.ohlc['high']
        let low = response.data.ohlc['low']
        vscode.window.showInformationMessage(`${tradingSymbol} LTP: ${ltp} Open: ${open} High: ${high} Low: ${low} Close: ${close}`);
    }).catch(function(err) {
        vscode.window.showErrorMessage(err.message);
    });
}

function streamStock() {
    user_data = store.get('user_data')
    let ticker = new KiteTicker(config['api_key'], user_data['user_id'], user_data['public_token']);
    ticker.connect();
    ticker.on("tick", setTick);
    ticker.on("connect", subscribe);

    function setTick(ticks) {
        for (let tick of ticks) {
            let status = vscode.window.createStatusBarItem(1,100)
            status.text = `${tick['Token']} : LTP ${tick['LastTradedPrice']}`
            status.show()
            console.log("Ticks", ticks);
        }
    }

    function subscribe() {
        let items = config['live_stocks'];
        ticker.subscribe(items);
        ticker.setMode(ticker.modeFull, items);
    }

}

function activate(context) {
    let login = vscode.commands.registerCommand('extension.initializeKite', function () {
        kc.requestAccessToken(config['request_token'], config['api_secret'])
        .then(function(response) {
            console.log(response)
            vscode.window.showInformationMessage("Logged In");
            store.set('user_data', {public_token:response.data['public_token'], user_data:response.data['user_id']});
        })
        .catch(function(err) {
            vscode.window.showErrorMessage(err.message);
        })
    });

    let quote = vscode.commands.registerCommand('extension.getQuote', function (stock) {
        vscode.window.showInformationMessage(stock);
        for (let tradingSymbol of config['symbols']) {
            fetchQuote(tradingSymbol)        
        }
    });

    let stream = vscode.commands.registerCommand('extension.streamData', function (stock) {
        streamStock()
    });


    let margin = vscode.commands.registerCommand('extension.fetchMargin', function () {
        fetchMargin()
    });

    context.subscriptions.push(margin);
    context.subscriptions.push(login);
    context.subscriptions.push(stream);
    context.subscriptions.push(quote);
    context.subscriptions.push(vscode.workspace.onDidChangeConfiguration(refresh))

}
exports.activate = activate;

function deactivate() {
}
exports.deactivate = deactivate;