const fs = require('fs'), // File System to handle file operations
    _ = require('lodash'), // Lodash Library
    msToMS = (millis) => `${Math.floor(millis / 60000)} minutes ${((millis % 60000) / 1000).toFixed(0)} seconds`, // Function to Convert Milleseconds to Minutes and Seconds
    countOcurrences = (str, value) => (str.match(new RegExp(value, "gi")) || []).length, // Find String Ocurrences Count
    replaceAll = (str, find, replace) => str.replace(new RegExp(find, 'g'), replace), // Replace String with All Ocurrence 
    delay = ms => new Promise(resolve => setTimeout(resolve, ms)); // Dealy function to sleep

let start = new Date(),
    hrstart = process.hrtime();

(async function () {
    try {
        for (let file of [
            './frequency.csv',
            './t8.shakespeare.translated.txt',
            './performance.txt'
        ]) if (fs.existsSync(file)) fs.unlinkSync(file)

        fs.appendFileSync('./frequency.csv', `English word,French word,Frequency\n`);

        let findWords = fs.readFileSync('find_words.txt', 'utf8').toString().split('\n'),
            frenchDictionary = fs.readFileSync('french_dictionary.csv', 'utf8').toString().split('\n'),
            replaceWords = {},
            translateTxt = fs.readFileSync('t8.shakespeare.txt', 'utf8').toString();
        for (let word of frenchDictionary) {
            if (!_.isEmpty(word)) {
                let words = word.split(',');
                replaceWords[_.get(words, '0')] = _.get(words, '1');
            }
        }

        for (let word of findWords) {
            if (!_.isEmpty(word)) {
                let replaceWord = _.get(replaceWords, word, word);
                fs.appendFileSync('./frequency.csv', `${word},${replaceWord},${countOcurrences(translateTxt, word)}\n`);
                translateTxt = replaceAll(translateTxt, word, replaceWord);
            }
        }
        fs.appendFileSync('./t8.shakespeare.translated.txt', translateTxt);

        let end = new Date() - start,
            used = Math.round((process.memoryUsage().heapUsed / 1024 / 1024) * 100) / 100;

        fs.appendFileSync('./performance.txt', `Time to process: ${msToMS(end)}\n`);
        fs.appendFileSync('./performance.txt', `Memory used: ${used} MB\n`);
    } catch (e) {
        console.error(e);
    }
})();