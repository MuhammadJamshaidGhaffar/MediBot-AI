// const qrcode = require('qrcode-terminal');
// const { Client } = require('whatsapp-web.js');

import qrcode from "qrcode-terminal";
import { Client } from "whatsapp-web.js";
import {getResponse} from "./medibot.js";


const client = new Client();

client.on('qr', qr => {
    qrcode.generate(qr, {small: true});
});

client.on('ready', () => {
    console.log('Client is ready!');
});

// const user_ids = {};

client.on('message', async (message) => {
    if(message.type == "chat"){
        console.log("got message on whatsapp" , message);

        const reply = await getResponse(message.from , message.body);
        message.reply(reply);
    }
});
 
 
client.initialize();
