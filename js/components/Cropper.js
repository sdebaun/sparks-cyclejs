import React from 'react'
import ReactDOM from 'react-dom'
import {BehaviorSubject} from 'rx'
import {reactComponent} from 'helpers'

// stupid react component requires ref (and thus a class)
// to get dataurl from canvas
class ReactCropper extends React.Component {
  crop = () => this.props.onCrop(
    this.refs.cropper.getCroppedCanvas().toDataURL()
  )

  render() {
    return <Cropper ref='cropper' {
      ...{...this.props, crop: this.crop, autoCrop: true}
    }/>
  }
}

export default ({image$}) => {
  const cropped$ = new BehaviorSubject(null)
  return {
    cropped$,
    // has to be attached on 'update', the default, breaks if 'insert'
    DOM: image$
      .map(src => reactComponent(ReactCropper, {
        src,
        onCrop: e => cropped$.onNext(e),
        aspectRatio: 1,
      }, 'update')),
  }
}
