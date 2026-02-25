import { useState, useRef, useCallback } from 'react';
import { Platform } from 'react-native';

// Web Speech API types (for web platform)
interface SpeechRecognitionEvent {
    results: SpeechRecognitionResultList;
    resultIndex: number;
}
interface SpeechRecognitionResultList {
    length: number;
    [index: number]: SpeechRecognitionResult;
}
interface SpeechRecognitionResult {
    isFinal: boolean;
    [index: number]: SpeechRecognitionAlternative;
}
interface SpeechRecognitionAlternative {
    transcript: string;
    confidence: number;
}
interface SpeechRecognitionInstance {
    continuous: boolean;
    interimResults: boolean;
    lang: string;
    onresult: ((event: SpeechRecognitionEvent) => void) | null;
    onerror: ((event: { error: string }) => void) | null;
    onend: (() => void) | null;
    start(): void;
    stop(): void;
    abort(): void;
}
declare global {
    interface Window {
        SpeechRecognition: new () => SpeechRecognitionInstance;
        webkitSpeechRecognition: new () => SpeechRecognitionInstance;
    }
}

// Try to import expo-speech-recognition for native platforms
let ExpoSpeechRecognitionModule: any = null;
if (Platform.OS !== 'web') {
    try {
        ExpoSpeechRecognitionModule = require('@jamsch/expo-speech-recognition');
    } catch {
        // Not available — web-only fallback
    }
}

export function useSpeechRecognition() {
    const [isListening, setIsListening] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [interimTranscript, setInterimTranscript] = useState('');
    const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
    const shouldRestartRef = useRef(false);
    // Track which results we've already processed to avoid duplication
    const processedResultsRef = useRef(0);

    const isSupported = (() => {
        if (Platform.OS !== 'web') {
            return !!ExpoSpeechRecognitionModule;
        }
        return typeof window !== 'undefined' &&
            ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);
    })();

    const startListening = useCallback(() => {
        if (Platform.OS !== 'web') {
            // --- Native: use expo-speech-recognition ---
            if (!ExpoSpeechRecognitionModule) return;
            const { ExpoSpeechRecognitionModule: Module, useSpeechRecognitionEvent } = ExpoSpeechRecognitionModule;
            Module.requestPermissionsAsync().then((result: any) => {
                if (result.granted) {
                    Module.start({
                        lang: 'en-US',
                        interimResults: true,
                        continuous: true,
                        requiresOnDeviceRecognition: true, // OFFLINE
                    });
                    setIsListening(true);
                }
            });
            return;
        }

        // --- Web: use Web Speech API ---
        if (!isSupported) return;

        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) return;

        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        // Reset processed results counter
        processedResultsRef.current = 0;

        recognition.onresult = (event: SpeechRecognitionEvent) => {
            let newFinalText = '';
            let currentInterim = '';

            // Only process results from resultIndex onwards to avoid duplication
            for (let i = event.resultIndex; i < event.results.length; i++) {
                const result = event.results[i];
                if (result.isFinal) {
                    newFinalText += result[0].transcript + ' ';
                } else {
                    currentInterim += result[0].transcript;
                }
            }

            if (newFinalText) {
                setTranscript(prev => prev + newFinalText);
            }
            setInterimTranscript(currentInterim);
        };

        recognition.onerror = (event: { error: string }) => {
            console.error('Speech recognition error:', event.error);
            if (event.error === 'no-speech' && shouldRestartRef.current) {
                try { recognition.start(); } catch { }
            } else {
                setIsListening(false);
                shouldRestartRef.current = false;
            }
        };

        recognition.onend = () => {
            if (shouldRestartRef.current) {
                try { recognition.start(); } catch { }
            } else {
                setIsListening(false);
            }
        };

        recognitionRef.current = recognition;
        shouldRestartRef.current = true;
        setTranscript('');
        setInterimTranscript('');

        try {
            recognition.start();
            setIsListening(true);
        } catch (err) {
            console.error('Failed to start speech recognition:', err);
        }
    }, [isSupported]);

    const stopListening = useCallback((): string => {
        if (Platform.OS !== 'web' && ExpoSpeechRecognitionModule) {
            ExpoSpeechRecognitionModule.ExpoSpeechRecognitionModule.stop();
        } else {
            shouldRestartRef.current = false;
            if (recognitionRef.current) {
                recognitionRef.current.stop();
                recognitionRef.current = null;
            }
        }
        setIsListening(false);
        setInterimTranscript('');
        return transcript;
    }, [transcript]);

    const resetTranscript = useCallback(() => {
        setTranscript('');
        setInterimTranscript('');
    }, []);

    return {
        isListening,
        transcript,
        interimTranscript,
        fullTranscript: transcript + interimTranscript,
        startListening,
        stopListening,
        resetTranscript,
        isSupported,
    };
}
