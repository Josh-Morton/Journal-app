import React from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, Modal, Platform } from 'react-native';
import { Cloud, CheckCircle, ExternalLink, AlertCircle } from 'lucide-react-native';
import { SyncProgressStatus } from '../../lib/drive';
import * as WebBrowser from 'expo-web-browser';

interface DriveSyncModalProps {
    visible: boolean;
    status: SyncProgressStatus | null;
    folderId?: string;
    onClose: () => void;
}

export function DriveSyncModal({ visible, status, folderId, onClose }: DriveSyncModalProps) {
    if (!visible) return null;

    const isDone = status === "Done";
    const isError = status === "Error";
    const isWorking = !isDone && !isError;

    const openDrive = async () => {
        if (folderId) {
            const url = `https://drive.google.com/drive/folders/${folderId}`;
            if (Platform.OS === 'web') {
                window.open(url, '_blank');
            } else {
                await WebBrowser.openBrowserAsync(url);
            }
        }
        onClose();
    };

    return (
        <Modal transparent animationType="fade" visible={visible} onRequestClose={onClose}>
            <View className="flex-1 justify-center items-center bg-black/40 px-6">
                <View className="bg-white w-full max-w-sm rounded-[32px] p-8 items-center" style={{ shadowColor: "#000", shadowOpacity: 0.1, shadowRadius: 20, elevation: 10 }}>

                    {/* Icon Header */}
                    <View className={`w-20 h-20 rounded-full items-center justify-center mb-6 
                        ${isWorking ? 'bg-blue-50' : ''}
                        ${isDone ? 'bg-green-50' : ''}
                        ${isError ? 'bg-red-50' : ''}
                    `}>
                        {isWorking && <Cloud size={36} color="#3b82f6" />}
                        {isDone && <CheckCircle size={36} color="#10b981" />}
                        {isError && <AlertCircle size={36} color="#ef4444" />}
                    </View>

                    {/* Status Text */}
                    <Text className="text-xl font-bold text-slate-900 mb-2 text-center">
                        {isDone ? 'Sync Complete!' : isError ? 'Sync Failed' : 'Syncing to Drive'}
                    </Text>
                    <Text className="text-slate-500 text-center mb-8">
                        {status || 'Connecting...'}
                    </Text>

                    {/* Action Area */}
                    {isWorking ? (
                        <ActivityIndicator size="large" color="#3b82f6" />
                    ) : (
                        <View className="w-full gap-3">
                            {isDone && folderId && (
                                <TouchableOpacity
                                    onPress={openDrive}
                                    className="w-full py-4 bg-blue-600 rounded-2xl flex-row justify-center items-center gap-2"
                                >
                                    <ExternalLink size={20} color="#ffffff" />
                                    <Text className="text-white font-semibold text-base">View in Drive</Text>
                                </TouchableOpacity>
                            )}
                            <TouchableOpacity
                                onPress={onClose}
                                className={`w-full py-4 rounded-2xl flex-row justify-center items-center ${isDone ? 'bg-slate-100' : 'bg-red-50'}`}
                            >
                                <Text className={`font-semibold text-base ${isDone ? 'text-slate-700' : 'text-red-600'}`}>
                                    {isDone ? 'Close' : 'Dismiss'}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </View>
            </View>
        </Modal>
    );
}
