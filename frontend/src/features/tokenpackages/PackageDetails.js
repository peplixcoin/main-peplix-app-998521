import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import TitleCard from "../../components/Cards/TitleCard";
import { useDispatch } from 'react-redux';
import CurrencyDollarIcon from '@heroicons/react/24/outline/CurrencyDollarIcon';
import { showNotification, clearNotification } from '../common/headerSlice';

function PackageDetails() {
    const { packageId } = useParams();
    const [packageDetails, setPackageDetails] = useState(null);
    const [tokenValue, setTokenValue] = useState(null); // New state for tokenValue
    const [calculatedTokens, setCalculatedTokens] = useState(null); // New state for calculated tokens
    const [message, setMessage] = useState('');
    const [utr, setUTR] = useState('');
    const [isUTRVisible, setIsUTRVisible] = useState(false);
    const [redirectCountdown, setRedirectCountdown] = useState(null);
    const [paymentStarted, setPaymentStarted] = useState(false);
    const [timeLeft, setTimeLeft] = useState(600); // Timer set for 10 minutes
    const [showQRCode, setShowQRCode] = useState(false);
    const [qrCodeUrl, setQRCodeUrl] = useState(null); // QR code URL state
    const [amountInINR, setAmountInINR] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false); // To disable the button while retrying
    const [showStakingOptions, setShowStakingOptions] = useState(false); // Control staking options visibility
    const [stakingType, setStakingType] = useState('fixed'); // Default to fixed staking
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const walletAddress = "TPkFPwgUZHnntSH6djHDH9GFggbgkGipH9"; // Static wallet address

    const fetchDataWithRetry = async (url, retries = 3) => {
        try {
            const res = await axios.get(url, { timeout: 5000 });
            return res.data;
        } catch (err) {
            if (retries > 0) {
                return fetchDataWithRetry(url, retries - 1);
            } else {
                throw err;
            }
        }
    };

    // Fetch package details
    useEffect(() => {
        dispatch(clearNotification());
        const fetchPackageDetails = async () => {
            try {
                const data = await fetchDataWithRetry(`${process.env.REACT_APP_API_URL}/api/users/packages/${packageId}`);
                setPackageDetails(data);
            } catch (err) {
                console.error('Failed to fetch package details', err);
                dispatch(showNotification({ message: 'Failed to load package details. Please try again later.', status: 0 }));
            }
        };
        fetchPackageDetails();
    }, [packageId, dispatch]);

    // Fetch tokenValue from /stats
    useEffect(() => {
        const fetchTokenValue = async () => {
            try {
                const data = await fetchDataWithRetry(`${process.env.REACT_APP_API_URL}/api/users/stats`, {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                });
                if (data && data.tokenValue > 0) {
                    setTokenValue(data.tokenValue);
                } else {
                    setMessage('Invalid or missing token value.');
                    dispatch(showNotification({ message: 'Invalid or missing token value.', status: 0 }));
                }
            } catch (err) {
                console.error('Failed to fetch token value:', err);
                setMessage('Failed to fetch token value.');
                dispatch(showNotification({ message: 'Failed to fetch token value.', status: 0 }));
            }
        };
        fetchTokenValue();
    }, [dispatch]);

    // Calculate tokens when packageDetails and tokenValue are available
    useEffect(() => {
        if (packageDetails && tokenValue) {
            const tokens = Math.floor(packageDetails.price / tokenValue);
            setCalculatedTokens(tokens);
        }
    }, [packageDetails, tokenValue]);

    // Fetch USD rate and calculate amountInINR
    useEffect(() => {
        const fetchUSDRate = async () => {
            try {
                const data = await fetchDataWithRetry(`${process.env.REACT_APP_API_URL}/api/users/usd-rate`);
                const rateInINR = data.rate;
                if (packageDetails) {
                    setAmountInINR((packageDetails.price * rateInINR).toFixed(2));
                }
            } catch (err) {
                console.error('Failed to fetch USD exchange rate:', err);
                setMessage('Failed to fetch the exchange rate.');
                dispatch(showNotification({ message: 'Failed to fetch the exchange rate.', status: 0 }));
            }
        };

        if (packageDetails) {
            fetchUSDRate();
        }
    }, [packageDetails]);

    // Fetch QR code
    useEffect(() => {
        if (showQRCode) {
            fetchQRCodeWithRetry();
        }
    }, [showQRCode]);

    const fetchQRCodeWithRetry = async (retries = 3) => {
        try {
            const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/users/qr-code`, {
                responseType: 'arraybuffer',
            });
            const imageBlob = new Blob([response.data], { type: response.headers['content-type'] });
            const imageUrl = URL.createObjectURL(imageBlob);
            setQRCodeUrl(imageUrl);
        } catch (error) {
            if (retries > 0) {
                console.warn('Retrying to fetch QR code...');
                return fetchQRCodeWithRetry(retries - 1);
            } else {
                console.error('Failed to fetch QR code after multiple attempts:', error);
                setMessage('Failed to load QR code. Please try again.');
                dispatch(showNotification({ message: 'Failed to load QR code. Please try again.', status: 0 }));
            }
        }
    };

    // Handle timer for payment
    useEffect(() => {
        if (paymentStarted && timeLeft > 0) {
            const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
            return () => clearTimeout(timer);
        }

        if (timeLeft === 0) {
            setMessage("Payment time has expired. Redirecting to dashboard in 5 seconds.");
            setShowQRCode(false);
            setPaymentStarted(false);
            setShowStakingOptions(false);

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
        }
    }, [paymentStarted, timeLeft, navigate]);

    const handlePurchase = () => {
        setShowStakingOptions(true); // Show staking options directly
    };

    const handlePaymentDone = () => {
        setShowQRCode(false);
        setPaymentStarted(false);
        setIsUTRVisible(true);
        setShowStakingOptions(false);
    };

    const handleSubmitUTR = async () => {
        if (!utr.trim()) {
            setMessage('Please enter the Transaction ID before submitting.');
            dispatch(showNotification({ message: 'Please enter the Transaction ID before submitting.', status: 0 }));
            return;
        }

        if (utr.length !== 64) {
            setMessage('Please enter a valid 64-digit Transaction ID.');
            dispatch(showNotification({ message: 'Please enter a valid 64-digit Transaction ID.', status: 0 }));
            return;
        }

        if (window.confirm('Are you sure you want to submit this Transaction ID?')) {
            setIsSubmitting(true);

            const token = localStorage.getItem('token');
            const submitUTRWithRetry = async (retries = 3) => {
                try {
                    const response = await axios.post(
                        `${process.env.REACT_APP_API_URL}/api/users/submit-utr`,
                        {
                            packageId: packageDetails._id,
                            packageAmount: packageDetails.price,
                            packageName: packageDetails.name,
                            stackingPeriod: packageDetails.stacking_period,
                            min_tokens_req: packageDetails.min_tokens_req,
                            utr,
                            amountInINR,
                        },
                        { headers: { Authorization: `Bearer ${token}` }, timeout: 5000 }
                    );

                    setMessage(`Transaction ID submitted successfully! You will receive ${response.data.tokens} tokens. Transaction is pending approval.`);
                    dispatch(showNotification({ 
                        message: `Transaction ID submitted successfully! You will receive ${response.data.tokens} tokens. Redirecting to dashboard in 5 seconds...`, 
                        status: 1 
                    }));
                    setIsUTRVisible(false);

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
                } catch (err) {
                    if (err.response && err.response.status === 400 && err.response.data.message === 'Transaction ID has already been submitted. Please use a unique Transaction ID.') {
                        setMessage('This Transaction ID has already been submitted. Please enter a unique Transaction ID.');
                        dispatch(showNotification({ message: 'This Transaction ID has already been submitted. Please enter a unique Transaction ID.', status: 0 }));
                    } else if (retries > 0) {
                        return submitUTRWithRetry(retries - 1);
                    } else {
                        setMessage('Failed to submit Transaction ID after multiple attempts. Please try again.');
                        dispatch(showNotification({ message: 'Failed to submit Transaction ID after multiple attempts. Please try again.', status: 0 }));
                    }
                } finally {
                    setIsSubmitting(false);
                }
            };

            submitUTRWithRetry();
        }
    };

    const handleStakingChange = (e) => {
        setStakingType(e.target.value);
    };

    const handleStakingConfirm = () => {
        setShowQRCode(true);
        setPaymentStarted(true);
        setShowStakingOptions(false);
    };

    if (!packageDetails || tokenValue === null) {
        return (
            <div className="flex justify-center items-center h-screen">
                <p className="text-lg text-gray-600">Loading package details...</p>
            </div>
        );
    }

    // Calculate displayed tokens based on staking type
    const displayedTokens = stakingType === 'smart' && calculatedTokens ? Math.floor(calculatedTokens * 0.65) : calculatedTokens;

    return (
        <div className="container mx-auto animate-fadeIn">
            <TitleCard title={`${packageDetails.name}`} topMargin="mt-2">
                <div className="mb-6">
                    <p className="text-lg"><strong>Price:</strong> <span className="text-green-600">${packageDetails.price}</span></p>
                    <p className="text-lg"><strong>Tokens:</strong> {displayedTokens !== null ? displayedTokens : 'Calculating...'}</p>
                    <p className="text-lg"><strong>Stacking Period:</strong> {packageDetails.stacking_period} days</p>
                    <p className="text-lg"><strong>Features:</strong></p>
                    <ul className="list-disc ml-6 text-lg">
                        {packageDetails.feature1 && <li>{packageDetails.feature1}</li>}
                        {packageDetails.feature2 && <li>{packageDetails.feature2}</li>}
                        {packageDetails.feature3 && <li>{packageDetails.feature3}</li>}
                        {packageDetails.feature4 && <li>{packageDetails.feature4}</li>}
                    </ul>
                    <p className="text-lg text-red-500 mt-2"><strong>Minimum Tokens:</strong> {packageDetails.min_tokens_req}</p>
                </div>

                {!isUTRVisible && (
                    <>
                        {!showQRCode && !showStakingOptions && (
                            <button
                                onClick={handlePurchase}
                                className="btn btn-primary w-full py-3 font-bold rounded-md hover:bg-blue-700 transition duration-300"
                            >
                                Buy Now
                            </button>
                        )}

                        {showStakingOptions && (
                            <div className="mt-4">
                                <h4 className="text-lg font-semibold mb-4">Choose Staking Option</h4>
                                <div className="flex flex-col space-y-2 mb-4">
                                    <label className="flex items-center">
                                        <input
                                            type="radio"
                                            name="stakingType"
                                            value="fixed"
                                            checked={stakingType === 'fixed'}
                                            onChange={handleStakingChange}
                                            className="mr-2"
                                        />
                                        <span className="text-lg">Fixed Staking</span>
                                    </label>
                                    <label className="flex items-center">
                                        <input
                                            type="radio"
                                            name="stakingType"
                                            value="smart"
                                            checked={stakingType === 'smart'}
                                            onChange={handleStakingChange}
                                            className="mr-2"
                                        />
                                        <span className="text-lg">Smart Staking </span>
                                    </label>
                                </div>
                                <button
                                    onClick={handleStakingConfirm}
                                    className="w-full py-3 bg-blue-600 text-white font-bold rounded-md hover:bg-blue-700 transition-colors duration-300"
                                >
                                    Confirm Staking Option
                                </button>
                            </div>
                        )}

                        {showQRCode && (
                            <div className="mt-4 text-center">
                                <p className="text-lg mb-4">Please complete your payment within <span className="font-bold">{Math.floor(timeLeft / 60)}:{timeLeft % 60}</span> minutes.</p>
                                <p className="text-lg break-all"><strong>Wallet Address:</strong> {walletAddress}</p>
                                {qrCodeUrl && <img src={qrCodeUrl} alt="QR Code" className="mx-auto" style={{ width: '200px', height: '200px' }} />}
                                <button
                                    onClick={handlePaymentDone}
                                    className="mt-4 w-full py-3 bg-green-500 text-white font-bold rounded-md hover:bg-green-600 transition-colors duration-300"
                                >
                                    Payment Done
                                </button>
                            </div>
                        )}
                    </>
                )}

                {isUTRVisible && (
                    <div className="mt-8">
                        <h4 className="text-lg font-semibold mb-4">Enter 64 digit Transaction ID to Complete Purchase</h4>
                        <input
                            type="text"
                            placeholder="Enter Transaction ID"
                            value={utr}
                            onChange={(e) => setUTR(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <button
                            onClick={handleSubmitUTR}
                            className="mt-4 w-full py-3 bg-green-500 text-white font-bold rounded-md hover:bg-green-600 transition-colors duration-300"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? 'Submitting Transaction ID...' : 'Submit Transaction ID'}
                        </button>
                    </div>
                )}

                {message && (
                    <p className={`mt-6 text-center ${message.includes('successfully') ? 'text-green-600' : 'text-red-600'} font-semibold`}>
                        {message}
                    </p>
                )}

                {redirectCountdown !== null && (
                    <p className="mt-4 text-center text-gray-600 font-semibold">
                        Redirecting to dashboard in {redirectCountdown} second{redirectCountdown !== 1 ? 's' : ''}.
                    </p>
                )}
            </TitleCard>
        </div>
    );
}

export default PackageDetails;