import React, { useEffect, useState } from 'react';
import axios from 'axios';

function NotificationBodyRightDrawer() {
    const [notifications, setNotifications] = useState([]);

    const fetchDataWithRetry = async (url, retries = 3) => {
        try {
            const res = await axios.get(url, { timeout: 5000 }); // Timeout after 5 seconds
            return res.data;
        } catch (err) {
            if (retries > 0) {
                console.warn(`Retrying... Attempts left: ${retries}`);
                return fetchDataWithRetry(url, retries - 1);
            } else {
                throw err; // Throw error after retries are exhausted
            }
        }
    };

    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                const data = await fetchDataWithRetry('http://localhost:5000/api/users/getnotifications');
                setNotifications(data);
            } catch (error) {
                console.error('Error fetching notifications:', error);
            }
        };

        fetchNotifications();
    }, []);

    return (
        <>
            {notifications.map((notification, i) => (
                <div
                    key={i}
                    className={
                        "grid mt-3 card bg-base-200 rounded-box p-3" +
                        (notification.isImportant ? " bg-blue-900" : "")
                    }
                >
                    {notification.message}
                </div>
            ))}
        </>
    );
}

export default NotificationBodyRightDrawer;
