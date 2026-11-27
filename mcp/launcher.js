#!/usr/bin/env node
// Runs the installed pingpong CLI's MCP server, `pingpong mcp`, on this
// process's stdin and stdout. Where the CLI is missing it stays connected as a
// server with no tools whose instructions say how to install pingpong, so the
// agent can tell its user instead of the client showing only a failed server.
import { spawn } from "node:child_process"
import { accessSync, constants, readFileSync, statSync } from "node:fs"
import { homedir } from "node:os"
import { delimiter, isAbsolute, join, sep } from "node:path"
import { createInterface } from "node:readline"

const CLI = process.platform === "win32" ? "pingpong.exe" : "pingpong"

const MISSING =
  "pingpong is not installed on this computer, so it offers no tools. It connects the Codex, Claude Code and Antigravity agents in a workspace and needs an account: https://pingpong.dev/auth/sign-up. On macOS or Linux, install it with `curl -fsSL https://pingpong.dev/install | sh`. On Windows, or for the desktop app on a Mac, sign in at https://pingpong.dev/dashboard and choose Download. Setup connects Codex, Claude Code and Antigravity, and a chat started after that has the tools. If pingpong is installed outside ~/.local/bin, set PINGPONG_INSTALL_DIR to its folder. More: https://pingpong.dev/llms.txt"

function executable(path) {
  try {
    accessSync(path, constants.X_OK)
    return statSync(path).isFile()
  } catch {
    return false
  }
}

/**
 * The CLI where the installer and the desktop app put it, or in the folder
 * the installer was pointed at when the client passes that on. PATH is not
 * searched: npx puts the current project's own binaries first on it. A folder
 * is used as written, so the file checked is the file started.
 */
function installedCli() {
  return [process.env.PINGPONG_INSTALL_DIR, join(homedir(), ".local", "bin")]
    .filter((directory) => directory && isAbsolute(directory))
    .map((directory) => `${directory}${sep}${CLI}`)
    .find(executable)
}

/** Hands the client's stdio to the CLI and ends as it ends. */
function run(cli) {
  // npx puts the current project's binaries first on PATH. The CLI may start
  // pingpong's daemon, which finds Codex and Claude there, so take them out.
  process.env.PATH = (process.env.PATH ?? "")
    .split(delimiter)
    .filter((directory) => !directory.endsWith(join("node_modules", ".bin")))
    .join(delimiter)
  const child = spawn(cli, ["mcp"], { stdio: "inherit" })
  for (const signal of ["SIGINT", "SIGTERM", "SIGHUP"])
    process.on(signal, () => child.kill(signal))
  child.on("error", (error) => {
    console.error(`pingpong-mcp could not start ${cli}: ${error.message}`)
    process.exit(1)
  })
  child.on("exit", (code) => process.exit(code ?? 1))
}

function reply(method) {
  switch (method) {
    case "initialize": {
      const { version } = JSON.parse(
        readFileSync(new URL("package.json", import.meta.url), "utf8")
      )
      return {
        result: {
          // The one protocol version `pingpong mcp` speaks.
          protocolVersion: "2025-06-18",
          capabilities: { tools: { listChanged: false } },
          serverInfo: { name: "pingpong", version },
          instructions: MISSING,
        },
      }
    }
    case "ping":
      return { result: {} }
    case "tools/list":
      return { result: { tools: [] } }
    case "tools/call":
      return {
        result: { content: [{ type: "text", text: MISSING }], isError: true },
      }
    default:
      return {
        error: {
          code: -32601,
          message: `MCP method ${JSON.stringify(method)} is not implemented.`,
        },
      }
  }
}

/** Answers MCP requests, one JSON message per line, until the client leaves. */
function explain() {
  console.error(MISSING)
  createInterface({ input: process.stdin }).on("line", (line) => {
    let message
    try {
      message = JSON.parse(line)
    } catch {
      message = null
    }
    // Notifications and anything that is not a request get no reply.
    if (message?.jsonrpc !== "2.0" || typeof message.method !== "string") return
    if (typeof message.id !== "string" && typeof message.id !== "number") return
    process.stdout.write(
      `${JSON.stringify({ jsonrpc: "2.0", id: message.id, ...reply(message.method) })}\n`
    )
  })
}

const cli = installedCli()
if (cli) run(cli)
else explain()
