import {Observable} from 'rx';
import {div, img} from 'cycle-snabbdom';

import DropAndCrop from 'components/DropAndCrop'

export default sources =>{
  const page$ = DropAndCrop(sources)

  return {
    DOM: page$.DOM
  };
}