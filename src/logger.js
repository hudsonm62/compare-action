const core = require("@actions/core")
const fs = require("fs")
//import { appendFile } from "node:fs"

const logPathInput = core.getInput("log_path")
const logPath = core.toPlatformPath(logPathInput)

// should we write logs?
let bWriteLog = false
if (logPathInput !== "" || logPath !== null) {
  bWriteLog = true // yes because we must have a path
}

/**
 * Handles error messages properly
 * @param {string} err The error message to display
 * @param {boolean} bNoError If true, then only throws at info-level
 * @param {boolean} bWarnOnly If true, then only throws at warning-level
 * @returns {string} The error message
 */
function myError(err, bNoError = false, bWarnOnly = false) {
  if (!bNoError) {
    writeLog(err)
    if (bWarnOnly) {
      core.warning(err)
    } else {
      core.error(err)
      throw new Error(err) // and fail the action (runWrapper handles actual failure)
    }
  } else {
    echo(err)
  }
}

/**
 * Echoes a message to the console
 * @param {string} str The message to display
 */
function echo(str) {
  core.info(str)
  writeLog(str)
  return str
}

// writes to file
function writeLog(str) {
  if (bWriteLog) {
    const now = new Date()
    const time = now.toISOString().replace(/\..+/, "")
    fs.appendFile(logPath, time + " " + str + "\n", (err) => {})
  }
}

export { echo, myError }
