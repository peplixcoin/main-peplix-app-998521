import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import LandingIntro from './LandingIntro';
import ErrorText from '../../components/Typography/ErrorText';
import InputText from '../../components/Input/InputText';
import axios from 'axios';
import { showNotification } from '../common/headerSlice';

function Login({ fetchUserProfile }) {
  const INITIAL_LOGIN_OBJ = {
    emailId: '',
    password: '',
  };

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [loginObj, setLoginObj] = useState(INITIAL_LOGIN_OBJ);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();
  const dispatch = useDispatch();
/*https://stlk-backend.onrender.com/api/users/login */
  const loginWithRetry = async (data, retries = 3) => {
    try {
      const res = await axios.post('http://localhost:5000/api/users/login', data, { timeout: 5000 });
      return res.data;
    } catch (error) {
      if (retries > 0) {
        return loginWithRetry(data, retries - 1); // Retry logic
      } else {
        throw error; // After retries are exhausted
      }
    }
  };

  const submitForm = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setMessage('');

    if (loginObj.emailId.trim() === '') {
      const errorMsg = 'Email Id is required!';
      setErrorMessage(errorMsg);
      dispatch(showNotification({ message: errorMsg, status: 0 }));
      return;
    }

    if (loginObj.password.trim() === '') {
      const errorMsg = 'Password is required!';
      setErrorMessage(errorMsg);
      dispatch(showNotification({ message: errorMsg, status: 0 }));
      return;
    }

    setLoading(true);
    try {
      const loginData = { email: loginObj.emailId, password: loginObj.password };

      const res = await loginWithRetry(loginData); // Using retry logic
      localStorage.setItem('token', res.token);

      setMessage('Login successful!');
      dispatch(showNotification({ message: 'Login successful!', status: 1 }));

      navigate('/app/dashboard');
    } catch (error) {
      setLoading(false);
      const errorMsg = error.response?.data?.message || 'Failed to login after multiple attempts. Please try again later.';
      setErrorMessage(errorMsg);
      dispatch(showNotification({ message: errorMsg, status: 0 }));
    } finally {
      setLoading(false);
    }
  };

  const updateFormValue = ({ updateType, value }) => {
    setErrorMessage('');
    setMessage('');
    setLoginObj({ ...loginObj, [updateType]: value });
  };

  return (
    <div className="min-h-screen bg-base-200 flex items-center">
      <div className="card mx-auto w-full max-w-5xl shadow-xl flex justify-center items-center">
        <div className="grid md:grid-cols-1 grid-cols-1 bg-base-100 rounded-xl w-full md:w-1/2 animate-fadeIn">
          <div className="py-24 px-10">
            <h1 className='text-3xl text-center font-bold mb-8 '><img src="/logo197.png" className="w-12 inline-block mr-2 mask mask-circle" alt="dashwind-logo" />Stocklink</h1>
            <h2 className="text-2xl font-semibold mb-2 text-center">Login</h2>
            <form onSubmit={submitForm}>
              <div className="mb-4">
                <InputText
                  type="email"
                  defaultValue={loginObj.emailId}
                  updateType="emailId"
                  containerStyle="mt-4"
                  labelTitle="Email Id"
                  updateFormValue={updateFormValue}
                />
                <InputText
                  defaultValue={loginObj.password}
                  type="password"
                  updateType="password"
                  containerStyle="mt-4"
                  labelTitle="Password"
                  updateFormValue={updateFormValue}
                />
              </div>

              <div className="text-right text-primary">
                <Link to="/forgot-password">
                  <span className="text-sm inline-block hover:text-primary hover:underline hover:cursor-pointer transition duration-200">
                    Forgot Password?
                  </span>
                </Link>
              </div>

              {/* Show only error or success message */}
              {errorMessage && <ErrorText styleClass="mt-8">{errorMessage}</ErrorText>}
              {message && <p className="mt-4 text-center text-green-500">{message}</p>}

              <button
                type="submit"
                className={'btn mt-2 w-full btn-primary' + (loading ? ' loading' : '')}
                disabled={loading}
              >
                Login
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
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
