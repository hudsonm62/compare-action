# Compare Action 🔃

📂 Simply compares 2 paths to see if they are the same or different. Supports globs, dates, and a handful of ignores.

> By default, this will error if there are any differences, but it's behaviour can be configured as needed.

## Usage

```yaml
- uses: actions/checkout@v4
- uses: hudsonm62/compare-action@v1
  with:
    path1: "path/to/first"
    path2: "path/to/second"
    exclude: "**/*.js,**/*.ts"
    #error_same: true
```

## Configuration

### Inputs

| Input                   | Default | Description                                                                                                                        |
| ----------------------- | ------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| `path1`                 | `null`  | The first path to compare (required)                                                                                               |
| `path2`                 | `null`  | The second path to compare (required)                                                                                              |
| `exclude`               | `null`  | Relative [minimatch] Glob pattern to filter out - Specify multiple patterns by separating with a comma (i.e. "`**/*.js,**/*.ts`"). |
| `include`               | `null`  | Relative [minimatch] Glob pattern to filter in - Specify multiple patterns by separating with a comma (i.e. "`**/*.js,**/*.ts`").  |
| `log_path`              | `null`  | This is the path to write the log file. Only turns on file logging if this is set. Doesn't discriminate between `\` and `/`.       |
| `compare_size`          | `true`  | If true, will compare the size of the files (always first).                                                                        |
| `compare_content`       | `true`  | If true, will compare the content of the files.                                                                                    |
| `compare_symlinks`      | `false` | If true, compares symbolic links directly instead of their targets.                                                                |
| `error_same`            | `false` | If true, the action will fail if the files are the same. This changes depending on `no_error` and `warn_instead`                   |
| `no_error`              | `false` | Disable errors. Simply outputs results.                                                                                            |
| `warn_instead`          | `false` | If true, replaces any diff-related failing errors with just a warning.                                                             |
| `output_diff`           | `false` | If true, outputs each compare result to console (matched or not) line by line. Not recommended for large file sets.                |
| `ignore_line_endings`   | `false` | If true, will ignore line endings when comparing files - CRLF/LF.                                                                  |
| `ignore_whitespace`     | `false` | If true, ignore any whitespace only at both the beginning and end of a line.                                                       |
| `ignore_all_whitespace` | `false` | If true, ignores ALL whitespace in files.                                                                                          |
| `ignore_empty_lines`    | `false` | If true, ignores empty lines when comparing files.                                                                                 |
| `ignore_empty_dirs`     | `false` | If true, ignores empty directories when comparing directories.                                                                     |
| `ignore_subdirs`        | `false` | If true, skips subdirectories when comparing directories. Effectively only compares the root of the paths.                         |
| `ignore_name_case`      | `false` | If true, ignores the casing of the file names.                                                                                     |
| `compare_only_name`     | `false` | If true, only compares the name of the files. (can be used in tandem with `compare_date`)                                          |
| `compare_date`          | `false` | If true, will _also_ compare the date of the files. (can be used in tandem with any `compare_**` flags)                            |

### Outputs

| Value           | Description                                                                        |
| --------------- | ---------------------------------------------------------------------------------- |
| `result`        | The result 'enum' of the comparison - `same`, `different`, `error`.                |
| `log_path`      | The path to the log file that was written (assuming `log_path` input has a value). |
| `distinct`      | The total number of items that are orphan/distinct.                                |
| `equal`         | The total number of items that are the same.                                       |
| `different`     | The total number of items with differences.                                        |
| `total_folders` | The total number of folders compared.                                              |
| `total_files`   | The total number of files compared.                                                |
| `total`         | The total number of items compared.                                                |

> Inputs `path1` and `path2` will automatically get converted to their platform-specific path.<br>_Always_ use `/` in your Globs, it will still work.

## Common Problems

- **Exclude Glob isn't working**
  - Double check its actually a [minimatch] glob pattern.
  - Make sure the pattern is relative to the root of the comparing directory (`path1`/`path2`) and NOT your `cwd`.
    - For example, if you want to exclude `thisFolder` folder, you would use something like `**/thisFolder/**` (or `./thisFolder` if it's always in the root of the comparing directory).
- **Out of Memory?**
  - Turn off `output_diff` if you have a large file set, as it prevents the array of results from being created.
  - Alternatively, you can split the Action into multiple steps that compare smaller sets at a time.
  - You can also try playing with the `compare_size` and `compare_content` flags to see if you can reduce the memory usage.
- **"No such file or directory"**
  - Ensure you've checked out your repo
  - Check the job has at least `read` for `contents` permissions.
  - If you're using a relative path, make sure you're in the right directory.
- **`ignore_subdirs` doesn't ignore the directories**
  - Right now, it only ignores items in subdirectories, not the directories themselves.
  - I don't think this is expected behaviour - See [gliviu/dir-compare#77](https://github.com/gliviu/dir-compare/issues/77) for more info.

## Credits

This is essentially an Action wrapper for [dir-compare](https://www.npmjs.com/package/dir-compare). Go check it out out!

## License

This project is licensed under the MIT License

[minimatch]: https://github.com/isaacs/minimatch
