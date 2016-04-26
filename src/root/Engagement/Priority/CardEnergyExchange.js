import {Observable as $} from 'rx'

import {
  Card,
} from 'components/sdm'

import EnergyExchange from '../Glance/Commitments'

export const CardEnergyExchange = sources => {
  const ee = EnergyExchange(sources)
  return {
    ...Card({...sources,
      content$: $.just([ee.DOM]),
    }),
  }
}
