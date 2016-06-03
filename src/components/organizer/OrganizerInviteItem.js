import {Observable} from 'rx'
const {just} = Observable
// import combineLatestObj from 'rx-combine-latest-obj'

import isolate from '@cycle/isolate'

import {Organizers} from 'components/remote'

import {
  ListItemWithMenu,
  ListItemClickable,
  ListItemNavigating,
} from 'components/sdm'

const Delete = sources => ListItemClickable({...sources,
  iconName$: just('remove'),
  title$: just('Remove'),
})

const View = sources => ListItemNavigating({...sources,
  iconName$: just('remove'),
  title$: just('View Invite Page'),
  path$: sources.item$.map(({$key}) => '/organize/' + $key),
})

const OrganizerInviteItem = sources => {
  const deleteItem = isolate(Delete,'delete')(sources)
  const viewItem = isolate(View,'view')(sources)

  const listItem = ListItemWithMenu({...sources,
    iconName$: just('mail_outline'),
    title$: sources.item$.map(({inviteEmail}) => inviteEmail),
    menuItems$: just([deleteItem.DOM, viewItem.DOM]),
  })

  const queue$ = deleteItem.click$
    .flatMapLatest(sources.item$)
    .pluck('$key')
    .withLatestFrom(sources.projectKey$,
      (key, projectKey) => ({key, projectKey})
    )
    .map(Organizers.action.remove)

  return {
    DOM: listItem.DOM,
    route$: viewItem.route$,
    queue$,
  }
}

// const OrganizerInviteList = sources => List({...sources,
//   Control$: just(OrganizerInviteItem),
// })

export {OrganizerInviteItem}
