import _ from "lodash";
import { wait, spawn, exec } from "@nebulario/core-process";
import { Operation, IO, Watcher } from "@nebulario/core-plugin-request";
import * as Performer from "@nebulario/core-performer";
import { sync } from "./dependencies";

export const clear = async (params, cxt) => {
  const {
    performer,
    performer: { type }
  } = params;

  if (type !== "instanced") {
    throw new Error("PERFORMER_NOT_INSTANCED");
  }

  const {
    code: {
      paths: {
        absolute: { folder }
      }
    }
  } = performer;

  IO.print("warning", "Clean for npm folders is manual with this plugin!", cxt);
};

export const init = async (params, cxt) => {
  const {
    payload,
    module: mod,
    performer,
    performer: {
      performerid,
      type,
      code: {
        paths: {
          absolute: { folder }
        }
      },
      dependents,
      module: { dependencies }
    },
    performers,
    task: { taskid }
  } = params;

  if (type === "instanced") {
    const linked = Performer.linked(performer, performers, cxt).forEach(
      depPerformer => {
        if (depPerformer.module.type === "npm") {
          IO.print("info", depPerformer.performerid + " npm linked!", cxt);

          const dependentDependencies = _.filter(
            dependencies,
            dependency => dependency.moduleid === depPerformer.performerid
          );

          for (const depdep of dependentDependencies) {
            const { filename, path } = depdep;

            JsonUtil.sync(folder, {
              filename,
              path,
              version: "link:./../" + depPerformer.performerid
            });
          }
        }
      }
    );
  }

  const instout = await exec(
    ["yarn install --check-files"],
    {
      cwd: folder
    },
    {},
    cxt
  );

  IO.sendOutput(instout, cxt);
};


export const start = (params, cxt) => {
  const {
    performers,
    performer: { dependents, type, code }
  } = params;

  if (type === "instanced") {
    const {
      paths: {
        absolute: { folder }
      }
    } = code;


    IO.print("out", "Building boundle...", cxt);

    const startOp = async (operation, cxt) => {
      await build(operation, params, cxt);
      const watcher = Watcher.watch(".", () => {
        IO.print("warning", "Boundle changed...", cxt);

        build(operation, params, cxt);
      });

      while (operation.status !== "stopping") {
        await wait(100);
      }

      Watcher.stop(watcher);
    };

    return {
      promise: startOp,
      process: null
    };
  }
};

const build = async (operation, params, cxt) => {
  const {
    performer: {
      code: {
        paths: {
          absolute: { folder }
        }
      },
      payload
    },
    config: { cluster }
  } = params;


  IO.print("done", "", cxt);
};
