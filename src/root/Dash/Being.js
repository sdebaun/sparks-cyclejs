import {h, ul} from 'cycle-snabbdom'
import {Observable} from 'rx'
const {combineLatest, of, merge} = Observable
import isolate from '@cycle/isolate'
import {div} from 'helpers'

import {LargeProfileAvatar} from 'components/profile'

import {
  Profiles,
} from 'components/remote'

import {
  ListItemHeader,
  ListItemCollapsibleTextArea,
  RaisedButton,
  TextAreaControl,
} from 'components/sdm'

const ProfileInfo = sources => ({
  DOM: sources.userProfile$
    .map(profile =>
    div({}, [
      h('h4', {}, `${profile.fullName}`),
      h('p', {}, `${profile.email}`),
      h('p', {}, `${profile.phone}`),
    ])
  ),
})

const _Profile = sources => {
  const av = LargeProfileAvatar({...sources,
    src$: sources.userProfile$.map(up => up && up.portraitUrl),
  })
  const pi = ProfileInfo(sources)
  const ed = RaisedButton({...sources,
    label$: of('Edit Profile'),
  })

  const DOM = combineLatest(
      av.DOM,
      pi.DOM,
      // ed.DOM,
      (avatar,...rest) => div('.row',[
        div('.col-xs-12.col-md-6.center',[avatar]),
        div('.col-cs-12.col-md-6.center',rest),
      ]),
    )

  return {
    DOM,
    openEdit$: ed.click$,
  }
}

const _Intro = sources => ListItemCollapsibleTextArea({...sources,
  isOpen$: sources.userProfile$.pluck('intro').map(v => !v),
  value$: sources.userProfile$.pluck('intro'),
  title$: of('Introduce Yourself!'),
  subtitle$: of(`
    Give people a quick glimpse of how awesome you are.
    This is the first thing they see on your applications.
  `),
  iconName$: of('playlist_add'),
  okLabel$: of('i am amazing'),
  cancelLabel$: of('hang on'),
})

const _Skills = sources => ListItemCollapsibleTextArea({...sources,
  isOpen$: sources.userProfile$.pluck('skills').map(v => !v),
  value$: sources.userProfile$.pluck('skills'),
  title$: of('What Else?'),
  subtitle$: of(`
    Organizers who want to dig deeper will be able to read
    this additional info if they want to.
  `),
  iconName$: of('playlist_add'),
  okLabel$: of('that\'s it'),
  cancelLabel$: of('nope'),
})

const _Edit = sources => {
  return {
    DOM: of(div({},['edit'])),
  }
}

const _About = sources => {
  const hd = ListItemHeader({...sources, title$: of('About You')})
  const int = isolate(_Intro,'intro')(sources)
  const sk = isolate(_Skills,'skills')(sources)

  const updateIntro$ = int.value$
    .withLatestFrom(sources.userProfileKey$, (intro,key) =>
      ({key, values: {intro}})
    )

  const updateSkills$ = sk.value$
    .withLatestFrom(sources.userProfileKey$, (skills,key) =>
      ({key, values: {skills}})
    )

  return {
    DOM: combineLatest(
      [hd,int,sk].map(c => c.DOM),
      (...doms) => div({},doms)
    ),
    queue$: merge(
      updateIntro$,
      updateSkills$,
    ).map(Profiles.action.update),
  }
}

export default sources => {
  const pr = _Profile(sources)
  const ed = _Edit(sources)
  const ab = _About(sources)

  const DOM = combineLatest(
    of(false),
    // pr.openEdit$.scan(a => !a, false).startWith(false),
    pr.DOM,
    ed.DOM,
    ab.DOM,
    (openEdit, profile, edit, about) => div({},[
      profile,
      openEdit ? edit : null,
      about,
    ])
  )

  return {
    DOM,
    queue$: ab.queue$,
  }
}
