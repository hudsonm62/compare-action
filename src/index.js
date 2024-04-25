// Compare Action 🔃

const core = require("@actions/core")
const compare = require("dir-compare")

// log strings
const noDiff = "All files ARE matching - No differences found."
const diffFound = "Differences were found, files are NOT matching."

/**
 * Handles error messages properly
 * @param bNoError If true, then only throws at info-level
 * @param bWarnOnly If true, then only throws at warning-level
 */
function myError(err, bNoError = false, bWarnOnly = false) {
  const shouldErr = !bNoError
  if (shouldErr) {
    if (bWarnOnly) {
      core.warning(err)
      return
    }
    core.error(err)
    // and fail the action (runWrapper handles actual failure)
    process.exit(1)
  }
  core.info(err)
}

function makeResults(results) {
  const equal =
    results.equal === 0
      ? `No items are equal`
      : results.equal === 1
        ? `1 item is equal`
        : `${results.equal} items are equal`
  const distinct =
    results.distinct === 0
      ? `No orphan/distinct items`
      : results.distinct === 1
        ? `1 item is an orphan/distinct`
        : `${results.distinct} items are orphans/distinct`
  const differences =
    results.differences === 0
      ? `No differences found`
      : results.differences === 1
        ? `1 difference found`
        : `${results.differences} differences found`
  const total =
    results.total === 0
      ? `No items were checked`
      : results.total === 1
        ? `1 item was checked`
        : `${results.total} items were checked`

  const str = `${equal}, ${distinct}, and ${differences}. - Total Checked: ${total}`
  core.notice(str, { title: "File Comparison Results" })
}

/**
 * The actual function that works out the end result of the action
 * @param results Results from the diff
 */
function sortDiff(results, options) {
  const { diffSet, differences } = results
  const { bOutputDiff, bNoError, bErrorSame } = options

  core.debug("Diff Results: " + JSON.stringify(results))
  core.debug("Diff Options: " + JSON.stringify(options))

  if (bOutputDiff) {
    let differenceString
    diffSet.forEach(({ relativePath, name1, type1, state, name2, type2 }) => {
      differenceString = `${relativePath}/${name1} (${type1}): ${state} - ${name2} (${type2})`
      core.info(differenceString)
    })
  }

  // Result: No differences
  if (differences <= 0) {
    core.debug = `- RESULT CASE: No differences: ${differences}`
    if (bErrorSame) {
      core.debug = `RESULT OPTION: Erroring same`
      myError(noDiff, bNoError, options.bWarnInstead)
      return
    } else {
      core.debug = `RESULT OPTION: Not erroring same`
      // Most common case
      core.info(noDiff)
      return
    }
  }

  core.debug = `- RESULT CASE: Differences detected: ${differences}`
  // Result: Differences found
  if (differences > 0 && bErrorSame === false) {
    core.debug = `RESULT OPTION: Erroring differences`
    myError(diffFound, bNoError, options.bWarnInstead)
    return
  }

  // Result: Differences found (but no error specified)
  core.debug = `RESULT OPTION: Not erroring differences`
  core.info(diffFound)
}

async function run() {
  // set paths
  const input1 = core.getInput("path1")
  const input2 = core.getInput("path2")

  const input = {
    path1: core.toPlatformPath(input1),
    path2: core.toPlatformPath(input2),
    globExcludeFilter: core.getInput("exclude"),
    globIncludeFilter: core.getInput("include"),
    bCompareSize: core.getBooleanInput("compare_size"),
    bCompareContent: core.getBooleanInput("compare_content"),
    bWarnInstead: core.getBooleanInput("warn_instead"),
    bErrorSame: core.getBooleanInput("error_same"),
    bNoError: core.getBooleanInput("no_error"),
    bOutputDiff: core.getBooleanInput("output_diff"),
    bCompareDate: core.getBooleanInput("compare_date"),
    bCompareOnlyName: core.getBooleanInput("compare_only_name"),
    bIgnoreNameCase: core.getBooleanInput("ignore_name_case"),
    bIgnoreLineEnding: core.getBooleanInput("ignore_line_ending"),
    bIgnoreWhiteSpace: core.getBooleanInput("ignore_whitespace"),
    bIgnoreAllWhiteSpace: core.getBooleanInput("ignore_all_whitespace"),
    bIgnoreEmptyLines: core.getBooleanInput("ignore_empty_lines"),
    bIgnoreEmptyDirs: core.getBooleanInput("ignore_empty_dirs"),
  }
  core.debug("Input Object: " + JSON.stringify(input))

  let diffOptions = {
    compareFileAsync:
      compare.fileCompareHandlers.lineBasedFileCompare.compareAsync,
    compareSize: input.bCompareSize,
    compareContent: true,
    compareDate: input.bCompareDate,
    includeFilter: input.globIncludeFilter,
    excludeFilter: input.globExcludeFilter,
    ignoreCase: input.bIgnoreNameCase,
    ignoreLineEnding: input.bIgnoreLineEnding,
    ignoreWhiteSpace: input.bIgnoreWhiteSpace,
    ignoreAllWhiteSpace: input.bIgnoreAllWhiteSpace,
    ignoreEmptyLines: input.bIgnoreEmptyLines,
    skipEmptyDirs: input.bIgnoreEmptyDirs,
    noDiffSet: !input.bOutputDiff, // no diff set if not outputting diff
  }

  // compare only names
  if (input.bCompareOnlyName) {
    diffOptions.compareContent = false
    diffOptions.compareSize = false
    //options.compareDate = false;
  }

  compare // run the comparison //
    .compare(input.path1, input.path2, diffOptions)
    .then((res) => {
      makeResults(res)
      sortDiff(res, input)
    })
    .catch((error) => {
      core.error(error)
      process.exit(1) // so runWrapper can catch it
    })
  /////////////////////////////
}

async function runWrapper() {
  try {
    await run()
  } catch (error) {
    core.setFailed("Compare failed: " + error.message)
  }
}

void runWrapper()
