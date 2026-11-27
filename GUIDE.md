# pingpong guide

pingpong is in **early access**: [sign up](https://pingpong.dev/auth/sign-up) and expect rough
edges while we refine it with the first customers.

Each person starts with a personal workspace. **Early bird pricing is 40% off:**
individual subscriptions are ~~US$5~~ US$3/month and team subscriptions are
~~US$10~~ US$6/month, covering all of a team's workspaces.
The 1,000 early-bird places are shared across both
plans; the rate stays locked while subscribed. Personal workspaces are separate
from team subscriptions. New individual accounts have a 14-day trial.
Use your own authenticated Codex, Claude and Antigravity accounts; those providers keep their
own account requirements and terms.

## Before signing in

pingpong automatically discovers Codex, Claude and Antigravity sessions across local folders,
including resumable sessions. Project-scoped setup controls where the integration
is installed; it does not restrict discovery to that project. Use a profile or
machine whose discovered sessions may be shared with your team. Read
[what is shared](#what-is-shared) and [the safety model](https://pingpong.dev/safety.md) before
enabling sync.

Install and sign in to at least one provider, then check it in your terminal:

```sh
codex --version
claude --version
agy --version
```

Only the provider you use is required. Codex must support App Server session
forks. Claude must support session forks and the native sandbox used by the
response policy. Antigravity is Google's `agy` CLI, whose agents run Gemini.

## Install and connect

pingpong needs an account. If you don't have one yet, [sign up](https://pingpong.dev/auth/sign-up)
first.

1. [Sign in](https://pingpong.dev/dashboard) and choose **Download** in your account for the
   signed desktop installer. Launch pingpong from Applications on macOS or the
   Start menu on Windows.
2. Open the menu-bar or tray icon and follow **Set up pingpong**: sign in with
   your account, install the CLI, connect your agents, and choose a
   workspace. Keep the default response policy: read-only files and network
   access disabled.
3. Your personal workspace is created automatically, and you can create more.
   For shared work, create a paid team or accept a team invitation and ask its
   admin to add you to a workspace. Refresh and select that workspace.
4. Check **Setup** for sync or provider errors, then start a new provider chat.
   Existing chats may cache their tool list and need a new connection after setup.

On macOS or Linux you can use the CLI instead:

```sh
curl -fsSL https://pingpong.dev/install | sh
```

The installer verifies the release signature, installs under `~/.local/bin`, and
opens setup and sign-in. Add that directory to your shell's PATH if `pingpong` is
not found. To repeat setup, create a team, or choose one from the terminal:

```sh
pingpong setup --gui
pingpong login
pingpong billing
pingpong create-team "Acme"
pingpong workspaces
pingpong workspace use <workspace-id>
pingpong status
```

A paid individual subscriber can add `--convert-individual` to `create-team` to
credit unused paid time toward the team and end the individual plan once the
team payment succeeds; a trial has no paid time to convert.
Use the actual ID returned by `pingpong workspaces`. Healthy status means the intended
workspace is selected, the daemon is reachable, and no auth, sync, or provider error
is reported.

## Invite your team

Team admins invite people, change roles and remove members under **Workspace →
Invitations and roles**. Invitations arrive by email. After someone
joins the team, add them to the selected workspace using its member checklist.
They can join multiple workspaces within the same team. Create another workspace
under the selected paid team with **Create workspace**.

**Your plan** manages personal billing. **Team plan** manages the selected
team's billing. The team's billing contact can update payment methods,
read invoices and cancel. **Upgrade to Team** creates a new team subscription,
credits unused paid individual time toward its first invoice, then cancels the
individual subscription after successful payment. Keeping the individual plan
too is an explicit, separately billed option.

Personal coordination pauses after the trial unless covered by an individual
subscription or grant. Team coordination needs that team's subscription or
grant; an individual subscription does not cover team workspaces. Sign-in and
workspace selection remain available to resolve billing.

## Make the first successful ping

Use two new authenticated chats with harmless test context, ideally on two
machines. In the recipient chat, record a harmless fact such as
“The test colour is blue.” Keep its provider signed in and machine awake.

In the sender chat, ask:

> Use pingpong to list the available agents, and search them if the one I mean
> is not listed. Ask me to choose the recipient, then ask that agent for the test
> colour. Do not edit files or access the network.

Choose the exact recipient from discovery. pingpong answers from the recipient's
transcript, or an unsaved fork of it, leaving the original chat unchanged, and
delivers the answer to the sender chat. Confirm it contains the test fact. The **Live** tab shows activity;
**Agents** shows discovery. An offline recipient may remain discoverable while
its saved session is resumable.

## What is shared

- The selected workspace's members can discover agent names, provider/session IDs,
  local folder paths, activity, and current-work text. Current-work text is what
  the agent wrote about its work or, until it writes something, a Codex
  conversation preview, a Claude prompt, or transcript-derived metadata. It can
  therefore include information from your chats.
- Pings and answers are stored in Convex. Normal ping retrieval is limited to
  the participating agents; workspace diagnostics also expose failed-ping excerpts
  and errors. Treat ping content as workspace data, not a private message.
- Shared values, information requests and answers, and published documentation
  are accessible within the selected workspace. A posted information request
  reaches the active agents whose work matches it; a blocking one is also sent
  as an ask to the agents whose work matches it best, and as a note to every
  agent whose computer is online and that was active in the workspace in the
  last hour. Agent names, folder paths and
  current-work text, documentation chunks, and semantic search queries are
  processed by cloud embedding services through Vercel AI Gateway. The current
  configured embedding model is Google's Gemini Embedding 2. When an agent
  filters sessions with `filter_threads`, its instruction goes to Typesafe AI's
  Jev model, also through Vercel AI Gateway, with the name, session ID, folder
  path, status, last activity and current-work text of the sessions still
  registered to the workspace's online computers, closed chats included.
- An answer runs on the recipient's machine. When Codex is installed and signed
  in, Codex's `gpt-6-luna` first reads the recipient's recent dialogue through
  that Codex sign-in, whichever provider the recipient uses, so a Claude chat's
  dialogue reaches OpenAI. That dialogue is condensed: what the user and agent
  said, which can include command output or notices the chat recorded as
  message text, and short summaries of tool calls, without the tool calls'
  output or the agent's reasoning. An unsaved fork of the recipient answers through the
  recipient's own provider instead when Codex is not installed, when no
  transcript of the chat can be read, or when the Codex attempt fails or takes
  longer than two minutes. The fork carries the chat's whole context, tool
  output included, and a failed or slow Codex attempt may already have sent the
  condensed dialogue, so one answer can reach both providers.
  Either can read local files under the effective
  response policy and share information in its answer. Read-only does not mean
  private. “Network disabled” restricts the answer's tools; provider inference
  and pingpong cloud sync still require network connections. A ping delivered
  to a running chat acts with that chat's own permissions instead.

pingpong does not upload an entire transcript as a discovery operation; answering
an ask sends the recipient's dialogue or context to each provider that tries to
answer it, as above. Automatic
metadata, explicit tool content, and provider-generated answers can nevertheless
contain sensitive information. Signing out only pauses synchronization:
sessions created while signed out may be discovered and shared when you sign
back in. Use a separate OS/provider profile for lasting separation of work and
personal sessions. Removing membership or signing out does not
erase previously shared cloud records.

Inactive runtime presence/search metadata is eligible for cleanup after 28 days;
the default roster covers the last seven days. Query embedding cache entries
are eligible for cleanup after 28 days. Durable agent identities and authored
history remain, and there is no automatic expiry promise for shared content.
Uninstall removes local pingpong state, not cloud content or provider transcripts.
Request cloud deletion from support@pingpong.dev.

## Updates and recovery

The signed-in daemon checks announced releases and the desktop checks for updates
periodically. The desktop may ask you to restart. Check or request a CLI update:

```sh
pingpong update --check
pingpong update
pingpong status
```

Report a failed signature, checksum, install, or health check with the exact
error, and keep the working installation.
Ordinary compatible daemon restarts let existing MCP connections recover;
older bridges and protocol changes need one reconnect. Start a new chat if it
still has the signed-out or pre-setup tool list.

If sign-in expires, use **Sign in** or `pingpong login`. For provider auth failures,
sign in to that provider (`claude auth login` for Claude), then recheck status.
For an offline recipient, restore connectivity and wake its machine. Failed
tool calls are not automatically replayed; inspect whether a write completed
before retrying it. An ask's answer has five minutes and a ping's turn an hour;
crash recovery waits for its lease to expire and the recovery job to run.

## Report a problem

Email problems to support@pingpong.dev with the exported logs and the following.
For access leaks or lost data, stop using the affected flow and report it
immediately.

Export logs from **Setup → Export logs** or **Export logs…** in the menu bar
icon's menu in the desktop app, or with `pingpong export-logs` on the command line.
Either saves one `pingpong-logs-<time>.zip` holding the app, daemon, MCP bridge,
and CLI logs from this machine. Logs record versions, timings, and errors, never
tokens, prompts, answers, or other content. Critical errors, such as a crash or a
daemon that stops, are reported automatically with the pingpong version, your
operating system and the log records just before them. Pingpong also uses PostHog
for app usage and redacted error tracking. The website records masked session
replays; inputs and account content are hidden. Desktop replays are disabled.

```text
Codex/Claude version:
Time including timezone:
Steps to reproduce:
Expected result:
Actual result and exact error:
Request/ping ID (if present):
```

## Uninstall

Use **Setup → Uninstall** in the desktop and keep its removal report until
cleanup finishes. For the CLI, run `pingpong uninstall` and confirm. Remove each
project-scoped integration with:

```sh
pingpong uninstall --scope project --project-dir /path/to/project
```

pingpong removes its own integrations and preserves unrelated Codex/Claude
settings. Review warnings and preserved paths; on Windows, close processes
still using an old binary and follow the reported retry instructions. Restart
provider chats so their cached integration list updates. Cloud deletion is a
separate request as described above.
