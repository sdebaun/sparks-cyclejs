import {Observable as $} from 'rx'
import {h} from 'cycle-snabbdom'
import {hideable} from 'util'

import isolate from '@cycle/isolate'

import {SidedrawerTitle} from 'components/Title'
import {MediumProfileAvatar} from 'components/profile'

import {
  ListItem,
  ListItemNavigating,
  ListItemCollapsible,
  List,
} from 'components/sdm'

import {
  Opps,
  Projects,
} from 'components/remote'

import {combineDOMsToDiv} from 'util'

require('./SideNav.scss')

const _Title = sources => SidedrawerTitle({...sources,
  titleDOM$: sources.userName$,
  subtitleDOM$: $.of('Welcome'),
  leftDOM$: MediumProfileAvatar({...sources,
    profileKey$: sources.userProfileKey$,
  }).DOM,
  classes$: $.of(['profile']),
})

const _Welcome = sources => hideable(ListItem)({...sources,
  title$: $.just('Welcome to the Sparks.Network!'),
  isVisible$: sources.navItemCount$.map(c => c === 0),
})

const _HelpLink = sources => isolate(ListItem)({...sources,
  title$: $.just(h('a',{
    props: {
      href: 'mailto:help@sparks.network',
    },
  },['Got questions?'])),
})

const EngagementItem = sources => {
  const opp$ = sources.item$.pluck('oppKey')
    .flatMapLatest(Opps.query.one(sources))
    .shareReplay(1)

  const project$ = opp$.pluck('projectKey')
    .flatMapLatest(Projects.query.one(sources))
    .shareReplay(1)

  return ListItemNavigating({...sources,
    classes$: $.just({'menu-item': true}),
    title$: project$.pluck('name'),
    path$: sources.item$.pluck('$key').map(k => `/engaged/${k}`),
    subtitle$: opp$.pluck('name'),
  })
}

const EngagementList = sources => List({...sources,
  Control$: $.just(EngagementItem),
  rows$: sources.user.engagements$,
})

const ProjectOppItem = sources => ListItemNavigating({...sources,
  classes$: $.just({'mini-menu-item': true}),
  title$: sources.item$.pluck('name'),
  path$: sources.item$.pluck('$key').map(k => `/opp/${k}`),
  // subtitle$: $.just('Project Owner'),
})

const ProjectPriorityItem = sources => ListItemNavigating({...sources,
  classes$: $.just({'mini-menu-item': true}),
  title$: $.just('Priority'),
  path$: sources.item$.pluck('$key').map(k => `/project/${k}`),
  // subtitle$: $.just('Project Owner'),
})

const ProjectItem = sources => {
  const prior = isolate(ProjectPriorityItem)(sources)
  const ol = List({...sources,
    Control$: $.just(ProjectOppItem),
    rows$: sources.item$.pluck('$key')
      .flatMapLatest(Opps.query.byProject(sources))
      .shareReplay(1),
  })

  const li = ListItemCollapsible({...sources,
    classes$: $.just({'menu-item': true}),
    title$: sources.item$.pluck('name'),
    // path$: sources.item$.pluck('$key').map(k => `/project/${k}`),
    subtitle$: $.just('Project Owner'),
    contentDOM$: combineDOMsToDiv('',prior,ol),
  })

  return {
    ...li,
    route$: $.merge(ol.route$, prior.route$),
  }
}

// const ProjectItem = sources => ListItemNavigating({...sources,
//   classes$: $.just('.menu-item'),
//   title$: sources.item$.pluck('name'),
//   path$: sources.item$.pluck('$key').map(k => `/project/${k}`),
//   subtitle$: $.just('Project Owner'),
// })

export const SideNav = _sources => {
  const sources = {..._sources,
    navItemCount$: $.combineLatest(
        _sources.user.projectsOwned$,
        _sources.user.engagements$,
        (p,e) => p.length + e.length
      ),
  }

  const t = _Title(sources)
  const wel = _Welcome(sources)
  const pl = List({...sources,
    Control$: $.just(ProjectItem),
    rows$: sources.user.projectsOwned$,
  })
  const el = EngagementList(sources)
  const help = _HelpLink(sources)

  // const route$ = sources.DOM.select('')
  return {
    DOM: combineDOMsToDiv('', t, wel, pl, el, help),
    route$: $.merge(t.route$, pl.route$, el.route$),
  }
}
