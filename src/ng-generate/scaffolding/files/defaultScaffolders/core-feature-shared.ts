export const CFS: unknown = {
  projects: [
    {
      name: 'default',
      structure: [
        {
          name: 'core',
          module: {
            routing: true,
          },
          children: [
            {
              name: 'service',
              component: [{ name: 'header' }, { name: 'footer' }, { name: 'breadcrumb' }],
              service: [{ name: 'auth' }, { name: 'logger' }],
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
          module: {
            routing: true,
          },
        },
      ],
    },
  ],
};

