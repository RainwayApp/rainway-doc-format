import * as core from "@actions/core";
import { format, Input, Mode } from ".";

async function run() {
  try {
    // action input
    const input: Input = {
      input: core.getInput("input"),
      output: core.getInput("output"),
      mode:
        core.getInput("xmldoc") === "true" ? Mode.Xmldoc : Mode.ApiExtractor,
      srcLib: core.getInput("src-lib"),
      dstLib: core.getInput("dest-lib"),
      index: core.getInput("index"),
      home: core.getInput("home"),
    };

    if (input.index.length === 0) {
      input.index = ".";
    }

    if (input.home.length === 0) {
      input.home = ".";
    }

    core.info(`🚀 Beginning work`);

    await format(input);

    core.info(`🎉 Work complete!`);
  } catch (e) {
    if (e instanceof Error) {
      core.setFailed(e);
    } else if (typeof e === "object") {
      core.setFailed(`Error: ${JSON.stringify(e)}`);
    } else {
      core.setFailed(`Error: ${e}`);
    }
  }
}

run();
