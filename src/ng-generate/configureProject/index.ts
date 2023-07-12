import { ConfigureProjectOptions } from './configure-project.interfaces';
import { Rule, schematic } from '@angular-devkit/schematics';

export function configureProject(options: ConfigureProjectOptions): Rule {
  return () => {
    const { schematicNames } = options;
    schematicNames.forEach((schematicName) => {
      schematic(schematicName, {});
    });
  };
}