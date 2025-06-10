import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { setPageTitle } from '../../features/common/headerSlice'
import PackageDetails from '../../features/tokenpackages/PackageDetails'

function InternalPage(){

    const dispatch = useDispatch()

    useEffect(() => {
        dispatch(setPageTitle({ title : "Package Details"}))
      }, [])
      
    return(
        <PackageDetails />
    )
}

export default InternalPage