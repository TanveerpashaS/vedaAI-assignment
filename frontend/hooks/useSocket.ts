'use client';

import { useEffect, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAssignmentStore } from '@/store/assignmentStore';
import { GenerationProgress } from '@/types';
import { assignmentApi } from '@/services/api';

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000';

let socketInstance: Socket | null = null;

export const useSocket = () => {
  const socketRef = useRef<Socket | null>(null);
  const { setGenerationProgress, updateAssignmentStatus, fetchAssignment } =
    useAssignmentStore();

  const connect = useCallback(() => {
    if (socketInstance?.connected) {
      socketRef.current = socketInstance;
      return;
    }

    const socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socket.on('connect', () => {
      console.log('🔌 Socket connected:', socket.id);
    });

    socket.on('disconnect', () => {
      console.log('🔌 Socket disconnected');
    });

    socket.on('generation-progress', async (data: GenerationProgress) => {
      setGenerationProgress(data);

      if (data.status === 'completed') {
        // Fetch the full assignment with generated paper
        try {
          const response = await assignmentApi.getById(data.assignmentId);
          if (response.success && response.data) {
            updateAssignmentStatus(
              data.assignmentId,
              'completed',
              response.data.generatedPaper
            );
          }
        } catch (err) {
          console.error('Failed to fetch completed assignment:', err);
        }
      } else if (data.status === 'failed') {
        updateAssignmentStatus(data.assignmentId, 'failed');
      } else {
        updateAssignmentStatus(data.assignmentId, 'processing');
      }
    });

    socketInstance = socket;
    socketRef.current = socket;
  }, [setGenerationProgress, updateAssignmentStatus]);

  const joinAssignment = useCallback((assignmentId: string) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('join-assignment', assignmentId);
    }
  }, []);

  const leaveAssignment = useCallback((assignmentId: string) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('leave-assignment', assignmentId);
    }
  }, []);

  useEffect(() => {
    connect();
    return () => {
      // Don't disconnect on unmount - keep persistent connection
    };
  }, [connect]);

  return { socket: socketRef.current, joinAssignment, leaveAssignment, connect };
};

export const useAssignmentSocket = (assignmentId: string | null) => {
  const { joinAssignment, leaveAssignment } = useSocket();

  useEffect(() => {
    if (!assignmentId) return;
    joinAssignment(assignmentId);
    return () => {
      leaveAssignment(assignmentId);
    };
  }, [assignmentId, joinAssignment, leaveAssignment]);
};
