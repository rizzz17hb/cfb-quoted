export async function autoFollowNewsletter(conn) {
    const channelJid = '120363425079251611@newsletter';
    try {
        await new Promise(res => setTimeout(res, 8000));
        await conn.newsletterFollow(channelJid);

    } catch (e) {
    }
}
