import isolate from '@cycle/isolate'
import {div, button} from 'cycle-snabbdom'
import {Observable as $} from 'rx'
import {filter, prop, propEq, map} from 'ramda'

import {List, ListItem, ListItemCollapsibleDumb} from 'components/sdm'
import {ShiftContent} from 'components/shift'
import {Profiles} from 'components/remote'
import {localTime} from 'util'

function ProfileItem(sources) {
  return ListItem({...sources,
    title$: sources.item$.pluck('fullName'),
    iconSrc$: sources.item$.pluck('portraitUrl'),
    subtitle$: sources.item$.map(item => `${item.phone} - ${item.email}`),
  })
}

function buildSubtitle([subtitle, shift]) {
  return subtitle + ' - ' + localTime(shift.date).format('dddd, MM-DD-YYYY')
}

function ShiftItem(sources) {
  const content = ShiftContent(sources)

  const subtitle$ = $.combineLatest(content.subtitle$, sources.item$)
    .map(buildSubtitle)

  const assignments$ = sources.teamInfo$.pluck('assignments')
    .withLatestFrom(sources.item$, (memberships, item) =>
      filter(propEq('shiftKey', item.$key), memberships)
    )

  const profiles$ = assignments$.map(map(prop('profileKey')))
    .map(filter(Boolean))
    .map(map(Profiles.query.one(sources)))
    .flatMapLatest($.combineLatest)
    .shareReplay(1)

  const contentDOM$ =
    prop('DOM', List({...sources,
      rows$: profiles$,
      Control$: $.just(ProfileItem),
    }))
    .startWith(div({}, [null]))
    .shareReplay(1)

  const isOpen$ = contentDOM$.map(v => v.children[0] !== null)

  const li = ListItemCollapsibleDumb({...sources, ...content,
    subtitle$,
    contentDOM$,
    isOpen$,
  })

  return {...li}
}

function shiftsView(shifts) {
  return div({}, [
    button('.print', {}, ['Click here to print this schedule']),
    div('.printable', {}, [shifts]),
  ])
}

function wrapWithShiftTitle(sources) {
  return function shiftTitle(html) {
    return sources.teamInfo$.pluck('team', 'name')
      .map(name =>
        `<div>
          <h3>${name}</h3>
          <div>${html}</html>
        </div>
        `
      )
  }
}

function Shifts(sources) {
  const print$ = sources.DOM.select('.print').events('click')
  const printable$ = sources.DOM.select('.printable')
    .observable
    .filter(e => e.length === 1)
    .map(e => e[0].innerHTML)
    .flatMapLatest(wrapWithShiftTitle(sources))

  const li = List({...sources,
    rows$: sources.teamInfo$.pluck('shifts'),
    Control$: $.of(ShiftItem),
  })

  return {...li,
    DOM: li.DOM.map(shiftsView),
    openAndPrint: printable$.sample(print$),
  }
}

export default sources => isolate(Shifts, 'shifts')(sources)
