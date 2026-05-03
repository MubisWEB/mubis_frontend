import React, { useEffect, useRef, useState } from 'react';
import { ArrowLeft, Loader2, Send } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Header from '@/components/Header';
import BottomNav from '@/components/BottomNav';
import { chatApi } from '@/api/services';
import socket, { joinChat, leaveChat } from '@/api/socket';
import { useAuth } from '@/lib/AuthContext';
import SubscriptionGate from '../components/SubscriptionGate';

function timeStr(dateStr) {
  return new Date(dateStr).toLocaleTimeString('es-CO', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

function dateSep(dateStr) {
  return new Date(dateStr).toLocaleDateString('es-CO', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
}

export default function Chat() {
  const { auctionId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const bottomRef = useRef(null);

  useEffect(() => {
    if (!auctionId) return;
    setLoading(true);
    setErrorMessage('');

    chatApi.getConversation(auctionId)
      .then((conv) => {
        setConversation(conv);
        setMessages(conv.messages || []);
      })
      .catch((error) => {
        setErrorMessage(error?.response?.data?.message || 'No pudimos abrir este chat');
      })
      .finally(() => setLoading(false));
  }, [auctionId]);

  useEffect(() => {
    if (!auctionId) return undefined;
    joinChat(auctionId);

    const handleMessage = (msg) => {
      setMessages((prev) => (
        prev.some((existing) => existing.id === msg.id) ? prev : [...prev, msg]
      ));
    };

    socket.on('chat_message', handleMessage);
    return () => {
      leaveChat(auctionId);
      socket.off('chat_message', handleMessage);
    };
  }, [auctionId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (event) => {
    event.preventDefault();
    if (!text.trim() || sending || errorMessage) return;

    setSending(true);
    setErrorMessage('');
    try {
      const message = await chatApi.sendMessage(auctionId, text.trim());
      setMessages((prev) => (
        prev.some((existing) => existing.id === message.id) ? prev : [...prev, message]
      ));
      setText('');
    } catch (error) {
      setErrorMessage(error?.response?.data?.message || 'No pudimos enviar el mensaje');
    } finally {
      setSending(false);
    }
  };

  const other = conversation
    ? (conversation.buyerId === user?.id ? conversation.seller : conversation.buyer)
    : null;

  const grouped = messages.reduce((acc, msg) => {
    const day = new Date(msg.createdAt).toDateString();
    if (!acc.length || acc[acc.length - 1].day !== day) acc.push({ day, msgs: [] });
    acc[acc.length - 1].msgs.push(msg);
    return acc;
  }, []);

  const friendlyError = errorMessage === 'El comprador aun no ha iniciado el chat'
    ? 'El comprador aun no ha iniciado el chat. En cuanto lo haga, podras comunicarte aqui.'
    : errorMessage;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      <div className="bg-card border-b border-border px-4 py-3 flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="rounded-full">
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-foreground text-sm truncate">
            {other ? other.nombre : 'Chat de subasta'}
          </p>
          {conversation && (
            <p className="text-xs text-muted-foreground truncate">
              {conversation.buyer?.id === user?.id ? 'Vendedor' : 'Comprador'}
            </p>
          )}
        </div>
      </div>

      <SubscriptionGate>
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1 pb-32">
        {loading && (
          <div className="flex justify-center py-16">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        )}

        {!loading && friendlyError && (
          <div className="mx-auto max-w-md rounded-xl border border-border bg-card p-4 text-center text-sm text-muted-foreground">
            {friendlyError}
          </div>
        )}

        {!loading && !friendlyError && messages.length === 0 && (
          <div className="text-center py-16 text-muted-foreground text-sm">
            Se el primero en escribir. Aqui coordinas entrega, pago y mas.
          </div>
        )}

        {grouped.map(({ day, msgs }) => (
          <div key={day}>
            <div className="flex items-center gap-2 my-3">
              <div className="flex-1 h-px bg-border" />
              <span className="text-[10px] text-muted-foreground capitalize">
                {dateSep(msgs[0].createdAt)}
              </span>
              <div className="flex-1 h-px bg-border" />
            </div>
            {msgs.map((msg) => {
              const isMe = msg.senderId === user?.id || msg.sender?.id === user?.id;
              return (
                <div key={msg.id} className={`flex mb-1 ${isMe ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[75%] px-3 py-2 rounded-2xl text-sm ${
                    isMe
                      ? 'bg-secondary text-secondary-foreground rounded-br-sm'
                      : 'bg-muted text-foreground rounded-bl-sm'
                  }`}>
                    {!isMe && (
                      <p className="text-[10px] font-semibold text-secondary mb-0.5">
                        {msg.senderName || msg.sender?.nombre}
                      </p>
                    )}
                    <p className="leading-snug">{msg.text}</p>
                    <p className={`text-[10px] mt-0.5 ${isMe ? 'text-secondary-foreground/60 text-right' : 'text-muted-foreground'}`}>
                      {timeStr(msg.createdAt)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      <div className="fixed bottom-[72px] left-0 right-0 bg-card border-t border-border z-50">
        <form onSubmit={handleSend} className="flex items-center gap-2 px-4 py-3">
          <Input
            value={text}
            onChange={(event) => setText(event.target.value)}
            placeholder="Escribe un mensaje..."
            className="flex-1 rounded-full border-border/70"
            disabled={sending || loading || Boolean(friendlyError)}
            maxLength={2000}
          />
          <Button
            type="submit"
            size="icon"
            disabled={!text.trim() || sending || loading || Boolean(friendlyError)}
            className="rounded-full bg-secondary text-secondary-foreground hover:bg-secondary/90 shrink-0 w-10 h-10"
          >
            {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </Button>
        </form>
      </div>

      </SubscriptionGate>

      <BottomNav />
    </div>
  );
}
