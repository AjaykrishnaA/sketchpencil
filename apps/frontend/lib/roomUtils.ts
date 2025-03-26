import { api } from './api';

export const updateRoomAccess = async (roomSlug: string) => {
    try {
        await api.post('/roomAccess/update', {
            roomSlug: roomSlug
        });
    } catch (error) {
        console.error('Failed to update room access:', error);
        throw error;
    }
};

// Re-export api for convenience
export { api }; 