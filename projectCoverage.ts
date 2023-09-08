import { FileCoverage } from './fileCoverage.ts';
import { basename, relative, resolve } from './deps.ts';

class Row {
  constructor(public coverage:string, public linesWithoutCoverage: string ) {}
}

export class ProjectCoverage {
  linesFound = 0;
  linesHit = 0;

  fileCoverages = new Set<FileCoverage>();
  #table: Record<string, Row> = {};
  #totalHasBeenAdded = false;

  constructor(public name: string = basename(resolve('.'))) {}

  addFileCoverage(...fcs: FileCoverage[]): typeof this {
    const cwd = Deno.cwd();
    for (const fc of fcs) {
      this.fileCoverages.add(fc);
      this.linesFound += fc.linesFound;
      this.linesHit += fc.linesHit;
      this.#table[relative(cwd, fc.name)] = new Row(`${(fc.linesHit / fc.linesFound * 100).toFixed(2)}%`, fc.missingCoverage);
    }
    return this;
  }

  printTable() {
    if (!this.#totalHasBeenAdded) {
      this.#totalHasBeenAdded = true;
      this.#table['Totals:'] = new Row(`${(this.linesHit / this.linesFound * 100).toFixed(2)}%`, 'n/a');
    }
    console.table(this.#table);
  }
}
