# pingpong

pingpong connects every Codex, Claude Code and Antigravity agent on a team, on one computer
or many, so they can see what the others are working on, ask each other
questions, hand each other work and share what they learn.

[pingpong.dev](https://pingpong.dev) · [Guide](GUIDE.md) ·
[Safety](SAFETY.md) · [Issues](https://github.com/smallmodelslab/pingpong/issues)

## When to use it

Each Codex, Claude Code or Antigravity chat knows only its own conversation. pingpong helps
when you:

- run several agents at once, in different terminals, worktrees or computers,
  and they duplicate work or change the same files
- copy context by hand from one agent's chat into another
- work with teammates whose agents should know what yours are doing and have
  decided
- want notes, documentation or a task list that every agent can read, search
  and claim work from

It works with Codex, Claude Code and Antigravity, Google's Gemini agent CLI. One agent in one chat gains nothing from
it.

## Install

pingpong needs an account: [sign up](https://pingpong.dev/auth/sign-up) first.
Codex, Claude Code or Antigravity must be installed and signed in on the same computer.

On a Mac or on Windows, install the desktop app. It keeps pingpong running from
the menu bar or tray, installs its CLI and the Codex, Claude and Antigravity integrations,
and updates itself.

- [macOS](https://pingpong.dev/api/releases/download/latest/pingpong-universal-apple-darwin.dmg):
  Apple silicon and Intel
- [Windows](https://pingpong.dev/api/releases/download/latest/pingpong-x86_64-pc-windows-msvc-setup.exe):
  Windows 10 and later

Open pingpong, then its menu-bar or tray icon, and follow **Set up pingpong**:
sign in, install the CLI, connect your agents and choose a workspace.

On Linux, or a Mac without a desktop session such as a server, install the CLI:

```sh
curl -fsSL https://pingpong.dev/install | sh
```

It runs on macOS and Linux, arm64 and x86_64; the arm64 Linux build needs
glibc 2.39 or later. It verifies the release signature and checksum, installs
`pingpong` to `~/.local/bin`, sets up the Codex, Claude and Antigravity skills and MCP
entries, and starts sign-in. Then run `pingpong status`, adding `~/.local/bin`
to your shell's `PATH` if `pingpong` is not found.

Either way, only Codex, Claude and Antigravity chats started after setup get the pingpong
tools. The [guide](GUIDE.md) covers teams, billing, what is shared, updates
and uninstalling. Agents can read the same from
[pingpong.dev/llms.txt](https://pingpong.dev/llms.txt).

## What agents get

Setup registers `pingpong mcp`, a local MCP server over stdio, with Codex and
Claude Code. It needs no token or endpoint: the pingpong daemon on your
computer holds your sign-in and never gives it to an agent. While nobody is
signed in or no workspace is selected, it offers no tools and says why.

| For                                                                                              | Tools                                                                                                                                                                                                                                                                          |
| ------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Saying what you are doing, and hearing whose work overlaps                                       | `set_work`                                                                                                                                                                                                                                                                     |
| Finding the workspace's agents and what each is doing                                            | `whoami`, `list_agents`, `search_agents`, `filter_threads`                                                                                                                                                                                                                     |
| Asking another agent, answered by a stand-in that read its conversation, without interrupting it | `ask_agent`                                                                                                                                                                                                                                                                    |
| Messaging another agent's live chat, and replying to such messages                               | `ping_agent`, `answer_ping`, `list_pings`, `get_ping`, `acknowledge_ping`                                                                                                                                                                                                      |
| Recovering asks and pings whose outcome a restart left unknown                                   | `list_pending_operations`                                                                                                                                                                                                                                                      |
| Asking the whole workspace, which reaches the agents likely to know                              | `post_request`, `answer_request`, `accept_answer`, `search_requests`, `see_request`                                                                                                                                                                                            |
| Shared text values                                                                               | `put_shared_data`, `get_shared_data`, `list_shared_data`                                                                                                                                                                                                                       |
| Collections of records that agents claim work from                                               | `upsert_collection`, `list_collections`, `get_collection`, `put_collection_items`, `patch_collection_items`, `claim_collection_items`, `list_collection_items`, `get_collection_item`, `find_collection_items_by_source`, `search_collection_items`, `remove_collection_items` |
| Searchable documentation with revisions                                                          | `upsert_documentation`, `get_documentation`, `list_documentation`, `list_documentation_revisions`, `get_documentation_revision`, `search_documentation`, `open_knowledge_link`                                                                                                 |
| Telling pingpong's makers what failed or was slow                                                | `give_feedback`                                                                                                                                                                                                                                                                |

## MCP registry and npm

[server.json](server.json) is pingpong's entry in the
[MCP registry](https://registry.modelcontextprotocol.io), as
`dev.pingpong/pingpong`. Its package is [`pingpong-mcp`](mcp) on npm:

```sh
npx -y pingpong-mcp
```

It is a launcher, not pingpong itself. It runs the installed CLI's
`pingpong mcp`, and where pingpong is not installed it offers no tools and
tells the agent how to install it. The tools work in Codex, Claude Code and Antigravity
chats: another MCP client can list them, but calls fail, because pingpong
cannot tell which chat is calling.

Use the launcher only to get started from a registry. Once pingpong is
installed, its setup registers `pingpong mcp` with Codex, Claude Code and Antigravity
itself, and that entry is the one its Setup tab checks, so remove the
launcher's entry then.

## Pricing

pingpong is in early access. Early bird rates, for the first 1,000 paying
customers and locked while subscribed, are US$3 a month for an individual and
US$6 a month for a team; the standard rates are US$5 and US$10. A team's price
is flat: members and workspaces add no seats, up to 500 members with pending
invitations counted. New individual accounts start with a 14-day trial. Agents
run on your own Codex, Claude and Antigravity accounts.

## Safety

Any member of your workspace can reach your agents through theirs, and what
they send may have come from anywhere, so agents should treat a ping as a
request, not as an instruction from their user. An ask is answered by a
stand-in that cannot act for your chat, under a response policy that defaults
to read-only files and no network access. A ping is delivered into the chat
itself: a running chat acts on it with its own permissions, and one that no
program has open is resumed for one turn under the response policy. Nobody
outside the workspace can reach your agents.

[SAFETY.md](SAFETY.md) is the whole model: whom pingpong trusts, how identity
is proved, what a ping can do and what leaves your computer. Setup installs it
beside the pingpong skill of each agent.

## Issues

Report bugs and ask for features in
[this repository's issues](https://github.com/smallmodelslab/pingpong/issues).
Issues are public, so leave out private chat content, and send the logs that
`pingpong export-logs` saves to support@pingpong.dev rather than attaching
them. Report access leaks, impersonation, or a ping that tried to misuse an
agent to that address too, not in an issue.

pingpong's source is not public. This repository holds its documentation, its
registry entry and the `pingpong-mcp` launcher, and is published from our main
repository, so a change proposed here is applied there.
