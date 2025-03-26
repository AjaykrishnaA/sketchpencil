'use client'
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { User, Mail, Lock } from 'lucide-react';
import axios from 'axios';
import { HTTP_BACKEND } from '@/config';
import { createUserSchema, signinSchema } from "@repo/common/types"; 
import { z } from 'zod';

export default function AuthPage({ isSignin }: {
    isSignin: boolean
}) {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [errors, setErrors] = useState<{
        email?: string[];
        password?: string[];
        name?: string[];
        form?: string[];
    }>({});

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrors({});
        
        try {
            // Validate form data using Zod schemas
            const schema = isSignin ? signinSchema : createUserSchema;
            const payload = isSignin ? { email, password } : { email, password, name };
            
            // Parse with Zod
            schema.parse(payload);
            
            const url = isSignin ? '/signin' : '/signup';

            const res = await axios.post(`${HTTP_BACKEND}${url}`, payload);

            // Handle successful login
            console.log(res.data);
            
            // Store token (if returned)
            if (res.data.token) {
                localStorage.setItem('authToken', res.data.token);
            }

            // Redirect to dashboard
            router.push('/dashboard');
            
        } catch (error) {
            if (error instanceof z.ZodError) {
                // Format and set validation errors
                const formattedErrors: Record<string, string[]> = {};
                
                error.errors.forEach((err: z.ZodIssue) => {
                    const field = err.path[0] as string;
                    if (!formattedErrors[field]) {
                        formattedErrors[field] = [];
                    }
                    formattedErrors[field].push(err.message);
                });
                
                setErrors(formattedErrors);
            } else {
                // Handle API errors
                console.error('Login failed:', error);
                setErrors({ form: ['Authentication failed. Please try again.'] });
            }
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-8">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        {isSignin ? 'Welcome Back' : 'Create Account'}
                    </h1>
                    <p className="text-gray-600">
                        {isSignin 
                            ? 'Sign in to access your account' 
                            : 'Sign up to get started with your new account'}
                    </p>
                </div>

                {errors.form && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                        {errors.form.map((error, i) => (
                            <p key={i}>{error}</p>
                        ))}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    {!isSignin && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Full Name
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <User className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className={`block w-full pl-10 pr-3 py-2 border ${errors.name ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                                    placeholder="John Doe"
                                    required
                                />
                            </div>
                            {errors.name && (
                                <div className="mt-1 text-sm text-red-600">
                                    {errors.name.map((error, i) => (
                                        <p key={i}>{error}</p>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Email Address
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Mail className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className={`block w-full pl-10 pr-3 py-2 border ${errors.email ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                                placeholder="johndoe@example.com"
                                required
                            />
                        </div>
                        {errors.email && (
                            <div className="mt-1 text-sm text-red-600">
                                {errors.email.map((error, i) => (
                                    <p key={i}>{error}</p>
                                ))}
                            </div>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Password
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Lock className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className={`block w-full pl-10 pr-3 py-2 border ${errors.password ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                                placeholder="********"
                                required
                            />
                        </div>
                        {errors.password && (
                            <div className="mt-1 text-sm text-red-600">
                                {errors.password.map((error, i) => (
                                    <p key={i}>{error}</p>
                                ))}
                            </div>
                        )}
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200"
                    >
                        {isSignin ? 'Sign In' : 'Sign Up'}
                    </button>
                    {isSignin && (
                        <p className="mt-4 text-center text-sm text-gray-600">
                           Don&apos;t have an account?{' '}
                            <a href="/signup" className="text-blue-600 hover:underline">
                                Sign up
                            </a>
                        </p>
                    )}
                    {!isSignin && (
                        <p className="mt-4 text-center text-sm text-gray-600">
                            Already have an account?{' '}
                            <a href="/signin" className="text-blue-600 hover:underline">
                                Sign in
                            </a>
                        </p>
                    )}
                </form>
            </div>
        </div>
    );
}