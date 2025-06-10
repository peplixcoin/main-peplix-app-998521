import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { setPageTitle } from '../../features/common/headerSlice'
import TokenDrop from '../../features/tokendrop'

function InternalPage(){

    const dispatch = useDispatch()

    useEffect(() => {
        dispatch(setPageTitle({ title : "Smart Card"}))
      }, [])
      
    return(
        <TokenDrop />
    )
}

export default InternalPage