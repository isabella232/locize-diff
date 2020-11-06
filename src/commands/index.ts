import { context } from '@actions/github'
import { createComment } from '../utils/comments'
import { runDiff } from './check'
import { runCopy } from './copy'

async function reportResult(message?: string) {
  if (message) {
    await createComment(`@${context.actor} ${message}`)
  }
}

export async function runCommand() {
  const comment = context.payload.comment?.body ?? ''
  const match = comment.match(/@locize-diff\s(check|copy)/)
  const command = match?.[1]

  switch (command) {
    case 'check':
      return reportResult(await runDiff())

    case 'copy':
      return reportResult(await runCopy())
  }
}
