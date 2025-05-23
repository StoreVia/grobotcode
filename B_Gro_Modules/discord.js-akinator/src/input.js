const Discord = require("discord.js");
const buttonMenu = require("./buttonMenu");
const translate = require("./translate");

/**
 * @param {boolean} useButtons If true, use buttons. If false, use text input.
 * @param {Discord.Message | Discord.CommandInteraction} input The Message or Slash Command Sent by the user.
 * @param {Discord.Message} botMessage The message for the bot to send, also the message which will contain the buttons (Max. 8). MUST BE AN EMBED!
 * @param {boolean} isGuessFilter Specifies whether to only show buttons used when Akinator is guessing.
 * @param {any} translations Active translation file.
 * @param {string} language The language of the game.
 * 
 */

module.exports = async function awaitInput(useButtons, input, botMessage, isGuessFilter, translations, language) {
    //check if useButtons is true. If so, use buttons. If not, use text input
    if (useButtons) {
        let yes = { type: 2, label: translations.yes, style: 3, custom_id: "✅", emoji: { name: "✅" } }
        let no = { type: 2, label: translations.no, style: 2, custom_id: "❌", emoji: { name: "❌" } }
        let idk = { type: 2, label: translations.dontKnow, style: 1, custom_id: "🤷", emoji: { name: "🤷" } }
        let back = { type: 2, label: translations.back, style: 2, custom_id: "⏪", emoji: { name: "⏪" } }
        let stop = { type: 2, label: translations.stop, style: 4, custom_id: "🛑", emoji: { name: "🛑" } }

        let answerTypes = [];

        if (isGuessFilter) {
            answerTypes = [yes, no]
        }
        else {
            answerTypes = [yes, no, idk, back, stop]
        }

        let choice = await buttonMenu(input.client, input, botMessage, answerTypes, 60000);
        if (!choice) return null;
        else return choice;
    }
    else {
        let filter;
        if (isGuessFilter) {
            filter = x => {
                return (x.author.id === input.author.id && ([
                    "y",
                    translations.yes.toLowerCase(),
                    "n",
                    translations.no.toLowerCase(),
                ].includes(x.content.toLowerCase())));
            }
        } else {
            filter = x => {
                return (x.author.id === input.author.id && ([
                    "y",
                    translations.yes.toLowerCase(),
                    "n",
                    translations.no.toLowerCase(),
                    "i",
                    "idk",
                    translations.dontKnowNoComma.toLowerCase(),
                    translations.dontKnow.toLowerCase(),
                    "p",
                    translations.probably.toLowerCase(),
                    "pn",
                    translations.probablyNot.toLowerCase(),
                    "b",
                    translations.back.toLowerCase(),
                    "s",
                    translations.stop.toLowerCase(),
                ].includes(x.content.toLowerCase())));
            }
        }
        let response = await input.channel.awaitMessages({
            filter: filter,
            max: 1,
            time: 60000
        })

        if (!response.size) {
            return null
        }
        else {
            await response.first().delete();
            const responseText = String(response.first()).toLowerCase();
            if (["y", "n", "i", "idk", "b", "s"].includes(responseText)) return responseText; //skip translation for these responses
            return await translate(responseText, language);
        }

    }
}
