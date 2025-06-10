import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import TitleCard from "../../components/Cards/TitleCard";
import { clearNotification } from '../common/headerSlice';
import { useDispatch } from "react-redux";

function PackageList() {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Retry logic for fetching data
  const fetchDataWithRetry = async (url, retries = 3) => {
    try {
      const res = await axios.get(url, { timeout: 5000 }); // Timeout after 5 seconds
      return res.data;
    } catch (err) {
      if (retries > 0) {
        return fetchDataWithRetry(url, retries - 1);
      } else {
        throw err; // Throw error after retries are exhausted
      }
    }
  };

  useEffect(() => {
    dispatch(clearNotification());
    const fetchPackages = async () => {
      try {
        const data = await fetchDataWithRetry('http://localhost:5000/api/users/packages');

        // Sort the packages by price in ascending order
        const sortedPackages = data.sort((a, b) => a.price - b.price);

        setPackages(sortedPackages);
        setError(null); // Clear any previous errors
      } catch (err) {
        setError('Failed to fetch packages. Please try again later.');
        console.error('Error fetching packages:', err);
      } finally {
        setLoading(false); // Hide loading state when finished
      }
    };

    fetchPackages();
  }, []);

  // Handle package buy click
  const handlePackageClick = (pkg) => {
    navigate(`/app/packages/buy-package/${pkg._id}`);
  };

  if (loading) return <p>Loading packages...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className="container mx-auto ">
      {/* Title for Available Packages */}

      {/* Grid for Package Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6  animate-fadeIn">
        {packages.map((pkg) => (
          <TitleCard key={pkg._id} title={pkg.name} topMargin="mt-4">
            <p className="mb-6">
              Price: <span className="text-green-600">${pkg.price}</span>
            </p>
            <button
              className="btn btn-primary w-full mt-4"
              onClick={() => handlePackageClick(pkg)}
            >
              Buy Now
            </button>
          </TitleCard>
        ))}
      </div>
    </div>
  );
}

export default PackageList;
