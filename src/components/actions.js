import React from "react"

import Storage from "../components/storage"
import "./actions.css"

import languages from '../components/translations.json'

const Aside = (props) => {
    const { action, operation, mobile, settings } = props
    const identity = operation[1]
    const ActionHandler = ( value ) => {
        action( { target: { value: value } } )
    }
    const ComposeAction = () => {
        if( !Storage('note_list') ){
            Storage('note_list', '[]' )
        }
        const date = Date.now()
        const list = JSON.parse( Storage('note_list') )
        list.push( { id: date } )
        Storage(`note_${date}`, JSON.stringify( {
            id: date,
            finished: false
        } ) )
        Storage('note_list', JSON.stringify( list ))
        ActionHandler( `modify:${date}` )
    }
    const RemoveAction = (e) => {
        const value = e.target.value
        Storage( value, null )
        const list = JSON.parse( Storage('note_list') )
        const newList = list.filter((item)=>{
            return item.id.toString() !== value.toString()
        })
        Storage('note_list', JSON.stringify( newList ))
        ActionHandler( undefined )
    }
    const StatusAction = (e) => {
        const value = e.target.value.split('#')
        const status = value[1] === 'true'
        const note = JSON.parse( Storage(`note_${value[0]}`) )
        note.finished = status
        if( note.list ? note.list.length > 0 : false ){
            for( const index in note.list ){
                note.list[index].checked = status
            }
        }
        note.lastChange = Date.now()
        Storage(`note_${value[0]}`, JSON.stringify( note ) )
        ActionHandler( undefined )
    }
    const MobileAction = (e) => {
        e.target.value = !mobile.status
        mobile.action( !mobile.status )
    }
	const translation = languages[Storage('language')].actions
    return(
        <nav id='actions'>
            <ActionButton icon={'create'} color='linear-gradient(135deg, #2F80ED 0%, #2D9CDB 50.28%, #56CCF2 100%)' value='???' text={translation.create} action={ComposeAction} />
            <ActionButton icon={'hamburger'} additionalClass='mobile' value={mobile.status} text={!mobile.status ? translation.show : translation.hide} action={MobileAction} />
            <ul style={{visibility: ( identity ? 'visible' : 'hidden' )}}>
                <hr />
                { operation[0] === 'modify' ?
                    <ActionButton icon={'search'} value={`preview:${identity}`} text={translation.preview} action={action} />
                :
                    <ActionButton icon={'edit'} value={`modify:${identity}`} text={translation.modify} action={action} />
                }
                <ActionButton icon={'list-checked'} value={`${identity}#true`} text={translation.check} action={StatusAction} />
                <ActionButton icon={'list-unchecked'} value={`${identity}#false`} text={translation.uncheck} action={StatusAction} />
                <ActionButton icon={'remove'} value={identity} text={translation.remove} action={RemoveAction} />
            </ul>
            <ActionButton icon={'settings'} text={translation.settings} action={settings.action} additionalClass={ mobile.status ? 'mobileSettings' : false }/>
        </nav>
    )
}

const RandomColor = () => {
    const random = Math.floor(Math.random() * 360)
    const color = `hsl(${random}, 100%, 50%)`
    return color
}

const ActionButton = ( props ) => {
    const { icon, text, action, color, value, additionalClass } = props
    return(
        <label className={`actionButton ${ additionalClass ? additionalClass : null }`}>
            <input type='button' value={ value ? value : undefined } onClick={action} />
            <div style={ { background: color ? color : `linear-gradient(135deg, ${RandomColor()} 0%, ${RandomColor()} 100%)` } }>
                <i className={`icon-${icon}`}></i>
                <span>{text}</span>
            </div>
        </label>
    )
}

export default Aside
