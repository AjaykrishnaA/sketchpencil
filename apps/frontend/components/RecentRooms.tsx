'use client'
import { useState, useEffect } from 'react';
import { Clock, Plus, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import AuthGuard from '@/components/AuthGuard';
import { updateRoomAccess, api } from '@/lib/roomUtils';

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

export default function RecentRooms() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true);
    const [groupedRooms, setGroupedRooms] = useState<GroupedRooms>({
        recent: [],
        lastMonth: [],
        older: []
    });

    useEffect(() => {
        const authToken = localStorage.getItem('authToken');
        if (!authToken) {
            router.push('/signin');
            return;
        }

        const fetchRecentRooms = async () => {
            setIsLoading(true);
            try {
                const response = await api.get('/roomAccess/recentrooms');
                
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
    }, [router]);

    const handleRoomClick = async (roomSlug: string) => {
        try {
            // Update room access before navigation
            await updateRoomAccess(roomSlug);
            router.push(`/canvas/${roomSlug}`);
        } catch (error) {
            console.error('Failed to handle room click:', error);
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

    const EmptyState = () => (
        <div className="text-center py-8">
            <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Recent Rooms</h3>
            <p className="text-gray-500 mb-4">
                You haven&apos;t accessed any rooms yet. Create a new room or join an existing one to get started!
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

    if (isLoading) {
        return <LoadingState />;
    }

    return (
        <AuthGuard>
            <div className="mt-8 bg-white rounded-lg shadow-lg p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                    <Clock className="h-5 w-5 text-blue-600 mr-2" />
                    Recently Accessed Rooms
                </h2>
                
                {groupedRooms.recent.length === 0 && 
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
        </AuthGuard>
    );
}