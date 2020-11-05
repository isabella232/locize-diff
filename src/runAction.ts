import { setFailed } from '@actions/core'
import { context } from '@actions/github'
import { runCommand } from './commands'
import { runDiff } from './commands/check'

export async function runAction() {
  try {
    if (context.eventName === 'issue_comment') {
      await runCommand()
    } else {
      await runDiff()
    }
  } catch (err) {
    setFailed(err.message)
  }
}
