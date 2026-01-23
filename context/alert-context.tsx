'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';
import styles from '@/styles/alerts.module.scss';

type AlertType = 'success' | 'error' | 'warning' | 'info';

interface Alert {
    id: string;
    type: AlertType;
    title?: string;
    message: string;
    duration: number;
    isExiting?: boolean;
}

interface AlertContextData {
    showAlert: (type: AlertType, message: string, title?: string, duration?: number) => void;
}

const AlertContext = createContext<AlertContextData>({} as AlertContextData);

let globalShowAlert: AlertContextData['showAlert'] | null = null;

const PENDING_ALERT_KEY = 'pendingAlert';

export const showAlertGlobal = (type: AlertType, message: string, title?: string, duration?: number) => {
    if (globalShowAlert) {
        globalShowAlert(type, message, title, duration);
    } else {
        console.warn('AlertProvider is not mounted yet');
    }
};

export const showAlertAfterRedirect = (type: AlertType, message: string, title?: string, duration?: number) => {
    if (typeof window !== 'undefined') {
        sessionStorage.setItem(PENDING_ALERT_KEY, JSON.stringify({ type, message, title, duration }));
    }
};

export const AlertProvider = ({ children }: { children: ReactNode }) => {
    const [alerts, setAlerts] = useState<Alert[]>([]);

    const removeAlert = useCallback((id: string) => {
        setAlerts((prev) => prev.map((alert) =>
            alert.id === id ? { ...alert, isExiting: true } : alert
        ));

        setTimeout(() => {
            setAlerts((prev) => prev.filter((alert) => alert.id !== id));
        }, 400);
    }, []);

    const showAlert = useCallback((
        type: AlertType,
        message: string,
        title?: string,
        duration = 5000
    ) => {
        const id = Math.random().toString(36).substr(2, 9);

        const defaultTitles = {
            success: 'Success!',
            error: 'Error!',
            warning: 'Warning!',
            info: 'Information'
        };

        const newAlert: Alert = {
            id,
            type,
            message,
            title: title || defaultTitles[type],
            duration,
            isExiting: false
        };

        setAlerts((prev) => [...prev, newAlert]);

        if (duration > 0) {
            setTimeout(() => {
                removeAlert(id);
            }, duration);
        }
    }, [removeAlert]);

    useEffect(() => {
        globalShowAlert = showAlert;

        const pendingAlert = sessionStorage.getItem(PENDING_ALERT_KEY);
        if (pendingAlert) {
            try {
                const { type, message, title, duration } = JSON.parse(pendingAlert);
                showAlert(type, message, title, duration);
                sessionStorage.removeItem(PENDING_ALERT_KEY);
            } catch (e) {
                console.error('Error processing pending alert:', e);
            }
        }

        return () => {
            globalShowAlert = null;
        };
    }, [showAlert]);
    return (
        <AlertContext.Provider value={{ showAlert }}>
            {children}

            <div className={styles.alertContainer}>
                {alerts.map((alert) => (
                    <div
                        key={alert.id}
                        className={`${styles.alertCard} ${styles[alert.type]} ${alert.isExiting ? styles.exiting : ''}`}
                    >
                        <div className={styles.icon}>
                            {alert.type === 'success' && <CheckCircle size={24} />}
                            {alert.type === 'error' && <XCircle size={24} />}
                            {alert.type === 'warning' && <AlertTriangle size={24} />}
                            {alert.type === 'info' && <Info size={24} />}
                        </div>

                        <div className={styles.content}>
                            <div className={styles.title}>{alert.title}</div>
                            <div className={styles.message}>{alert.message}</div>
                        </div>

                        <button className={styles.closeBtn} onClick={() => removeAlert(alert.id)}>
                            <X size={18} />
                        </button>

                        <div className={styles.progressBar}>
                            <div
                                className={styles.progressFill}
                                style={{
                                    animation: `${styles.timer} ${alert.duration}ms linear forwards`,
                                    backgroundColor:
                                        alert.type === 'success' ? '#2ecc71' :
                                            alert.type === 'error' ? '#e74c3c' :
                                                alert.type === 'warning' ? '#f1c40f' : '#3498db'
                                }}
                            />
                        </div>
                    </div>
                ))}
            </div>
        </AlertContext.Provider>
    );
};

export const useAlert = () => useContext(AlertContext);