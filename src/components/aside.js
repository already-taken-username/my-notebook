import React from "react"

import Storage from "../components/storage"
import "./aside.css"
import languages from '../components/translations.json'

const Aside = (props) => {
    const { action, operation, mobile } = props
    
    return (
        <aside id='lists' className={ mobile ? 'open' : 'close' }>
            <h1>{languages[Storage('language')].note_list}</h1>
            <SortLists action={action} operation={operation} />
        </aside>
    )
}

const SortLists = (props) => {
    const { action, operation } = props
    const list = Storage('note_list') ? JSON.parse( Storage('note_list') ) : []
    const finished = []
    const unfinished = []
    for( const target of list ){
        const note = JSON.parse( Storage(`note_${target.id}`) )
        const { id, title, description, image, list, lastChange } = note
        const { source } = image ? image : {}
        const checked = list ? list.filter((element)=>{
            return element.checked
        }) : undefined
        const element = {
            id: id,
            title: ( title ? title.replace(/\s+/g, ' ').substr(0, 64) : undefined ),
            image: source,
            lastChange: lastChange,
            description: ( description ? description.substr(0, 128) : undefined ),
        }
        if( list ? ( list.length > 0 ? checked.length === list.length : note.finished ) : note.finished ){
            finished.push( element )
        }else{
            unfinished.push( element )
        }
    }
    finished.sort((a, b) => b.lastChange - a.lastChange);
    
    return(
        <ol>
            <List list={unfinished} selected={operation[1]} action={action} />
            {
                finished.length > 0 ? 
                    <>
                        <span className='separator'>
                            {languages[Storage('language')].note.finished}
                            <hr />
                        </span>
                        <List list={finished} selected={operation[1]} action={action} />
                    </>
                :
                null
            }
        </ol>
    )
}

const List = (props) => {
    const { list, selected, action } = props
    return(
        <ul>
            {
                list.map( ( element, i ) => {
                    const { id, title, description, image } = element
                    return(
                        <ListElement key={id} id={id} title={title} description={description} source={image} selected={ parseInt(selected) === parseInt(id) } action={action} />
                        )
                    } )
                }
        </ul>
    )
}

const ListElement = (props) => {
    const { id, title, description, source, selected, action } = props
    return(
        <li className='listElement'>
            <label className={ selected ? 'selected' : null }>
                <input type='button' value={`preview:${id}`} onClick={action} />
                <div>
                    { source ? <div className='img' style={{ backgroundImage: `url(${source})` }} /> : null }
                    { title ? <h1>{title}</h1> : null }
                    { description ? <h2>{description}</h2> : null }
                    { !title && !description && !source ? <h1>·</h1> : null }
                </div>
            </label>
        </li>
    )
}

export default Aside
