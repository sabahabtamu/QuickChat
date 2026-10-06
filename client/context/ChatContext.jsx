import { useCallback, useContext, useEffect, useState } from "react";
import { AuthContext, ChatContext } from "./contexts";
import toast from "react-hot-toast";

export const ChatProvider = ({ children }) => {
    const [messages, setMessages] = useState([]);
    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [unseenMessages, setUnseenMessages] = useState({});

    const { socket, axios } = useContext(AuthContext);

    const getUsers = useCallback(async () => {
        try {
            const { data } = await axios.get("/api/messages/users");
            if (data.success) {
                setUsers(data.users);
                setUnseenMessages(data.unseenMessages);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || error.message);
        }
    }, [axios]);

    const getMessages = useCallback(async (userId) => {
        try {
            const { data } = await axios.get(`/api/messages/${userId}`);
            if (data.success) {
                setMessages(data.messages);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || error.message);
        }
    }, [axios]);

    const sendMessage = useCallback(async (messageData) => {
        if (!selectedUser) return;

        try {
            const { data } = await axios.post(
                `/api/messages/send/${selectedUser._id}`,
                messageData,
            );

            if (data.success) {
                setMessages((previous) => [...previous, data.newMessage]);
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || error.message);
        }
    }, [axios, selectedUser]);

    useEffect(() => {
        if (!socket) return undefined;

        const handleNewMessage = (newMessage) => {
            if (selectedUser && selectedUser._id === newMessage.senderId) {
                setMessages((previous) => [
                    ...previous,
                    { ...newMessage, seen: true },
                ]);
                axios.put(`/api/messages/mark/${newMessage._id}`).catch((error) => {
                    toast.error(error.response?.data?.message || error.message);
                });
            } else {
                setUnseenMessages((previous) => ({
                    ...previous,
                    [newMessage.senderId]: previous[newMessage.senderId]
                        ? previous[newMessage.senderId] + 1
                        : 1,
                }));
            }
        };

        socket.on("newMessage", handleNewMessage);
        return () => socket.off("newMessage", handleNewMessage);
    }, [axios, selectedUser, socket]);

    const value = {
        messages,
        users,
        selectedUser,
        getUsers,
        sendMessage,
        setSelectedUser,
        unseenMessages,
        setUnseenMessages,
        getMessages,
    };

    return (
        <ChatContext.Provider value={value}>{children}</ChatContext.Provider>
    );
};
