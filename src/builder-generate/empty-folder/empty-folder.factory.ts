import {
  apply,
  applyTemplates,
  filter,
  MergeStrategy,
  mergeWith,
  move,
  renameTemplateFiles,
  strings,
  Tree,
  url,
} from '@angular-devkit/schematics';

export function emptyFolderFactory({ name }: { name: string }) {
  return (tree: Tree) => {
    const urlTemplates = ['.gitkeep.template'];
    const template = apply(url('./files'), [
      filter((path) => urlTemplates.some((template) => path.includes(template))),
      applyTemplates({
        ...strings,
      }),
      renameTemplateFiles(),
      move(`./${name}`),
    ]);
    return mergeWith(template, MergeStrategy.AllowCreationConflict);
  };
}
