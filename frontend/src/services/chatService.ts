import { db } from '@/lib/firebase';
import { addDoc, collection, onSnapshot, orderBy, query, serverTimestamp } from 'firebase/firestore';
import { ChatMessage } from '@/types';

const EVENTS_COLLECTION = 'events';

export const subscribeToMessages = (eventId: string, callback: (messages: ChatMessage[]) => void) => {
  const messagesRef = collection(db, `${EVENTS_COLLECTION}/${eventId}/messages`);
  const q = query(messagesRef, orderBy('createdAt', 'asc'));

  return onSnapshot(q, (snapshot) => {
    const messages = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as ChatMessage[];
    callback(messages);
  });
};

export const sendMessage = async (eventId: string, userId: string, userName: string, text: string): Promise<void> => {
  const response = await fetch('/api/chat/send', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ eventId, userId, userName, text }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to send message');
  }
};

