'use client'
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Clock, ArrowRight } from 'lucide-react';
import axios from 'axios';
import { HTTP_BACKEND } from '@/config';

interface Room {
    id: string;
    name: string;
    lastAccessed: string;
}

export default function Dashboard() {
    const router = useRouter();
    const [newRoomName, setNewRoomName] = useState('');
    // const [recentRooms, setRecentRooms] = useState<Room[]>([
    //     { id: '1', name: 'Project Wireframes', lastAccessed: '2024-02-10T10:30:00' },
    //     { id: '2', name: 'UI Design Review', lastAccessed: '2024-02-09T15:45:00' },
    //     { id: '3', name: 'Team Brainstorm', lastAccessed: '2024-02-08T09:15:00' }
    // ]);

    const handleCreateRoom = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            console.log('Creating room:', newRoomName);
            const res = await axios.post(`${HTTP_BACKEND}/room/create-room`, {
                "name": newRoomName
            }, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('authToken')}`
                }
            });
            console.log(res.data);
            if (res.data.roomId) {
                router.push(`/canvas/${newRoomName}`);
            }
        } catch (error) {
            console.error('Room Creation failed:', error);
            // Handle errors (e.g., show error message)
        }
    };

    const handleJoinRoom = (roomId: string) => {
        // Handle room joining logic here
        console.log('Joining room:', roomId);
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

                    {/* Recent Rooms Section */}
                    <div className="bg-white rounded-lg shadow-lg p-6">
                        <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                            <Clock className="h-5 w-5 text-blue-600 mr-2" />
                            Recent Rooms
                        </h2>
                        {/* <div className="space-y-4">
                            {recentRooms.map((room) => (
                                <div
                                    key={room.id}
                                    className="group border border-gray-200 rounded-lg p-4 hover:border-blue-500 transition-colors duration-200"
                                >
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <h3 className="text-lg font-medium text-gray-900 group-hover:text-blue-600 transition-colors duration-200">
                                                {room.name}
                                            </h3>
                                            <p className="text-sm text-gray-500">
                                                Last accessed: {new Date(room.lastAccessed).toLocaleDateString()}
                                            </p>
                                        </div>
                                        <button
                                            onClick={() => handleJoinRoom(room.id)}
                                            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-blue-600 hover:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200"
                                        >
                                            Join
                                        </button>
                                    </div>
                                </div>
                            ))}
                            {recentRooms.length === 0 && (
                                <p className="text-center text-gray-500 py-4">
                                    No recent rooms found
                                </p>
                            )}
                        </div> */}
                    </div>
                </div>
            </main>
        </div>
    );
}