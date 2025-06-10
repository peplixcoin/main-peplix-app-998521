import React, { useState, useEffect } from "react";
import axios from "axios";
import TitleCard from "../../../components/Cards/TitleCard";
import { useDispatch } from 'react-redux';
import { showNotification, clearNotification } from '../../common/headerSlice';

function Billing() {
    const [totalAmountInvested, setTotalAmountInvested] = useState(0);
    const [transactions, setTransactions] = useState([]);
    const [approvedTransactions, setApprovedTransactions] = useState([]);
    const [totalTokens, setTotalTokens] = useState(0);
    const [availableTokens, setAvailableTokens] = useState(0);
    const [totalTokensWithdrawn, setTotalTokensWithdrawn] = useState(0);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const dispatch = useDispatch();

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
        dispatch(clearNotification());

        const fetchUserData = async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                setError('No token found, please log in again.');
                dispatch(showNotification({ message: 'No token found, please log in again.', status: 0 }));
                setLoading(false);
                return;
            }
            try {
                const resUser = await fetchDataWithRetry('http://localhost:5000/api/users/profile', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const investedAmount = resUser.totalAmountInvested || 0;
                setTotalAmountInvested(investedAmount);

                const resTransactions = await fetchDataWithRetry('http://localhost:5000/api/users/transactions', {
                    headers: { Authorization: `Bearer ${token}` }
                });

                const sortedTransactions = resTransactions.sort((a, b) => new Date(b.dateandtime) - new Date(a.dateandtime));
                setTransactions(sortedTransactions);

                // Filter only approved transactions for the cards
                const approvedTrans = sortedTransactions.filter(transaction => transaction.status === 'approved');
                setApprovedTransactions(approvedTrans);

                // Calculate tokens and other data for approved transactions only
                const totalTokensSum = approvedTrans.reduce((sum, transaction) => sum + (transaction.tokens || 0), 0);
                const availableTokensSum = approvedTrans.reduce((sum, transaction) => sum + (transaction.tokensAvailable || 0), 0);
                const totalWithdrawnTokensSum = approvedTrans.reduce((sum, transaction) => sum + (transaction.tokensWithdrawn || 0), 0);

                setTotalTokens(totalTokensSum);
                setAvailableTokens(availableTokensSum);
                setTotalTokensWithdrawn(totalWithdrawnTokensSum);

                setError(null);
                dispatch(showNotification({ message: 'Data loaded successfully!', status: 1 }));
            } catch (err) {
                setError('Failed to fetch data.');
                dispatch(showNotification({ message: 'Failed to fetch data.', status: 0 }));
            } finally {
                setLoading(false);
            }
        };

        fetchUserData();
    }, [dispatch]);

    const getTransactionStatus = (status) => {
        if (status === "approved") return <div className="badge badge-success">{status}</div>;
        if (status === "pending") return <div className="badge badge-primary">{status}</div>;
        if (status === "rejected") return <div className="badge badge-error">{status}</div>;
        return <div className="badge badge-ghost">{status}</div>;
    };

    if (loading) return <p>Loading...</p>;
    if (error) return <p className="text-red-500">{error}</p>;

    return (
        <>
            {/* Cards for approved transactions only */}
            <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-1 gap-6 mb-6">
                {approvedTransactions.map((transaction) => (
                    <TitleCard key={transaction._id} title={transaction.packageName} topMargin="mt-2">
                        <p className="text-lg">Total Tokens: {transaction.tokens}</p>
                        <p className="text-lg">Tokens Available: {transaction.tokensAvailable.toFixed(2)}</p>
                        <p className="text-lg">Tokens Withdrawn: {transaction.tokensWithdrawn}</p>
                        <p className="text-lg">Minimum Tokens: {transaction.min_tokens_req}</p>
                    </TitleCard>
                ))}
            </div>

            {/* Show all transactions in transaction history */}
            <TitleCard title="Transaction History" topMargin="mt-2">    
                <div className="overflow-x-auto w-full animate-fadeIn">
                    <table className="table w-full">
                        <thead>
                            <tr>
                                <th>Package Name</th>
                                <th>Package Price</th>
                                <th>Package Tokens</th>
                                <th>Stacking Period</th>
                                <th>Date</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {transactions.map((transaction) => (
                                <tr key={transaction._id}>
                                    <td>{transaction.packageName}</td>
                                    <td>${transaction.packagePrice}</td>
                                    <td>{transaction.tokens}</td>
                                    <td>{transaction.stackingPeriod} Days</td>
                                    <td>{new Date(transaction.dateandtime).toLocaleDateString()}</td>
                                    <td>{getTransactionStatus(transaction.status)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </TitleCard>
        </>
    );
}

export default Billing;
