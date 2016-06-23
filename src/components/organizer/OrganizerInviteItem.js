import {Observable as $} from 'rx'
const {just} = $
import {prop, objOf} from 'ramda'

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
  iconName$: just('eye'),
  title$: just('View Invite Page'),
  path$: sources.item$.map(({$key}) => '/organize/' + $key),
})

const Resend = sources => ListItemClickable({
  ...sources,
  iconName$: just('send'),
  title$: just('Resend Invite Email'),
})

const OrganizerInviteItem = sources => {
  const deleteItem = isolate(Delete,'delete')(sources)
  const viewItem = isolate(View,'view')(sources)
  const resendItem = isolate(Resend,'resend')(sources)

  const listItem = ListItemWithMenu({...sources,
    iconName$: just('mail_outline'),
    title$: sources.item$.map(prop('inviteEmail')),
    subtitle$: sources.item$.map(prop('authority')),
    menuItems$: just([resendItem.DOM, deleteItem.DOM, viewItem.DOM]),
  })

  const deleteQueue$ = deleteItem.click$
    .flatMapLatest(sources.item$)
    .map(prop('$key'))
    .withLatestFrom(sources.projectKey$,
      (key, projectKey) => ({key, projectKey})
    )
    .map(Organizers.action.remove)

  const resendQueue$ = resendItem.click$
    .flatMapLatest(sources.item$)
    .map(prop('$key'))
    .map(objOf('key'))
    .map(Organizers.action.resend)

  return {
    DOM: listItem.DOM,
    route$: viewItem.route$,
    queue$: $.merge(deleteQueue$, resendQueue$),
  }
}

export {OrganizerInviteItem}
