const { Api, TelegramClient} = require("telegram");
const { StringSession } = require("telegram/sessions");
const TelegramBot = require('node-telegram-bot-api');
require('colors');
const cron = require('node-cron');

const token = process.env.BOT_TOKEN;
const bot = new TelegramBot(token, {polling: true});
const arrayDomens = [
    'dimka',        'yurydud',    'litvintm',
    'durov',       'durov_russia',      'topor',
    'Cbpub',       'koko_by',      'onlinerby',
    'yandex',       'devby',      'mudak',
    'kotya',       'pikabu',      'Reddit',
    'apple',       'muztv',      'stickroom',
    'igmtv',       'kinopoisk'
]

const client = new TelegramClient(process.env.SESSION, process.env.API_ID, process.env.API_HASH, {});
const client1 = new TelegramClient(process.env.SESSION1, process.env.API_ID, process.env.API_HASH, {});
const client2 = new TelegramClient(process.env.SESSION2, process.env.API_ID, process.env.API_HASH, {});
const client3 = new TelegramClient(process.env.SESSION3, process.env.API_ID, process.env.API_HASH, {});

const clientsArr = [client, client1, client2, client3];

bot.onText(/\/start/, (msg) => {
    let replyOptions = {
		reply_markup: {
            keyboard : [
                [{ text : "Домены, которые проверяются" }]
            ],
			resize_keyboard: true,
			one_time_keyboard: true,
		},
	};
    bot.sendMessage(msg.chat.id, 'Отправь мне домены', replyOptions);
});

bot.on("message", async (msg) => {
    if(msg.text == "Домены, которые проверяются")
    {
        let result_message = "";
        arrayDomens.length != 0 ? arrayDomens.map((el) => {
            result_message += `${el}\n`
        }) : result_message += "Пока что нет доменов, которые проверяются"

        bot.sendMessage(msg.chat.id, result_message)
    }
    else{
        chatID = msg.chat.id;
        const reg = /^[a-z0-9_]+$/i;
        const regFirstSymbol = /^[0-9_]+$/i;
        if(msg.text.length < 5){
            bot.sendMessage(msg.chat.id, "Ошибка! Минимальная длина Username составляет 5 символов!")
        }else if(msg.text.length > 32){
            bot.sendMessage(msg.chat.id, "Ошибка! Максимальная длина Username составляет 32 символа!")
        }
        else if(regFirstSymbol.test(msg.text[0]) == true){
            bot.sendMessage(msg.chat.id, `Ошибка! Username не может начинаться с цифры или знака "_"`)
        }
        else if(reg.test(msg.text) == false){
            bot.sendMessage(msg.chat.id, `Ошибка! Username содержит недопустимые символы!\nМожно использовать символы a-z, 0-9 и "_"`)
        }
        else{
            arrayDomens.push(msg.text);
        }
    }
})

const sleep = (waitTimeInMs) => new Promise(resolve => setTimeout(resolve, waitTimeInMs))

const setDomainToUser = async () => {
    await client.connect();
    await client1.connect();
    await client2.connect();
    await client3.connect();

    for(let i of arrayDomens){
        await sleep(2500).then(async() => {
            var cl = Math.floor(Math.random() * clientsArr.length);
            console.log(cl);
            try{
                const checkUsername = await client.invoke(
                    new Api.account.CheckUsername({
                        username: i,
                    })
                )
                if(checkUsername == true){
                    await sleep(2000).then(async() => {
                        try{
                            const result = await client.invoke(
                                new Api.account.UpdateUsername({
                                username: i,
                                })
                            );
                            arrayDomens.map((el, index) => {
                                if(el == i){
                                    arrayDomens.slice(index, 1)
                                }
                            })
                            bot.sendMessage(5573054825, `Username изменен на ${i}` )
                        }
                        catch(e){
                            console.error(e);
                        }   
                    })
                }
            }
            catch(e){
                console.error(e)
            }
        })
    }
}

cron.schedule('0 * * * * *', () => {
    setDomainToUser();
})