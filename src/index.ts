import { Tasks } from './lib/tasks';
import { Logger } from 'lib-dd-helpers';


(async () => {
    const log = Logger.getInstance().getLogger('main');
    const task = new Tasks();

    await task.checkToken();
    await task.saveAllBackgrounds();

    log.info('Stop');
})();
