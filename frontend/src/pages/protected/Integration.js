import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { setPageTitle } from '../../features/common/headerSlice'
import Integration from '../../features/tokenpackages'

function InternalPage(){

    const dispatch = useDispatch()

    useEffect(() => {
        dispatch(setPageTitle({ title : "Packages"}))
      }, [])
      
    return(
        <Integration />
    )
}

export default InternalPage