import {Observable} from 'rx'
const {of, merge} = Observable
import {Form} from 'components/ui/Form'
import {Shifts as ShiftsRemote} from 'components/remote'
import {div} from 'cycle-snabbdom'
import {icon} from 'helpers'
import {combineLatestToDiv} from 'util'

import isolate from '@cycle/isolate'

import moment from 'moment'

import {
  List,
  ListItemWithMenu,
  ListItemClickable,
  ListItemWithDialog,
  InputControl,
  Dialog,
} from 'components/sdm'

import {
  ShiftContent,
} from 'components/shift'

import {localTime} from 'util'

const _Fetch = sources => {
  const shifts$ = sources.teamKey$
    .flatMapLatest(ShiftsRemote.query.byTeam(sources))
  const shiftsForDate$ = shifts$
    .combineLatest(sources.date$, (shifts, date) =>
      // shifts.filter(shift => moment.utc(shift.date).format('YYYY-MM-DD') === date)
      shifts.filter(shift => localTime(shift.date).format('YYYY-MM-DD') === date)
        .sort((a,b) => moment(a.start).valueOf() - moment(b.start).valueOf())
    )
  return {shifts$, shiftsForDate$}
}

const ToggleControl = sources => {
  const click$ = sources.DOM.select('.toggle').events('click')
    .map(true)
    .scan((a) => !a, false)
    .startWith(false)
    .shareReplay(1)

  return {
    click$,
    DOM: click$.map(v =>
      div({class: {toggle: true}},[
        v ?
        icon('toggle-on','accent') :
        icon('toggle-off'),
      ])
    ),
  }
}

const ListItemBonusToggle = (sources) => {
  const toggle = ToggleControl(sources)
  const item = ListItemClickable({...sources,
    leftDOM$: toggle.DOM,
    title$: toggle.click$.flatMapLatest(v =>
      v ? sources.titleTrue$ : sources.titleFalse$
    ),
  })

  return {
    DOM: item.DOM,
    value$: toggle.click$,
  }
}

import {ShiftForm} from './ShiftForm'

const AddShift = sources => {
  const form = ShiftForm(sources)
  const liwd = ListItemWithDialog({
    ...sources,
    iconName$: of('calendar-check-o'),
    title$: of('Add a shift.'),
    dialogTitleDOM$: of('Add a shift'),
    dialogContentDOM$: form.DOM,
  })

  const submit$ = liwd.submit$
  const queue$ = form.item$
    .withLatestFrom(
      sources.teamKey$,
      sources.date$,
      ({start, hours, people, bonus}, teamKey, date) => ({
        teamKey,
        date: moment(date).format(),
        reserved: 0,
        hours,
        people,
        bonus,
        start: moment(date).add(start,'hours').format(),
        end: moment(date).add(start,'hours').add(hours,'hours').format(),
      }))
    .sample(submit$)
    .map(ShiftsRemote.action.create)

  return {
    DOM: liwd.DOM,
    queue$,
  }
}

const _Remove = sources => ListItemClickable({...sources,
  iconName$: of('remove'),
  title$: of('Remove'),
})

const _IncHours = sources => ListItemClickable({...sources,
  iconName$: of('plus-square'),
  title$: of('Lengthen'),
})

const _DecHours = sources => ListItemClickable({...sources,
  iconName$: of('minus-square'),
  title$: of('Shrink'),
})

const _IncPeople = sources => ListItemClickable({...sources,
  iconName$: of('user-plus'),
  title$: of('Increase'),
})

const _DecPeople = sources => ListItemClickable({...sources,
  iconName$: of('user-minus'),
  title$: of('Decrease'),
})

const _Edit = sources => ListItemClickable({...sources,
  iconName$: of('pencil'),
  title$: of('Edit'),
})

