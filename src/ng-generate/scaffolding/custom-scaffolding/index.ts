import { ScaffoldOptions } from '../scaffold.interfaces';
import { Rule, Tree } from '@angular-devkit/schematics';

export function scaffolding(_options: ScaffoldOptions): Rule {
  return async (_tree: Tree) => {};
}