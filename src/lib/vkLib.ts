import { Log } from '../helpers/logger';
import { Logger } from 'winston';
import { LibStatus } from '../helpers/status';
import { Got } from 'got';

class VkLib {
    private static readonly VK_API_VERSION = '5.131';

    private readonly tokenVk: string;
    private readonly loginUrl: string;

    private got: Got;
    private log: Logger;
    private user;
    private isLogged: boolean;


    public getIsLogged() {
        return this.isLogged;
    }

    public getUser() {
        return this.user;
    }

    constructor(got, { token, loginUrl }) {
        this.log = Log.getLogger('vk');

        this.tokenVk = token;
        this.loginUrl = loginUrl;

        if (!this.tokenVk || !this.loginUrl) {
            this.log.error(`No token or login url`);
        }

        this.got = got
    }

    public async parseWall(groupId, offset, count = 100): Promise<any> {
        const result = await this.apiVkCall('wall.get', {
            owner_id: groupId,
            offset,
            count,
        });

        if (result === LibStatus.ERR_VK_REQUEST_FAILED) {
            return null;
        }

        const data = result.response;

        return data;
    }

    public async getMe() {
        const result: any = await this.apiVkCall('account.getProfileInfo', {}, true);

        if (!result.response.id) {
            return LibStatus.ERR_VK_NO_AUTH;
        }

        this.user = {
            id: result.response.id,
            firstName: result.response.first_name,
            lastName: result.response.last_name,
        };

        this.log.info(`Logged as ${this.user.firstName} ${this.user.lastName}`);
        this.isLogged = true;

        return LibStatus.NO_ERROR;
    }

    public async getBackgrounds(): Promise<{name: string, links: {fileName: string, url: string, ext: string}[]}[]> {
        const result = await this.apiVkCall('internal.getBackgrounds', {});

        if (result === LibStatus.ERR_VK_REQUEST_FAILED) {
            return null;
        }

        const out = [];

        result.response.forEach(item => {
            const name = item.name;
            const links = [];

            item.items.forEach(bg => {
                links.push({
                    fileName: `${bg.doc.id}_${bg.height}x${bg.width}_${bg.doc.title}`,
                    url: bg.doc.url,
                    ext: bg.doc.ext,
                });
            });

            out.push({name, links});
        });

        return out;
    }

    public async apiVkCall(method, params, force = false): Promise<any> {
        if (!force && !this.isLogged) {
            this.log.error(`Can't call VK without login`);
            return LibStatus.ERR_VK_NO_AUTH;
        }

        const result = await this.got.post(`https://api.vk.com/method/${method}`, {
            searchParams: {
                access_token: this.tokenVk,
                v: VkLib.VK_API_VERSION,
                ...params,
            }
        }).json();

        const error = this.checkError(result);

        if (error) {
            this.log.error(error);
            return LibStatus.ERR_VK_REQUEST_FAILED;
        }

        return result;
    }

    private checkError(response): string {
        if (!response?.error) {
            return null;
        }

        if (response.error?.error_code === 5) {
            this.log.error(`Old token, use url: ${this.loginUrl}`);
        }

        return response.error?.error_msg;
    }
}

export { VkLib };
