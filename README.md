# Locize Diff Action

GitHub Action to display a diff of translations for two Locize versions.

![Example comments](https://raw.githubusercontent.com/Widen/locize-diff/main/screenshot.png)

## Inputs

### `projectId`

Locize project id. You can find your `projectId` in your project settings under the **Api Keys** tab. **Required**

### `apiKey`

Locize API key. You can find your `apiKey` in your project settings under the **Api Keys** tab. **Required**

### `projectSlug`

Locize project slug. Used to provide a quick link in the comment to navigate directly to the project settings for quick publishing.

### `leftVersion`

Locize version to use as the left side of the comparision. Default: `'latest'`

### `rightVersion`

Locize version to use as the right side of the comparision. Default: `'production'`

### `ignoreDeletedKeys`

> This action assumes that your Locize keys originate from `leftVersion` and are then copied to `rightVersion` when publishing to production. Keys that are missing in `rightVersion` are likely unpublished keys and thus this action will mark them as a diff. However, keys that are missing in `leftVersion` are likely deleted keys which won't have a negative impact if they are not deleted from `rightVersion`.

If you wish to also mark deleted keys as a diff, set this input to `false`. Default: `true`

### `token`

`GITHUB_TOKEN` used to authenticate requests. Since there's a default, this is typically not supplied by the user. Default: `${{ github.token }}`

## Usage

Basic:

```yml
on:
  pull_request:
  issue_comment:
    types: [created]
name: Locize Diff
jobs:
  diff:
    name: Locize Diff
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: Widen/locize-diff@v2
        with:
          apiKey: ${{ secrets.LOCIZE_API_KEY }}
          projectId: 86d599ec-81c2-460a-b0d8-d236bd8753b5
          projectSlug: maj9dez2
```

Custom versions:

```yml
on:
  pull_request:
  issue_comment:
    types: [created]
name: Locize Diff
jobs:
  diff:
    name: Locize Diff
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: Widen/locize-diff@v2
        with:
          apiKey: ${{ secrets.LOCIZE_API_KEY }}
          projectId: 86d599ec-81c2-460a-b0d8-d236bd8753b5
          leftVersion: left
          rightVersion: right
```

Ignore draft PRs:

```yml
on:
  pull_request:
  issue_comment:
    types: [created]
name: Locize Diff
jobs:
  diff:
    name: Locize Diff
    runs-on: ubuntu-latest
    if: ${{ !github.event.pull_request.draft }}
    steps:
      - uses: actions/checkout@v2
      - uses: Widen/locize-diff@v2
        with:
          apiKey: ${{ secrets.LOCIZE_API_KEY }}
          projectId: 86d599ec-81c2-460a-b0d8-d236bd8753b5
```
