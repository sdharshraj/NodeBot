var builder = require('botbuilder');
var https = require('https');
var querystring = require('querystring');
var prompts = require('./prompts.js');
const request = require('request');
var url = require('url');
var validUrl = require('valid-url');

var model = process.env.LUIS_MODEL;
var recognizer = new builder.LuisRecognizer(model)
var dialog = new builder.IntentDialog({
    recognizers: [recognizer]
});
var olayData = require('./OlayProduct.json');
var pid = "";

module.exports = dialog
    .matches('Greet', [greet])
    .matches('Product', [
        ProductTypeSelection,
        MoisturiserType,
        SpfType
    ])
    .matches('LocateStore', [
        function (session, args, next) {
            pid = session.message.text;
            builder.Prompts.text(session, 'Please provide your Zip code.');
        },
        function (session, results) {
            var zipCode = results.response.match(/[0-9]{6}/);
            if (zipCode) {
                if (pid.match(/pid/)) {
                    var message = " ";
                    var index = 0;
                    var cards = olayData.Products.map(function (Products) {
                        if (Products.ProductId == pid && Products.Pin == zipCode) {
                            console.log(Products.ProductId + " " + Products.Pin)
                            index++;
                            return message += index + ". " + Products.Location + "  ||  Quntity: " + Products.Quantity + " \n ";
                        }
                    });
                    if (index > 0) {
                        session.send(message);
                    } else {
                        session.send("Sorry.. there is no shop for the particular product in your location.")
                    }
                } else {
                    var message = " ";
                    var index = 0;
                    var cards = olayData.Products.map(function (Products) {
                        if (Products.Pin == zipCode) {
                            index++;
                            return message += index + ". " + Products.Location + "  ||  Quntity: " + Products.Quantity + " \n ";
                        }
                    });
                    if (index > 0) {
                        session.send(message);
                    } else {
                        session.send("Sorry.. there is no Olay shop near your location.");
                    }
                }
            } else {
                session.send('invalid Pin code. Please enter 6 digit Pin code.');
            }
        }
    ])
    .onDefault([NotUnderstood]);

function NotUnderstood(session, args) {
    session.send("Sorry i could not understand.");
}

function greet(session, args, next) {

    var msg1 = new builder.Message(session)
        .attachments([{
            contentType: "image/jpeg",
            contentUrl: "http://www.alexandrahancock.co.uk/img/olay-regen-small.jpg"
        }]);

    var msg2 = new builder.Message(session)
        .attachments([{
            contentType: "video/mp4",
            contentUrl: "http://techslides.com/demos/sample-videos/small.mp4",
            Name: "Sample Video"
        }]);
    var msg3 = new builder.Message(session)
        .attachments([{
            contentType: "audio",
            contentUrl: "https://ia802508.us.archive.org/5/items/testmp3testfile/mpthreetest.mp3",
            Name: "Sample Audio"
        }]);

    // session.send(prompts.userWelcomeMessage);
    // session.send(msg1);
    // session.send(msg2);
    // session.send(msg3);
    // session.send("end message");
    session.send(prompts.userWelcomeMessage);
}

function createCard(session, items) {
    var card = new builder.HeroCard(session);
    card.title(items.Type);
    card.subtitle(items.Name);
    card.images([builder.CardImage.create(session, items.ImagePath)]);
    card.tap(new builder.CardAction.openUrl(session, items.URL));
    card.buttons([new builder.CardAction.openUrl(session, items.URL, '  Buy it Online  '), new builder.CardAction.imBack(session, items.ProductId, '  Buy it offline  '), new builder.CardAction.openUrl(session, items.URL, '  See more details  ')]);

    return card;
}

function MoisturiserType(session, args, next) {
    if (args.response) {
        if (args.response.entity == 'Day Moisturiser' || args.response.entity == 'Night Moisturiser') {
            session.dialogData.property = null;
            var cards = olayData.Products.map(function (Products) {
                if (Products.Type == args.response.entity)
                    return createCard(session, Products)
            });
            var message = new builder.Message(session).attachments(cards).attachmentLayout('carousel');
        } else if (args.response.entity == 'Sun Protection') {
            builder.Prompts.choice(session, 'What spf value cream you want?', sunProtectionTypes);
        } else {
            session.endDialog('Sorry..some error occured.');
        }
        session.send(message);
    } else {
        session.endDialog('Sorry i did not understand.');
    }
}

function ProductTypeSelection(session, args, next) {
    var applyType = builder.EntityRecognizer.findEntity(args.entities, 'ApplyType') || builder.EntityRecognizer.findEntity(args.entities, 'SPF');
    if (applyType) {
        if (applyType.entity == 'sun' || applyType.entity == 'SPF' || applyType.entity == 'spf') {
            applyType.entity = 'Sun Protection';
            next({
                response: applyType
            })
        } else if (applyType.entity == 'day' || applyType.entity == 'Day' || applyType.entity == 'daytime') {
            applyType.entity = 'Day Moisturiser';
            next({
                response: applyType
            })
        } else if (applyType.entity == 'night' || applyType.entity == 'NIGHT' || applyType.entity == 'nighttime') {
            applyType.entity = 'Night Moisturiser';
            next({
                response: applyType
            })
        } else {
            builder.Prompts.choice(session, 'Sorry i did not understand your requirement.Please choose among the options.', productTypes);
        }
    } else {
        builder.Prompts.choice(session, 'Which type of product do you want?', productTypes);
    }
}

function SpfType(session, args, next) {
    if (args.response.entity == 'Above spf 15') {
        session.dialogData.property = null;
        var cards = olayData.Products.map(function (Products) {
            if (Products.SPFValue > 15 && Products.Type == "Sun Protection")
                return createCard(session, Products)
        });
        var message = new builder.Message(session).attachments(cards).attachmentLayout('carousel');
    } else if (args.response.entity == 'Spf 15 or below') {
        session.dialogData.property = null;
        var cards = olayData.Products.map(function (Products) {
            if (Products.SPFValue <= 15 && Products.Type == "Sun Protection")
                return createCard(session, Products)
        });
        var message = new builder.Message(session).attachments(cards).attachmentLayout('carousel');
    }
    session.send(message);
}

var productTypes = [
    'Day Moisturiser',
    'Night Moisturiser',
    'Sun Protection'
]

var sunProtectionTypes = [
    'Above spf 15',
    'Spf 15 or below'
]