const axios = require('axios');

function initAxios(cookies) {
    return axios.create({
        timeout: 10000,
        headers: {
            'Accept-Charset': 'utf-8',
            'Accept-Language': 'ru-RU,ru;q=0.9,ru;q=0.8',
            'Accept-Encoding': 'gzip, deflate, br',
            'Connection': 'keep-alive',
            'Cookie': cookies,
            'X-Requested-With': 'XMLHttpRequest',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0'
        },
    });
}

module.exports = {
    initAxios,
};
