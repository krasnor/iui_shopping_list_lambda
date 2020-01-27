// This sample demonstrates handling intents from an Alexa skill using the Alexa Skills Kit SDK (v2).
// Please visit https://alexa.design/cookbook for additional examples on implementing slots, dialog management,
// session persistence, api calls, and more.
const Alexa = require('ask-sdk-core');
const http = require('http');

//
var globalShoppingList = [];
const REPROMPT = 'Is there anything else i can do for you?';
const HELP_MESSAGE = 'You can add and remove items from your shopping list. You can also ask shopply to suggest items that you might have forgotten to add to your list.';
const LAUNCH_MESSAGE = 'Welcome to shopply. If you want to know what you can do, say help.';

// ### API - Wrapper - HTTP
// const http = require('http');
// localhost:3000/contents  - 'contents': { 'bananen':1, 'Milch':2 }
// localhost:3000/emotion -  'emotion': 'neutral' | 'angry' | 'happy'
const fridgeBaseUrl = 'localhost';
const fridgePort = 5000;

function http_GetStatus() {
    return new Promise(((resolve, reject) => {
        let options = {
            host: fridgeBaseUrl,
            port: fridgePort,
            path: '/',
            method: 'GET',
        };

        //const request = https.request(options, (response) => {
        const request = http.request(options, (response) => {
            response.setEncoding('utf8');
            let returnData = '';

            response.on('data', (chunk) => {
                returnData += chunk;
            });

            response.on('end', () => {
                resolve(JSON.parse(returnData));
            });

            response.on('error', (error) => {
                reject(error);
            });
        });
        request.end();
    }));
}
function http_GetFridgeContents() {
    return new Promise(((resolve, reject) => {
        let options = {
            host: fridgeBaseUrl,
            port: fridgePort,
            path: '/contents',
            method: 'GET',
        };

        //const request = https.request(options, (response) => {
        const request = http.request(options, (response) => {
            response.setEncoding('utf8');
            let returnData = '';

            response.on('data', (chunk) => {
                returnData += chunk;
            });

            response.on('end', () => {
                resolve(JSON.parse(returnData));
            });

            response.on('error', (error) => {
                reject(error);
            });
        });
        request.end();
    }));
}
function http_GetUserEmotion() {
    return new Promise(((resolve, reject) => {
        let options = {
            host: fridgeBaseUrl,
            port: fridgePort,
            path: '/emotion',
            method: 'GET',
        };

        //const request = https.request(options, (response) => {
        const request = http.request(options, (response) => {
            response.setEncoding('utf8');
            let returnData = '';

            response.on('data', (chunk) => {
                returnData += chunk;
            });

            response.on('end', () => {
                resolve(JSON.parse(returnData));
            });

            response.on('error', (error) => {
                reject(error);
            });
        });
        request.end();
    }));
}
// ! this may take some seconds
function http_CalculateUserEmotion() {
    return new Promise(((resolve, reject) => {
        let options = {
            host: fridgeBaseUrl,
            port: fridgePort,
            path: '/calcEmotion',
            method: 'GET',
        };

        //const request = https.request(options, (response) => {
        const request = http.request(options, (response) => {
            response.setEncoding('utf8');
            let returnData = '';

            response.on('data', (chunk) => {
                returnData += chunk;
            });

            response.on('end', () => {
                resolve(JSON.parse(returnData));
            });

            response.on('error', (error) => {
                reject(error);
            });
        });
        request.end();
    }));
}

