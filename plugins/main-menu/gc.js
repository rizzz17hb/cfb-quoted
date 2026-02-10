import fs from 'fs';
import path from 'path';
import { generateWAMessageFromContent, prepareWAMessageMedia } from '@whiskeysockets/baileys';
global.fake = fs.readFileSync(
    path.join(process.cwd(), 'assets', 'fake.jpg')
);

export default {
    name: 'gcbot',
    alias: ['grupchat', 'gcscript'],
    category: 'main',
    hidden: true,
    exec: async ({ conn, m, command }) => {

        await m.react('⏱️');

        const fake = {
            key: {
                fromMe: false,
                participant: '0@s.whatsapp.net',
                remoteJid: 'status@broadcast'
            },
            message: { conversation: command }
        };

        const fail = {
            key: {
                fromMe: false,
                participant: '0@s.whatsapp.net',
                remoteJid: 'status@broadcast'
            },
            message: { conversation: '❌failed' }
        };

        try {

            const caption = `👥 *GROUP COMMUNITY*\n\nTempat kumpul user untuk diskusi & update:`;

            const media = await prepareWAMessageMedia(
                { image: global.fake },
                { upload: conn.waUploadToServer }
            );

            const interactiveMessage = {
                header: {
                    hasMediaAttachment: true,
                    imageMessage: media.imageMessage
                },
                body: { text: caption },
                footer: { text: global.footer },
                nativeFlowMessage: {
                    buttons: [
                        {
                            name: 'cta_url',
                            buttonParamsJson: JSON.stringify({
                                display_text: ' Gᖇᑌᑭ ',
                                url: 'https://chat.whatsapp.com/Ez8TnTrtLWR6T39oZhpg0b'
                            })
                        }
                    ]
                }
            };

            const msg = generateWAMessageFromContent(
                m.chat,
                { viewOnceMessage: { message: { interactiveMessage } } },
                { quoted: fake }
            );

            await conn.relayMessage(m.chat, msg.message, {
                messageId: msg.key.id
            });

            await m.react('✅');

        } catch (e) {
            console.error(e);
            await m.react('❌');
            return conn.sendMessage(
                m.chat,
                {
                    image: { url: global.fake },
                    caption: `❏ K E S A L A H A N  S Y S T E M ❏\nAlasan:\n❌ ${e.message}`
                },
                { quoted: fail }
            );
        }
    }
};
