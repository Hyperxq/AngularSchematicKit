export const CFS: unknown = {
  projects: [
    {
      name: 'default',
      structure: [
        {
          name: 'core',
          module: {
            flat: true,
          },
          children: [
            {
              name: 'layout',
              component: {
                name: 'main-layout',
              },
            },
          ],
        },
        {
          name: 'features',
          hasShortPath: true,
          children: [
            {
              name: 'home',
              component: {
                flat: true,
              },
              module: {
                flat: true,
                routing: true,
              },
            },
            {
              name: 'admin',
              component: {
                flat: true,
              },
              module: {
                flat: true,
                routing: true,
              },
            },
          ],
        },
        {
          name: 'shared',
          component: {
            name: 'tag-list',
          },
          module: {
            flat: true,
          },
        },
      ],
    },
  ],
};

