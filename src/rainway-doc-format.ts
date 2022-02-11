#!/usr/bin/env node

import arg from "arg";
import { Input, Mode, format } from ".";
import { findPossibleLibraryName } from "./util";

/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-non-null-assertion */

const args = arg({
  "--help": Boolean,
  "--xmldoc": Boolean,
  "--api-extractor": Boolean,
  "--src-lib": String,
  "--dest-lib": String,
  "--index": String,
  "--home": String,
  "-i": String,
  "-o": String,
});

const missingInput = !args["-i"];
const missingOutput = !args["-o"];

if (args["--help"] || missingInput || missingOutput) {
  console.log(`rainway-doc-format [options] -i <input> -i <output>
    Options:
      --xmldoc         Informs the formatter your input was sourced from xmldoc.
      --api-extractor  Informs the formatter your input was sourced from api-extractor.
      --src-lib        The name of the library your input was generated from.
      --dest-lib       The vanity name of the library you want docs to use.
      --index          The url of the root page for the docs.
      --home           The url of the overall docs homepage.
      -i               Input file(s) globs supported.
      -o               Output directory.

    Examples:
      rainway-doc-format --xmldoc -i csharp-docs/*.md -o docs/
  `);

  const missingParams = [];

  if (missingInput) {
    missingParams.push("-i");
  }
  if (missingOutput) {
    missingParams.push("-o");
  }

  if (missingParams.length > 0) {
    console.log(`Missing param(s): ${missingParams.join(", ")}`);
    process.exit(1);
  }
}

let srcLib = args["--src-lib"];

if (!srcLib) {
  srcLib = findPossibleLibraryName(args["-i"]!);
  console.warn(
    `Guessed srcLib value '${srcLib}'. If this is wrong, specify '--src-lib' as an option.`
  );
}

let destLib = args["--dest-lib"];

if (!destLib) {
  destLib = srcLib;
  console.warn(
    `Guessed destLib value '${destLib}'. If this is wrong, specify '--dest-lib' as an option.`
  );
}

// cli input
const input: Input = {
  input: args["-i"]!,
  output: args["-o"]!,
  mode: args["--xmldoc"] ? Mode.Xmldoc : Mode.ApiExtractor,
  srcLib: args["--src-lib"] ?? srcLib,
  dstLib: args["--dest-lib"] ?? destLib,
  index: args["--index"] ?? ".",
  home: args["--home"] ?? ".",
};

// run
format(input)
  .then((code) => {
    process.exit(code);
  })
  .catch((e) => {
    console.error(`Error: ${e}`);
  });
