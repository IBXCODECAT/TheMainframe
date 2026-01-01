const { handleCount } = require('../modules/countingEngine');

module.exports = {
  name: 'messageCreate',
    execute(message) {
        // Filter out bots and system messages
        if (message.author.bot || message.system) return;

        // Identify the Counting Channel (Replace with your actual ID)
        const COUNTING_CHANNEL_ID = '905539660162433104';

        if (message.channel.id === COUNTING_CHANNEL_ID) {
            handleCount(message);
        }
    },
}
