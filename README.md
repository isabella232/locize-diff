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

### `includeDrafts`

When `true`, will run the action on draft PRs. Default: `false`

### `token`

`GITHUB_TOKEN` used to authenticate requests. Since there's a default, this is typically not supplied by the user. Default: `${{ github.token }}`

## Usage

> Note: We recommend running this action with the `pull_request` event.

Basic:

```yml
steps:
  - uses: actions/checkout@v2
  - uses: Widen/locize-diff@v1
    with:
      projectId: 86d599ec-81c2-460a-b0d8-d236bd8753b5
      apiKey: 4734080e-2860-40b4-9007-781ce07a571d
      projectSlug: maj9dez2
```

Custom versions:

```yml
steps:
  - uses: actions/checkout@v2
  - uses: Widen/locize-diff@v1
    with:
      projectId: 86d599ec-81c2-460a-b0d8-d236bd8753b5
      apiKey: 4734080e-2860-40b4-9007-781ce07a571d
      leftVersion: left
      rightVersion: right
```
