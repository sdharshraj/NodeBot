var builder = require('botbuilder');
var restify = require('restify');
var Botmetrics = require('botmetrics');
var dialog = require('./dialog');
var prompts = require('./prompts');

module.exports = {
    start: function () {
        var server = restify.createServer();
        server.listen(process.env.port || process.env.PORT || 3978, function () {
            console.log('listening on ' + process.env.PORT);
        });

         // Initialize the middleware 
        var BotmetricsMiddleware = require('botmetrics-botframework-middleware').BotmetricsMiddleware({
        botId: process.env.BOTMETRICS_BOT_ID,
        apiKey: process.env.BOTMETRICS_API_KEY
        });
        
        var connector = new builder.ChatConnector({
            appId: process.env.MICROSOFT_APP_ID,
            appPassword: process.env.MICROSOFT_APP_PASSWORD
        });
        
        var bot = new builder.UniversalBot(connector);
        
        
        // Use the middleware 
        bot.use(
        {
            receive: BotmetricsMiddleware.receive,
            send: BotmetricsMiddleware.send
        }
        );
        
        server.use(restify.queryParser());

        server.post('/api/messages', connector.listen());

        bot.dialog('/', dialog);

    }
}