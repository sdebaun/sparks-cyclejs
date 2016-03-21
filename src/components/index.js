export const NavClicker = sources => ({
  route$: sources.DOM.select('.nav').events('click')
    .map(e => e.ownerTarget.dataset.link),
})

