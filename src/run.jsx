import path from 'path'
import fs from 'fs'
import {
  spawn
} from '@nebulario/core-process';
import {
  IO
} from '@nebulario/core-plugin-request';

export const start = (params, cxt) => {

  const {
    performer,
    performer: {
      type
    }
  } = params;

  if (type !== "instanced") {
    throw new Error("PERFORMER_NOT_INSTANCED");
  }

  return null;
}