// ### Handlers
// ## Costum Intents
const AddItemIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AddItemIntent';
    },
    async handle(handlerInput) {
        let speakOutput = ""; //= 'In AddItemIntentHandler!';
        let groceryItem = handlerInput.requestEnvelope.request.intent.slots.item.value;
        //var list = handlerInput.requestEnvelope.request.intent.slots.list.value;
        globalShoppingList.push(groceryItem);
        speakOutput = "I added " + groceryItem + " to your list. ## runnning locally ##" + REPROMPT;
        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(REPROMPT)
            .getResponse();
    }
};
const RemoveItemIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'RemoveItemIntent';
    },
    handle(handlerInput) {
        let speakOutput = 'In RemoveItemIntentHandler!';
        let groceryItem = handlerInput.requestEnvelope.request.intent.slots.item.value;

        for (var i = 0; i < globalShoppingList.length; i++) {
            if(globalShoppingList[i] === groceryItem){
                globalShoppingList.splice(i,1);
            }
        }

        speakOutput = "I removed " + groceryItem + " from your list. " + REPROMPT;

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(REPROMPT)
            .getResponse();
    }
};
const ReadListIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'ReadListIntent';
    },
    handle(handlerInput) {
        var speakOutput = 'In ReadListIntentHandler!';
        speakOutput = "On your list are the following items: ";

        globalShoppingList.forEach(function(entry) {
            speakOutput += entry + ", ";
        });

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(REPROMPT)
            .getResponse();
    }
};
const SuggestItemsIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'SuggestItemsIntent';
    },
    async handle(handlerInput) {
        let speakOutput = 'You might need';
        try{
            //globalShoppingList.push('chocolate');
            let fridge_result = await http_GetFridgeContents();
            let fridgeContents = fridge_result.contents;
            // # im moment noch statisch
            // wenn von einem item weiniger als 1 vorhanden, dann wird Kauf empfohlen
            // Auf jeden Fall enthalten sollten: Milch, Eier, Schokolade

            console.log(JSON.stringify(fridgeContents));
            // könnte man auch noch kürzer schrieben mit for loop und Items in Array
            if(!('Milch' in fridgeContents) || fridgeContents.Milch < 1)
                speakOutput += ', milk';
            if(!('Eier' in fridgeContents) || fridgeContents.Eier < 1)
                speakOutput += ', eggs';
            if(!('Schokolade' in fridgeContents) || fridgeContents.Schokolade < 1)
                speakOutput += ', chocolate';
            if(!('Wein' in fridgeContents) || fridgeContents.Wein < 1)
                speakOutput += ', wine';

        } catch (e){
            speakOutput = 'sorry there was an error with your request';
            console.log(e);
        }

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .getResponse();
    }
};

const SuggestActivityIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'SuggestActivityIntent';
    },
    async handle(handlerInput) {
        let speakOutput = 'You could watch an action movie';

        try {
            // let fridgeContents = await http_GetFridgeContents();
            let emotion = 'Neutral';
            //emotion = await http_GetUserEmotion(); // poll last calculated emotion
            emotion = await http_CalculateUserEmotion(); // diese Variante braucht einige sekunden (Keine Ahnung wie es sich mit Alexa verhält - timeouts etc.?)

            console.log('# suggest activity');
            console.log(JSON.stringify(emotion));
            let emotionBasedOptions = [''];
            switch (emotion.emotion) {
                case 'Angry':
                    let options_angry = [
                        'How abaout a warm bath?',
                        'Shall i play some music for you?', // calming music
                        'You could do some sport'
                    ];
                    emotionBasedOptions = options_angry;
                    break;
                case 'Disgust':
                    let options_disgust = [
                        'You seem to not feel well. How about a cup of stomach tea?', // TODO wording
                    ];
                    emotionBasedOptions = options_disgust;
                    break;
                case 'Fear':
                    let options_fear = [
                        'How about a cup of camomile tea?',
                    ];
                    emotionBasedOptions = options_fear;
                    break;
                case 'Happy':
                    let options_happy = [
                        'You could cook something', // hier was aufwändiges vorschlagen
                        'Hey, I know a cool movie. Wanna watch it?',
                        'You could do the big shopping', // TODO wording
                        'Why dont you invite your friends over',
                    ];
                    emotionBasedOptions = options_happy;
                    break;
                case 'Sad':
                    let options_sad = [
                        'I have the feeling that you could need some Vitamine D. How about you cook some Salmon Salad?',
                        'Shall i play some music for you?', // happy music
                        'You could read a book', // evtl hier ein Buch zum Kauf vorschlagen
                    ];
                    emotionBasedOptions = options_sad;
                    break;
                case 'Surprise':
                    let options_surprised = [
                        'Are you ok? You look upset. Did you break something?',
                    ];
                    emotionBasedOptions = options_surprised;
                    break;
                case 'Neutral':
                default:
                    let options_neutral = [
                        'You could read a book', // evtl hier ein Buch zum Kauf vorschlagen
                        'Shall i play some music for you?', // ranodom
                        'You could do the big shopping', // TODO wording
                    ];
                    emotionBasedOptions = options_neutral;
                    break;
            }
            console.log(JSON.stringify(emotionBasedOptions));
            speakOutput = emotionBasedOptions[Math.floor(Math.random() * emotionBasedOptions.length)];
            console.log(speakOutput);
        } catch(e){
            speakOutput = 'sorry there was an error with your request';
            console.log(e);
        }
        return handlerInput.responseBuilder
            .speak(speakOutput)
            .getResponse();
    }
};

