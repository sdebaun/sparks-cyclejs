import React from 'react'
import ReactDOM from 'react-dom'
import BaseCropper from 'react-cropper'
import {Observable, BehaviorSubject} from 'rx';
import {div,img} from 'cycle-snabbdom';

const reactComponent = (Klass,attrs)=>
  div({
    hook: { update: ({elm})=> ReactDOM.render(<Klass {...attrs}/>,elm) }
  })      

class Cropper extends React.Component {
  crop = ()=>{
    const canvas = this.refs.cropper.getCroppedCanvas()
    canvas && this.props.onCrop(canvas.toDataURL())
  }

  render() {
    return <BaseCropper ref='cropper' {...{...this.props,crop:this.crop,autoCrop:true}}/>
  }
}

export default ({image$}) =>{
  const cropped$ = new BehaviorSubject(null)
  image$.subscribe(i=>console.log('new image to crop',i))
  return {
    cropped$,
    DOM: image$
      // .filter( image => !!image )
      .map( src=>reactComponent(Cropper, {src,onCrop:e=>cropped$.onNext(e),aspectRatio:1}) )
  }
}
