
import { supabase } from "@/integrations/supabase/client";
import { Message, MessageRequest } from "@/types/message";

const API_URL = "https://dnshwngijsnbttiivbbf.supabase.co/rest/v1";
const API_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRuc2h3bmdpanNuYnR0aWl2YmJmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY0ODI0MjIsImV4cCI6MjA2MjA1ODQyMn0.h0kpjgOOcBXfyNszdRrX6pHuac4n0mUq4hKifOpg92w";

export const getMessages = async (userId: string): Promise<Message[]> => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    const accessToken = session?.access_token;
    
    const response = await fetch(`${API_URL}/messages?or=(sender_id.eq.${userId},receiver_id.eq.${userId})&order=created_at.asc`, {
      headers: {
        'apikey': API_KEY,
        'Authorization': `Bearer ${accessToken}`
      }
    });
    
    const data = await response.json();
    return data as Message[];
  } catch (error) {
    console.error("Error fetching messages:", error);
    return [];
  }
};

export const getMessageRequests = async (userId: string): Promise<MessageRequest[]> => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    const accessToken = session?.access_token;
    
    const response = await fetch(`${API_URL}/message_requests?or=(sender_id.eq.${userId},receiver_id.eq.${userId})`, {
      headers: {
        'apikey': API_KEY,
        'Authorization': `Bearer ${accessToken}`
      }
    });
    
    const data = await response.json();
    return data as MessageRequest[];
  } catch (error) {
    console.error("Error fetching message requests:", error);
    return [];
  }
};

export const sendMessage = async (
  userId: string, 
  receiverId: string, 
  content: string,
  existingRequest?: MessageRequest
): Promise<{ message: Message; messagesRemaining: number; requestStatus: string }> => {
  const { data: { session } } = await supabase.auth.getSession();
  const accessToken = session?.access_token;
  
  let requestId = existingRequest?.id;
  let messagesRemaining = 3;
  
  // If no existing request and not sending to self
  if (!existingRequest && userId !== receiverId) {
    try {
      // Create a new message request using fetch
      const requestResponse = await fetch(`${API_URL}/message_requests`, {
        method: 'POST',
        headers: {
          'apikey': API_KEY,
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation'
        },
        body: JSON.stringify({
          sender_id: userId,
          receiver_id: receiverId,
          status: 'pending',
          messages_sent: 1
        })
      });
      
      const newRequest = await requestResponse.json();
      requestId = newRequest[0]?.id;
      messagesRemaining = 2; // 3 messages allowed, 1 used
    } catch (error) {
      console.error("Error creating message request:", error);
      throw new Error("Failed to create message request");
    }
  } 
  // If existing request initiated by the current user and still pending
  else if (existingRequest && existingRequest.sender_id === userId && existingRequest.status === 'pending') {
    // Increment messages_sent
    if (existingRequest.messages_sent >= 3) {
      throw new Error("Message request limit reached. Wait for the other user to respond.");
    }
    
    try {
      // Update message request using fetch
      await fetch(`${API_URL}/message_requests?id=eq.${existingRequest.id}`, {
        method: 'PATCH',
        headers: {
          'apikey': API_KEY,
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ messages_sent: existingRequest.messages_sent + 1 })
      });
      
      messagesRemaining = 3 - (existingRequest.messages_sent + 1);
    } catch (error) {
      console.error("Error updating message request:", error);
      throw new Error("Failed to update message request");
    }
  }
  
  // Insert the actual message
  try {
    const messageResponse = await fetch(`${API_URL}/messages`, {
      method: 'POST',
      headers: {
        'apikey': API_KEY,
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      body: JSON.stringify({
        sender_id: userId,
        receiver_id: receiverId,
        content: content,
        is_read: false
      })
    });
    
    const message = await messageResponse.json();
    return { 
      message: message[0], 
      messagesRemaining, 
      requestStatus: existingRequest?.status || 'pending' 
    };
  } catch (error) {
    console.error("Error sending message:", error);
    throw new Error("Failed to send message");
  }
};

export const acceptMessageRequest = async (requestId: string): Promise<string> => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    const accessToken = session?.access_token;
    
    await fetch(`${API_URL}/message_requests?id=eq.${requestId}`, {
      method: 'PATCH',
      headers: {
        'apikey': API_KEY,
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ status: 'accepted' })
    });
    
    return requestId;
  } catch (error) {
    console.error("Error accepting message request:", error);
    throw new Error("Failed to accept message request");
  }
};

export const markMessagesAsRead = async (userId: string, senderId: string): Promise<string> => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    const accessToken = session?.access_token;
    
    await fetch(`${API_URL}/messages?sender_id=eq.${senderId}&receiver_id=eq.${userId}&is_read=eq.false`, {
      method: 'PATCH',
      headers: {
        'apikey': API_KEY,
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ is_read: true })
    });
    
    return senderId;
  } catch (error) {
    console.error("Error marking messages as read:", error);
    throw new Error("Failed to mark messages as read");
  }
};
