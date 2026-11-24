import assert from "node:assert/strict"
import { spawnSync } from "node:child_process"
import {
  chmodSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  writeFileSync,
} from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { test } from "node:test"
import { fileURLToPath } from "node:url"

const launcher = fileURLToPath(new URL("launcher.js", import.meta.url))
const read = (file) =>
  JSON.parse(readFileSync(new URL(file, import.meta.url), "utf8"))

/** A folder holding a stand-in CLI that names its argument, echoes stdin and exits 7. */
function standIn(bin) {
  mkdirSync(bin, { recursive: true })
  writeFileSync(
    join(bin, "pingpong"),
    '#!/bin/sh\necho "$1"\n/bin/cat\nexit 7\n'
  )
  chmodSync(join(bin, "pingpong"), 0o755)
  return bin
}

/** Runs the launcher with `home` as its home and nothing else in its environment. */
function launch(home, env, input) {
  return spawnSync(process.execPath, [launcher], {
    input,
    encoding: "utf8",
    env: { HOME: home, USERPROFILE: home, ...env },
  })
}

const temporary = () => mkdtempSync(join(tmpdir(), "pingpong-mcp-"))

for (const place of ["~/.local/bin", "PINGPONG_INSTALL_DIR"])
  test(
    `hands stdio and the exit code to the CLI in ${place}`,
    { skip: process.platform === "win32" },
    () => {
      const home = temporary()
      const env =
        place === "PINGPONG_INSTALL_DIR"
          ? { PINGPONG_INSTALL_DIR: standIn(temporary()) }
          : (standIn(join(home, ".local", "bin")), {})
      const { stdout, status } = launch(home, env, "from the client\n")
      assert.equal(stdout, "mcp\nfrom the client\n")
      assert.equal(status, 7)
    }
  )

test("without the CLI, serves no tools and says how to install it", () => {
  // A `pingpong` on PATH, as a project's dependency would put there, is not it.
  const path = process.platform === "win32" ? temporary() : standIn(temporary())
  const requests = [
    {
      jsonrpc: "2.0",
      id: 1,
      method: "initialize",
      params: { protocolVersion: "2025-06-18" },
    },
    { jsonrpc: "2.0", method: "notifications/initialized" },
    { jsonrpc: "2.0", id: 2, method: "tools/list" },
  ]
  const { stdout, stderr, status } = launch(
    temporary(),
    { PATH: path },
    requests.map((request) => `${JSON.stringify(request)}\n`).join("")
  )
  const [initialized, listed, ...rest] = stdout
    .trim()
    .split("\n")
    .map((line) => JSON.parse(line))
  assert.deepEqual(rest, [])
  assert.equal(initialized.id, 1)
  assert.match(initialized.result.instructions, /pingpong\.dev\/install/)
  assert.deepEqual(listed, { jsonrpc: "2.0", id: 2, result: { tools: [] } })
  assert.match(stderr, /not installed/)
  assert.equal(status, 0)
})

test("the registry entry names this package and version", () => {
  const { name, version, mcpName } = read("package.json")
  const server = read("../server.json")
  assert.equal(server.name, mcpName)
  assert.equal(server.version, version)
  assert.deepEqual(
    server.packages.map(({ identifier, version }) => [identifier, version]),
    [[name, version]]
  )
})
