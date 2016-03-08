// naive first pass

export default {
  Projects: {
    create: (payload) => ({
      domain: 'Projects',
      action: 'create',
      payload,
    }),
  },
}
