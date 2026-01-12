'use client';

import React, { createContext, useContext, useState, useRef, useCallback, ReactNode } from 'react';
import { AlertTriangle, Info } from 'lucide-react';
import styles from '@/styles/confirmmodal.module.scss';

// Tipos
type ConfirmVariant = 'danger' | 'info';

interface ConfirmOptions {
    title: string;
    message: string;
    variant?: ConfirmVariant;
    confirmText?: string;
    cancelText?: string;
}

interface ConfirmContextData {
    confirm: (options: ConfirmOptions) => Promise<boolean>;
}

const ConfirmContext = createContext<ConfirmContextData>({} as ConfirmContextData);

export const ConfirmProvider = ({ children }: { children: ReactNode }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [options, setOptions] = useState<ConfirmOptions>({
        title: '',
        message: '',
        variant: 'danger',
        confirmText: 'Confirmar',
        cancelText: 'Cancelar',
    });

    const resolveRef = useRef<(value: boolean) => void>(() => { });

    const confirm = useCallback((opts: ConfirmOptions) => {
        setOptions({
            variant: 'danger', // Default
            confirmText: 'Confirmar',
            cancelText: 'Cancelar',
            ...opts,
        });
        setIsOpen(true);

        return new Promise<boolean>((resolve) => {
            resolveRef.current = resolve;
        });
    }, []);

    const handleCancel = () => {
        setIsOpen(false);
        resolveRef.current(false);
    };

    const handleConfirm = () => {
        setIsOpen(false);
        resolveRef.current(true);
    };

    return (
        <ConfirmContext.Provider value={{ confirm }}>
            {children}

            {/* Renderização do Modal */}
            {isOpen && (
                <div className={styles.overlay} onClick={handleCancel}>
                    <div
                        className={styles.modal}
                        onClick={(e) => e.stopPropagation()} // Impede fechar ao clicar dentro
                        role="dialog"
                    >
                        <div className={styles.header}>
                            <div className={`${styles.iconWrapper} ${styles[options.variant!]}`}>
                                {options.variant === 'danger' ? <AlertTriangle size={20} /> : <Info size={20} />}
                            </div>

                            <div className={styles.textContent}>
                                <h3>{options.title}</h3>
                                <p>{options.message}</p>
                            </div>
                        </div>

                        <div className={styles.actions}>
                            <button className={`${styles.btn} ${styles.btnCancel}`} onClick={handleCancel}>
                                {options.cancelText}
                            </button>
                            <button
                                className={`${styles.btn} ${styles.btnConfirm} ${styles[options.variant!]}`}
                                onClick={handleConfirm}
                                autoFocus // Foca no botão de confirmar para acessibilidade (ou cancele se preferir segurança)
                            >
                                {options.confirmText}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </ConfirmContext.Provider>
    );
};

export const useConfirm = () => useContext(ConfirmContext);