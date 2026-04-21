import { io } from 'socket.io-client';

const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
const wsUrl = import.meta.env.VITE_WS_URL || apiUrl.replace(/\/api\/?$/, '');

const socket = io(wsUrl, {
  autoConnect: false,
  reconnection: true,
  reconnectionAttempts: 3,
  reconnectionDelay: 1500,
  reconnectionDelayMax: 8000,
  timeout: 5000,
  auth: (cb) => cb({ token: localStorage.getItem('accessToken') }),
});

export const connectSocket = () => {
  const token = localStorage.getItem('accessToken');

  if (!token || socket.connected || socket.active) {
    return socket;
  }

  socket.connect();
  return socket;
};

export const disconnectSocket = () => {
  if (socket.connected || socket.active) {
    socket.disconnect();
  }

  return socket;
};

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
