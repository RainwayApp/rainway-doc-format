import * as path from "path";

/**
 * Dumb library name detector
 * @param input - input string
 * @returns string
 */
export function findPossibleLibraryName(input: string): string {
  const dotIndex = input.indexOf(".");
  if (dotIndex !== -1) {
    return input.substring(0, dotIndex);
  } else {
    return input[0];
  }
}

/**
 * Docs-safe file path
 * @param input - docs file path
 */
export function escapeFilename(input: string): string {
  // we "escape" filenames to ensure they are compatible with the docs site
  const dirName = path.dirname(input);
  const extName = path.extname(input);

  // if we don't have an extension we're assuming we're not a doc and
  // exiting early with the same input
  if (extName.length === 0) {
    return input;
  }

  let baseName = path.basename(input, extName);

  baseName = baseName.replace(/_/g, "-").replace(/\./g, "-").trim();

  const output = `${path.join(dirName, baseName)}${extName}`.replace(
    /\\/g,
    "/"
  );

  // fix for {path.join} not respecting './'
  if (input.startsWith("./")) {
    return `./${output}`;
  } else {
    return output;
  }
}

/**
 * A markdown link
 */
export interface Link {
  /**
   * The link title
   */
  title: string;

  /**
   * The link href
   */
  href: string;
}

/**
 * Runs a replacement operation for each link in markdown text
 * @param input - markdown text
 * @param cb - callback for each link
 * @returns the text with replacements made
 */
export function forAllLinks(
  input: string,
  cb: (link: Link) => Link | null
): string {
  const replacements: Array<Link & { start: number; end: number }> = [];

  const mdLinkRe = /\[(?<title>.+?)\]\((?<href>.+?)\)/g;
  let match: RegExpExecArray | null = null;
  while ((match = mdLinkRe.exec(input)) !== null) {
    const len = match[0].length;
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const title = match.groups!["title"];
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const href = match.groups!["href"];

    const repl = cb({ title, href });

    if (repl !== null) {
      replacements.push({
        ...repl,
        start: match.index,
        end: match.index + len,
      });
    }
  }

  for (let i = 0; i < replacements.length; i++) {
    const re = replacements[i];
    const beforeSize = input.length;
    input = `${input.substring(0, re.start)}[${re.title}](${
      re.href
    })${input.substring(re.end)}`;
    const afterSize = input.length;

    for (let j = 0; j < replacements.length; j++) {
      replacements[j].start += afterSize - beforeSize;
      replacements[j].end += afterSize - beforeSize;
    }
  }

  return input;
}
