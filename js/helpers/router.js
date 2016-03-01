function nestedComponent({path$, value$}, sources) {
  return path$.zip(value$,
    (path, value) => value({...sources, router: sources.router.path(path)})
  ).shareReplay(1)
}

export {nestedComponent}
