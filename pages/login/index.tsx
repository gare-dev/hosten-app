import React, { useState } from 'react';
import Head from 'next/head';
import { Lock, ArrowRight, User } from 'lucide-react';
import styles from '@/styles/login.module.scss';
import { useAlert } from '@/contexts/alert-context';
import { useMutation } from '@tanstack/react-query';
import userLogin from '@/services/user-login';

export default function LoginPage() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const { showAlert } = useAlert();

    const { mutate: login, isPending } = useMutation({
        mutationFn: userLogin,
        onSuccess: (data) => {
            showAlert('success', 'Login successful!');
            // Handle successful login (redirect, save token, etc.)
        },
        onError: (error) => {
            showAlert('error', 'Login failed. Please check your credentials.');
        }
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        login({ username, password });
    };

    return (
        <div className={styles.container}>
            <Head>
                <title>Login | Hosten App</title>
                <meta name="viewport" content="width=device-width, initial-scale=1" />
            </Head>

            <div className={styles.loginWrapper}>
                {/* Left Side - Visual and Branding */}
                <div className={styles.visualSide}>
                    <div className={styles.visualContent}>
                        <h2>Welcome back!</h2>
                        <p>
                            Access your account to manage your projects efficiently and securely.
                            Innovation starts here.
                        </p>
                    </div>
                </div>

                <div className={styles.formSide}>
                    <header className={styles.header}>
                        <h1>Login</h1>
                        <p>Enter your credentials to continue.</p>
                    </header>

                    <form onSubmit={handleSubmit}>
                        <div className={styles.inputGroup}>
                            <label htmlFor="username">Username</label>
                            <div className={styles.inputWrapper}>
                                <User size={20} />
                                <input
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    type="text"
                                    id="username"
                                    placeholder="1234"
                                    required
                                />
                            </div>
                        </div>

                        <div className={styles.inputGroup}>
                            <label htmlFor="password">Password</label>
                            <div className={styles.inputWrapper}>
                                <Lock size={20} />
                                <input
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    type="password"
                                    id="password"
                                    placeholder="••••••••"
                                    required
                                />
                            </div>
                        </div>
                        < button type="submit" className={styles.button} disabled={isPending}>
                            {isPending ? 'Signing in...' : (
                                <>
                                    Sign in  <ArrowRight size={20} />
                                </>
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div >
    );
}