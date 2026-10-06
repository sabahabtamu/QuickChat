import axios from "axios";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import toast from "react-hot-toast";
import { io } from "socket.io-client";
import { AuthContext } from "./contexts";

const backendUrl = import.meta.env.VITE_BACKEND_URL;

export const AuthProvider = ({ children }) => {
    const [token, setToken] = useState(localStorage.getItem("token"));
    const [authUser, setAuthUser] = useState(null);
    const [onlineUsers, setOnlineUsers] = useState([]);
    const [socket, setSocket] = useState(null);
    const socketRef = useRef(null);

    const api = useMemo(() => {
        const instance = axios.create({ baseURL: backendUrl });
        instance.interceptors.request.use((config) => {
            const storedToken = localStorage.getItem("token");
            if (storedToken) {
                config.headers.set("token", storedToken);
            }
            return config;
        });
        return instance;
    }, []);

    const connectSocket = useCallback((authToken) => {
        if (socketRef.current?.connected) return;

        const newSocket = io(backendUrl, {
            auth: { token: authToken },
        });
        socketRef.current = newSocket;
        setSocket(newSocket);

        newSocket.on("getOnlineUsers", (userIds) => {
            setOnlineUsers(userIds);
        });
    }, []);

    useEffect(() => {
        if (!token) return undefined;

        let active = true;
        const restoreSession = async () => {
            try {
                const { data } = await api.get("/api/auth/check");
                if (!active) return;

                if (data.success) {
                    setAuthUser(data.user);
                    connectSocket(token);
                } else {
                    localStorage.removeItem("token");
                    setToken(null);
                    setAuthUser(null);
                }
            } catch (error) {
                if (active) {
                    toast.error(error.response?.data?.message || error.message);
                }
            }
        };

        void restoreSession();
        return () => {
            active = false;
        };
    }, [api, connectSocket, token]);

    const login = async (state, credentials) => {
        try {
            const { data } = await api.post(`/api/auth/${state}`, credentials);
            if (data.success) {
                localStorage.setItem("token", data.token);
                setToken(data.token);
                setAuthUser(data.userData);
                toast.success(data.message);
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || error.message);
        }
    };

    const logout = () => {
        localStorage.removeItem("token");
        socketRef.current?.disconnect();
        socketRef.current = null;
        setSocket(null);
        setToken(null);
        setAuthUser(null);
        setOnlineUsers([]);
        toast.success("Logged out successfully");
    };

    const updateProfile = async (body) => {
        try {
            const { data } = await api.put("/api/auth/update-profile", body);
            if (data.success) {
                setAuthUser(data.user);
                toast.success("Profile updated successfully");
                return true;
            }
            toast.error(data.message || "Failed to update profile");
            return false;
        } catch (error) {
            toast.error(error.response?.data?.message || error.message);
            return false;
        }
    };

    const value = {
        axios: api,
        authUser,
        onlineUsers,
        socket,
        login,
        logout,
        updateProfile,
    };

    return (
        <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
    );
};
