import {Observable} from 'rx'
const {just} = Observable

import DropAndCrop from 'components/DropAndCrop'

import {
  ListItemCollapsible,
} from 'components/sdm'

const ChooseItem = sources => ListItemCollapsible({...sources,
  title$: sources.inputDataUrl$.map(v =>
    v ? 'Change your picture.' : 'Choose a picture to use.'
  ),
  iconName$: just('add_a_photo'),
})

export default sources => {
  const dropAndCrop = DropAndCrop(sources)

  const choose = ChooseItem({...sources,
    isOpen$: dropAndCrop.dataUrl$.map(false),
    contentDOM$: dropAndCrop.DOM,
  })

  return {
    DOM: choose.DOM,
    dataUrl$: dropAndCrop.dataUrl$,
  }
}
