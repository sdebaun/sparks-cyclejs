import {Observable as $} from 'rx'
import {div} from 'cycle-snabbdom'
import {Paper} from 'snabbdom-material'

const style = {
  margin: '1em',
}

const headerStyle = {
  backgroundColor: '#FFEB3B',
  fontSize: '1.8em',
  fontWeight: 'bolder',
  color: 'white',
  padding: '.5em',
  boxShadow: 'inset 0px -5px 10px 0px rgba(0,0,0,0.1)',
  textShadow: `
    1px 1px 0 rgba(0, 0, 0, 0.2),
    -1px -1px 0 rgba(0, 0, 0, 0.2),
    -1px 1px 0 rgba(0, 0, 0, 0.2),
    1px -1px 0 rgba(0, 0, 0, 0.2)
  `,
}

const contentStyle = {
  paddingLeft: '.5em',
  paddingRight: '.5em',
}

export const Card = sources => {
  const {elevation$, content$, header$, DOM} = sources

  const click$ = DOM.select('.card').events('click')

  const view$ = $.combineLatest(elevation$, content$, header$,
    (elevation, content, header) => div([div('.card', {style}, [
      Paper({elevation, noPadding: true}, [
        div({style: headerStyle}, [
          header,
        ]),
        div({style: contentStyle}, [
          content,
        ]),
      ]),
    ])])
  )

  return {
    click$,
    DOM: view$,
  }
}

export const CardNavigating = sources => {
  const {path$} = sources
  const {DOM, click$} = Card(sources)

  const route$ = path$.sample(click$)

  route$.subscribe(x => console.log('card route', x))

  return {DOM, route$, click$}
}
