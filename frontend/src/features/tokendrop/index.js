import { useState, useEffect } from "react";
import axios from "axios";

function RankBonus() {
    const [userDetails, setUserDetails] = useState({ username: '' });
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const tokenWallet = "$XXXX"; // Static balance formatted as $XXX
    const cardNumber = `XXXX XXXX XXXX ${Math.floor(1000 + Math.random() * 9000)}`;

    // Retry logic for fetching data
    const fetchDataWithRetry = async (url, options = {}, retries = 3, delay = 1000) => {
        try {
            const res = await axios.get(url, { ...options, timeout: 5000 });
            return res.data;
        } catch (err) {
            if (retries > 0) {
                console.warn(`Retrying in ${delay}ms... Attempts left: ${retries}`);
                await new Promise((res) => setTimeout(res, delay));
                return fetchDataWithRetry(url, options, retries - 1, delay * 2);
            } else {
                throw err;
            }
        }
    };

    useEffect(() => {
        const fetchProfile = async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                setError('No token found, please log in again.');
                setLoading(false);
                return;
            }

            try {
                const data = await fetchDataWithRetry(
                    `${process.env.REACT_APP_API_URL}/api/users/profile`,
                    {
                        headers: { Authorization: `Bearer ${token}` },
                        timeout: 5000,
                    }
                );
                setUserDetails({ username: data.username || 'Unknown User' });
                setError(null);
            } catch (err) {
                setError('Failed to fetch username. Please try again.');
                console.error('Error fetching profile:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, []);

    if (loading) return <p className="text-gray-700 text-lg">Loading...</p>;
    if (error) return <p className="text-red-500 text-lg">{error}</p>;

    return (
        <div className="flex flex-col items-center justify-center p-6 animate-fadeIn">
            {/* Credit Card */}
            <div className="relative w-96 h-56 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg shadow-lg text-white p-6 flex flex-col justify-between transform transition-transform hover:scale-105">
                {/* Card Header */}
                <div className="flex justify-between items-center">
                    <h2 className="text-xl font-bold">Peplix</h2>
                    <svg className="w-10 h-10" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/>
                    </svg>
                </div>
                {/* Card Chip */}
                <div className="absolute top-16 left-6 w-12 h-8 bg-gray-300 rounded-md border border-gray-400"></div>
                {/* Card Details */}
                <div className="mt-12">
                    <p className="text-lg tracking-wider">{cardNumber}</p>
                    <div className="flex justify-between mt-4">
                        <div>
                            <p className="text-sm">Card Holder</p>
                            <p className="text-base font-semibold">{userDetails.username}</p>
                        </div>
                        <div>
                            <p className="text-sm">Balance</p>
                            <p className="text-base font-semibold">{tokenWallet}</p>
                        </div>
                    </div>
                </div>
            </div>
            {/* Disabled Redeem Button */}
            <button 
                className="mt-6 px-6 py-2 bg-gray-300 text-gray-600 rounded-lg cursor-not-allowed" 
                disabled
            >
                Coming Soon
            </button>
            {/* Footer Note */}
           
        </div>
    );
}

export default RankBonus;