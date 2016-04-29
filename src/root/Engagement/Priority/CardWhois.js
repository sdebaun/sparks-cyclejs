import {Observable as $} from 'rx'

import {hideable} from 'util'

import {
  TitledCard,
  ListItem,
} from 'components/sdm'

import {
  Profiles,
} from 'components/remote'

/*
const ToDoShifts = sources => ToDoListItem({...sources,
  title$: $.of('Choose when you\'d like to work.'),
  isDone$: sources.engagement$.map(m => !!m.isAssigned),
  path$: $.of(sources.router.createHref('/confirmation')),
})

const ToDoPayment = sources => ToDoListItem({...sources,
  title$: $.of('Make your payments.'),
  isDone$: sources.engagement$.map(m => !!m.isPaid),
  path$: $.of(sources.router.createHref('/confirmation')),
})
*/

const BaseCard = sources => {
  const profile$ = sources.engagement$.pluck('profileKey')
    .flatMapLatest(Profiles.query.one(sources))

  const li = ListItem({...sources,
    title$: profile$.pluck('fullName'),
    subtitle$: profile$.map(({email, $key}) => `${email} | ${$key}`),
  })

  return TitledCard({...sources,
    title$: $.just('Applicant View'),
    content$: $.combineLatest(li.DOM),
  })
}

export const CardWhois = sources => hideable(BaseCard)({...sources,
  elevation$: $.just(2),
  isVisible$: $.combineLatest(
    sources.engagement$.pluck('profileKey'),
    sources.userProfileKey$,
    (pk,upk) => pk !== upk
  ),
})
