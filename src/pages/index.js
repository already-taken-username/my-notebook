import React, { useState } from "react"

import Actions from "../components/actions"
import Main from "../components/main"
import Storage from "../components/storage"

import '../components/styles.css'
import '../images/fontello/css/fontello.css'

import MockupData from "../components/mockup.json"
import languages from '../components/translations.json'
import { object } from "prop-types"

const IndexPage = () => {

	const stateComposer = (status, action) => {
		return {
			'status': status,
			'action': () => action( !status )
		}
	}
	
	const [ stringOperation, changeOperation ] = useState( undefined )
	const [ openSettings, toggleSettings ] = useState( false )
	const settings = stateComposer( openSettings, toggleSettings )
	const [ openMobileTab, toggleMobileTab ] = useState( false )
	const mobile = stateComposer( openMobileTab, toggleMobileTab )
	
	if( !Storage('language') ){
		Storage('language', 'en')
	}
	if( !Storage('theme') ){
		Storage('theme', 'default')
	}

	const OperationAction = (e) => {
		const value = e.target.value
		if( value ? ( value.split(':')[1] === operation[1] && value.split(':')[0] === operation[0] ) : true ){
			changeOperation( undefined )
		}else{
			changeOperation( value )
		}
	}

	const operation = stringOperation ? stringOperation.split(':') : [undefined, undefined]
	
	return(
		<div id='page'>
			<Main action={OperationAction} operation={operation} mobile={openMobileTab} />
			<Actions action={OperationAction} operation={operation} mobile={mobile} settings={settings} />
			{ settings.status ? <Settings settings={settings} /> : null }
		</div>
	)

}

const Settings = (props) => {
	const { settings } = props
	const ClearStorage = () => {
		Storage(null)
		window.location.reload(true);
	}
	const SampleStorage = () => {
		if( Storage('note_list') ){
            const list = JSON.parse( Storage('note_list') )
            for( const element of list ){
                Storage(`note_${element.id}`, null);
            }
        }
		const note_list = []
		for( const element of MockupData ){
			note_list.push( { id: element.id } )
			Storage(`note_${element.id}`, JSON.stringify( element ))
		}
		Storage('note_list', JSON.stringify( note_list ) )
		window.location.reload(true);
	}	
	const Division = (props) => {
		const { title, description, buttons, name, action, type } = props
		const Element = (props) => {
			const { name, action, type } = props
			const { text, value } = props.data
			const selected = name ? Storage(name) : false
			return(
				<label className='button'>
					<input type={type} name={name} value={value} defaultChecked={ selected === value } onClick={ type !== 'file' ? action : null } onChange={ type === 'file' ? action : null } />
					<span>
						{text}
					</span>
				</label>
			)
		}
		return(
			<li>
				{ title ? <h1>{title}</h1> : null }
				{ description ? <h2>{description}</h2> : null }
				{ buttons ? <ol>
					{ buttons.map( element => <Element data={element} name={name} type={ element.type ? element.type : type } action={ action ? action : element.action } /> ) }
				</ol> : null }
			</li>
		)
	}
	const ChangeExhibitionStorage = (e) => {
		const value = e.target.value
		const name = e.target.name
		Storage(name, value)
		window.location.reload(true);
	}
	const ImportAppData = (e) => {
		const target = e.target
		target.setAttribute('accept', '.json');

		const file = e.target.files[0];
		const reader = new FileReader();
		reader.onloadend = () => {
			const result = JSON.parse( reader.result )
			console.log( result )
			Storage(null)
			const note_list = []
			for( const element of Object.keys( result ) ){
				note_list.push( { id: result[element].id } )
				Storage(`note_${result[element].id}`, JSON.stringify( result[element] ))
			}
			Storage('note_list', JSON.stringify( note_list ) )
			window.location.reload(true);
		};
		reader.readAsText(file);
	}
	const ExportAppData = (e) => {
		const list = JSON.parse( Storage('note_list') )
		const object = {}
		console.log(list)
		for( const element of list ){
			object[element.id] = JSON.parse( Storage(`note_${element.id}`) )
		}
		const data = "data:text/json;charset=utf-8," + encodeURIComponent( JSON.stringify( object ) )
		const target = e.target.parentNode
		const element = document.createElement('a')
		element.setAttribute('href', data);
		element.setAttribute('download', 'data.json');
		element.style.display = 'none';
		target.appendChild(element)
		element.click()
		target.removeChild(element)
	}
	const translation = languages[Storage('language')].settings
	return(
		<div id='settings'>
			<section>
				<div className='background'>
					<h1>{languages[Storage('language')].settings.title}</h1>
					<label className='float button'>
						<input type='button' onClick={()=>settings.action( !settings.status )} />
						<div>
							<i className='icon-cancel' />
						</div>
					</label>
				</div>
				<ul>
					<Division title={translation.language.title} description={translation.language.description} name='language' action={ChangeExhibitionStorage} type='radio' buttons={[{text:translation.language.english, value: 'en'},{text:translation.language.polish, value: 'pl'}]} />
					<Division title={translation.theme.title} description={translation.theme.description} name='theme' action={ChangeExhibitionStorage} type='radio' buttons={[{text:translation.theme.default, value: 'default'}]} />
					<Division title={translation.data.title} description={translation.data.description} type='button' buttons={[{type: 'file',text:translation.data.import, action: ImportAppData},{text:translation.data.export, action: ExportAppData}]} />
					<Division title={translation.mockup.title} description={translation.mockup.description} action={SampleStorage} type='button' buttons={[{text:translation.mockup.load}]} />
					<Division title={translation.remove.title} description={translation.remove.description} action={ClearStorage} type='button' buttons={[{text:translation.remove.wipe}]} />
				</ul>
			</section>
		</div>
	)
}

export default IndexPage