const _Item = sources => {
  const ed = isolate(_Edit, 'edit')(sources)
  const inc = isolate(_IncHours,'inc')(sources)
  const dec = isolate(_DecHours,'dec')(sources)
  const incp = isolate(_IncPeople)(sources)
  const decp = isolate(_DecPeople)(sources)
  const rm = isolate(_Remove,'remove')(sources)

  const key$ = sources.item$.pluck('$key').shareReplay(1)
  const hours$ = sources.item$.pluck('hours').shareReplay(1)
  const people$ = sources.item$.pluck('people').shareReplay(1)
  const start$ = sources.item$.pluck('start').shareReplay(1)

  const hrChange$ = merge(
    hours$.sample(inc.click$).map(h => parseInt(h) + 1),
    hours$.sample(dec.click$).map(h => parseInt(h) - 1),
  ).withLatestFrom(
    start$,
    (hours,start) => ({
      hours,
      end: moment(start).add(hours,'hours').format(),
    })
  ).withLatestFrom(
    key$,
    (values, key) => ({key: `${key}`, values})
  )

  const peopleChange$ = merge(
    people$.sample(incp.click$).map(p => parseInt(p) + 1),
    people$.sample(decp.click$).map(p => parseInt(p) - 1),
  )
  .map(people => ({people}))
  .withLatestFrom(
    key$,
    (values, key) => ({key: `${key}`, values})
  )

  const edit$ = ed.click$.withLatestFrom(key$, (c,k) => k)
    .tap(x => console.log('edit!',x))

  const queue$ = merge(
    key$.sample(rm.click$).map(ShiftsRemote.action.remove),
    hrChange$.map(ShiftsRemote.action.update),
    peopleChange$.map(ShiftsRemote.action.update),
  )

  const content = ShiftContent(sources)

  return {
    queue$,
    edit$,

    ...ListItemWithMenu({...sources,
      ...content, // leftDOM$, title$, subtitle$,
      rightDOM$: of(icon('menu')),
      menuItems$: of([ed.DOM, inc.DOM, dec.DOM, incp.DOM, decp.DOM, rm.DOM]),
    }),
  }
}

const _List = sources => List({...sources,
  Control$: of(_Item),
  rows$: sources.shiftsForDate$,
})

const _EditDialog = sources => {
  const shift$ = sources.edit$.withLatestFrom(
      sources.shifts$,
      (key,shifts) => shifts.find(s => key === s.$key)
    )
    .map(({start, date, hours, ...s}) => ({...s,
      // start: moment(date).add(start, 'hours'),
      start: moment(start).hours() + moment(start).minutes() / 60,
      hours,
      date,
    }))
    .tap(x => console.log('shift',x))
    .shareReplay(1)
  // Y U NO
  // const shift$ = sources.edit$
  //   .tap(k => console.log('edit',k))
  //   .flatMapLatest(ShiftsRemote.query.one)
  //   .tap(s => console.log('shift',s))
  //   // .shareReplay(1)

  const form = ShiftForm({...sources, item$: shift$})
  const dialog = Dialog({...sources,
    isOpen$: shift$.map(true),
    title$: of('foo'),
    contentDOM$: form.DOM,
  })

  form.item$.subscribe(x => console.log('item to submit', x))

  return {
    DOM: dialog.DOM,
    queue$: dialog.submit$.withLatestFrom(form.item$, (s,i) => i)
    // queue$: form.item$.sample(dialog.submit$)
    .tap(n => console.log('new item', n))
    .withLatestFrom(
      sources.date$,
      sources.edit$,
      ({start, hours, ...values}, date, key) => ({
        key, values: {
          ...values,
          start: localTime(date).add(start,'hours').format(),
          // start: moment(date).add(start,'hours').format(),
          end: localTime(date).add(start,'hours').add(hours,'hours').format(),
        //   start: moment(date)
        //     .add(start, 'seconds').format(),
        //   end: moment(date)
        //     .add(parseInt(start) + parseInt(hours),'hours').format(),
        },
      })
    )
    .map(ShiftsRemote.action.update),
  }
}

export default sources => {
  const _sources = {...sources, ..._Fetch(sources)}

  const list = _List(_sources)
  const add = AddShift(_sources)
  const ed = _EditDialog({..._sources, edit$: list.edit$})
  return {
    DOM: combineLatestToDiv(list.DOM, add.DOM, ed.DOM),
    queue$: merge(add.queue$, list.queue$, ed.queue$),
  }
}
