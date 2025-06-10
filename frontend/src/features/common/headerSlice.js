import { createSlice } from '@reduxjs/toolkit'

export const headerSlice = createSlice({
    name: 'header',
    initialState: {
        pageTitle: "Home",  // current page title state management
        noOfNotifications: 0,  // no of unread notifications
        newNotificationMessage: "",  // message of notification to be shown
        newNotificationStatus: 1,   // to check the notification type - success/error/info
    },
    reducers: {
        setPageTitle: (state, action) => {
            state.pageTitle = action.payload.title;
        },


        removeNotificationMessage: (state, action) => {
            state.newNotificationMessage = ""
        },


        // Action to show a notification with a message and status
        showNotification: (state, action) => {
            state.newNotificationMessage = action.payload.message;
            state.newNotificationStatus = action.payload.status;
        },

        // Action to clear the current notification (both message and status)
        clearNotification: (state) => {
            state.newNotificationMessage = "";
            state.newNotificationStatus = 1; // Reset to default (success or neutral)
        },
    }
});

// Export the actions
export const { setPageTitle, showNotification, removeNotificationMessage, clearNotification } = headerSlice.actions;

// Export the reducer
export default headerSlice.reducer;
