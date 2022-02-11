import * as path from "path";
import { promises as fs } from "fs";
import { create as createGlobber } from "@actions/glob";
import { escapeFilename, forAllLinks, Link } from "./util";

// re-exports
export { Link };

/* eslint-disable no-console */

/**
 * Formatter modes
 */
export enum Mode {
  /**
   * Api extractor formatter
   */
  ApiExtractor,

  /**
   * Xmldoc formatter
   */
  Xmldoc,
}

/**
 * Properties for the handlers
 */
export interface HandlerProperties {
  srcLib: string;
  dstLib: string;
  index: string;
  home: string;
}

/**
 * Process input
 */
export interface Input extends HandlerProperties {
  input: string;
  output: string;
  mode: Mode;
}

/**
 * Handler for any link type, does some basic handling.
 * More scoped implementations may want to call this before doing their own processing.
 * @param link - md link
 * @param props - handler props
 */
export function handleAnyLink(link: Link, props: HandlerProperties): Link {
  const res = link;

  // for our docs sites, we want to ensure we replace filenames in links with page slugs
  if (path.extname(link.href) === ".md") {
    res.href = escapeFilename(res.href);
    res.href = res.href.substring(0, res.href.length - ".md".length);
  }

  // we also want to replace all instances of {srcLib} with {dstLib}
  res.href = res.href.replace(new RegExp(props.srcLib, "g"), props.dstLib);

  // we also want to remove double hyphens, as readme.com doesn't allow that.
  res.href = res.href.replace(/--/g, "-");

  return res;
}

/**
 * Handler for xmldoc links
 * @param link - md link
 * @param props - handler props
 */
export function handleXmldocLink(
  link: Link,
  props: HandlerProperties
): Link | null {
  // lowercase all the links
  link.href = link.href.toLowerCase();

  // xmldoc had hierarchy, we need to undo that
  // this is because the docs site requires a flat tree
  let hierarchy = link.href
    .split("/")
    .filter((h) => h !== "..")
    .join(".");

  // special case for starting with a "./" meaning we join as ".."
  if (hierarchy.startsWith("..")) {
    hierarchy = hierarchy.substring("..".length);
  }

  // root xmldoc hierarchies automatically
  if (!hierarchy.startsWith("./")) {
    hierarchy = `./${hierarchy}`;
  }

  const res = handleAnyLink({ ...link, href: hierarchy }, props);

  // // they need the lib prefix in the root, too
  const libPrefix = `./${props.dstLib}`;
  if (!res.href.startsWith(libPrefix)) {
    res.href = `${libPrefix}-${res.href.substring("./".length)}`;
  }

  return res;
}

/**
 * Handler for api extractor links
 * @param link - md link
 * @param props - handler props
 */
export function handleApiExtractorLink(
  link: Link,
  props: HandlerProperties
): Link | null {
  const res = handleAnyLink({ ...link }, props);

  // it's confusing below that `./index.md` doesn't get mapped to our `props.index` value
  // but that IS desired behavior.

  // for api extractor headers, we want to replace the `./index.md` with the home link
  // we'll overwrite any preprocessing from {handleAnyLink} to do this
  if (link.href === "./index.md") {
    res.href = props.home;
  }

  // we also want to force any `./{srcLib}.md` links to {index}
  // again overwriting any preprocessing from {handleAnyLink}
  if (link.href === `./${props.srcLib}.md`) {
    res.href = props.index;
  }

  return res;
}

/**
 * Entrypoint. (re)formats docs.
 * @param input - input to process
 * @returns exit code
 */
export async function format(input: Input): Promise<number> {
  const globber = await createGlobber(input.input);
  const files = await globber.glob();

  if (files.length === 0) {
    throw new Error(`Unable to find files using '${input.input}'.`);
  }

  await Promise.all(
    files.map(async (file) => {
      const extName = path.extname(file);

      if (extName !== ".md") {
        console.warn(
          `Warning: File '${file}' does not have the .md extension. Formatting may yield undesirable results.`
        );
      }

      const data = await fs.readFile(file, { encoding: "utf-8" });

      const output = forAllLinks(data, (link) => {
        return input.mode == Mode.ApiExtractor
          ? handleApiExtractorLink(link, input)
          : handleXmldocLink(link, input);
      });

      const dirName = path.dirname(file);
      let baseName = path.basename(file, extName).toLowerCase();
      if (baseName.includes(input.srcLib)) {
        baseName = baseName.replace(
          new RegExp(input.srcLib, "g"),
          input.dstLib
        );
      }

      const outFile = escapeFilename(
        (path.isAbsolute(input.output)
          ? path.join(input.output, baseName)
          : path.join(dirName, input.output, baseName)) + extName
      );

      await fs.mkdir(path.dirname(outFile), { recursive: true });

      if (outFile !== file) {
        console.log(`Renaming file '${file}' => '${outFile}'.`);
        await fs.rename(file, outFile);
      }

      await fs.writeFile(outFile, output, { encoding: "utf-8" });
    })
  );

  return 0;
}
