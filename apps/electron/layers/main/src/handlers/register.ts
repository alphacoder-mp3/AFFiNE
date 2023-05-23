import path from 'node:path';

import { ipcMain } from 'electron';

import { getLogFilePath, logger, revealLogFile } from '../logger';
import { dbHandlers } from './db';
import { dialogHandlers } from './dialog';
import { uiHandlers } from './ui';
import { updaterHandlers } from './updater';
import { workspaceHandlers } from './workspace';

type IsomorphicHandler = (
  e: Electron.IpcMainInvokeEvent,
  ...args: any[]
) => Promise<any>;

type NamespaceHandlers = {
  [key: string]: IsomorphicHandler;
};

export const debugHandlers = {
  revealLogFile: async () => {
    return revealLogFile();
  },
  logFilePath: async () => {
    return getLogFilePath();
  },
};

// Note: all of these handlers will be the single-source-of-truth for the apis exposed to the renderer process
export const allHandlers = {
  workspace: workspaceHandlers,
  ui: uiHandlers,
  db: dbHandlers,
  dialog: dialogHandlers,
  debug: debugHandlers,
  updater: updaterHandlers,
} satisfies Record<string, NamespaceHandlers>;

export const registerHandlers = () => {
  // TODO: listen to namespace instead of individual event types
  ipcMain.setMaxListeners(100);
  for (const [namespace, namespaceHandlers] of Object.entries(allHandlers)) {
    for (const [key, handler] of Object.entries(namespaceHandlers)) {
      const chan = `${namespace}:${key}`;
      ipcMain.handle(chan, async (e, ...args) => {
        const start = performance.now();
        try {
          const result = await handler(e, ...args);
          logger.info(
            '[ipc-api]',
            chan,
            args.filter(
              arg => typeof arg !== 'function' && typeof arg !== 'object'
            ),
            '-',
            (performance.now() - start).toFixed(2),
            'ms'
          );
          return result;
        } catch (error) {
          logger.error('[ipc]', chan, error);
        }
      });
    }
  }
};

export const registerArgsHandler = () => {
  const args = process.argv.slice(2);
  if (args.length > 0) {
    const command = args[0];
    if (command === 'affine') {
      const filePath = path.resolve(args[1]);
      console.log(filePath);
    }
  }
};
