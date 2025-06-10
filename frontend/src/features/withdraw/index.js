import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { showNotification, clearNotification } from '../common/headerSlice';
import TitleCard from "../../components/Cards/TitleCard";
import axios from 'axios';
import WithdrawalsHistory from './WithdrawalsHistory';
import { useNavigate } from 'react-router-dom';

function Withdraw() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [noOfTokens, setNoOfTokens] = useState('');
  const [upiId, setUpiId] = useState('');
  const [confirmUpiId, setConfirmUpiId] = useState('');
  const [transactionPackages, setTransactionPackages] = useState([]);
  const [selectedTransaction, setSelectedTransaction] = useState('');
  const [message, setMessage] = useState('');
  const [redirectCountdown, setRedirectCountdown] = useState(null);

  // Retry logic for fetching data
  const fetchDataWithRetry = async (url, options = {}, retries = 4) => {
    try {
      const res = await axios.get(url, { ...options, timeout: 5000 });
      return res.data;
    } catch (error) {
      if (retries > 0) {
        return fetchDataWithRetry(url, options, retries - 1);
      } else {
        throw error;
      }
    }
  };

  // Fetch token value from the backend
  useEffect(() => {
    dispatch(clearNotification());
  }, [dispatch]);

  // Fetch user's approved transactions
  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const data = await fetchDataWithRetry('http://localhost:5000/api/users/transactions', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        setTransactionPackages(data);
      } catch (error) {
        console.error('Error fetching transaction packages', error);
        dispatch(showNotification({ message: 'Failed to fetch transaction packages.', status: 0 }));
      }
    };
    fetchTransactions();
  }, [dispatch]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedTransaction) {
      dispatch(showNotification({ message: 'Please select a transaction package.', status: 0 }));
      return;
    }

    const selectedPackage = transactionPackages.find(pkg => pkg._id === selectedTransaction);

    if (noOfTokens > selectedPackage.tokensAvailable) {
      dispatch(showNotification({ message: 'Insufficient tokens in this package to withdraw.', status: 0 }));
      return;
    }

    const totalTokens = selectedPackage.tokensAvailable + selectedPackage.tokensWithdrawn;
    if (totalTokens < selectedPackage.min_tokens_req) {
      dispatch(showNotification({ message: `You need a minimum of ${selectedPackage.min_tokens_req} tokens to withdraw from this package.`, status: 0 }));
      return;
    }

    if (upiId !== confirmUpiId) {
      dispatch(showNotification({ message: 'Wallet Address IDs do not match. Please re-enter.', status: 0 }));
      return;
    }

    try {
      const res = await axios.post(
        'http://localhost:5000/api/users/withdraw',
        { noOfTokens, upiId, transactionId: selectedTransaction },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        }
      );
      setMessage(res.data.message);
      dispatch(showNotification({ message: 'Withdrawal Request sent successfully. Redirecting to dashboard in 5 seconds...', status: 1 }));

      setNoOfTokens('');
      setUpiId('');
      setConfirmUpiId('');
      setSelectedTransaction('');

      setRedirectCountdown(5);
      const interval = setInterval(() => {
        setRedirectCountdown((prevCountdown) => {
          if (prevCountdown <= 1) {
            clearInterval(interval);
            navigate('/app/dashboard');
          }
          return prevCountdown - 1;
        });
      }, 1000);

    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Error processing withdrawal';
      dispatch(showNotification({ message: errorMsg, status: 0 }));
    }
  };

  return (
    <>
      <div className="mt-4">
        <div className="animate-fadeIn mx-auto shadow-lg rounded-lg">
          <TitleCard title="Withdraw Tokens" topMargin="mt-0">
            {/* Transaction Selection */}
            <div className="mb-6">
              <label htmlFor="transactionPackage" className="block text-lg font-semibold text-gray-600 mb-2">
                Select Transaction Package:
              </label>
              <select
                id="transactionPackage"
                value={selectedTransaction}
                onChange={(e) => setSelectedTransaction(e.target.value)}
                className="input input-bordered w-full p-3 border-gray-300 rounded-md"
                required
              >
                <option value="">Select a package</option>
                {transactionPackages
                  .filter((pkg) => pkg.status === 'approved')
                  .map((pkg) => (
                    <option key={pkg._id} value={pkg._id}>
                      {pkg.packageName} - {pkg.tokensAvailable.toFixed(2)} tokens available
                    </option>
                  ))}
              </select>
            </div>

            {/* Number of Tokens */}
            <div className="mb-6">
              <label htmlFor="tokens" className="block text-lg font-semibold text-gray-600 mb-2">
                Enter Number of Tokens:
              </label>
              <input
                type="number"
                id="tokens"
                value={noOfTokens}
                onChange={(e) => setNoOfTokens(e.target.value)}
                className="input input-bordered w-full p-3 border-gray-300 rounded-md"
                placeholder="Enter number of tokens"
                required
              />
            </div>

            {/* Wallet Address ID */}
            <div className="mb-6">
              <label htmlFor="upiId" className="block text-lg font-semibold text-gray-600 mb-2">
                Wallet Address :
              </label>
              <input
                type="text"
                id="upiId"
                value={upiId}
                onChange={(e) => setUpiId(e.target.value)}
                className="input input-bordered w-full p-3 border-gray-300 rounded-md"
                placeholder="Enter your Wallet Address ID"
                required
              />
            </div>

            {/* Confirm Wallet Address ID */}
            <div className="mb-6">
              <label htmlFor="confirmUpiId" className="block text-lg font-semibold text-gray-600 mb-2">
                Confirm Wallet Address :
              </label>
              <input
                type="text"
                id="confirmUpiId"
                value={confirmUpiId}
                onChange={(e) => setConfirmUpiId(e.target.value)}
                className="input input-bordered w-full p-3 border-gray-300 rounded-md"
                placeholder="Re-enter your Wallet Address ID"
                required
              />
            </div>

            {/* Withdraw Button */}
            <button
              onClick={handleSubmit}
              className="btn btn-primary w-full p-3 font-bold rounded-md hover:bg-blue-700 transition duration-300 mt-1"
            >
              Submit Withdrawal Request
            </button>

            {/* Success Message */}
            {message && (
              <p className="mt-4 text-center text-green-600 font-semibold">
                {message}
              </p>
            )}

            {/* Countdown for redirection */}
            {redirectCountdown !== null && (
              <p className="mt-4 text-center text-gray-600 font-semibold">
                Redirecting to dashboard in {redirectCountdown} second{redirectCountdown !== 1 ? 's' : ''}.
              </p>
            )}
          </TitleCard>
        </div>

        {/* Withdrawals History Component */}
        <WithdrawalsHistory />
      </div>
    </>
  );
}

export default Withdraw;
