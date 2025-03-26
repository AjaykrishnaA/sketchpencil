'use client'
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Clock, ArrowRight } from 'lucide-react';
import axios from 'axios';
import { HTTP_BACKEND } from '@/config';

interface RoomAccess {
    roomId: string;
    lastAccessed: string;
    room: {
        slug: string;
    };
}

interface GroupedRooms {
    recent: RoomAccess[];
    lastMonth: RoomAccess[];
    older: RoomAccess[];
}

export default function Dashboard() {
    const router = useRouter();
    const [newRoomName, setNewRoomName] = useState('');
    const [joinRoomSlug, setJoinRoomSlug] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [groupedRooms, setGroupedRooms] = useState<GroupedRooms>({
        recent: [],
        lastMonth: [],
        older: []
    });

    useEffect(() => {
        const fetchRecentRooms = async () => {
            setIsLoading(true);
            try {
                const response = await axios.get(`${HTTP_BACKEND}/roomAccess/recentrooms`, {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('authToken')}`
                    }
                });
                
                const rooms: RoomAccess[] = response.data.recentRooms;
                const now = new Date();
                const sevenDaysAgo = new Date(now.setDate(now.getDate() - 7));
                const thirtyDaysAgo = new Date(now.setDate(now.getDate() - 23));

                const grouped = rooms.reduce((acc: GroupedRooms, room) => {
                    const lastAccessed = new Date(room.lastAccessed);
                    if (lastAccessed >= sevenDaysAgo) {
                        acc.recent.push(room);
                    } else if (lastAccessed >= thirtyDaysAgo) {
                        acc.lastMonth.push(room);
                    } else {
                        acc.older.push(room);
                    }
                    return acc;
                }, { recent: [], lastMonth: [], older: [] });

                setGroupedRooms(grouped);
            } catch (error) {
                console.error('Failed to fetch recent rooms:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchRecentRooms();
    }, []);

    const updateRoomAccess = async (roomSlug: string) => {
        try {
            await axios.post(`${HTTP_BACKEND}/roomAccess/update`, {
                roomSlug: roomSlug
            }, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('authToken')}`
                }
            });
        } catch (error) {
            console.error('Failed to update room access:', error);
        }
    };

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

    const handleRoomClick = async (roomSlug: string) => {
        try {
            // Update room access before navigation
            await updateRoomAccess(roomSlug);
            router.push(`/canvas/${roomSlug}`);
        } catch (error) {
            console.error('Failed to update room access:', error);
            // Still navigate to the room even if access update fails
            router.push(`/canvas/${roomSlug}`);
        }
    };

    const RoomGroup = ({ title, rooms }: { title: string; rooms: RoomAccess[] }) => (
        rooms.length > 0 ? (
            <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-700 mb-3">{title}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {rooms.map((room) => (
                        <div
                            key={room.roomId}
                            onClick={() => handleRoomClick(room.room.slug)}
                            className="bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer border border-gray-200 hover:border-blue-500"
                        >
                            <div className="flex items-center justify-between">
                                <span className="font-medium text-gray-900">{room.room.slug}</span>
                                <Clock className="h-4 w-4 text-gray-400" />
                            </div>
                            <p className="text-sm text-gray-500 mt-1">
                                Last accessed: {new Date(room.lastAccessed).toLocaleDateString()}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        ) : null
    );

    const EmptyState = () => (
        <div className="text-center py-8">
            <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Recent Rooms</h3>
            <p className="text-gray-500 mb-4">
                You haven't accessed any rooms yet. Create a new room or join an existing one to get started!
            </p>
            <div className="flex justify-center space-x-4">
                <button
                    onClick={() => document.getElementById('roomName')?.focus()}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                    <Plus className="h-4 w-4 mr-2" />
                    Create Room
                </button>
                <button
                    onClick={() => document.getElementById('joinRoomSlug')?.focus()}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                    <ArrowRight className="h-4 w-4 mr-2" />
                    Join Room
                </button>
            </div>
        </div>
    );

    const LoadingState = () => (
        <div className="space-y-6">
            <div className="animate-pulse">
                <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                            <div className="flex items-center justify-between">
                                <div className="h-5 bg-gray-200 rounded w-3/4"></div>
                                <div className="h-4 w-4 bg-gray-200 rounded"></div>
                            </div>
                            <div className="mt-2 h-4 bg-gray-200 rounded w-1/2"></div>
                        </div>
                    ))}
                </div>
            </div>
            <div className="animate-pulse">
                <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[1, 2].map((i) => (
                        <div key={i} className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                            <div className="flex items-center justify-between">
                                <div className="h-5 bg-gray-200 rounded w-3/4"></div>
                                <div className="h-4 w-4 bg-gray-200 rounded"></div>
                            </div>
                            <div className="mt-2 h-4 bg-gray-200 rounded w-1/2"></div>
                        </div>
                    ))}
                </div>
            </div>
            <div className="animate-pulse">
                <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[1].map((i) => (
                        <div key={i} className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                            <div className="flex items-center justify-between">
                                <div className="h-5 bg-gray-200 rounded w-3/4"></div>
                                <div className="h-4 w-4 bg-gray-200 rounded"></div>
                            </div>
                            <div className="mt-2 h-4 bg-gray-200 rounded w-1/2"></div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );

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
                <div className="mt-8 bg-white rounded-lg shadow-lg p-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                        <Clock className="h-5 w-5 text-blue-600 mr-2" />
                        Recently Accessed Rooms
                    </h2>
                    
                    {isLoading ? (
                        <LoadingState />
                    ) : groupedRooms.recent.length === 0 && 
                        groupedRooms.lastMonth.length === 0 && 
                        groupedRooms.older.length === 0 ? (
                        <EmptyState />
                    ) : (
                        <>
                            <RoomGroup title="Last 7 Days" rooms={groupedRooms.recent} />
                            <RoomGroup title="Last 30 Days" rooms={groupedRooms.lastMonth} />
                            <RoomGroup title="Earlier" rooms={groupedRooms.older} />
                        </>
                    )}
                </div>
            </main>
        </div>
    );
}