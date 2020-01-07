#cenit-snippets

Is a development tool to download and update the snippets of codes from CenitIO.

# Installation

```bash
npm install -g cenit-io/cenit-snippets
```

# Help

```bash
cenit-snippets -h
```

```
Usage: cenit-snippets [options]

  Options:

    -h, --help                    output usage information
    -V, --version                 output the version number
    -u, --url,   [url]            Set CenitIO base URL
    -k, --key,   [key]            Set CenitIO tenant key
    -t, --token, [token]          Set CenitIO tenant token
    -p, --tenant, [tenant]        Set CenitIO tenant name
    -n, --namespace, [namespace]  Set CenitIO namespace
    -o, --out,   [out]            Set output path
    -s, --origins,   [origin]     Set data origins

```

# Run

```
cenit-snippets -k KKKKKKKKKK -t TTTTTTTTTTTTTTTTTTTT -o "./development" -s "default,owner" -n "^(eCAPI|OMNAv2|Ov2.*)$" -u https://cenit.io
```