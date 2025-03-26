'use client'
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, ArrowRight } from 'lucide-react';
import RecentRooms from '@/components/RecentRooms';
import { updateRoomAccess, api } from '@/lib/roomUtils';

export default function Dashboard() {
    const router = useRouter();
    const [newRoomName, setNewRoomName] = useState('');
    const [joinRoomSlug, setJoinRoomSlug] = useState('');

    useEffect(() => {
        const token = localStorage.getItem('authToken');    
        if (!token) {
            router.push('/login');
        }
    }, [router]);

    const handleCreateRoom = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            console.log('Creating room:', newRoomName);
            const res = await api.post('/room/create-room', {
                "name": newRoomName
            });
            console.log(res.data);
            if (res.data.roomId) {
                // Update room access before navigation
                await updateRoomAccess(newRoomName);
                router.push(`/canvas/${newRoomName}`);
            }
        } catch (error) {
            console.error('Room Creation failed:', error);
            // Handle errors (e.g., show error message)
        }
    };

    const handleJoinRoom = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!joinRoomSlug) return;
        
        try {
            // Update room access before navigation
            await updateRoomAccess(joinRoomSlug);
            router.push(`/canvas/${joinRoomSlug}`);
        } catch (error) {
            console.error('Failed to join room:', error);
            // Still navigate to the room even if access update fails
            router.push(`/canvas/${joinRoomSlug}`);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-100 to-purple-100">
            {/* Header */}
            <header className="bg-white shadow-sm">
                <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
                    <h1 className="text-2xl font-bold text-gray-900">Welcome to Sketchpencil</h1>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
                <div className="grid gap-8 md:grid-cols-2">
                    {/* Create New Room Section */}
                    <div className="bg-white rounded-lg shadow-lg p-6">
                        <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                            <Plus className="h-5 w-5 text-blue-600 mr-2" />
                            Create New Room
                        </h2>
                        <form onSubmit={handleCreateRoom} className="space-y-4">
                            <div>
                                <label htmlFor="roomName" className="block text-sm font-medium text-gray-700 mb-2">
                                    Room Name
                                </label>
                                <input
                                    type="text"
                                    id="roomName"
                                    value={newRoomName}
                                    onChange={(e) => setNewRoomName(e.target.value)}
                                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="Enter room name"
                                    required
                                />
                            </div>
                            <button
                                type="submit"
                                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200 flex items-center justify-center"
                            >
                                Create Room
                                <ArrowRight className="ml-2 h-5 w-5" />
                            </button>
                        </form>
                    </div>

                    {/* Join Room Section */}
                    <div className="bg-white rounded-lg shadow-lg p-6">
                        <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                            <ArrowRight className="h-5 w-5 text-blue-600 mr-2" />
                            Join Existing Room
                        </h2>
                        <form onSubmit={handleJoinRoom}>
                            <div>
                                <label htmlFor="joinRoomSlug" className="block text-sm font-medium text-gray-700 mb-2">
                                    Room Name
                                </label>
                                <input
                                    type="text"
                                    id="joinRoomSlug"
                                    value={joinRoomSlug}
                                    onChange={(e) => setJoinRoomSlug(e.target.value)}
                                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="Enter room name to join"
                                    required
                                />
                            </div>
                            <button
                                type="submit"
                                className="mt-4 w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors duration-200 flex items-center justify-center"
                            >
                                Join Room
                                <ArrowRight className="ml-2 h-5 w-5" />
                            </button>
                        </form>
                    </div>
                </div>

                {/* Recent Rooms Section */}
                <RecentRooms />
            </main>
        </div>
    );
}