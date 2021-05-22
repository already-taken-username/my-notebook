import React, { useState } from "react"

import Aside from "../components/aside"
import Storage from "../components/storage"

import "./main.css"

import MockupData from "../components/mockup.json"
import languages from '../components/translations.json'

const Main = (props) => {
    const { action, operation, mobile } = props
    const TypesSwitch = () => {
        const string = operation.join(':')
        switch( operation[0] ){
            case null:
                return null
            case 'preview':
                return <PreviewNote key={string} identity={ operation[1] } />
            case 'modify':
                return <ModifyNote key={string} identity={ operation[1] } />
            case undefined:
                return <Blank_ action={action} />
            default:
                action( { target: { value: undefined } } )
                return <Blank_ action={action} />
        }
    }
    return(
        <main>
            <section id='content'>
                <div>
                    { TypesSwitch() }
                </div>
            </section>
            <Aside action={action} operation={operation} mobile={mobile} />
        </main>
    )
}

const Blank_ = (props) => {
    const { action } = props
    const CreateNewNote = () => {
        if( !Storage('note_list') ){
            Storage('note_list', '[]')
        }
        const date = Date.now()
        const list = JSON.parse( Storage('note_list') )
        list.push( { id: date } )
        Storage(`note_${date}`, JSON.stringify( {
            id: date,
            finished: false
        } ) )
        Storage('note_list', JSON.stringify( list ) )
        action( { target: { value: `modify:${date}` } } )
    }
    const UseMockupData = () => {
        if( Storage('note_list') ){
            const list = JSON.parse( Storage('note_list') )
            for( const element of list ){
                Storage(`note_${element.id}`, null)
            }
        }
        const note_list = []
		for( const element of MockupData ){
			note_list.push( { id: element.id } )
			Storage(`note_${element.id}`, JSON.stringify( element ) )
		}
		Storage('note_list', JSON.stringify( note_list ) )
		window.location.reload(true);
    }
    const LargeButton = (props) => {
        const { action, icon, text, value } = props
        return(
            <label className='largeButton'>
                <input type='button' value={value} onClick={action} />
                <div>
                    <i className={`icon-${icon}`} />
                </div>
                <span>
                    {text}
                </span>
            </label>
        )
    }
    return(
        <>
            <LargeButton icon={'create'} action={ CreateNewNote } text={ languages[Storage('language')].create } />
            <LargeButton icon={'import'} action={ UseMockupData } text={ languages[Storage('language')].try } />
        </>
    )
}

const PreviewNote = (props) => {
    const { identity } = props
    
    const note = JSON.parse( Storage(`note_${identity}`) )

    const { title, description, image, list } = note
    const { source, expand } = image ? image : {}
    const [ stringList, updateList ] = useState( JSON.stringify( list ) )
    const [ expandImage, toggleExpandImage ] = useState( expand === true || expand === null ? expand : false )

    const checked = []
    const unchecked = []
    for( let i = 0 ; i < ( note.list ? note.list.length : 0 ) ; i++ ){
        const element = note.list[i]
        element.index = i
        if( element.checked )
            checked.push( element )
        else
            unchecked.push( element )
    }
    checked.sort((a, b) => b.lastChange - a.lastChange)

    const ListElement = (element) => {
        const { text, checked, value, action } = element
        return(
            <label className='listElementCheckbox'>
                <input type='button' value={value} onClick={action} />
                <li>
                    <div className={`checkbox ${ checked ? 'checked' : null }`}></div>
                    {text}
                </li>
            </label>
        )
    }

    const ToggleAction = (e) => {
        const identity = e.target.value.split(':')
        console.log( identity )
        
        list[identity[1]].checked = !list[identity[1]].checked
        list[identity[1]].lastChange = Date.now()
        note.list = list
        note.lastChange = Date.now()
        Storage(`note_${identity[0]}`, JSON.stringify( note ))
        updateList( JSON.stringify( list ) )
    }

    const SaveImageExpand = (e) => {
        note.image.expand = !expandImage
        Storage(`note_${identity}`, JSON.stringify( note ))
        toggleExpandImage( !expandImage ) 
    }
    
    const ImageHeight = () => {
        const image = new Image()
        image.src = source
        const note = window.screen.width > 800 ? 662 : ( window.screen.width - 2 )
        const scale = ( ( note - image.width ) / image.width ) * 100
        const height = `${ ((100 + scale) / 100) * image.height }px` 
        return height
    }

    return(
        <div className='note' id={`preview_${identity}`}>
            { !source && !title && !description && !( note.list ? note.list.length !== 0 : false ) ?
                <pre>{languages[Storage('language')].note.empty}</pre>
            : null }
            { source ? 
                <div className='image' style={{ backgroundImage: `url(${source})`, height: ( expandImage ? ImageHeight() : null ) }}>
                    { !description && !title && list.length === 0 ? 
                        <img src={source} /> 
                        : 
                        ( expand !== null ? 
                            <label>
                                <input type='button' value={ !expandImage } onClick={ (e) => SaveImageExpand(e) } />
                                <div className='expand'>
                                    <i className='icon-arrow' style={{transform: `rotate(${ expandImage ? '-' : '' }90deg)`}}></i>
                                    <span>{ expandImage ? languages[Storage('language')].note.shrink : languages[Storage('language')].note.fill }</span>
                                </div>
                            </label>
                        :
                            null )
                    }
                </div>
                : 
                null 
            }
            { title ? <h1>{title}</h1> : null }
            { description ? <h2>{description}</h2> : null }
            { note.list ?
                ( unchecked.length > 0 || checked.length > 0 ?
                    <>
                        <ul>
                            { unchecked.length > 0 ? 
                                unchecked.map( element => 
                                    <ListElement key={element.index} text={element.text} checked={element.checked} value={`${identity}:${element.index}`} action={ToggleAction} />
                                ) 
                                : 
                                <pre>{languages[Storage('language')].note.done}</pre> 
                            }
                        </ul>
                        { checked.length > 0 ?
                            <>
                                <span className='separator'>
                                    {languages[Storage('language')].note.checked}
                                    <hr />
                                </span>
                                <ul>
                                    {
                                        checked.map( element => 
                                            <ListElement key={element.index} text={element.text} checked={element.checked} value={`${identity}:${element.index}`} action={ToggleAction} />
                                        )
                                    }
                                </ul>
                            </>
                            :
                            null
                        }
                    </>
                : null ) : null
            }
        </div>
    )
}

