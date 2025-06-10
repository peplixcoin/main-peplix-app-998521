import React, { useEffect, useState } from 'react';
import axios from 'axios';
import TitleCard from "../../components/Cards/TitleCard";
import moment from 'moment';

function WithdrawalsHistory() {
  const [withdrawals, setWithdrawals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Retry logic for fetching data
  const fetchDataWithRetry = async (url, options = {}, retries = 3) => {
    try {
      const res = await axios.get(url, { ...options, timeout: 5000 }); // 5-second timeout
      return res.data;
    } catch (error) {
      if (retries > 0) {
        return fetchDataWithRetry(url, options, retries - 1); // Retry the request
      } else {
        throw error; // Throw error after retries are exhausted
      }
    }
  };

  useEffect(() => {
    const fetchWithdrawals = async () => {
      try {
        const token = localStorage.getItem('token');
        const data = await fetchDataWithRetry('http://localhost:5000/api/users/withdrawals-history', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setWithdrawals(data);
        setError(''); // Clear any previous error
      } catch (error) {
        console.error("Error fetching withdrawals:", error);
        setError('Failed to load withdrawal history. Please try again.');
      } finally {
        setLoading(false); // Stop loading state
      }
    };

    fetchWithdrawals();
  }, []);

  const getWithdrawStatus = (status) => {
    if (status === "approved") return <div className="badge badge-success">{status}</div>;
    if (status === "pending") return <div className="badge badge-primary">{status}</div>;
    if (status === "rejected") return <div className="badge badge-error">{status}</div>;
    return <div className="badge badge-ghost">{status}</div>;
  };

  if (loading) return <p className="text-center mt-4">Loading...</p>;
  if (error) return <p className="text-center text-red-500">{error}</p>;

  return (
    <>
      <div className="mt-5 grid grid-cols-1 gap-6 mb-6 animate-fadeIn">
        <TitleCard title="Withdrawal History" topMargin="mt-2">
          {withdrawals.length === 0 ? (
            <p className="text-center">No withdrawals found</p>
          ) : (
            <div className="overflow-x-auto w-full">
              <table className="table w-full">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Tokens</th>
                    <th>Value ($)</th>
                    <th>Wallet Adress</th>
                    <th>Status</th>
                    <th>Transaction ID</th>
                  </tr>
                </thead>
                <tbody>
                  {withdrawals.map((withdrawal, index) => (
                    <tr key={index}>
                      <td className="p-4">{moment(withdrawal.requestedAt).format("DD MMM YYYY")}</td>
                      <td className="p-4">{withdrawal.noOfTokens}</td>
                      <td className="p-4">${withdrawal.value}</td>
                      <td className="p-4">{withdrawal.upiId}</td>
                      <td className="p-4">{getWithdrawStatus(withdrawal.status)}</td>
                      <td className="p-4">{withdrawal.utrNo || 'N/A'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </TitleCard>
      </div>
    </>
  );
}

export default WithdrawalsHistory;
