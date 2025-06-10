import { themeChange } from 'theme-change';
import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import BellIcon from '@heroicons/react/24/outline/BellIcon';
import Bars3Icon from '@heroicons/react/24/outline/Bars3Icon';
import MoonIcon from '@heroicons/react/24/outline/MoonIcon';
import SunIcon from '@heroicons/react/24/outline/SunIcon';
import { openRightDrawer } from '../features/common/rightDrawerSlice';
import { RIGHT_DRAWER_TYPES } from '../utils/globalConstantUtil';
import { FaUserLarge } from "react-icons/fa6";
import { NavLink, Routes, Link, useLocation } from 'react-router-dom';

function Header() {
    const dispatch = useDispatch();
    const { noOfNotifications, pageTitle } = useSelector(state => state.header);
    const [currentTheme, setCurrentTheme] = useState(localStorage.getItem("theme"));
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    useEffect(() => {
        themeChange(false);
        if (currentTheme === null) {
            if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
                setCurrentTheme("dark");
            } else {
                setCurrentTheme("light");
            }
        }
    }, [currentTheme]);

    // Opening right sidebar for notification
    const openNotification = () => {
        dispatch(openRightDrawer({ header: "Notifications", bodyType: RIGHT_DRAWER_TYPES.NOTIFICATION }));
    };

    const logoutUser = () => {
        localStorage.clear();
        window.location.href = '/';
    };

    const handleOptionClick = () => {
        setIsDropdownOpen(false);
    };

    return (
        <div className="navbar sticky top-0 bg-base-100 z-10 shadow-md px-4 md:px-8">
            {/* Menu toggle for mobile view */}
            <div className="flex-1 flex items-center">
                <label
                    htmlFor="left-sidebar-drawer"
                    className="btn bg-base-100 p-3 drawer-button lg:hidden mr-4"
                >
                    <Bars3Icon className="h-5 w-5" />
                </label>
                <h1 className="text-lg md:text-2xl font-semibold">{pageTitle}</h1>
            </div>

            <div className="flex-none flex items-center space-x-4">
                {/* Theme toggle */}
                <label className="swap">
                    <input type="checkbox" />
                    <SunIcon data-set-theme="light" data-act-class="ACTIVECLASS" className={"fill-current w-6 h-6 " + (currentTheme === "dark" ? "swap-on" : "swap-off")} />
                    <MoonIcon data-set-theme="dark" data-act-class="ACTIVECLASS" className={"fill-current w-6 h-6 " + (currentTheme === "light" ? "swap-on" : "swap-off")} />
                </label>

                <div className="flex items-center space-x-2">
                    {/* Notification icon */}
                    <button className="btn btn-ghost btn-circle relative" onClick={() => openNotification()}>
                        <BellIcon className="h-6 w-6" />
                        {noOfNotifications > 0 && (
                            <span className="badge badge-secondary badge-sm absolute top-0 right-0">{noOfNotifications}</span>
                        )}
                    </button>

                    {/* Profile icon */}
                    <div className="dropdown dropdown-end" onClick={() => setIsDropdownOpen(!isDropdownOpen)}>
                        <label tabIndex={0} className="btn btn-ghost btn-circle">
                            <div className="rounded-full">
                                <FaUserLarge />
                            </div>
                        </label>
                        {isDropdownOpen && (
                            <ul tabIndex={0} className="menu menu-compact dropdown-content mt-3 p-2 shadow bg-base-100 rounded-box w-52">
                                <li><Link to={'/app/profile-details'} onClick={handleOptionClick}>Profile Details</Link></li>
                                <div className="divider my-0"></div>
                                <li><a onClick={() => { handleOptionClick(); logoutUser(); }}>Logout</a></li>
                            </ul>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Header;
