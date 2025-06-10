import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import ErrorText from '../../components/Typography/ErrorText';
import InputText from '../../components/Input/InputText';
import axios from 'axios';
import { showNotification } from '../common/headerSlice';

function Register() {
  const INITIAL_REGISTER_OBJ = {
    name: "",
    emailId: "",
    password: "",
    confirmPassword: "",
    phoneNumber: "",
    sponsorUsername: "",
    countryCode: "+91",
  };

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [registerObj, setRegisterObj] = useState(INITIAL_REGISTER_OBJ);
  const [message, setMessage] = useState("");
  const [showNonIndiaMessage, setShowNonIndiaMessage] = useState(false);
  const [terms, setTerms] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(false); // State for password visibility
  const dispatch = useDispatch();

  // Retry logic with timeout
  const submitWithRetry = async (request, retries = 3, timeout = 5000) => {
    try {
      const res = await axios.post(request.url, request.data, { timeout });
      return res.data;
    } catch (err) {
      if (retries > 0) {
        return submitWithRetry(request, retries - 1, timeout);
      } else {
        throw err;
      }
    }
  };

  useEffect(() => {
    const fetchTerms = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/users/terms');
        setTerms(res.data);
      } catch (error) {
        console.error('Failed to fetch terms', error);
      }
    };

    fetchTerms();
  }, []);

  const submitForm = async (e) => {
    e.preventDefault();
    if (!acceptTerms) {
      setErrorMessage("You must accept the terms and conditions!");
      return;
    }
    setErrorMessage("");
    setMessage(""); // Clear previous messages

    // Form validation with notification
    if (!registerObj.name.trim()) {
      const errorMsg = "Name is required!";
      setErrorMessage(errorMsg);
      dispatch(showNotification({ message: errorMsg, status: 0 }));
      return;
    }

    if (!registerObj.emailId.trim()) {
      const errorMsg = "Email Id is required!";
      setErrorMessage(errorMsg);
      dispatch(showNotification({ message: errorMsg, status: 0 }));
      return;
    }

    if (!registerObj.password.trim()) {
      const errorMsg = "Password is required!";
      setErrorMessage(errorMsg);
      dispatch(showNotification({ message: errorMsg, status: 0 }));
      return;
    }

    // Password validation: more than 7 characters and alphanumeric
    const passwordRegex = /^(?=.*[a-zA-Z])(?=.*[0-9])[a-zA-Z0-9]+$/;
    if (registerObj.password.length <= 7 || !passwordRegex.test(registerObj.password)) {
      const errorMsg = "Password must be more than 7 characters and alphanumeric!";
      setErrorMessage(errorMsg);
      dispatch(showNotification({ message: errorMsg, status: 0 }));
      return;
    }

    if (!registerObj.confirmPassword.trim()) {
      const errorMsg = "Please confirm your password!";
      setErrorMessage(errorMsg);
      dispatch(showNotification({ message: errorMsg, status: 0 }));
      return;
    }

    if (registerObj.password !== registerObj.confirmPassword) {
      const errorMsg = "Passwords do not match!";
      setErrorMessage(errorMsg);
      dispatch(showNotification({ message: errorMsg, status: 0 }));
      return;
    }

    if (!registerObj.phoneNumber.trim()) {
      const errorMsg = "Phone number is required!";
      setErrorMessage(errorMsg);
      dispatch(showNotification({ message: errorMsg, status: 0 }));
      return;
    }

    // Validate phone number length and digits
    if (registerObj.phoneNumber.length !== 10 || isNaN(registerObj.phoneNumber)) {
      const errorMsg = "Phone number must be 10 digits!";
      setErrorMessage(errorMsg);
      dispatch(showNotification({ message: errorMsg, status: 0 }));
      return;
    }

    setLoading(true);

    try {
      const data = await submitWithRetry({
        url: 'http://localhost:5000/api/users/register',
        data: {
          username: registerObj.name,
          email: registerObj.emailId,
          password: registerObj.password,
          phoneNumber: `${registerObj.countryCode}-${registerObj.phoneNumber}`,
          sponsorUsername: registerObj.sponsorUsername,
        },
      });

      setMessage(data.message || 'Registration successful!');
      dispatch(showNotification({ message: 'Registration successful!', status: 1 }));

      localStorage.setItem("token", data.token); // Store token if applicable
      window.location.href = '/app/dashboard'; // Redirect to dashboard
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Registration failed. Please try again.';
      setErrorMessage(errorMsg);
      dispatch(showNotification({ message: errorMsg, status: 0 }));
    } finally {
      setLoading(false);
    }
  };

  const updateFormValue = ({ updateType, value }) => {
    setErrorMessage("");
    setMessage(""); // Clear previous messages on form input change
    setRegisterObj({ ...registerObj, [updateType]: value });

    // Show non-India message based on country code selection
    if (updateType === "countryCode" && value !== "+91") {
      setShowNonIndiaMessage(true);
    } else if (updateType === "countryCode" && value === "+91") {
      setShowNonIndiaMessage(false);
    }
  };

  // Toggle password visibility
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="min-h-screen bg-base-200 flex items-center">
      <div className="card mx-auto w-full max-w-5xl shadow-xl flex justify-center items-center">
        <div className="grid md:grid-cols-1 grid-cols-1 bg-base-100 rounded-xl w-full md:w-1/2 animate-fadeIn">
          <div className="py-24 px-10">
            <h1 className='text-3xl text-center font-bold mb-8 '><img src="/logo197.png" className="w-12 inline-block mr-2 mask mask-circle" alt="dashwind-logo" />Stocklink</h1>
            <h2 className="text-2xl font-semibold mb-2 text-center">Register</h2>
            <form onSubmit={submitForm}>
              <div className="mb-4">
                <InputText
                  defaultValue={registerObj.name}
                  updateType="name"
                  containerStyle="mt-4"
                  labelTitle="Name"
                  updateFormValue={updateFormValue}
                />
                <InputText
                  defaultValue={registerObj.emailId}
                  updateType="emailId"
                  containerStyle="mt-4"
                  labelTitle="Email Id"
                  updateFormValue={updateFormValue}
                />
                <div className="relative">
                  <InputText
                    defaultValue={registerObj.password}
                    type={showPassword ? "text" : "password"}
                    updateType="password"
                    containerStyle="mt-4"
                    labelTitle="Password"
                    updateFormValue={updateFormValue}
                  />
                  <button
                    type="button"
                    className="absolute right-2 top-10 text-sm text-primary"
                    onClick={togglePasswordVisibility}
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
                <div className="relative">
                  <InputText
                    defaultValue={registerObj.confirmPassword}
                    type={showPassword ? "text" : "password"}
                    updateType="confirmPassword"
                    containerStyle="mt-4"
                    labelTitle="Confirm Password"
                    updateFormValue={updateFormValue}
                  />
                  <button
                    type="button"
                    className="absolute right-2 top-10 text-sm text-primary"
                    onClick={togglePasswordVisibility}
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
                <div className="mt-4">
                  <label className="label">Country Code</label>
                  <select
                    value={registerObj.countryCode}
                    onChange={(e) =>
                      updateFormValue({ updateType: "countryCode", value: e.target.value })
                    }
                    className="select select-bordered w-full"
                  >
                    <option value="+91">India (+91)</option>
                    <option value="+971">UAE (+971)</option>
                    <option value="+44">UK (+44)</option>
                    <option value="+1">USA (+1)</option>
                    <option value="+65">Singapore (+65)</option>
                    <option value="+49">Germany (+49)</option>
                  </select>
                  {showNonIndiaMessage && (
                    <p className="text-red-500 mt-2 text-center">Your IP address does not match this country!</p>
                  )}
                </div>
                <InputText
                  defaultValue={registerObj.phoneNumber}
                  updateType="phoneNumber"
                  containerStyle="mt-4"
                  labelTitle="Phone Number"
                  updateFormValue={updateFormValue}
                />
                <InputText
                  defaultValue={registerObj.sponsorUsername}
                  updateType="sponsorUsername"
                  containerStyle="mt-4"
                  labelTitle="Sponsor Username (optional)"
                  updateFormValue={updateFormValue}
                />
              </div>

              <div className="mt-4">
                <label className="checkbox-container flex items-center">
                  <input
                    type="checkbox"
                    checked={acceptTerms}
                    onChange={(e) => setAcceptTerms(e.target.checked)}
                    style={{ width: '20px', height: '20px' }} // Increase checkbox size
                  />
                  <span className="ml-2">
                    I accept the{" "}
                    <button
                      type="button"
                      className="text-blue-500 underline"
                      onClick={() => setShowModal(true)}
                    >
                      terms and conditions
                    </button>
                  </span>
                </label>
              </div>

              <ErrorText styleClass="mt-8">{errorMessage}</ErrorText>
              <button
                type="submit"
                className={`btn mt-2 w-full btn-primary ${loading ? "loading" : ""}`}
              >
                Register
              </button>
              <div className="text-center mt-4">
                Already have an account?{" "}
                <Link to="/login">
                  <span className="inline-block hover:text-primary hover:underline hover:cursor-pointer transition duration-200">
                    Login
                  </span>
                </Link>
              </div>
            </form>
            <p className="mt-4 text-center text-green-500">{message}</p>
          </div>
        </div>
      </div>

      {/* Terms and Conditions Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md" style={{ backgroundColor: '#0F172A' }}>
            <h3 className="text-lg font-semibold text-white">Terms and Conditions</h3>
            <div className="mt-4">
              {terms.length > 0 ? (
                <ul>
                  {terms.map((term, index) => (
                    <li key={index} className="mb-2 text-white">{term.paragraph}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-white">Loading terms and conditions...</p>
              )}
            </div>
            <div className="mt-4 flex justify-end space-x-2">
              <button
                className="btn btn-secondary"
                onClick={() => setShowModal(false)}
              >
                Close
              </button>
              <button
                className="btn btn-primary"
                onClick={() => {
                  setAcceptTerms(true);
                  setShowModal(false);
                }}
              >
                I Accept
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Register;