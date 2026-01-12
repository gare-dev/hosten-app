'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';
import styles from '@/styles/alerts.module.scss';

// Definições de Tipo
type AlertType = 'success' | 'error' | 'warning' | 'info';

interface Alert {
    id: string;
    type: AlertType;
    title?: string;
    message: string;
    duration: number;
    isExiting?: boolean; // Controle da animação de saída
}

interface AlertContextData {
    showAlert: (type: AlertType, message: string, title?: string, duration?: number) => void;
}

const AlertContext = createContext<AlertContextData>({} as AlertContextData);

export const AlertProvider = ({ children }: { children: ReactNode }) => {
    const [alerts, setAlerts] = useState<Alert[]>([]);

    const removeAlert = useCallback((id: string) => {
        // 1. Marca como "saindo" para ativar a animação CSS
        setAlerts((prev) => prev.map((alert) =>
            alert.id === id ? { ...alert, isExiting: true } : alert
        ));

        // 2. Remove do estado após a animação terminar (400ms do CSS)
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

        // Define títulos padrão se não forem passados
        const defaultTitles = {
            success: 'Sucesso!',
            error: 'Erro!',
            warning: 'Atenção!',
            info: 'Informação'
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

        // Timer automático para iniciar a remoção
        if (duration > 0) {
            setTimeout(() => {
                removeAlert(id);
            }, duration);
        }
    }, [removeAlert]);

    return (
        <AlertContext.Provider value={{ showAlert }}>
            {children}

            {/* Container de Alertas (Renderizado no topo da app) */}
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

                        {/* Barrinha de progresso */}
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