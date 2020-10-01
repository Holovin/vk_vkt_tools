import * as jetpack from 'fs-jetpack';
import got, { Got } from 'got';
import { VkLib } from './vkLib';
import { Config, DConfig } from '../helpers/config';
import { Logger } from 'winston';
import { Log } from '../helpers/logger';
import { LibStatus } from '../helpers/status';

class Tasks {
    private readonly got: Got;
    private config: Config;
    private vkLib: VkLib;
    private log: Logger;

    constructor() {
        this.log = Log.getLogger('tasks');
        this.config = DConfig;

        this.got = got.extend({
            headers: {
              'Accept-Language': 'ru',
              'Connection': 'keep-alive',
              'X-Requested-With': 'XMLHttpRequest',
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0'
            }
        });

        this.vkLib = new VkLib(this.got, {
            token: this.config.get('token'),
            loginUrl: this.config.get('url'),
        });
    }

    public async checkToken() {
        const result = await this.vkLib.getMe();

        if (result !== LibStatus.NO_ERROR) {
            process.exit(1);
        }
    }

    public async saveAllBackgrounds(filePath: string = './out/') {
        const response = await this.vkLib.getBackgrounds();

        this.log.info(`saveAllBackgrounds :: find ${response.length} backgrounds`);

        for (const bg of response) {
            for (const file of bg.links) {
                const stream = await this.got.get(file.url).buffer();
                const path = `${filePath}${bg.name}/${file.fileName}.${file.ext}`;

                jetpack.write(path, stream);

                this.log.info(`Save ${bg.name} to ${path}`);
            }
        }
    }

    public async getWallPostsCountFromDate(groupId: number, minDate: number) {
        // minDate = new Date('09/09/19').getTime()/1000;
        const ids = [];

        let currentItem = 0;
        let maxItems = -1;

        do {
            const data = await this.vkLib.parseWall(groupId, currentItem);

            maxItems = data.count;
            currentItem = data.next_from;

            data.items.forEach(item => {
                if (item.date >= minDate) {
                    ids.push(item.id);
                }
            });

            if (!currentItem) {
                break;
            }

            console.log(currentItem, maxItems);

        } while (currentItem < maxItems);

        this.log.info(ids.length);
    }
}

export { Tasks }
