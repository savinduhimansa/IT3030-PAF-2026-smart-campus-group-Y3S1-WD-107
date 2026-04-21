import React, { createContext, useContext, useState, useEffect } from 'react';
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';
import { notificationApi } from '../services/api';

const NotificationContext = createContext();

export const useNotification = () => useContext(NotificationContext);

export const NotificationProvider = ({ children }) => {
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [stompClient, setStompClient] = useState(null);

    const userRole = localStorage.getItem('role');
    const userIdRaw = localStorage.getItem('userId');
    const userId = userIdRaw ? Number(userIdRaw) : null;
    const userString = localStorage.getItem('user');
    const user = userString ? JSON.parse(userString) : null;

    useEffect(() => {
        if (userId) {
            fetchInitialData();
        }
    }, [userId]);

    const fetchInitialData = async () => {
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
        }
    };

    useEffect(() => {
        if (userId) {
            const client = new Client({
                webSocketFactory: () => new SockJS('http://localhost:8080/ws-notifications'),
                reconnectDelay: 5000,

                // --- NEW: Enable debugging to see exactly what is happening under the hood ---
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
            setStompClient(client);

            return () => {
                if (client) {
                    client.deactivate();
                }
            };
        }
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
        <NotificationContext.Provider value={{ notifications, unreadCount, markAsRead }}>
            {children}
        </NotificationContext.Provider>
    );
};