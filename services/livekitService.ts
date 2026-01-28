import {
    ConnectionState,
    LocalAudioTrack,
    RemoteParticipant,
    RemoteTrackPublication,
    Room,
    RoomEvent
} from 'livekit-client';

export class LiveKitService {
  private room: Room | null = null;
  private localAudioTrack: LocalAudioTrack | null = null;

  constructor() {
    // Initialize LiveKit room instance
  }

  async connectToRoom(
    token: string, 
    serverUrl: string,
    onParticipantConnected?: (participant: RemoteParticipant) => void,
    onParticipantDisconnected?: (participant: RemoteParticipant) => void,
    onTrackSubscribed?: (publication: RemoteTrackPublication, participant: RemoteParticipant) => void
  ): Promise<Room> {
    try {
      this.room = new Room({
        // Audio settings
        adaptiveStream: true,
        dynacast: true,
      });

      // Set up event listeners
      this.room.on(RoomEvent.ParticipantConnected, (participant) => {
        console.log('Participant connected:', participant.identity);
        onParticipantConnected?.(participant);
      });

      this.room.on(RoomEvent.ParticipantDisconnected, (participant) => {
        console.log('Participant disconnected:', participant.identity);
        onParticipantDisconnected?.(participant);
      });

      this.room.on(RoomEvent.TrackSubscribed, (track, publication, participant) => {
        console.log('Track subscribed:', publication.kind);
        onTrackSubscribed?.(publication, participant);
      });

      this.room.on(RoomEvent.Disconnected, () => {
        console.log('Disconnected from room');
      });

      // Connect to the room
      await this.room.connect(serverUrl, token);
      
      // Publish local audio track if available
      if (this.localAudioTrack) {
        await this.room.localParticipant.publishTrack(this.localAudioTrack);
      }

      return this.room;
    } catch (error) {
      console.error('Error connecting to LiveKit room:', error);
      throw error;
    }
  }

  async createLocalAudioTrack(): Promise<LocalAudioTrack | undefined> {
    try {
      const tracks = await this.room?.localParticipant.createTracks({
        audio: true,
        video: false,
      });

      if (tracks && tracks.length > 0) {
        this.localAudioTrack = tracks[0] as LocalAudioTrack;
        return this.localAudioTrack;
      }
    } catch (error) {
      console.error('Error creating local audio track:', error);
    }
  }

  async createLocalTracks(audio: boolean = true, video: boolean = false) {
    try {
      const tracks = await this.room?.localParticipant.createTracks({
        audio: audio,
        video: video,
      });
      
      return tracks;
    } catch (error) {
      console.error('Error creating local tracks:', error);
      return [];
    }
  }

  async publishAudioTrack(): Promise<void> {
    if (!this.room || !this.localAudioTrack) {
      console.warn('Room or local audio track not available');
      return;
    }

    try {
      await this.room.localParticipant.publishTrack(this.localAudioTrack);
    } catch (error) {
      console.error('Error publishing audio track:', error);
    }
  }

  async unpublishAudioTrack(): Promise<void> {
    if (!this.room || !this.localAudioTrack) {
      return;
    }

    try {
      this.room.localParticipant.unpublishTrack(this.localAudioTrack);
    } catch (error) {
      console.error('Error unpublishing audio track:', error);
    }
  }

  async disconnect(): Promise<void> {
    try {
      if (this.room) {
        await this.room.disconnect();
        this.room = null;
      }
    } catch (error) {
      console.error('Error disconnecting from room:', error);
    }
  }

  async toggleMute(): Promise<boolean> {
    if (!this.localAudioTrack) {
      return false;
    }

    const wasMuted = this.localAudioTrack.isMuted;
    if (wasMuted) {
      await this.localAudioTrack.unmute();
    } else {
      await this.localAudioTrack.mute();
    }
    return !wasMuted;
  }

  async setMicrophoneEnabled(enabled: boolean): Promise<void> {
    if (!this.localAudioTrack) {
      return;
    }

    try {
      if (enabled) {
        await this.localAudioTrack.unmute();
      } else {
        await this.localAudioTrack.mute();
      }
    } catch (error) {
      console.error('Error setting microphone enabled:', error);
    }
  }

  getRoom(): Room | null {
    return this.room;
  }

  isConnected(): boolean {
    return this.room?.state === ConnectionState.Connected;
  }

  getRemoteParticipants(): RemoteParticipant[] {
    if (!this.room) return [];
    return Array.from(this.room.remoteParticipants.values());
  }
}

// Singleton instance
export const liveKitService = new LiveKitService();