import React, { useState, useEffect, useRef } from 'react';
import { Box, Typography, Input, Button, Avatar, Badge, CircularProgress } from '@mui/joy';
import axios from 'axios';
import SendIcon from '@mui/icons-material/Send';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';

const MessageChat = ({ projectId, userId, userType, embedded = false }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [chatOpen, setChatOpen] = useState(embedded); // Always open if embedded
  const messagesEndRef = useRef(null);

  // Fetch messages on component mount and when chat is opened
  useEffect(() => {
    if ((chatOpen || embedded) && projectId) {
      fetchMessages();
    }
  }, [projectId, chatOpen, embedded]);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (chatOpen || embedded) {
      scrollToBottom();
    }
  }, [messages, chatOpen, embedded]);

  // Mark messages as read when chat is opened
  useEffect(() => {
    if ((chatOpen || embedded) && unreadCount > 0 && projectId) {
      markMessagesAsRead();
    }
  }, [chatOpen, embedded, unreadCount]);

  // Fetch unread message count periodically
  useEffect(() => {
    if (!projectId) return; // Skip if no valid project ID
    
    const fetchUnreadCount = async () => {
      try {
        const response = await axios.get(`http://127.0.0.1:5000/messages/project/${projectId}`);
        const unread = response.data.filter(
          msg => !msg.is_read && msg.sender_type !== userType
        ).length;
        setUnreadCount(unread);
      } catch (err) {
        console.error('Error fetching unread count:', err);
      }
    };

    fetchUnreadCount();
    // Only poll for updates if not embedded
    let interval;
    if (!embedded) {
      interval = setInterval(fetchUnreadCount, 10000); // Check every 10 seconds
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [projectId, userType, embedded]);

  const fetchMessages = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`http://127.0.0.1:5000/messages/project/${projectId}`);
      setMessages(response.data);
      
      // Calculate unread messages
      const unread = response.data.filter(
        msg => !msg.is_read && msg.sender_type !== userType
      ).length;
      setUnreadCount(unread);
      
      setLoading(false);
    } catch (err) {
      console.error('Error fetching messages:', err);
      setError('Failed to load messages. Please try again.');
      setLoading(false);
    }
  };

  const markMessagesAsRead = async () => {
    try {
      await axios.put(`http://127.0.0.1:5000/messages/read`, {
        project_id: projectId,
        reader_type: userType,
        reader_id: userId
      });
      setUnreadCount(0);
    } catch (err) {
      console.error('Error marking messages as read:', err);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;
    if (!projectId) {
      setError('Cannot send message: Invalid project ID');
      return;
    }

    try {
      const response = await axios.post(`http://127.0.0.1:5000/messages`, {
        project_id: projectId,
        sender_type: userType,
        sender_id: userId,
        message_text: newMessage
      });

      // Add new message to the list
      if (response.data.data) {
        setMessages(prev => [...prev, response.data.data]);
      } else {
        // Refresh messages if we couldn't get the new message details
        fetchMessages();
      }
      
      // Clear the input
      setNewMessage('');
    } catch (err) {
      console.error('Error sending message:', err);
      setError('Failed to send message. Please try again.');
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Format timestamp
  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // If embedded, render just the chat interface without the floating button
  if (embedded) {
    return (
      <Box sx={{ 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column', 
        borderRadius: 'sm',
        border: '1px solid #333',
        overflow: 'hidden'
      }}>
        {/* Chat header for embedded mode */}
        <Box
          sx={{
            p: 2,
            bgcolor: '#0F0F0F',
            borderBottom: '1px solid #333',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}
        >
          <Typography level="title-md" sx={{ color: 'white' }}>
            Project Chat
            {unreadCount > 0 && (
              <Badge 
                badgeContent={unreadCount} 
                color="danger" 
                size="sm"
                sx={{ ml: 1 }}
              />
            )}
          </Typography>
          <Button
            variant="plain"
            color="neutral"
            size="sm"
            onClick={() => fetchMessages()}
            sx={{ color: '#aaa' }}
          >
            Refresh
          </Button>
        </Box>

        {/* Messages container */}
        <Box
          className="message-container"
          sx={{
            flexGrow: 1,
            p: 2,
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: 1,
            bgcolor: '#181818',
          }}
        >
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
              <CircularProgress />
            </Box>
          ) : error ? (
            <Typography color="danger" sx={{ textAlign: 'center' }}>
              {error}
            </Typography>
          ) : messages.length === 0 ? (
            <Typography sx={{ color: '#aaa', textAlign: 'center', mt: 10 }}>
              No messages yet. Start the conversation!
            </Typography>
          ) : (
            messages.map((msg) => {
              const isSender = msg.sender_type === userType;
              return (
                <Box
                  key={msg.message_id}
                  className="fade-in"
                  sx={{
                    display: 'flex',
                    flexDirection: isSender ? 'row-reverse' : 'row',
                    alignItems: 'flex-start',
                    gap: 1,
                    mb: 1
                  }}
                >
                  <Avatar
                    size="sm"
                    sx={{
                      bgcolor: isSender ? '#e50914' : '#333'
                    }}
                  >
                    {msg.sender_name?.[0] || (isSender ? userType[0].toUpperCase() : 'U')}
                  </Avatar>
                  <Box
                    sx={{
                      maxWidth: '70%',
                      p: 1.5,
                      borderRadius: 2,
                      bgcolor: isSender ? '#e50914' : '#333',
                      color: 'white',
                      position: 'relative'
                    }}
                  >
                    <Typography level="body-sm" sx={{ color: '#ddd' }}>
                      {msg.sender_name || (isSender ? 'You' : 'User')}
                    </Typography>
                    <Typography sx={{ wordBreak: 'break-word' }}>
                      {msg.message_text}
                    </Typography>
                    <Typography level="body-xs" sx={{ color: '#aaa', textAlign: 'right', mt: 0.5 }}>
                      {formatTime(msg.sent_at)}
                    </Typography>
                  </Box>
                </Box>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </Box>

        {/* Message input */}
        <Box
          sx={{
            p: 2,
            borderTop: '1px solid #333',
            display: 'flex',
            gap: 1,
            bgcolor: '#0F0F0F',
          }}
        >
          <Input
            placeholder="Type a message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            sx={{
              flexGrow: 1,
              bgcolor: '#333',
              color: 'white',
              '&:focus': { borderColor: '#e50914' }
            }}
          />
          <Button
            onClick={handleSendMessage}
            color="danger"
            sx={{ bgcolor: '#e50914', '&:hover': { bgcolor: '#b2070e' } }}
          >
            <SendIcon />
          </Button>
        </Box>
      </Box>
    );
  }

  // Original floating chat UI
  return (
    <Box sx={{ position: 'fixed', bottom: 20, right: 20, zIndex: 1000 }}>
      {/* Chat toggle button with notification badge */}
      <div className="button-scale">
        <Badge badgeContent={unreadCount} color="danger">
          <Button
            variant="solid"
            color="primary"
            onClick={() => setChatOpen(!chatOpen)}
            startDecorator={<ChatBubbleOutlineIcon />}
            sx={{ 
              borderRadius: '50%', 
              p: 1.5,
              width: 56,
              height: 56,
              backgroundColor: '#e50914',
              '&:hover': { backgroundColor: '#b2070e' }
            }}
          >
            {chatOpen ? 'X' : ''}
          </Button>
        </Badge>
      </div>

      {/* Chat window */}
      {chatOpen && (
        <Box
          className="slide-up"
          sx={{
            position: 'absolute',
            bottom: 70,
            right: 0,
            width: 320,
            height: 450,
            bgcolor: '#181818',
            borderRadius: 2,
            boxShadow: '0 10px 25px rgba(0,0,0,0.3)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            border: '1px solid #333'
          }}
        >
          {/* Chat header */}
          <Box
            sx={{
              p: 2,
              bgcolor: '#0F0F0F',
              borderBottom: '1px solid #333',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}
          >
            <Typography level="title-md" sx={{ color: 'white' }}>
              Project Chat
            </Typography>
            <Button
              variant="plain"
              color="neutral"
              size="sm"
              onClick={() => setChatOpen(false)}
              sx={{ color: '#aaa' }}
            >
              Close
            </Button>
          </Box>

          {/* Messages container */}
          <Box
            className="message-container"
            sx={{
              flexGrow: 1,
              p: 2,
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: 1
            }}
          >
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                <CircularProgress />
              </Box>
            ) : error ? (
              <Typography color="danger" sx={{ textAlign: 'center' }}>
                {error}
              </Typography>
            ) : messages.length === 0 ? (
              <Typography sx={{ color: '#aaa', textAlign: 'center', mt: 10 }}>
                No messages yet. Start the conversation!
              </Typography>
            ) : (
              messages.map((msg) => {
                const isSender = msg.sender_type === userType;
                return (
                  <Box
                    key={msg.message_id}
                    className="fade-in"
                    sx={{
                      display: 'flex',
                      flexDirection: isSender ? 'row-reverse' : 'row',
                      alignItems: 'flex-start',
                      gap: 1,
                      mb: 1
                    }}
                  >
                    <Avatar
                      size="sm"
                      sx={{
                        bgcolor: isSender ? '#e50914' : '#333'
                      }}
                    >
                      {msg.sender_name?.[0] || (isSender ? userType[0].toUpperCase() : 'U')}
                    </Avatar>
                    <Box
                      sx={{
                        maxWidth: '70%',
                        p: 1.5,
                        borderRadius: 2,
                        bgcolor: isSender ? '#e50914' : '#333',
                        color: 'white',
                        position: 'relative'
                      }}
                    >
                      <Typography level="body-sm" sx={{ color: '#ddd' }}>
                        {msg.sender_name || (isSender ? 'You' : 'User')}
                      </Typography>
                      <Typography sx={{ wordBreak: 'break-word' }}>
                        {msg.message_text}
                      </Typography>
                      <Typography level="body-xs" sx={{ color: '#aaa', textAlign: 'right', mt: 0.5 }}>
                        {formatTime(msg.sent_at)}
                      </Typography>
                    </Box>
                  </Box>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </Box>

          {/* Message input */}
          <Box
            sx={{
              p: 2,
              borderTop: '1px solid #333',
              display: 'flex',
              gap: 1
            }}
          >
            <Input
              placeholder="Type a message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              sx={{
                flexGrow: 1,
                bgcolor: '#333',
                color: 'white',
                '&:focus': { borderColor: '#e50914' }
              }}
            />
            <div className="button-scale">
              <Button
                onClick={handleSendMessage}
                color="danger"
                sx={{ bgcolor: '#e50914', '&:hover': { bgcolor: '#b2070e' } }}
              >
                <SendIcon />
              </Button>
            </div>
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default MessageChat; 