const version = require("../package.json").version
const core = require("@actions/core")
const run = require("./action")
async function runWrapper() {
  try {
    core.info(
      `Running Compare Action v${version}\nhttps://github.com/hudsonm62/compare-action`,
    )
    await run()
  } catch (error) {
    core.setFailed("Compare failed: " + error.message)
  }
}

void runWrapper()
