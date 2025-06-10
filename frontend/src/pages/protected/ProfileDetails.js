import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { setPageTitle } from '../../features/common/headerSlice'
import ProfileDetails from '../../features/settings/profiledetails'

function InternalPage(){
    const dispatch = useDispatch()

    useEffect(() => {
        dispatch(setPageTitle({ title : "Profile Details"}))
      }, [])


    return(
        <ProfileDetails />
    )
}

export default InternalPage