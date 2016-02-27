import { BehaviorSubject } from 'rx'

const makeScreenInfoDriver = eventSource => 

import Firebase from 'firebase'




const FbStream = (ref,evtName)=>
  Observable.create( obs=> ref.on( evtName, (snap)=>obs.onNext(snap) ) )

const AddedStream = ref=>
  FbStream(ref,'child_added').map( snap => acc => ({[snap.key()]:snap.val(), ...acc}) )

const ChangedStream = ref=>
  FbStream(ref,'child_changed').map( snap => acc => ({...acc, [snap.key()]:snap.val()}) )

const RemovedStream = ref=>
  FbStream(ref,'child_removed').map( snap => acc => ({...acc, [snap.key()]:null}) )

const ValueStream = ref=>
  FbStream(ref,'value').map( snap =>snap.val() )

const CollectionStream = ref =>
  Observable.merge( AddedStream(ref), ChangedStream(ref), RemovedStream(ref) )
  .scan( ((acc,op)=>op(acc)), {} )
  .map( acc=> Object.keys(acc).map( x=>({$key:x,...acc[x]}) ) )

export const makeFirebaseDriver = fb => {

  const subs = {}

  const watch = (col,params)=>
    subs[String(col+params)] || (subs[String(col+params)] = buildSub(col,params))

  const buildSub = (col,params)=>
    ((typeof params == 'object') ? CollectionStream : ValueStream)( buildFbRef(col,params) )
    .shareReplay(1)

  const buildFbRef = (col, params)=>
    ((typeof params == 'object')) ? buildFbQuery(col,params) : fb.child(col).child(params)

  const buildFbQuery = (col,{orderByChild})=>{
    let ref=fb.child(col)
    if (orderByChild) { ref = ref.orderByChild(orderByChild) }
    return ref
  }

  return () => {
    return ({watch})
  }
}

export const makeQueueDriver = fb => {

  const get = key => {
    const ref = fb.child('out').child(key) 
    return AddedStream(ref)
      .doAction( snap => snap.ref().remove() )
      .map( snap=>snap.val() )
  }

  return $input => {
    $input.subscribe( item => fb.child('in').push(item) )
    return { get }
  }
}

export const POPUP = 'popup'
export const REDIRECT = 'redirect'
export const LOGOUT = 'logout'

export const makeFirebaseAuthDriver = fb => {

  const auth$ = Observable.create( obs=> fb.onAuth( response=>obs.onNext(response) ) )

  return input$ => {
    input$.filter(({type})=>type==POPUP).subscribe( ({provider})=>{console.log('login'); fb.authWithOAuthPopup(provider)} )
    input$.filter(({type})=>type==REDIRECT).subscribe( ({provider})=>fb.authWithOAuthRedirect(provider) )
    input$.filter(({type})=>type==LOGOUT).subscribe( ()=>{console.log('logout'); fb.unauth()} )
    return auth$
  }
}