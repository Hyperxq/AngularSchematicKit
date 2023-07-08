import { FolderStructure } from '../../scaffold.interfaces';

export const ATOMICDESIGN: FolderStructure[] = [
  {
    name: 'pages',
    hasShortPath: true,
  },
  {
    name: 'shared',
    hasShortPath: true,
    hasModule: true,
    children: [
      {
        name: 'components',
        children: [
          { name: 'atoms' },
          { name: 'molecules' },
          { name: 'organisms' },
          { name: 'templates' },
        ],
      },
      {
        name: 'directives',
      },
    ],
  },
];