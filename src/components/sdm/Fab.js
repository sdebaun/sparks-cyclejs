//placeholder for replacement w cyclic-surface-material
import {Observable} from 'rx'
const {just} = Observable

import combineLatestObj from 'rx-combine-latest-obj'
import {Appbar} from 'snabbdom-material'

import newId from './id'

const Fab = sources => {
  const id = newId()

  const viewState = {
    classNames$: sources.classNames$ || just([]),
    iconDOM$: sources.iconDOM$,
  }

  const click$ = sources.DOM.select('.' + id).events('click')

  const DOM = combineLatestObj(viewState)
    .map(({iconDOM, classNames}) =>
      Appbar.Button({
        onClick: true,
        primary: true,
        className: [id, ...classNames].join('.'),
      }, [
        iconDOM,
      ]),
    )

  return {
    DOM,
    click$,
  }
}

export {Fab}