const ModifyNote = (props) => {
    const { identity } = props
    
    const note = JSON.parse( Storage(`note_${identity}`) )

    const { title, description, image } = note
    const { source } = image ? image : {}
    const list = note.list ? note.list : []
    const [ stringList, updateList ] = useState( JSON.stringify( list ) )
    const [ errorHandle, setError ] = useState( undefined )

    const ListElement = (element) => {
        const { text, index, position } = element
        const [ contextMenu, toggleContextMenu ] = useState(false)
        const Resize = (e) => {
            const target = e.target
            target.style.height = `20px`
            const lines = ( target.scrollHeight - 20 ) / 20
            target.style.height = `${ lines * 20 }px`
            console.log( lines )
            return `${ lines * 20 }px`
        }
        return(
            <li className='listElement'>
                <label className='button' onMouseLeave={()=>toggleContextMenu(false)}>
                    <input type='button' value={!contextMenu} onClick={(e)=>toggleContextMenu(!contextMenu)} />
                    <i className='icon-list'>{/*‡*/}</i>
                    { contextMenu ? <ContextMenu identity={`${identity}:${index}`} actions={{'remove': DeleteListElement}} position={position} /> : null }
                </label>
                <textarea className='input' placeholder={languages[Storage('language')].note.text} name='list' defaultValue={text} onClick={Resize} onChange={Resize} onBlur={UpdateContent}>
                </textarea>
            </li>
        )
    }

    const ContextMenu = (props) => {
        const { identity, actions, position } = props
        const { remove } = actions
        const ContextElement = (props) => {
            const { text, icon, action, value } = props
            return(
                <label>
                    <input type='button' value={value} onClick={ action ? action : (e) => console.log(e.target.value) } />
                    <li>
                        <i className={ icon ? `icon-${icon}` : null }></i>
                        {text}
                    </li>
                </label>
            )
        }
        return(
            <ol className='contextMenu' >
                { !position.first ? <ContextElement text={languages[Storage('language')].note.up} value={`${identity}-1`} action={MoveListElement} icon='level-up' /> : null }
                { !position.last ? <ContextElement text={languages[Storage('language')].note.down} value={`${identity}+1`} action={MoveListElement} icon='level-down' /> : null }
                <ContextElement text={languages[Storage('language')].note.remove} icon='remove' value={identity} action={remove} />
            </ol>
        )
    }

    const CreateNewListElement = (e) => {
        const identity = e.target.value.split(':')
        const form = document.forms['compose']
        if( form['list'] ){
            if( form['list'].length > 0 ){
                for( let i = 0 ; i < form['list'].length ; i++ ){
                    const text = form['list'][i].value
                    list[i].text = text
                }
            }else{
                list[0].text = form['list'].value
            }
        }
        list.push({text: '', checked: false})
        note.list = list
        updateList( JSON.stringify(list) )
        Storage(`note_${identity[0]}`, JSON.stringify( note ))
    }
    const DeleteListElement = (e) => {
        const identity = e.target.value.split(':')
        const newlist = list.filter(( element, index )=>{
            return parseInt(index) !== parseInt(identity[1])
        })
        note.list = newlist
        updateList( JSON.stringify(newlist) )
        Storage(`note_${identity[0]}`, JSON.stringify( note ))
    }
    const MoveListElement = (e) => {
        const identity = e.target.value.split(':')
        const operation = identity[1].split( /[+|-]/g )
        const current = operation[0]
        const future = identity[1].includes('+') ? parseInt(current) + parseInt(operation[1]) : ( identity[1].includes('-') ? parseInt(current) - parseInt(operation[1]) : parseInt(current) ) 
        const store = note.list[future]
        note.list[future] = note.list[current]
        note.list[current] = store

        updateList( JSON.stringify(note.list) )
        Storage(`note_${identity[0]}`, JSON.stringify( note ) )
    }
    const UpdateContent = () => {
        const form = document.forms['compose']
        const identity = form['identity'].value
        const image = form['image'].value
        const title = form['title'].value
        const description = form['description'].value
        const list = []
        if( form['list'] ){
            if( form['list'].length > 0 ){
                for( let i = 0 ; i < form['list'].length ; i++ ){
                    const element = form['list'][i].value
                    list.push({ text: element })
                }
            }else{
                list.push({ text: form['list'].value })
            }
        }
        const note = JSON.parse( Storage(`note_${identity}`) )
        note.title = title
        note.description = description
        if( !note.image ){
            note.image = {
                source: image,
                expand: note.image ? ( image !== note.image.source && note.image.expand !== null ? false : note.image.expand ) : false
            }
        }else{
            note.image.source = image
        }
        note.list = list
        note.lastChange = Date.now()
        updateList( JSON.stringify(list) )
        try{
            setError( undefined )
            Storage(`note_${identity}`, JSON.stringify( note ))
        }catch(error){
            setError('an error was encountered while saving')
            console.log(error)
            console.error(error);
        }
    }
    const LoadImage = (e) => {
        const file = e.target.files[0];
        
        const reader = new FileReader();
        reader.onloadend = () => {
            document.forms['compose']['image'].value = reader.result
            if( !note.image ){
                note.image = {}
            }
            note.image.source = reader.result
            console.log( note.image.source )
            UpdateContent()
        };
        const size = ((file.size/1024)/1024).toFixed(4)
        const limit = 1
        if( size < limit ){
            reader.readAsDataURL(file);
        }else{
            setError('file size is too large')
            console.log( `[file size is too large] ${size} of ${limit}`)
        }
    }
    const Validate = (e, validate) => {
        const target = e.target
        var value = target.value
        const max = target.maxLength
        const words = value.split(' ')
        if( validate ){
            value = value.replace(/\s+/g, ' ')
            if( words[0] === '' ){
                words.shift()
            }
        }
        for( const i in words ){
            const length = words[i].length
            const max = 26
            if( length > max ){
                words[i] = words[i].substr(0, max) + ' ' + words[i].substr(max)
            }
        }
        if( max > 0 ){
            value = value.substr(0, max)
        }
        value = words.join(' ')
        target.value = value
    }
    return(
        <form name='compose' className='note'>
            <input type='hidden' name='identity' value={identity} />
            { errorHandle ? 
                <div className='error'>{errorHandle}</div>
            : null }
            <div className='image' style={{ backgroundImage: `url(${ note.image ? note.image.source : null })` }}>
                <input type='hidden' defaultValue={source} name='image' />
                <div>
                    <textarea placeholder={languages[Storage('language')].note.url} className='input' defaultValue={ source ? ( source.substr(0, 4) === 'http' ? source : null ) : null } onChange={(e)=>{ document.forms['compose']['image'].value = e.target.value; UpdateContent(); }} onInput={UpdateContent}></textarea>
                    <label className='upload'>
                        <input type="file" onChange={LoadImage} accept="image/*" />
                        <span>{languages[Storage('language')].note.upload}</span>
                    </label>
                </div>
            </div>
            <div>
                <textarea className='input' placeholder={languages[Storage('language')].note.title} name='title' defaultValue={ title ? title : '' } maxLength={64} onChange={(e)=>Validate(e, true)} onInput={UpdateContent}></textarea>
                <textarea className='input resize' placeholder={languages[Storage('language')].note.description} name='description' defaultValue={ description ? description : null } maxLength={1024} onChange={(e)=>Validate(e, false)} onInput={UpdateContent}></textarea>
            </div>
            <ul name='ul'>
                { list ?
                    list.map( ( element, index ) => 
                        <ListElement 
                            key={`${identity}#${index}`}
                            text={element.text} 
                            index={index} 
                            actions={
                                {
                                    'update': UpdateContent
                                }} 
                            position={
                                { 
                                    first: index === 0 ? true : null, 
                                    last: index+1 === list.length ? true : null 
                                }} 
                            /> )
                : null }
            </ul>
            <label className='button'>
                <input type='button' value={`${identity}:${list.length}`} onClick={CreateNewListElement} />
                <span>
                    { ( list ? list.length > 0 : false ) ?
                        languages[Storage('language')].note.add
                        :
                        languages[Storage('language')].note.create
                    }
                </span>
            </label>
        </form>
    )
}

export default Main
