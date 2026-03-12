import { io } from 'socket.io-client';

const socket = io(import.meta.env.VITE_WS_URL, {
  autoConnect: false,
  auth: (cb) => cb({ token: localStorage.getItem('accessToken') }),
});

export const connectSocket = () => socket.connect();
export const disconnectSocket = () => socket.disconnect();

export const joinAuction = (auctionId) => socket.emit('join_auction', auctionId);
export const leaveAuction = (auctionId) => socket.emit('leave_auction', auctionId);
export const joinNotifications = (userId) => socket.emit('join_notifications', userId);
export const joinActivity = () => socket.emit('join_activity');
export const joinInspections = (branch) => socket.emit('join_inspections', branch);

// Eventos entrantes:
// socket.on('new_bid', ({ auctionId, currentBid, bidsCount, leaderId, userName }) => ...)
// socket.on('auction_ended', ({ auctionId, winnerId, finalBid }) => ...)
// socket.on('auction_status_changed', ({ auctionId, status }) => ...)
// socket.on('notification_created', (notification) => ...)
// socket.on('new_inspection', ({ inspectionId, vehicleId, branch }) => ...)

export default socket;
