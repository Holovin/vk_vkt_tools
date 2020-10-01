import { Log } from './helpers/logger';
import { Tasks } from './lib/tasks';

(async () => {
    const log = Log.getLogger('main');
    const task = new Tasks();

    await task.checkToken();
    await task.saveAllBackgrounds();

    log.info('Stop');
})();
