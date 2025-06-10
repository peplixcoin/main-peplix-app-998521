import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux'; // Import useDispatch from react-redux
import LandingIntro from './LandingIntro';
import ErrorText from '../../components/Typography/ErrorText';
import InputText from '../../components/Input/InputText';
import CheckCircleIcon from '@heroicons/react/24/solid/CheckCircleIcon';
import { showNotification } from '../common/headerSlice'; // Import showNotification action

function ResetPassword() {
  const { token } = useParams(); // Get the token from the URL
  const navigate = useNavigate(); // To redirect after successful password reset
  const dispatch = useDispatch(); // Initialize dispatch

  const INITIAL_USER_OBJ = {
    password: '',
    confirmPassword: '',
  };

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [passwordReset, setPasswordReset] = useState(false);
  const [userObj, setUserObj] = useState(INITIAL_USER_OBJ);

  const submitForm = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (userObj.password.trim() === '') return setErrorMessage('Password is required!');
    if (userObj.confirmPassword.trim() === '') return setErrorMessage('Confirm Password is required!');
    if (userObj.password !== userObj.confirmPassword) return setErrorMessage('Passwords do not match!');

    setLoading(true);

    try {
      // Make the API request to reset the password
      const response = await fetch(`https://stlk-backend.onrender.com/api/users/reset-password/${token}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password: userObj.password }),
      });

      const result = await response.json();
      setLoading(false);

      if (response.ok) {
        setPasswordReset(true); // Show success message
        dispatch(showNotification({ message: 'Password reset successful!', status: 1 })); // Notify success
        setTimeout(() => navigate('/login'), 3000); // Redirect to login after 3 seconds
      } else {
        if (result.message === 'Invalid or expired token') {
          setErrorMessage('Your reset token has expired. Please request a new one.');
          dispatch(showNotification({ message: 'Your reset token has expired. Please request a new one.', status: 0 })); // Notify error
        } else {
          setErrorMessage(result.message || 'Something went wrong.');
          dispatch(showNotification({ message: result.message || 'Something went wrong.', status: 0 })); // Notify error
        }
      }
    } catch (error) {
      setLoading(false);
      setErrorMessage('Error resetting password, please try again.');
      dispatch(showNotification({ message: 'Error resetting password, please try again.', status: 0 })); // Notify error
    }
  };

  const updateFormValue = ({ updateType, value }) => {
    setErrorMessage('');
    setUserObj({ ...userObj, [updateType]: value });
  };

  return (
    <div className="min-h-screen bg-base-200 flex items-center">
      <div className="card mx-auto w-full max-w-5xl shadow-xl flex justify-center items-center">
        <div className="grid md:grid-cols-1 grid-cols-1 bg-base-100 rounded-xl w-full md:w-1/2 animate-fadeIn">
          <div className="py-24 px-10">
            <h1 className='text-3xl text-center font-bold '><img src="/logo197.png" className="w-12 inline-block mr-2 mask mask-circle" alt="dashwind-logo" />Stocklink</h1>
            <h2 className="text-2xl font-semibold mb-2 mt-10 text-center">Reset Password</h2>

            {passwordReset ? (
              <>
                <div className="text-center mt-8">
                  <CheckCircleIcon className="inline-block w-32 text-success" />
                </div>
                <p className="my-4 text-xl font-bold text-center">Password Reset Successful</p>
                <p className="mt-4 mb-8 font-semibold text-center">
                  Redirecting to login...
                </p>
              </>
            ) : (
              <>
                <p className="my-8 font-semibold text-center">
                  Enter your new password below.
                </p>
                <form onSubmit={submitForm}>
                  <div className="mb-4">
                    <InputText
                      type="password"
                      defaultValue={userObj.password}
                      updateType="password"
                      containerStyle="mt-4"
                      labelTitle="New Password"
                      updateFormValue={updateFormValue}
                    />
                    <InputText
                      type="password"
                      defaultValue={userObj.confirmPassword}
                      updateType="confirmPassword"
                      containerStyle="mt-4"
                      labelTitle="Confirm Password"
                      updateFormValue={updateFormValue}
                    />
                  </div>

                  <ErrorText styleClass="mt-12">{errorMessage}</ErrorText>
                  <button
                    type="submit"
                    className={`btn mt-2 w-full btn-primary ${loading ? 'loading' : ''}`}
                    disabled={loading}
                  >
                    Reset Password
                  </button>

                  <div className="text-center mt-4">
                    <Link to="/login">
                      <span className="inline-block hover:text-primary hover:underline hover:cursor-pointer transition duration-200">
                        Back to Login
                      </span>
                    </Link>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ResetPassword;
