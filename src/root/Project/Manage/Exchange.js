import isolate from '@cycle/isolate'
import {Subject} from 'rx'
import combineLatestObj from 'rx-combine-latest-obj'
import ExchangeGive from 'components/ExchangeGive'
import ExchangeBenefits from 'components/ExchangeBenefits'

import {div} from 'helpers'

const _render = ({give, benefits}) =>
  div('.container', [
    give,
    benefits,
  ])

export default sources => {
  const give = isolate(ExchangeGive)(sources)
  const benefits = isolate(ExchangeBenefits)(sources)

  const viewState = {
    give: give.DOM,
    benefits: benefits.DOM,
  }

  const DOM = combineLatestObj(viewState).map(_render)
  return {DOM}
}
