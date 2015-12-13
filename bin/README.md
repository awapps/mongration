# Mongration CLI

> A cli tool to manage mongration migrations

## CLI tool

```
  Usage: mongration [options]

  Options:

    -h, --help                          output usage information
    -V, --version                       output the version number
    -f, --folder [value]                migrations folder (current dir is default)
    -h, --hosts [value]                 mongoDB hosts
    -d, --database [value]              mongoDB database
    -u, --user [value]                  mongoDB user
    -p, --password [value]              mongoDB password
    -m, --migration-collection [value]  collection to save migrations state
    -c, --config [value]                path to config file
```

## Using as a `package.json` script

To avoid installing it globally, you can make use of `package.json` `scripts`
configuration, simply adding `mongration` to it.

Example:

```javascript
{
  "scripts": {
    "migrate": "mongration -f ./migrations -c cfg.js"
  }
}
```
