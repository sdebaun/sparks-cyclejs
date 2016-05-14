import {Observable as $} from 'rx'
import ImageDropCrop from './index'

const demo = sources => {
  const dropCrop = ImageDropCrop({...sources, props$: $.just({
    accept: 'image/*',
  })})

  return dropCrop
}

export default demo
