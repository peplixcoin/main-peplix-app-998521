import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import LandingIntro from './LandingIntro';
import ErrorText from '../../components/Typography/ErrorText';
import InputText from '../../components/Input/InputText';
import CheckCircleIcon from '@heroicons/react/24/solid/CheckCircleIcon';
import { showNotification } from '../common/headerSlice';

function ForgotPassword() {
  const INITIAL_USER_OBJ = {
    emailId: '',
  };

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [linkSent, setLinkSent] = useState(false);
  const [userObj, setUserObj] = useState(INITIAL_USER_OBJ);
  const dispatch = useDispatch();

  // Retry logic with timeout
  const submitWithRetry = async (request, retries = 3, timeout = 5000) => {
    try {
      const controller = new AbortController();
      const id = setTimeout(() => controller.abort(), timeout);

      const res = await fetch(request.url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request.data),
        signal: controller.signal,
      });

      clearTimeout(id);

      if (!res.ok) {
        throw new Error('Failed to send reset link.');
      }

      return await res.json();
    } catch (error) {
      if (retries > 0) {
        return submitWithRetry(request, retries - 1, timeout);
      } else {
        throw error;
      }
    }
  };

  const submitForm = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setLoading(true);

    if (userObj.emailId.trim() === '') {
      setLoading(false);
      return setErrorMessage('Email Id is required!');
    }

    try {
      const result = await submitWithRetry({
        url: 'https://stlk-backend.onrender.com/api/users/forgot-password',
        data: { email: userObj.emailId },
      });

      setLoading(false);
      setLinkSent(true);
      dispatch(showNotification({ message: 'Reset link sent successfully!', status: 1 }));
    } catch (error) {
      setLoading(false);
      setErrorMessage('Error sending reset link, please try again.');
      dispatch(showNotification({ message: 'Error sending reset link, please try again.', status: 0 }));
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
            <h1 className='text-3xl text-center font-bold mb-8'><img src="/logo197.png" className="w-12 inline-block mr-2 mask mask-circle" alt="dashwind-logo" />Peplix</h1>
            <h2 className="text-2xl font-semibold mb-2 text-center">Forgot Password</h2>

            {linkSent ? (
              <>
                <div className="text-center mt-8">
                  <CheckCircleIcon className="inline-block w-32 text-success" />
                </div>
                <p className="my-4 text-xl font-bold text-center">Link Sent</p>
                <p className="mt-4 mb-8 font-semibold text-center">
                  Check your email to reset the password
                </p>
                <div className="text-center mt-4">
                  <Link to="/login">
                    <button className="btn btn-block btn-primary">Login</button>
                  </Link>
                </div>
              </>
            ) : (
              <>
                <p className="my-8 font-semibold text-center">
                  We will send a password reset link to your email address
                </p>
                <form onSubmit={submitForm}>
                  <div className="mb-4">
                    <InputText
                      type="emailId"
                      defaultValue={userObj.emailId}
                      updateType="emailId"
                      containerStyle="mt-4"
                      labelTitle="Email Id"
                      updateFormValue={updateFormValue}
                    />
                  </div>

                  <ErrorText styleClass="mt-12">{errorMessage}</ErrorText>
                  <button
                    type="submit"
                    className={`btn mt-2 w-full btn-primary ${loading ? 'loading' : ''}`}
                    disabled={loading}
                  >
                    Send Reset Link
                  </button>

                  <div className="text-center mt-4">
                    Don't have an account yet?{' '}
                    <Link to="/register">
                      <span className="inline-block hover:text-primary hover:underline hover:cursor-pointer transition duration-200">
                        Register
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

export default ForgotPassword;
