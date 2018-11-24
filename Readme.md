# [import-server](https://import.pw)

GitHub redirection and documentation server intended for use with `import`.

## Deploying to Now

The `importpw-github-access-token` Now secret must be configured to a valid
GitHub API access token. Make sure that it does not have private repository
permissions!

```bash
$ now
```

The Now + GitHub integration is also configured, so pushing to master will deploy
and alias the code to production.
