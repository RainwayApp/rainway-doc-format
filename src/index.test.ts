import { fs } from "memfs";
import {
  format,
  handleAnyLink,
  handleApiExtractorLink,
  handleXmldocLink,
  Mode,
} from "./index";
import { findPossibleLibraryName } from "./util";

jest.mock("fs", () => {
  return jest.requireActual("memfs");
});

describe("rainway-doc-format", () => {
  describe("findPossibleLibraryName", () => {
    it("should do an extremely average job", () => {
      expect(findPossibleLibraryName("my-lib.md")).toEqual("my-lib");
      expect(findPossibleLibraryName("*")).toEqual("*");
    });
  });
  describe("handleAnyLink", () => {
    it("should escape md links", () => {
      // underscores and multiple dots
      expect(
        handleAnyLink(
          {
            title: "Hello World",
            href: "./test_file.real.md",
          },
          {
            srcLib: "",
            dstLib: "",
            index: "",
            home: "",
          }
        )
      ).toEqual({
        title: "Hello World",
        href: "./test-file-real",
      });

      // lib in url
      expect(
        handleAnyLink(
          {
            title: "Hello World",
            href: "./my-lib.real.md",
          },
          {
            srcLib: "my-lib",
            dstLib: "your-lib",
            index: "",
            home: "",
          }
        )
      ).toEqual({
        title: "Hello World",
        href: "./your-lib-real",
      });
    });
  });

  describe("handleApiExtractorLink", () => {
    it("should escape md links", () => {
      // replace home with https link
      expect(
        handleApiExtractorLink(
          {
            title: "Hello World",
            href: "./index.md",
          },
          {
            srcLib: "",
            dstLib: "",
            index: "https://index.com",
            home: "https://home.com",
          }
        )
      ).toEqual({
        title: "Hello World",
        href: "https://home.com",
      });

      // replace home with local
      expect(
        handleApiExtractorLink(
          {
            title: "Hello World",
            href: "./index.md",
          },
          {
            srcLib: "",
            dstLib: "",
            index: "https://index.com",
            home: "./custom-home",
          }
        )
      ).toEqual({
        title: "Hello World",
        href: "./custom-home",
      });

      // replace index with https link
      expect(
        handleApiExtractorLink(
          {
            title: "Hello World",
            href: "./my-lib.md",
          },
          {
            srcLib: "my-lib",
            dstLib: "",
            index: "https://index.com",
            home: "https://home.com",
          }
        )
      ).toEqual({
        title: "Hello World",
        href: "https://index.com",
      });

      // replace index with local
      expect(
        handleApiExtractorLink(
          {
            title: "Hello World",
            href: "./my-lib.md",
          },
          {
            srcLib: "my-lib",
            dstLib: "",
            index: "./custom-index",
            home: "https://home.com",
          }
        )
      ).toEqual({
        title: "Hello World",
        href: "./custom-index",
      });
    });
  });

  describe("handleXmldocLink", () => {
    it("should handle hierarchical links", () => {
      // parent dir link
      expect(
        handleXmldocLink(
          {
            title: "Hello World",
            href: "../../doc.md",
          },
          {
            srcLib: "",
            dstLib: "",
            index: "",
            home: "",
          }
        )
      ).toEqual({
        title: "Hello World",
        href: "./doc",
      });

      // sub folder link
      expect(
        handleXmldocLink(
          {
            title: "Hello World",
            href: "child-folder/doc.md",
          },
          {
            srcLib: "",
            dstLib: "",
            index: "",
            home: "",
          }
        )
      ).toEqual({
        title: "Hello World",
        href: "./child-folder-doc",
      });

      // single parent dir link
      expect(
        handleXmldocLink(
          {
            title: "Hello World",
            href: "../doc.md",
          },
          {
            srcLib: "",
            dstLib: "",
            index: "",
            home: "",
          }
        )
      ).toEqual({
        title: "Hello World",
        href: "./doc",
      });

      // dot in folder sub folder
      expect(
        handleXmldocLink(
          {
            title: "Hello World",
            href: "./sub.folder/doc.md",
          },
          {
            srcLib: "",
            dstLib: "",
            index: "",
            home: "",
          }
        )
      ).toEqual({
        title: "Hello World",
        href: "./sub-folder-doc",
      });
    });
  });

  describe("format", () => {
    beforeEach(async () => {
      await fs.promises.mkdir(process.cwd(), { recursive: true });
    });

    afterEach(async () => {
      await fs.promises.rm(process.cwd(), { recursive: true });
    });

    it("should not find any files if none are present", async () => {
      await expect(
        format({
          input: "not-real/*.md",
          output: "dest/",
          mode: Mode.ApiExtractor,
          index: "",
          home: "",
          srcLib: "",
          dstLib: "",
        })
      ).rejects.toThrowError(/Unable to find files/);
    });

    it("should warn for non markdown files", async () => {
      const warnSpy = jest.spyOn(console, "warn");

      await fs.promises.writeFile("file.txt", "text file", {
        encoding: "utf-8",
      });

      await expect(
        format({
          input: "file.txt",
          output: "dest/",
          mode: Mode.ApiExtractor,
          index: "",
          home: "",
          srcLib: "",
          dstLib: "",
        })
      ).resolves.toBe(0);

      expect(warnSpy).toHaveBeenCalledTimes(1);
      expect(warnSpy.mock.calls[0][0]).toMatch(
        /does not have the .md extension/
      );
    });

    it("should work for xmldoc files", async () => {
      await fs.promises.writeFile(
        "my-lib.md",
        "# Hello\nI am [a link](./my-lib/component.md).",
        { encoding: "utf-8" }
      );

      await fs.promises.writeFile(
        "my-lib.component.md",
        "# Component\nI am a kickback [link](../my-lib.md).",
        { encoding: "utf-8" }
      );

      await expect(
        format({
          input: "*.md",
          output: "docs/",
          mode: Mode.Xmldoc,
          srcLib: "my-lib",
          dstLib: "your-lib",
          index: "your-lib",
          home: "https://real.com",
        })
      ).resolves.toBe(0);

      expect(fs.existsSync("./docs/your-lib.md")).toBeTruthy();
      expect(fs.existsSync("./docs/your-lib-component.md")).toBeTruthy();

      // the below snapshots are written into source by jest - use `npm run test -- -u` to update

      await expect(
        fs.promises.readFile("./docs/your-lib.md", { encoding: "utf-8" })
      ).resolves.toMatchInlineSnapshot(`
              "# Hello
              I am [a link](./your-lib-component)."
            `);
      await expect(
        fs.promises.readFile("./docs/your-lib-component.md", {
          encoding: "utf-8",
        })
      ).resolves.toMatchInlineSnapshot(`
              "# Component
              I am a kickback [link](./your-lib)."
            `);
    });
  });
});
