import React, { useState, useEffect } from 'react';
import axios from 'axios';
import DashboardStats from './components/DashboardStats';
import DoughnutChart from './components/DoughnutChart';
import CurrencyDollarIcon from '@heroicons/react/24/outline/CurrencyDollarIcon';
import CreditCardIcon from '@heroicons/react/24/outline/CreditCardIcon';
import { useDispatch } from 'react-redux';
import { showNotification, clearNotification } from '../common/headerSlice';

function Dashboard() {
  const [statsData, setStatsData] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [totalAmountInvested, setTotalAmountInvested] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [approvedTransactions, setApprovedTransactions] = useState([]);
  const [totalTokens, setTotalTokens] = useState(0);
  const [availableTokens, setAvailableTokens] = useState(0);
  const [totalTokensWithdrawn, setTotalTokensWithdrawn] = useState(0);
  const dispatch = useDispatch();

  const fetchDataWithRetry = async (url, options = {}, retries = 3) => {
    try {
      const response = await axios(url, { ...options, timeout: 5000 }); // 5 seconds timeout
      return response.data;
    } catch (error) {
      if (retries > 0) {
        return fetchDataWithRetry(url, options, retries - 1); // Retry logic
      } else {
        throw error; // Throw after retry limit
      }
    }
  };

  useEffect(() => {
    dispatch(clearNotification());
    const fetchStats = async () => {
      const token = localStorage.getItem('token');

      if (!token) {
        setError('No token found, please log in again.');
        setLoading(false);
        return;
      }

      try {
        const statsData = await fetchDataWithRetry(`${process.env.REACT_APP_API_URL}/api/users/stats`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        const formattedData = [
          { title: "Current Token Value", value: `$${statsData.tokenValue}`, icon: <CurrencyDollarIcon className='w-8 h-8' />, description: statsData.tokenDescription || "↗︎ 15%" }
        ];

        setStatsData(formattedData);
        setError(null);
      } catch (err) {
        setError('Failed to fetch stats data after multiple attempts. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    const fetchUserData = async () => {
      const token = localStorage.getItem('token');

      if (!token) {
        setError('No token found, please log in again.');
        dispatch(showNotification({ message: 'No token found, please log in again.', status: 0 }));
        setLoading(false);
        return;
      }

      try {
        const userData = await fetchDataWithRetry(`${process.env.REACT_APP_API_URL}/api/users/profile`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        const investedAmount = userData.totalAmountInvested || 0;
        setTotalAmountInvested(investedAmount);

        const transactionData = await fetchDataWithRetry(`${process.env.REACT_APP_API_URL}/api/users/transactions`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        const sortedTransactions = transactionData.sort((a, b) => new Date(b.dateandtime) - new Date(a.dateandtime));
        setTransactions(sortedTransactions);

        const approvedTrans = sortedTransactions.filter(transaction => transaction.status === 'approved');
        setApprovedTransactions(approvedTrans);

        const totalTokensSum = approvedTrans.reduce((sum, transaction) => sum + (transaction.tokens || 0), 0);
        const availableTokensSum = approvedTrans.reduce((sum, transaction) => sum + (transaction.tokensAvailable || 0), 0);
        const totalWithdrawnTokensSum = approvedTrans.reduce((sum, transaction) => sum + (transaction.tokensWithdrawn || 0), 0);

        setTotalTokens(totalTokensSum);
        setAvailableTokens(availableTokensSum);
        setTotalTokensWithdrawn(totalWithdrawnTokensSum);

        setError(null);
        dispatch(showNotification({ message: 'Data loaded successfully!', status: 1 }));
      } catch (err) {
        setError('Failed to fetch user data after multiple attempts. Please try again later.');
        dispatch(showNotification({ message: 'Failed to fetch data.', status: 0 }));
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
    fetchStats();
  }, [dispatch]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <>
    <div className='min-h-screen lg:min-h-fit'>
      <div className="grid lg:grid-cols-3 mt-2 md:grid-cols-2 grid-cols-1 gap-4 animate-fadeIn">
        {statsData.map((d, k) => (
          <DashboardStats key={k} {...d} colorIndex={k} />
        ))}
        <DashboardStats
          title="Total Amount Invested"
          icon={<CurrencyDollarIcon className='w-8 h-8' />}
          value={`$${totalAmountInvested}`}
          description=""
          colorIndex={0}
        />
        <DashboardStats
          title="Total Tokens"
          icon={<CreditCardIcon className='w-8 h-8' />}
          value={totalTokens}
          description=""
          colorIndex={1}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 mt-4 animate-fadeIn">
        <DashboardStats
          title="Total Available Tokens"
          icon={<CreditCardIcon className='w-8 h-8' />}
          value={availableTokens.toFixed(2)}
          description=""
          colorIndex={0}
        />
        <DashboardStats
          title="Total Tokens Withdrawn"
          icon={<CreditCardIcon className='w-8 h-8' />}
          value={totalTokensWithdrawn.toFixed(2)}
          description=""
          colorIndex={1}
        />
      </div>

     </div>
    </>
  );
}

export default Dashboard;
