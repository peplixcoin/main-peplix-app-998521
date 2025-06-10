import { useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import ForgotPassword from '../features/user/ForgotPassword'
import Login from '../features/user/Login'
import ResetPassword from '../features/user/ResetPassword'

function ExternalPage() {


  return (
    <div className="">
      <ResetPassword />
    </div>
  )
}

export default ExternalPage