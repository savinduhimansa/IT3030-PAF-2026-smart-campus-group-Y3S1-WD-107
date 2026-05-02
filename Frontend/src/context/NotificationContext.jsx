import React, { createContext, useContext, useState, useEffect } from 'react';
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';
import { notificationApi } from '../services/api';

// Fix 1: Added default value 'null' to createContext
const NotificationContext = createContext(null);

// Fix 2: Disabled fast refresh warning for this specific hook export
// eslint-disable-next-line react-refresh/only-export-components
export const useNotification = () => useContext(NotificationContext);

export const NotificationProvider = ({ children }) => {
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isLoading, setIsLoading] = useState(true);

    // Fix 3: Removed unused variables (userRole, user, stompClient)
    const userIdRaw = localStorage.getItem('userId');
    const userId = userIdRaw ? Number(userIdRaw) : null;

    useEffect(() => {
        // Fix 4: Moved fetchInitialData inside useEffect to fix missing dependency warning
        const fetchInitialData = async () => {
            setIsLoading(true);
            try {
                const countRes = await notificationApi.getUnreadCount(userId);
                setUnreadCount(countRes.data);

                const notifRes = await notificationApi.getUserNotifications(userId);
                setNotifications(notifRes.data);

                const unreadNotifs = notifRes.data.filter(n => n.read === false || n.isRead === false);
                if (unreadNotifs.length > 0 && !sessionStorage.getItem('welcomeToastShown')) {
                    const event = new CustomEvent('show-toast', {
                        detail: { message: unreadNotifs[0].message, type: 'success' }
                    });
                    window.dispatchEvent(event);
                    sessionStorage.setItem('welcomeToastShown', 'true');
                }
            } catch (error) {
                console.error("Error fetching notifications:", error);
            } finally {
                setTimeout(() => {
                    setIsLoading(false);
                }, 2000);
            }
        };

        if (userId) {
            // Fix 5: Handled ignored promise warning
            void fetchInitialData();
        }
    }, [userId]);

    useEffect(() => {
        if (!userId) return;

        const client = new Client({
            webSocketFactory: () => new SockJS('http://localhost:8080/ws-notifications'),
            reconnectDelay: 5000,

            debug: (str) => {
                console.log('STOMP DEBUG: ' + str);
            },

            onConnect: () => {
                console.log(`✅ SUCCESS: Connected! Subscribing to /topic/user/${userId}/notifications`);

                client.subscribe(`/topic/user/${userId}/notifications`, (message) => {
                    console.log("🔥 LIVE MESSAGE ARRIVED: ", message.body);
                    const newNotification = JSON.parse(message.body);

                    const event = new CustomEvent('show-toast', {
                        detail: { message: newNotification.message, type: 'success' }
                    });
                    window.dispatchEvent(event);

                    setNotifications((prev) => [newNotification, ...prev]);
                    setUnreadCount((prev) => prev + 1);
                });
            },
            onStompError: (frame) => {
                console.error('Broker reported error: ' + frame.headers['message']);
                console.error('Additional details: ' + frame.body);
            },
        });

        client.activate();

        return () => {
            if (client) {
                client.deactivate();
            }
        };
    }, [userId]);

    const markAsRead = async (notificationId) => {
        try {
            await notificationApi.markAsRead(notificationId);
            setNotifications(notifications.map(n =>
                n.id === notificationId ? { ...n, isRead: true } : n
            ));
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (error) {
            console.error("Error marking as read:", error);
        }
    };

    return (
        <NotificationContext.Provider value={{ notifications, unreadCount, markAsRead, isLoading }}>
            {children}
        </NotificationContext.Provider>
    );
};