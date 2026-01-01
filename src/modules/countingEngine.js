const { PermissionFlagsBits } = require('discord.js');
const db = require('../db');
const { evaluate } = require('mathjs');

const { permissionGuard } = require('../utils/permissionGuard');

// Ensure counting state exists in db on startup
db.init('counting', { current: 0, newestPlayer: null, record: 0});

function handleCount(message) {

    if(!permissionGuard(message, PermissionFlagsBits.SendMessages | PermissionFlagsBits.AddReactions | PermissionFlagsBits.EmbedLinks )) return;

    const countingState = db.get('counting');

    let resultt;
    try {
        result = evaluate(message.content);
    } catch (err) {
        return message.channel.send(`⚠️ **[INPUT REJECTED]** Only math/numbers allowed.`);
    }

    const expected = countingState.current + 1;

    // Double-Tap Check
    if (message.author.id === countingState.newestPlayer) {
        return message.channel.send(`🚫 **[NEURAL OVERLOAD]** ${message.author}, consecutive nodes detected.`)
    }

    // --- FAILURE LOGIC ---
    if (result !== expected) {
        // 1. Immediate Reaction (The Explosion)
        message.react('💥').catch(() => {});

        const reached = countingState.current;
        countingState.current = 0;
        countingState.newestPlayer = null;

        // 2. Public Accountability
        message.channel.send({
            embeds: [{
                title: "❌ [SEQUENCE TERMINATED]",
                description: `<@${message.author.id}> has compromised the data stream at **${result}**.`,
                fields: [
                    { name: "Final Depth", value: `${reached}`, inline: true },
                    { name: "Global Record", value: `${countingState.record}`, inline: true }
                ],
                color: 0xff0000,
                footer: { text: "The count has been reset to 0 by order of The Mainframe." }
            }]
        });
    } else {
        // --- SUCCESS LOGIC ---
        countingState.current = expected;
        countingState.newestPlayer = message.author.id;

        const isNewRecord = expected > countingState.record;

        if (isNewRecord) {
            message.react('✅').catch(() => {}); 
            if (expected === countingState.record + 1) {
                message.channel.send({
                    embeds: [{
                        title: "🏆 [NEW WORLD RECORD]",
                        description: `The Mainframe has surpassed the previous limit! Current depth: **${expected}**`,
                        color: 0x00ff00
                    }]
                });
            }
            countingState.record = expected;
        } else {
            message.react('☑️').catch(() => {}); 
        }

        if (expected === 100) message.react('💯').catch(() => {});
    }

    db.set('counting', countingState);
}

module.exports = { handleCount };
