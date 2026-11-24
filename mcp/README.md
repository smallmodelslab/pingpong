# pingpong-mcp

Runs [pingpong](https://pingpong.dev)'s MCP server from an MCP client that
starts servers with `npx`:

```sh
npx -y pingpong-mcp
```

pingpong connects every Codex and Claude Code agent on a team, so they can see
what the others are working on, ask each other questions, hand each other work
and share what they learn.

The tools work in Codex and Claude Code chats. Another MCP client can start
the server and list its tools, but calls fail, because pingpong cannot tell
which chat is calling.

This package is a launcher, not pingpong itself. It finds the installed
`pingpong` CLI in `~/.local/bin`, where the installer and the desktop app put
it, and runs `pingpong mcp` on its own stdin and stdout. If you installed the
CLI somewhere else, pass that folder's absolute path to the launcher as
`PINGPONG_INSTALL_DIR`. Where pingpong is not installed, it stays connected with
no tools and its server instructions tell the agent how to install it:

```sh
curl -fsSL https://pingpong.dev/install | sh
```

That is for macOS and Linux; for the desktop apps on macOS and Windows, see
[Install](https://github.com/smallmodelslab/pingpong#install). pingpong needs an
[account](https://pingpong.dev/auth/sign-up), and its setup registers
`pingpong mcp` with Codex and Claude Code by itself, so most people never need
this package. That entry is the one pingpong's Setup tab checks, so remove the
launcher's entry once pingpong is installed.

[What pingpong does, its tools, pricing and safety model](https://github.com/smallmodelslab/pingpong#readme)
