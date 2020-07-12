const nconf = require('nconf');
nconf.argv().env().file({ file: 'config.json' });

const fs = require('fs');
const iconv = require('iconv-lite');
const cheerio = require('cheerio');
const network = require('./axios-helper').initAxios(nconf.get('cookies'), false);

async function getPage(url) {
    return await network.get(url, {
        responseType: 'arraybuffer',
        responseEncoding: 'binary'
    });
}

async function loadPage(data) {
    return cheerio.load(data, { xmlMode: true });
}

async function main(oldResult) {
    let result = '';

    try {
        const { data } = await getPage(nconf.get('url'));
        const html = iconv.decode(data, 'win1251');

        const page = await loadPage(html);
        result = page('textarea').val();

        if (oldResult === result) {
            console.log(`No changes (${new Date().getTime()})`);
            return result;
        }

        const fileName = `./out/${new Date().getTime()}.csv`;

        await fs.promises.writeFile(fileName, result);
        console.log(`File saved: `, fileName);

    } catch (e) {
        console.log(`Error: ${e}`);

        return false;
    }

    return result;
}

async function runner(oldResult) {
    const result = await main(oldResult);

    if (result) {
        setTimeout( async () => {
            await runner(result);
        }, 5 * 60 * 1000)
    }
}

(async () => {
    await runner('');
})();
