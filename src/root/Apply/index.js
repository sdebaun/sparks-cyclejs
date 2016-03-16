import {Observable} from 'rx'
import isolate from '@cycle/isolate'

import ComingSoon from 'components/ComingSoon'
import SoloFrame from 'components/SoloFrame'
import Title from 'components/Title'

// export default ComingSoon('Apply')

import {rows, nestedComponent} from 'util'

import {col} from 'helpers'

const Glance = ComingSoon('Apply/Glance')
const Opp = ComingSoon('Apply/Opp/#')

const _routes = {
  // isolating breaks child tab navigation?
  // '/': isolate(Glance),
  // '/manage': isolate(Manage),
  '/': Glance,
  '/opp/:key': key => sources =>
    isolate(Opp)({oppKey$: Observable.just(key), ...sources}),
}

export default sources => {
  const projectKey$ = sources.projectKey$

  // const projectImage$ = projectKey$
  //   .flatMapLatest(projectKey => sources.firebase('ProjectImages',projectKey))

  const project$ = projectKey$
    .flatMapLatest(projectKey => sources.firebase('Projects',projectKey))

  // const teams$ = projectKey$
  //   .flatMapLatest(projectKey => sources.firebase('Teams',{
  //     orderByChild: 'projectKey',
  //     equalTo: projectKey,
  //   }))

  const opps$ = projectKey$
    .flatMapLatest(projectKey => sources.firebase('Opps', {
      orderByChild: 'projectKey',
      equalTo: projectKey,
    }))

  const oppRows$ = opps$.map(rows)

  const title = Title({
    labelText$: project$.pluck('name'),
    subLabelText$: oppRows$.map(opps =>
      opps.length + ' Opportunities Available'
    ),
    oppRows$,
    ...sources,
  })

  const page$ = nestedComponent(sources.router.define(_routes),sources)

  const pageDOM = col(title.DOM, page$.flatMapLatest(({DOM}) => DOM))

  const frame = SoloFrame({pageDOM, ...sources})

  const DOM = frame.DOM

  const route$ = frame.route$

  // const queue$ = frame.queue$

  const auth$ = frame.auth$

  return {
    DOM,
    route$,
    // queue$,
    auth$,
  }
}
