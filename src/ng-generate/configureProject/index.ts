import { ConfigureProjectOptions } from './configure-project.interfaces';
import { chain, Rule, schematic } from '@angular-devkit/schematics';

export function configureProject(options: ConfigureProjectOptions): Rule {
  return () => {
    const { schematicNames } = options;
    let calls: Rule[] = [];
    schematicNames.forEach((schematicName) => {
      calls.push(schematic(schematicName, {}));
    });
    return chain(calls);
  };
}