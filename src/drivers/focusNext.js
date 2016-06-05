import {Observable} from 'rx'

function makeFocusNextDriver() {
  return function focusNextDriver(focus$) {
    const sink$ = Observable.create(obs => {
      focus$.subscribe(focus => {
        const elements = document.querySelectorAll(focus.selector)
        let found = false

        if (focus.lostFocus) {
          const currentEl = document.querySelector(focus.lostFocus)

          for (let i = 0; i < elements.length; ++i) {
            let item = elements[i]

            if (found) {
              return obs.onNext(item)
            }
            if (item === currentEl) { found = true }
          }
        }

        if (!found && elements.length > 0) {
          return obs.onNext(elements[0])
        }

        return null
      })
    }).share()

    sink$.withLatestFrom(focus$)
    .subscribe(([element, focus]) => {
      element.focus()
      if (focus.select) { element.select() }
    })
    return sink$
  }
}

export {makeFocusNextDriver}
