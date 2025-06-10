import React, { useState, useEffect } from 'react';
import axios from 'axios';
import TitleCard from '../../../components/Cards/TitleCard';
import InputRead from '../../../components/Input/InputRead';

function Profile() {
  const [userDetails, setUserDetails] = useState({
    username: '',
    email: '',
    phoneNumber: '',
  });
  const [error, setError] = useState(null); // Error state
  const [loading, setLoading] = useState(true); // Loading state

  // Retry logic function
  const fetchDataWithRetry = async (url, options = {}, retries = 3, delay = 1000) => {
    try {
      const res = await axios.get(url, options);
      return res.data;
    } catch (err) {
      if (retries > 0) {
        console.warn(`Retrying in ${delay}ms... Attempts left: ${retries}`);
        await new Promise((res) => setTimeout(res, delay)); // Wait before retrying
        return fetchDataWithRetry(url, options, retries - 1, delay * 2); // Exponential backoff
      } else {
        throw err; // Throw error after retries are exhausted
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
            timeout: 5000, // Timeout after 5 seconds
          }
        );

        setUserDetails({
          username: data.username || '',
          email: data.email || '',
          phoneNumber: data.phoneNumber || 'N/A',
        });
        setError(null); // Clear error if the request is successful
      } catch (err) {
        setError('Failed to fetch profile data. Please try again.');
        console.error('Error fetching profile:', err);
      } finally {
        setLoading(false); // Stop loading once the request completes
      }
    };

    fetchProfile();
  }, []);

  if (loading) return <p>Loading...</p>; // Show loading state
  if (error) return <p className="text-red-500">{error}</p>; // Show error message

  return (
    <>
      <div className="animate-fadeIn">
        {/* Top Card: Profile Details */}
        {/* Separate Cards for Each Detail */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card for Username */}
          <TitleCard title="Username" topMargin="mt-2">
            <InputRead defaultValue={userDetails.username} disabled />
            
          </TitleCard>

          {/* Card for Email */}
          <TitleCard title="Email-Id" topMargin="mt-2">
            <InputRead defaultValue={userDetails.email} disabled />
          </TitleCard>

          {/* Card for Phone Number */}
          <TitleCard title="Phone No." topMargin="mt-2">
            <InputRead defaultValue={userDetails.phoneNumber} disabled />
          </TitleCard>
        </div>
      </div>
    </>
  );
}

export default Profile;
