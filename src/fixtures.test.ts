import { fs } from "memfs";
import { format, Mode } from "./index";

jest.mock("fs", () => {
  return jest.requireActual("memfs");
});

const realFs = jest.requireActual("fs") as typeof fs;

describe("fixtures [api-extractor]", () => {
  beforeAll(async () => {
    const fixturePath = "src/__fixtures__/api-extractor/";
    await fs.promises.mkdir(process.cwd(), { recursive: true });
    const fixtures = await realFs.promises.readdir(fixturePath);
    await Promise.all(
      fixtures.map(async (path) => {
        const src = await realFs.promises.readFile(fixturePath + path, {
          encoding: "utf-8",
        });
        await fs.promises.writeFile(path, src, { encoding: "utf-8" });
      })
    );
  });

  afterAll(async () => {
    await fs.promises.rm(process.cwd(), { recursive: true });
  });

  it("should run for api-extractor", async () => {
    await expect(
      format({
        input: "*.md\n!index.md",
        output: "docs/",
        srcLib: "test-lib",
        dstLib: "your-lib",
        mode: Mode.ApiExtractor,
        home: "https://home.com",
        index: "./your-lib",
      })
    ).resolves.toBe(0);

    expect(fs.existsSync("./docs/your-lib.md")).toBeTruthy();
    expect(fs.existsSync("./docs/your-lib-beginwork.md")).toBeTruthy();
    expect(fs.existsSync("./docs/your-lib-endwork.md")).toBeTruthy();
    await expect(
      fs.promises.readFile("./docs/your-lib.md", { encoding: "utf-8" })
    ).resolves.toMatchSnapshot();
    await expect(
      fs.promises.readFile("./docs/your-lib-beginwork.md", {
        encoding: "utf-8",
      })
    ).resolves.toMatchSnapshot();
    await expect(
      fs.promises.readFile("./docs/your-lib-endwork.md", { encoding: "utf-8" })
    ).resolves.toMatchSnapshot();
  });
});

describe("fixtures [xmldoc]", () => {
  beforeAll(async () => {
    const fixturePath = "src/__fixtures__/xmldoc/";
    await fs.promises.mkdir(process.cwd(), {
      recursive: true,
    });
    const fixtures = await realFs.promises.readdir(fixturePath);
    await Promise.all(
      fixtures.map(async (path) => {
        const src = await realFs.promises.readFile(fixturePath + path, {
          encoding: "utf-8",
        });
        await fs.promises.writeFile(path, src, { encoding: "utf-8" });
      })
    );
  });

  afterAll(async () => {
    await fs.promises.rm(process.cwd(), { recursive: true });
  });

  it("should run for xmldoc", async () => {
    await expect(
      format({
        input: "*.md\n!index.md",
        output: "docs/",
        srcLib: "test-lib",
        dstLib: "your-lib",
        mode: Mode.Xmldoc,
        home: "https://home.com",
        index: "./your-lib",
      })
    ).resolves.toBe(0);

    expect(fs.existsSync("./docs/your-lib.md")).toBeTruthy();
    expect(fs.existsSync("./docs/your-lib-program.md")).toBeTruthy();
    expect(fs.existsSync("./docs/your-lib-program-beginwork.md")).toBeTruthy();
    expect(fs.existsSync("./docs/your-lib-program-endwork.md")).toBeTruthy();
    expect(fs.existsSync("./docs/your-lib-program-main.md")).toBeTruthy();
    expect(fs.existsSync("./docs/your-lib-program-program.md")).toBeTruthy();
    await expect(
      fs.promises.readFile("./docs/your-lib.md", { encoding: "utf-8" })
    ).resolves.toMatchSnapshot();
    await expect(
      fs.promises.readFile("./docs/your-lib-program.md", { encoding: "utf-8" })
    ).resolves.toMatchSnapshot();
    await expect(
      fs.promises.readFile("./docs/your-lib-program-beginwork.md", {
        encoding: "utf-8",
      })
    ).resolves.toMatchSnapshot();
    await expect(
      fs.promises.readFile("./docs/your-lib-program-endwork.md", {
        encoding: "utf-8",
      })
    ).resolves.toMatchSnapshot();
    await expect(
      fs.promises.readFile("./docs/your-lib-program-main.md", {
        encoding: "utf-8",
      })
    ).resolves.toMatchSnapshot();
    await expect(
      fs.promises.readFile("./docs/your-lib-program-program.md", {
        encoding: "utf-8",
      })
    ).resolves.toMatchSnapshot();
  });
});
