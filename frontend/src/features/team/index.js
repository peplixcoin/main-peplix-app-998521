import { useEffect, useState } from "react";
import TitleCard from "../../components/Cards/TitleCard";
import axios from 'axios';
import { useDispatch } from "react-redux";
import { showNotification, clearNotification } from '../common/headerSlice';
import { useNavigate } from "react-router-dom";

function Leads() {
    const [wallet, setWallet] = useState(0);
    const [teamMembers, setTeamMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [withdrawWallet, setWithdrawWallet] = useState(0);
    const [withdrawalHistory, setWithdrawalHistory] = useState([]);
    const [withdrawAmount, setWithdrawAmount] = useState('');
    const [upiId, setUpiId] = useState('');
    const [confirmUpiId, setConfirmUpiId] = useState('');
    const [redirectCountdown, setRedirectCountdown] = useState(null);

    const dispatch = useDispatch();
    const navigate = useNavigate();

    const fetchDataWithRetry = async (url, options = {}, retries = 3) => {
        try {
            const res = await axios(url, { ...options, timeout: 5000 });
            return res.data;
        } catch (error) {
            if (retries > 0) {
                return fetchDataWithRetry(url, options, retries - 1);
            } else {
                throw error;
            }
        }
    };

    useEffect(() => {
        dispatch(clearNotification());
        const fetchSponsorAndWallet = async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                dispatch(showNotification({ message: 'No token found. Please log in again.', status: 0 }));
                setLoading(false);
                return;
            }

            try {
                const data = await fetchDataWithRetry('http://localhost:5000/api/users/profile', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setWallet(data.wallet || 0);
               
                setError(null);
            } catch (err) {
                setError('Failed to fetch sponsor and wallet data.');
                dispatch(showNotification({ message: 'Failed to fetch sponsor and wallet data.', status: 0 }));
            } finally {
                setLoading(false);
            }
        };

        const fetchTeamMembers = async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                dispatch(showNotification({ message: 'No token found. Please log in again.', status: 0 }));
                setLoading(false);
                return;
            }

            try {
                const data = await fetchDataWithRetry(`http://localhost:5000/api/users/team`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setTeamMembers(data || []);
            } catch (err) {
                setError('Failed to fetch team members.');
                dispatch(showNotification({ message: 'Failed to fetch team members.', status: 0 }));
            }
        };

        const fetchWithdrawWallet = async () => {
            const token = localStorage.getItem('token');
            try {
                const data = await fetchDataWithRetry('http://localhost:5000/api/users/withdraw-wallet', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setWithdrawWallet(data.withdrawWallet || 0);
            } catch (err) {
                
            }
        };

        const fetchWithdrawalHistory = async () => {
            const token = localStorage.getItem('token');
            try {
                const data = await fetchDataWithRetry('http://localhost:5000/api/users/withdrawal-history', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setWithdrawalHistory(data || []);
            } catch (err) {
                dispatch(showNotification({ message: 'Failed to fetch wallet withdrawal history.', status: 0 }));
            }
        };

        fetchSponsorAndWallet();
        fetchTeamMembers();
        fetchWithdrawWallet();
        fetchWithdrawalHistory();
    }, [dispatch]);

    useEffect(() => {
        if (redirectCountdown !== null && redirectCountdown > 0) {
            const timer = setTimeout(() => {
                setRedirectCountdown(redirectCountdown - 1);
            }, 1000);
            return () => clearTimeout(timer);
        } else if (redirectCountdown === 0) {
            navigate('/app/dashboard');
        }
    }, [redirectCountdown, navigate]);

    const handleWithdrawSubmit = async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            dispatch(showNotification({ message: 'No token found. Please log in again.', status: 0 }));
            return;
        }
    
        if (!withdrawAmount || !upiId || !confirmUpiId) {
            dispatch(showNotification({ message: 'Please fill in all fields.', status: 0 }));
            return;
        }
    
        if (upiId !== confirmUpiId) {
            dispatch(showNotification({ message: 'Wallet Address IDs do not match.', status: 0 }));
            return;
        }
    
        if (parseFloat(withdrawAmount) > wallet) {
            dispatch(showNotification({ message: 'Insufficient amount in your wallet.', status: 0 }));
            return;
        }
    
        try {
            const res = await fetchDataWithRetry('http://localhost:5000/api/users/withdraw-wallet', {
                method: 'POST',
                data: { withdrawAmount, upiId },
                headers: { Authorization: `Bearer ${token}` }
            });
    
            dispatch(showNotification({
                message: 'Withdrawal Request sent successfully. Redirecting to dashboard in 5 seconds...',
                status: 1
            }));
    
            setWithdrawAmount('');
            setUpiId('');
            setConfirmUpiId('');
            setRedirectCountdown(5);
        } catch (err) {
            if (err.response && err.response.data && err.response.data.message === 'You must own at least one package to withdraw funds.') {
                dispatch(showNotification({ message: 'You must own at least one package to withdraw wallet amount', status: 0 }));
            } 
            else if(err.response && err.response.data && err.response.data.message === 'The minimum withdrawal amount is $15.'){
                dispatch(showNotification({ message: 'Minimum wallet withdrawal amount is $15', status: 0 }));
            }
            else {
                dispatch(showNotification({ message: 'Failed to submit withdrawal request.', status: 0 }));
            }
        }
    };
    

    const getWithdrawStatus = (status) => {
        if (status === "approved") return <div className="badge badge-success">{status}</div>;
        if (status === "pending") return <div className="badge badge-primary">{status}</div>;
        if (status === "rejected") return <div className="badge badge-error">{status}</div>;
        return <div className="badge badge-ghost">{status}</div>;
    };

    if (loading) return <p>Loading...</p>;
    if (error) return <p className="text-red-500">{error}</p>;

    return (
        <>
            {/* Cards for Sponsor and Wallet Amount */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6 animate-fadeIn">
               
                <TitleCard title="Wallet Amount" topMargin="mt-2">
                    <p className="text-lg font-semibold">${wallet}</p>
                </TitleCard>
            </div>

            {/* My Team Card */}
            <div className="mb-6 animate-fadeIn">
                <TitleCard title="My Team" topMargin="mt-2">
                    <div className="overflow-x-auto w-full">
                        <table className="table w-full">
                            <thead>
                                <tr>
                                    <th>Username</th>
                                    <th>Rank</th>
                                    <th>Email</th>
                                    <th>Phone Number</th>
                                </tr>
                            </thead>
                            <tbody>
                                {teamMembers.length > 0 ? (
                                    teamMembers.map((member, index) => (
                                        <tr key={index}>
                                            <td>{member.username}</td>
                                            <td>{member.rank}</td>
                                            <td>{member.email}</td>
                                            <td>{member.phoneNumber}</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="4" className="text-center">No team members found</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </TitleCard>
            </div>

            {/* Withdraw Wallet Section */}
            <div className="mb-6 animate-fadeIn">
                <TitleCard title="Withdraw Wallet Amount" topMargin="mt-2">
                    <div>
                        <div className="mb-6">
                            <label htmlFor="withdrawAmount" className="block text-lg font-semibold text-gray-600 mb-2">Withdraw Amount</label>
                            <input
                                type="number"
                                id="withdrawAmount"
                                value={withdrawAmount}
                                onChange={(e) => setWithdrawAmount(e.target.value)}
                                className="input input-bordered w-full p-3 border-gray-300 rounded-md"
                                placeholder="Enter amount to withdraw"
                            />
                        </div>

                        <div className="mb-6">
                            <label htmlFor="upiId" className="block text-lg font-semibold text-gray-600 mb-2">Wallet Address ID</label>
                            <input
                                type="text"
                                id="upiId"
                                value={upiId}
                                onChange={(e) => setUpiId(e.target.value)}
                                className="input input-bordered w-full p-3 border-gray-300 rounded-md"
                                placeholder="Enter your Wallet Address ID"
                            />
                        </div>
                        
                        <div className="mb-6">
                            <label htmlFor="confirmUpiId" className="block text-lg font-semibold text-gray-600 mb-2">Confirm Wallet Address ID</label>
                            <input
                                type="text"
                                id="confirmUpiId"
                                value={confirmUpiId}
                                onChange={(e) => setConfirmUpiId(e.target.value)}
                                className="input input-bordered w-full p-3 border-gray-300 rounded-md"
                                placeholder="Confirm your Wallet Address ID"
                            />
                        </div>

                        <button onClick={handleWithdrawSubmit} className="btn btn-primary w-full p-3 font-bold rounded-md hover:bg-blue-700 transition duration-300 mt-1">Submit Withdrawal Request</button>

                        {/* Countdown for redirection */}
                        {redirectCountdown !== null && (
                            <p className="mt-4 text-center text-gray-600 font-semibold">
                                Redirecting to dashboard in {redirectCountdown} second{redirectCountdown !== 1 ? 's' : ''}.
                            </p>
                        )}
                    </div>
                </TitleCard>
            </div>

            {/* Wallet Withdrawal History */}
            <div className="grid grid-cols-1 md:grid-cols-1 gap-6 mb-6 animate-fadeIn">
                <TitleCard title="Wallet Withdrawal History" topMargin="mt-2">
                    <div className="overflow-x-auto w-full">
                        <table className="table w-full">
                            <thead>
                                <tr>
                                    <th>Date</th>
                                    <th>Amount</th>
                                    <th>Transaction </th>
                                    <th>Wallet Address </th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {withdrawalHistory.length > 0 ? (
                                    withdrawalHistory.map((history, index) => (
                                        <tr key={index}>
                                            <td>{new Date(history.requestedAt).toLocaleDateString()}</td>
                                            <td>${history.withdrawAmount}</td>
                                            <td>{history.utrNo || 'N/A'}</td>
                                            <td>{history.upiId || 'N/A'}</td>
                                            <td>{getWithdrawStatus(history.status)}</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="5" className="text-center">No withdrawal history found</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </TitleCard>
            </div>
        </>
    );
}

export default Leads;
