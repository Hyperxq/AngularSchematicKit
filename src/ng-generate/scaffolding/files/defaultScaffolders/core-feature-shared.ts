import { FolderStructure } from '../../scaffold.interfaces';

export const CFS: FolderStructure[] = [
  {
    name: 'core',

    hasModule: true,
    children: [
      {
        name: 'service',
        children: [{ name: 'data' }, { name: 'logic' }],
      },
    ],
  },
  {
    name: 'features',
    hasShortPath: true,
  },
  {
    name: 'shared',

    hasModule: true,
  },
];