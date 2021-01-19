# Locize Diff Action

GitHub Action to display a diff of translations for two Locize versions.

![Example comments](https://raw.githubusercontent.com/Widen/locize-diff/main/screenshot.png)

## Inputs

### `projectId`

Locize project id. You can find your `projectId` in your project settings under the **Api Keys** tab. **Required**

### `apiKey`

Locize API key. You can find your `apiKey` in your project settings under the **Api Keys** tab. **Required**

*NOTE*: the `apiKey` needs to have admin access and access to all versions. This can be set by the **Admin Access** checkbox under **Api Keys**

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
    types:
      - opened
      - synchronize
      - reopened
      - ready_for_review
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

## Commands

In addition to running on pull request events, this action also is setup to watch issue or pull request comments so you can manually trigger specific commands on-demand. The available commands and their usage are detailed below.

### `@locize-diff check`

This command will perform the same steps that run when you commit changes. Additionally, it will respond to your request with a comment explaining if the existing comment was updated, no diffs were found, or if an old comment was resolved. To run this command, create a comment with the following text:

```
@locize-diff check
```

### `@locize-diff copy`

This command will copy changes from the `leftVersion` to the `rightVersion` without you having to bother with manually doing this in Locize! This command has several safeguards in place to prevent accidentally copying translations you don't want to by ensuring that the diff comment in the PR/issue is up to date before copying any changes. To run this command, create a comment with the following text:

```
@locize-diff copy
```
