import { setFailed } from '@actions/core'
import { context } from '@actions/github'
import { runCommand } from './commands'
import { runDiff } from './commands/diff'

export async function runAction() {
  try {
    if (context.eventName === 'issue_comment') {
      return runCommand()
    }

    await runDiff()
  } catch (err) {
    setFailed(err.message)
  }
}
