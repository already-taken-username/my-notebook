
const constant = {}

const Storage = ( name, value ) => {
    const TestStorage = () => {
        try{
            localStorage.setItem('test', true)
            localStorage.removeItem('test')
            return true
        }catch(e){
            console.warn(e)
            return false
        }
    }
    if( name === null ){
        if( TestStorage() ){
            localStorage.clear()
        }
        for( const element of Object.keys( constant ) ){
            delete constant[element]
        }
    }else{
        if( value === null ){
            if( TestStorage() ){
                localStorage.removeItem(name);
            }
            delete constant[name]
        }else{
            if( value ){
                if( TestStorage() ){
                    localStorage[name] = value
                }
                constant[name] = value
            }
            if( TestStorage() ){
                return localStorage[name]
            }
            return constant[name]
        }
    }
}

export default Storage
