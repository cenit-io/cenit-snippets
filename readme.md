# cenit-snippets

Is a development tool to download and update the snippets of codes from CenitIO.

## Installation

```bash
npm install -g cenit-io/cenit-snippets
```

## Help

```bash
cenit-snippets -h
```

```
Usage: cenit-snippets [options]

  Options:

  -V, --version                   output the version number
  -u, --base-url,    [baseUrl]    Set CenitIO base URL (default: "https://cenit.io")
  -k, --key,         [key]        Set CenitIO tenant key (default: process.env.X_TENANT_ACCESS_KEY)
  -t, --token,       [token]      Set CenitIO tenant token (default: process.env.X_TENANT_ACCESS_TOKEN)
  -n, --namespace,   [namespace]  Set CenitIO namespace (default: "Basic")
  -p, --tenant,      [tenant]     Set CenitIO tenant name
  -o, --out-path,    [outPath]    Set output path
  -s, --origins,     [origin]     Set data origins (default: "default,owner")
  -h, --help                      display help for command

```

## Environments

You can create the ** `.env` ** file in your working directory and set the key and token.
 

```bash
X_TENANT_ACCESS_KEY=***************
X_TENANT_ACCESS_TOKEN=*****************
```

## Run

```
cenit-snippets -k "KKKK" -t "TTTT" -o "./development" -s "default,owner" -n "^(eCAPIv1|OMNAv2|Ov2.*)$"
```