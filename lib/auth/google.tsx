import * as AuthSession from "expo-auth-session";
import * as WebBrowser from "expo-web-browser";
import * as SecureStore from "expo-secure-store";
import { makeRedirectUri } from "expo-auth-session";
import {
    createContext,
    useContext,
    useState,
    useEffect,
    ReactNode,
} from "react";

WebBrowser.maybeCompleteAuthSession();

// Google OAuth configuration
// You'll need to create credentials at https://console.cloud.google.com/
const GOOGLE_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID || "";

const discovery = {
    authorizationEndpoint: "https://accounts.google.com/o/oauth2/v2/auth",
    tokenEndpoint: "https://oauth2.googleapis.com/token",
    revocationEndpoint: "https://oauth2.googleapis.com/revoke",
};

// Scopes needed for Drive file access
const SCOPES = [
    "openid",
    "profile",
    "email",
    "https://www.googleapis.com/auth/drive.file",
];

interface User {
    id: string;
    email: string;
    name: string;
    picture?: string;
}

interface AuthContextType {
    user: User | null;
    accessToken: string | null;
    isLoading: boolean;
    signIn: () => Promise<void>;
    signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [accessToken, setAccessToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const redirectUri = makeRedirectUri({
        scheme: "journalapp",
    });

    const [request, response, promptAsync] = AuthSession.useAuthRequest(
        {
            clientId: GOOGLE_CLIENT_ID,
            scopes: SCOPES,
            redirectUri,
        },
        discovery
    );

    // Load stored session on mount
    useEffect(() => {
        loadStoredSession();
    }, []);

    // Handle auth response
    useEffect(() => {
        if (response?.type === "success") {
            const { access_token } = response.params;
            handleSuccessfulAuth(access_token);
        }
    }, [response]);

    async function loadStoredSession() {
        try {
            const storedToken = await SecureStore.getItemAsync("accessToken");
            const storedUser = await SecureStore.getItemAsync("user");

            if (storedToken && storedUser) {
                setAccessToken(storedToken);
                setUser(JSON.parse(storedUser));
            }
        } catch (error) {
            console.error("Error loading stored session:", error);
        } finally {
            setIsLoading(false);
        }
    }

    async function handleSuccessfulAuth(token: string) {
        try {
            // Fetch user info from Google
            const userInfoResponse = await fetch(
                "https://www.googleapis.com/oauth2/v2/userinfo",
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );
            const userInfo = await userInfoResponse.json();

            const userData: User = {
                id: userInfo.id,
                email: userInfo.email,
                name: userInfo.name,
                picture: userInfo.picture,
            };

            // Store session
            await SecureStore.setItemAsync("accessToken", token);
            await SecureStore.setItemAsync("user", JSON.stringify(userData));

            setAccessToken(token);
            setUser(userData);
        } catch (error) {
            console.error("Error handling auth:", error);
        }
    }

    async function signIn() {
        if (request) {
            await promptAsync();
        }
    }

    async function signOut() {
        try {
            await SecureStore.deleteItemAsync("accessToken");
            await SecureStore.deleteItemAsync("user");
            setAccessToken(null);
            setUser(null);
        } catch (error) {
            console.error("Error signing out:", error);
        }
    }

    return (
        <AuthContext.Provider
            value={{ user, accessToken, isLoading, signIn, signOut }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}