// ## Basic Intents
const LaunchRequestHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'LaunchRequest';
    },
    handle(handlerInput) {
        return handlerInput.responseBuilder
            .speak(LAUNCH_MESSAGE)
            .reprompt(REPROMPT)
            .getResponse();
    }
};
const HelloWorldIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'HelloWorldIntent';
    },
    handle(handlerInput) {
        const speakOutput = 'Hello World!';
        return handlerInput.responseBuilder
            .speak(speakOutput)
            //.reprompt('add a reprompt if you want to keep the session open for the user to respond')
            .getResponse();
    }
};
const HelpIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.HelpIntent';
    },
    handle(handlerInput) {
        return handlerInput.responseBuilder
            .speak(HELP_MESSAGE)
            .reprompt(REPROMPT)
            .getResponse();
    }
};
const CancelAndStopIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && (Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.CancelIntent'
                || Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.StopIntent');
    },
    handle(handlerInput) {
        const speakOutput = 'Goodbye!';
        return handlerInput.responseBuilder
            .speak(speakOutput)
            .getResponse();
    }
};
const SessionEndedRequestHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'SessionEndedRequest';
    },
    handle(handlerInput) {
        // Any cleanup logic goes here.
        return handlerInput.responseBuilder.getResponse();
    }
};

// The intent reflector is used for interaction model testing and debugging.
// It will simply repeat the intent the user said. You can create custom handlers
// for your intents by defining them above, then also adding them to the request
// handler chain below.
const IntentReflectorHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest';
    },
    handle(handlerInput) {
        const intentName = Alexa.getIntentName(handlerInput.requestEnvelope);
        const speakOutput = `You just triggered ${intentName}`;

        return handlerInput.responseBuilder
            .speak(speakOutput)
            //.reprompt('add a reprompt if you want to keep the session open for the user to respond')
            .getResponse();
    }
};

// Generic error handling to capture any syntax or routing errors. If you receive an error
// stating the request handler chain is not found, you have not implemented a handler for
// the intent being invoked or included it in the skill builder below.
const ErrorHandler = {
    canHandle() {
        return true;
    },
    handle(handlerInput, error) {
        console.log(`~~~~ Error handled: ${error.stack}`);
        const speakOutput = `Sorry, I had trouble doing what you asked. Please try again.`;

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};

// The SkillBuilder acts as the entry point for your skill, routing all request and response
// payloads to the handlers above. Make sure any new handlers or interceptors you've
// defined are included below. The order matters - they're processed top to bottom.
exports.handler = Alexa.SkillBuilders.custom()
    .addRequestHandlers(
        LaunchRequestHandler,
        HelloWorldIntentHandler,

        AddItemIntentHandler,
        RemoveItemIntentHandler,
        ReadListIntentHandler,
        SuggestItemsIntentHandler,
        SuggestActivityIntentHandler,

        HelpIntentHandler,
        CancelAndStopIntentHandler,
        SessionEndedRequestHandler,
        IntentReflectorHandler, // make sure IntentReflectorHandler is last so it doesn't override your custom intent handlers
    )
    .addErrorHandlers(
        ErrorHandler,
    )
    .lambda();
