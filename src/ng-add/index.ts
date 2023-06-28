import { SchematicContext, Rule, Tree, chain } from '@angular-devkit/schematics';

export default function (_options: unknown): Rule {
    return (_tree: Tree, _context: SchematicContext) => {
        return chain([]);
    };
}
