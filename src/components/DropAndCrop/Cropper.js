import React from 'react'
import ReactDOM from 'react-dom'
import ReactCropper from 'react-cropper'
import {Observable, BehaviorSubject} from 'rx'
const {just, combineLatest} = Observable

import {reactComponent} from 'helpers'

// stupid react component requires ref (and thus a class)
// to get dataurl from canvas
class Cropper extends React.Component {
  crop = () => this.props.onCrop(
    this.refs.cropper.getCroppedCanvas().toDataURL()
  )

  render() {
    return <ReactCropper ref='cropper'
      style={{maxHeight: 400, maxWidth: 400, margin: '0 auto'}}
    {
      ...{...this.props, crop: this.crop, autoCrop: true}
    }/>
  }
}

export default (sources) => {
  const cropped$ = new BehaviorSubject(null)

  const DOM1 = combineLatest(
    sources.image$ || just(null),
    sources.aspectRatio$ || just(300 / 120),
    (src, aspectRatio) =>
      reactComponent(Cropper, {
        src,
        aspectRatio,
        onCrop: e => cropped$.onNext(e),
      }, 'update')
    )

  // const DOM2 = sources.image$
  //   .map(src => reactComponent(Cropper, {
  //     src,
  //     onCrop: e => cropped$.onNext(e),
  //     aspectRatio: 300 / 120, // HAX
  //   }, 'update'))

  return {
    cropped$,
    DOM: DOM1,
    // DOM: DOM2,
    // has to be attached on 'update', the default, breaks if 'insert'
    // DOM: sources.image$
    //   .map(src => reactComponent(Cropper, {
    //     src,
    //     onCrop: e => cropped$.onNext(e),
    //     aspectRatio: 300 / 120, // HAX
    //   }, 'update')),
  }
}
