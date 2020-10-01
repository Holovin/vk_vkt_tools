import nconf from 'nconf';
const config = nconf.env().file({ file: 'config.json' });


class Config {
    constructor() {
        //
    }

    public get(key) {
        return config.get(key);
    }
}

const DConfig = new Config();
export { DConfig, Config };
