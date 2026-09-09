import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../api/client';
import { useSocket } from './SocketContext';
import { useAuth } from './AuthContext';
import { soundManager } from '../utils/soundEffects';

const ChatContext = createContext();

export function ChatProvider({ children }) {
  const { socket } = useSocket();
  const { user } = useAuth();

  const [activeView, setActiveView] = useState({ type: 'channel', id: 1, data: { name: 'main', topic: 'The heart of CrowdChat!' } });
  const [channels, setChannels] = useState([]);
  const [dms, setDms] = useState([]);
  const [groups, setGroups] = useState([]);
  const [messages, setMessages] = useState([]);
  const [activeChatMembers, setActiveChatMembers] = useState([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [replyingTo, setReplyingTo] = useState(null);
  const [typingUsers, setTypingUsers] = useState({});

  const refreshChannels = useCallback(async () => {
    try {
      const res = await api.get('/channels');
      setChannels(res.data.channels);
    } catch (e) { console.error(e); }
  }, []);

  const refreshDMs = useCallback(async () => {
    try {
      const res = await api.get('/dms/conversations');
      setDms(res.data.conversations);
    } catch (e) { console.error(e); }
  }, []);

  const refreshGroups = useCallback(async () => {
    try {
      const res = await api.get('/groups');
      setGroups(res.data.groups);
    } catch (e) { console.error(e); }
  }, []);

  useEffect(() => {
    if (user) {
      refreshChannels();
      refreshDMs();
      refreshGroups();
    }
  }, [user, refreshChannels, refreshDMs, refreshGroups]);

  // Handle room joining & message loading
  useEffect(() => {
    if (!user || !activeView.id) return;
    setLoadingMessages(true);
    setReplyingTo(null);

    const roomKey = `${activeView.type}_${activeView.id}`;
    if (socket) {
      socket.emit('room:join_chat', roomKey);
    }

    async function loadChat() {
      try {
        let res;
        if (activeView.type === 'channel') {
          res = await api.get(`/messages/channel/${activeView.id}`);
          if (socket) socket.emit('channel:join', activeView.id);
        } else if (activeView.type === 'dm') {
          res = await api.get(`/dms/${activeView.id}`);
          if (socket) socket.emit('dm:join', activeView.id);
        } else if (activeView.type === 'group') {
          res = await api.get(`/groups/${activeView.id}/messages`);
          if (socket) socket.emit('group:join', activeView.id);
        }
        setMessages(res.data.messages || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingMessages(false);
      }
    }
    loadChat();
  }, [activeView.type, activeView.id, user, socket]);

  // Real-time socket message listeners & room roster
  useEffect(() => {
    if (!socket) return;

    const handleRoomRoster = ({ roomId, members }) => {
      const currentRoomKey = `${activeView.type}_${activeView.id}`;
      if (roomId === currentRoomKey) {
        setActiveChatMembers(members);
      }
    };

    const handleNewMessage = (newMsg) => {
      const isCurrentChat =
        (activeView.type === 'channel' && newMsg.channel_id === activeView.id) ||
        (activeView.type === 'dm' && (newMsg.sender_id === activeView.id || newMsg.recipient_id === activeView.id)) ||
        (activeView.type === 'group' && newMsg.group_id === activeView.id);

      if (isCurrentChat) {
        setMessages(prev => [...prev, newMsg]);
        if (newMsg.sender_id !== user.id) {
          soundManager.playMessageSound();
        }
      }
      refreshDMs();
      refreshGroups();
    };

    const handleMessageUpdated = (updated) => {
      setMessages(prev => prev.map(m => m.id === updated.id ? { ...m, ...updated } : m));
    };

    const handleMessageDeleted = ({ messageId }) => {
      setMessages(prev => prev.map(m => m.id === messageId ? { ...m, is_deleted: 1, content: '[Message deleted]' } : m));
    };

    const handleReactionUpdated = ({ messageId, reactions }) => {
      setMessages(prev => prev.map(m => m.id === messageId ? { ...m, reactions } : m));
    };

    const handleTypingDisplay = ({ userId, displayName, channelId, dmUserId, groupId }) => {
      if (userId === user.id) return;
      const key = `${channelId || ''}_${dmUserId || ''}_${groupId || ''}`;
      setTypingUsers(prev => ({ ...prev, [key]: displayName }));
    };

    const handleTypingHide = ({ userId, channelId, dmUserId, groupId }) => {
      const key = `${channelId || ''}_${dmUserId || ''}_${groupId || ''}`;
      setTypingUsers(prev => {
        const copy = { ...prev };
        delete copy[key];
        return copy;
      });
    };

    socket.on('room:roster', handleRoomRoster);
    socket.on('chat:new_message', handleNewMessage);
    socket.on('dm:new_message', handleNewMessage);
    socket.on('group:new_message', handleNewMessage);
    socket.on('chat:message_updated', handleMessageUpdated);
    socket.on('chat:message_deleted', handleMessageDeleted);
    socket.on('chat:reaction_updated', handleReactionUpdated);
    socket.on('dm:reaction_updated', handleReactionUpdated);
    socket.on('group:reaction_updated', handleReactionUpdated);
    socket.on('typing:display', handleTypingDisplay);
    socket.on('typing:hide', handleTypingHide);

    return () => {
      socket.off('room:roster', handleRoomRoster);
      socket.off('chat:new_message', handleNewMessage);
      socket.off('dm:new_message', handleNewMessage);
      socket.off('group:new_message', handleNewMessage);
      socket.off('chat:message_updated', handleMessageUpdated);
      socket.off('chat:message_deleted', handleMessageDeleted);
      socket.off('chat:reaction_updated', handleReactionUpdated);
      socket.off('dm:reaction_updated', handleReactionUpdated);
      socket.off('group:reaction_updated', handleReactionUpdated);
      socket.off('typing:display', handleTypingDisplay);
      socket.off('typing:hide', handleTypingHide);
    };
  }, [socket, activeView, user, refreshDMs, refreshGroups]);

  return (
    <ChatContext.Provider
      value={{
        activeView,
        setActiveView,
        channels,
        dms,
        groups,
        messages,
        activeChatMembers,
        loadingMessages,
        replyingTo,
        setReplyingTo,
        typingUsers,
        refreshChannels,
        refreshDMs,
        refreshGroups
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}

export const useChat = () => useContext(ChatContext);
