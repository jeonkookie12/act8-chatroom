import { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import trashIcon from './assets/trash.svg';

function App() {
  const [username, setUsername] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [chatrooms, setChatrooms] = useState([]);
  const [currentRoom, setCurrentRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [showCreateRoom, setShowCreateRoom] = useState(false);
  const [newRoomName, setNewRoomName] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const messagesEndRef = useRef(null);
  const wsRef = useRef(null);

  // Socket.IO connection management
  const connectSocket = () => {
    if (wsRef.current) {
      wsRef.current.disconnect();
    }

    console.log('Connecting to WebSocket server...');
    wsRef.current = io('http://localhost:3000', {
      transports: ['websocket', 'polling'],
    });

    wsRef.current.on('connect', () => {
      console.log('Connected to WebSocket server');
      setIsConnected(true);
    });

    wsRef.current.on('disconnect', () => {
      console.log('Disconnected from WebSocket server');
      setIsConnected(false);
    });

    wsRef.current.on('message', (message) => {
      console.log('Received message:', message);
      setMessages(prev => [...prev, message].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp)));

      // Update message count for the room
      setChatrooms(prev => prev.map(room =>
        room.id === message.roomId
          ? { ...room, messageCount: room.messageCount + 1 }
          : room
      ));
    });

    wsRef.current.on('room-history', (data) => {
      console.log('Received room history:', data.messages);
      setMessages((data.messages || []).sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp)));

      // Update message count for the room
      setChatrooms(prev => prev.map(room =>
        room.id === data.roomId
          ? { ...room, messageCount: data.messages?.length || 0 }
          : room
      ));
    });

    wsRef.current.on('chatroom-created', (room) => {
      console.log('New chatroom created:', room);
      setChatrooms(prev => [...prev, room]);
    });

    wsRef.current.on('error', (error) => {
      console.error('WebSocket error:', error);
      alert('WebSocket error: ' + error.message);
    });

    wsRef.current.on('message-deleted', (data) => {
      console.log('Message deleted:', data);
      setMessages(prev => prev.filter(msg => msg.id !== data.messageId));

      // Update message count for the room
      setChatrooms(prev => prev.map(room =>
        room.id === data.roomId
          ? { ...room, messageCount: Math.max(0, room.messageCount - 1) }
          : room
      ));
    });

    wsRef.current.on('chatroom-deleted', (data) => {
      console.log('Chatroom deleted:', data);
      setChatrooms(prev => prev.filter(room => room.id !== data.roomId));
      // Note: Room switching logic moved to useEffect below
    });
  };

  const disconnectWebSocket = () => {
    if (wsRef.current) {
      wsRef.current.disconnect();
      wsRef.current = null;
      setIsConnected(false);
    }
  };

  const sendWebSocketMessage = (type, payload) => {
    if (wsRef.current && wsRef.current.connected) {
      console.log('Sending WebSocket message:', type, payload);
      wsRef.current.emit(type, payload);
    } else {
      console.warn('WebSocket not connected, cannot send message');
    }
  };

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Fetch chatrooms when logged in and connect WebSocket
  useEffect(() => {
    if (isLoggedIn) {
      fetchChatrooms();
      connectSocket();
    } else {
      disconnectWebSocket();
    }

    return () => {
      disconnectWebSocket();
    };
  }, [isLoggedIn]);

  // Auto-switch to another room if current room is deleted
  useEffect(() => {
    if (currentRoom && chatrooms.length > 0) {
      const currentRoomExists = chatrooms.some(room => room.id === currentRoom);
      if (!currentRoomExists) {
        // Current room was deleted, switch to the first available room
        joinRoom(chatrooms[0].id);
      }
    } else if (!currentRoom && chatrooms.length > 0 && isLoggedIn) {
      // No current room selected but rooms are available, auto-select first one
      joinRoom(chatrooms[0].id);
    }
  }, [chatrooms, currentRoom, isLoggedIn]);

  const fetchChatrooms = async () => {
    try {
      console.log('Fetching chatrooms from /api/chatrooms');
      const response = await fetch('/api/chatrooms');
      console.log('Response status:', response.status);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const rooms = await response.json();
      console.log('Received rooms:', rooms);
      setChatrooms(Array.isArray(rooms) ? rooms : []);
    } catch (error) {
      console.error('Error fetching chatrooms:', error);
      alert('Failed to load chatrooms. Please check if the backend server is running.');
      setChatrooms([]);
    }
  };

  const handleLogin = (e) => {
    e.preventDefault();
    if (username.trim()) {
      setIsLoggedIn(true);
      fetchChatrooms(); // Fetch chatrooms when logging in
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUsername('');
    setCurrentRoom(null);
    setMessages([]);
    setChatrooms([]);
    setShowCreateRoom(false);
    setNewRoomName('');
    disconnectWebSocket();
  };

  const joinRoom = (roomId) => {
    setCurrentRoom(roomId);
    sendWebSocketMessage('join-room', { username, roomId });
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !currentRoom) return;

    // Send message via WebSocket for real-time communication
    sendWebSocketMessage('send-message', {
      username,
      message: newMessage.trim(),
      roomId: currentRoom,
    });

    // Clear the input immediately for better UX
    setNewMessage('');
  };

  const createRoom = async (e) => {
    e.preventDefault();
    if (!newRoomName.trim()) return;

    try {
      const response = await fetch('/api/chatrooms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: newRoomName,
        }),
      });

      if (response.ok) {
        const newRoom = await response.json();
        // Immediately add the new room to the local state
        setChatrooms(prev => [...prev, newRoom]);
        setNewRoomName('');
        setShowCreateRoom(false);
        console.log('Created room:', newRoom.name);
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to create room');
      }
    } catch (error) {
      console.error('Error creating room:', error);
      alert('Failed to create room. Please check if the backend server is running.');
    }
  };

  const deleteMessage = (messageId) => {
    if (!currentRoom) return;

    sendWebSocketMessage('delete-message', {
      username,
      roomId: currentRoom,
      messageId,
    });
  };

  const deleteRoom = (roomId) => {
    if (confirm(`Are you sure you want to delete the room "${chatrooms.find(r => r.id === roomId)?.name}"? This will delete all messages in the room.`)) {
      sendWebSocketMessage('delete-room', {
        roomId,
      });
    }
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
          <h1 className="text-2xl font-bold text-center mb-6">Join Chatroom</h1>
          <form onSubmit={handleLogin}>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="username">
                Username
              </label>
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                placeholder="Enter your username"
                required
              />
            </div>
            <button
              type="submit"
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded w-full"
            >
              Join Chat
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex bg-gray-100">
      {/* Sidebar - Chatrooms List */}
      <div className="w-1/4 bg-white border-r border-gray-300 flex flex-col">
        <div className="p-4 border-b border-gray-300">
          <div className="flex justify-between items-center mb-2">
            <div className="flex items-center space-x-2">
              <button
                onClick={handleLogout}
                className="text-gray-500 hover:text-gray-700 text-sm px-2 py-1 rounded"
                title="Logout"
              >
                ← Back
              </button>
              <h2 className="text-lg font-semibold">Chatrooms</h2>
            </div>
            <button
              onClick={() => setShowCreateRoom(!showCreateRoom)}
              className="bg-blue-500 hover:bg-blue-700 text-white text-sm px-3 py-1 rounded"
            >
              + New
            </button>
          </div>
          <p className="text-sm text-gray-600">Welcome, {username}!</p>
          
          {showCreateRoom && (
            <form onSubmit={createRoom} className="mt-3">
              <input
                type="text"
                value={newRoomName}
                onChange={(e) => setNewRoomName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Room name"
                required
              />
              <div className="flex space-x-2 mt-2">
                <button
                  type="submit"
                  className="bg-green-500 hover:bg-green-700 text-white text-sm px-3 py-1 rounded flex-1"
                >
                  Create
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateRoom(false);
                    setNewRoomName('');
                  }}
                  className="bg-gray-500 hover:bg-gray-700 text-white text-sm px-3 py-1 rounded"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
        <div className="flex-1 overflow-y-auto">
          {Array.isArray(chatrooms) && chatrooms.length > 0 ? (
            chatrooms.map((room) => (
              <div
                key={room.id}
                className={`p-4 cursor-pointer border-b border-gray-200 hover:bg-gray-50 relative ${
                  currentRoom === room.id ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                }`}
              >
                <div onClick={() => joinRoom(room.id)} className="flex-1">
                  <div className="font-medium">{room.name}</div>
                  <div className="text-sm text-gray-500">{room.messageCount} messages</div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteRoom(room.id);
                  }}
                  className="absolute top-2 right-2 rounded-full w-10 h-10 flex items-center justify-center hover:bg-gray-100 transition-colors opacity-60 hover:opacity-100"
                  title="Delete room"
                >
                  <img
                    src={trashIcon}
                    alt="Delete"
                    className="w-5 h-5"
                  />
                </button>
              </div>
            ))
          ) : (
            <div className="p-4 text-center text-gray-500">
              {Array.isArray(chatrooms) ? 'No chatrooms available' : 'Loading chatrooms...'}
            </div>
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {currentRoom ? (
          <>
            {/* Chat Header */}
            <div className="bg-white p-4 border-b border-gray-300">
              <h2 className="text-lg font-semibold">
                {chatrooms.find(r => r.id === currentRoom)?.name || 'Chat'}
              </h2>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.username === username ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg relative ${
                      message.username === username
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-200 text-gray-800'
                    }`}
                  >
                    <div className="text-sm font-medium mb-1">
                      {message.username === username ? 'You' : message.username}
                    </div>
                    <div>{message.message}</div>
                    <div className={`text-xs mt-1 ${
                      message.username === username ? 'text-blue-100' : 'text-gray-500'
                    }`}>
                      {formatTime(message.timestamp)}
                    </div>
                    {message.username === username && (
                      <button
                        onClick={() => deleteMessage(message.id)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                        title="Delete message"
                      >
                        ×
                      </button>
                    )}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="bg-white p-4 border-t border-gray-300">
              <form onSubmit={sendMessage} className="flex space-x-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Type a message..."
                />
                <button
                  type="submit"
                  className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg"
                >
                  Send
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <h3 className="text-xl font-medium text-gray-600 mb-2">Select a chatroom</h3>
              <p className="text-gray-500">Choose a room from the sidebar to start chatting</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
