import {Observable as $} from 'rx'
import {OkAndCancelAndRemove} from 'components/sdm/Button'
import {combineDOMsToDiv} from 'util'

import DropCrop from 'components/image-drop-crop'

import {
  ListItemCollapsible,
} from 'components/sdm'

const ChooseItem = sources => ListItemCollapsible({...sources,
  title$: sources.inputDataUrl$.map(v =>
    v ? 'Change your picture.' : 'Choose a picture to use.'
  ),
  iconName$: $.just('add_a_photo'),
})

export default sources => {
  const buttons = OkAndCancelAndRemove({...sources, value$: $.just(true)})
  const currentDataUrl$ = buttons.intent$.map(null).startWith(null)

  const dropCrop = DropCrop({
    ...sources,
    props$: currentDataUrl$.map(url => ({
      title: 'Drop an image or click to browse',
      image: url,
      movable: false,
    })),
  })

  const vtree$ = combineDOMsToDiv('.set-image.paper-1.padded',
    dropCrop, buttons)

  const choose = ChooseItem({...sources,
    isOpen$: buttons.intent$.map(false),
    contentDOM$: vtree$,
  })

  const dataUrl$ = $.create(obs =>
    dropCrop.image$.sample(buttons.ok$).subscribe(image => {
      const reader = new FileReader()
      reader.addEventListener('loadend', () => obs.onNext(reader.result))
      reader.readAsDataURL(image.blob)
    }).dispose
  ).merge(
    buttons.remove$.map(null)
  )

  return {
    DOM: choose.DOM,
    dataUrl$,
  }
}
