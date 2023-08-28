#!/usr/bin/env node
import chokidar from "chokidar";
import debaunce from "lodash.debounce";
import program from "caporal";
import fs from "fs";
import child_process, { spawn } from "child_process";
import chalk from "chalk";

program
  .version("1.0.0")
  .argument("[filename]", "name of a file to be executed")
  .action(async (arg) => {
    const { filename } = arg;
    const targetFileName: string = filename || "index.js";

    let proc: child_process.ChildProcess;
    const startExecution = debaunce(() => {
      if (proc) {
        proc.kill();
        console.log(chalk.italic.green("[stare] changes detected..."));
      }
      console.log(chalk.green(`[stare] running ${targetFileName}`));
      proc = spawn("node", [targetFileName], { stdio: "inherit" });
    }, 300);

    try {
      await fs.promises.access(targetFileName);
    } catch (err) {
      throw new Error(
        `Could not access file ${targetFileName} or ${targetFileName} doesn't exist`
      );
    }
    chokidar
      .watch(".")
      .on("add", startExecution)
      .on("change", startExecution)
      .on("unlink", startExecution);
  });
program.parse(process.argv);
