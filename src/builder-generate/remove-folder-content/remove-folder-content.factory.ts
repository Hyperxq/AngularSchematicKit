import { SchematicContext, Tree } from '@angular-devkit/schematics';

export function removeFolderContent({
  name,
  excludeFiles,
}: {
  name: string;
  excludeFiles: string;
}) {
  return (tree: Tree, _context: SchematicContext) => {
    deleteFolderContents(tree, name, processExclusions(excludeFiles || ''));
    _context.logger.info(
      `Deleted all contents within the folder ${name} but preserved the folder itself.`
    );
    return tree;
  };
}

function deleteFolderContents(tree: Tree, path: string, excludeFiles: string[]): void {
  const dir = tree.getDir(path);
  // Iterate over files in the directory and delete them
  dir.subfiles.forEach((file) => {
    if (!excludeFiles.includes(file)) {
      // Check if the file is not in the excludeFiles list
      tree.delete(`${dir.path}/${file}`);
    }
  });
  // Recursively delete the contents of subdirectories
  dir.subdirs.forEach((subDir) => {
    const subDirPath = `${dir.path}/${subDir}`;
    // Recursively delete the contents of this subdirectory
    if (!excludeFiles.includes(subDir)) {
      const subDirPath = `${dir.path}/${subDir}`;
      deleteFolderContents(tree, subDirPath, excludeFiles); // Pass excludeFiles down recursively
      tree.delete(subDirPath);
    }
  });
}

function processExclusions(excludeFiles: string): string[] {
  // Split the string into an array, trimming whitespace from each item
  // and removing any empty strings that result from double commas or trailing commas
  return excludeFiles
    .split(',')
    .map((s) => s.trim())
    .filter((s) => s !== '');
}
