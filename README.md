# rainway-doc-format

Rainway documentation formatter.

## Getting Started

- `npx rainway-doc-format --help`

```
rainway-doc-format [options] -i <input> -i <output>
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
```

### GitHub Action

```
- uses: RainwayApp/rainway-doc-format@v1.0.0
  with:
    # Input file(s) globs supported. (required)
    input: *.md
    # Output directory. (required)
    output: docs/
    # The name of the library your input was generated from. (required)
    src-lib: my-lib
    # The vanity name of the library you want docs to use. (required)
    dest-lib: your-lib
    # Informs the formatter your input was sourced from xmldoc. (optional, default 'false')
    # xmldoc: 'false'
    # Informs the formatter your input was sourced from api-extractor. (optional, default 'true')
    # api-extractor: 'true'
    # The url of the root page for the docs. (optional, default '.')
    # index: .
    # The url of the overall docs homepage. (optional, default '.')
    # home: .
```
