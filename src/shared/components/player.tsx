import { Asset } from 'expo-asset';
import { useEffect, useRef, useState } from 'react';
import { Button, StyleSheet, View } from 'react-native';
import Sound from 'react-native-sound';

const audioSource = require('@assets/test.wav');

// Enable playback in silence mode
Sound.setCategory('Playback');

export default function Player() {
  const [asset, setAsset] = useState<Asset | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState<number>(0);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const soundRef = useRef<Sound | null>(null);

  
  // Preload the asset and initialize sound
  useEffect(() => {
    const loadAsset = async () => {
      try {
        console.log('Loading asset:', audioSource);
        const loadedAsset = await Asset.loadAsync(audioSource);
        console.log('Asset loaded:', loadedAsset);
        const assetUri = loadedAsset[0].localUri || loadedAsset[0].uri;
        setAsset(loadedAsset[0]);

        // Initialize react-native-sound with the asset URI
        // For local files, we need to use the file path
        const sound = new Sound(assetUri, '', (error) => {
          if (error) {
            console.error('Failed to load the sound', error);
            setIsLoading(false);
            return;
          }

          console.log('Sound loaded successfully');
          console.log('Duration in seconds:', sound.getDuration());
          console.log('Number of channels:', sound.getNumberOfChannels());

          setDuration(sound.getDuration());
          soundRef.current = sound;
          setIsLoading(false);
        });
      } catch (error) {
        console.error('Error loading asset:', error);
        setIsLoading(false);
      }
    };

    loadAsset();

    // Cleanup function
    return () => {
      if (soundRef.current) {
        soundRef.current.stop();
        soundRef.current.release();
        soundRef.current = null;
      }
    };
  }, []);

  // Monitor playback progress
  useEffect(() => {
    if (!soundRef.current || !isPlaying) return;

    const interval = setInterval(() => {
      if (soundRef.current) {
        soundRef.current.getCurrentTime((seconds) => {
          setCurrentTime(seconds);
        });
      }
    }, 100);

    return () => clearInterval(interval);
  }, [isPlaying]);

  const handlePlay = () => {
    if (!soundRef.current) {
      console.error('Sound is not available');
      return;
    }

    try {
      if (isPlaying) {
        console.log('Audio is already playing, pausing...');
        soundRef.current.pause();
        setIsPlaying(false);
      } else {
        console.log('Starting playback...');
        soundRef.current.play((success) => {
          if (success) {
            console.log('Successfully finished playing');
            setIsPlaying(false);
            setCurrentTime(0);
          } else {
            console.log('Playback failed due to audio decoding errors');
            setIsPlaying(false);
          }
        });
        setIsPlaying(true);
      }
    } catch (error) {
      console.error('Error playing audio:', error);
      if (error instanceof Error) {
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
      }
    }
  };

  const handleReplay = () => {
    if (!soundRef.current) {
      console.error('Sound is not available for replay');
      return;
    }

    try {
      console.log('Attempting to replay audio...');
      soundRef.current.stop(() => {
        soundRef.current?.setCurrentTime(0);
        soundRef.current?.play((success) => {
          if (success) {
            console.log('Successfully finished replaying');
            setIsPlaying(false);
            setCurrentTime(0);
          } else {
            console.log('Replay failed due to audio decoding errors');
            setIsPlaying(false);
          }
        });
        setIsPlaying(true);
      });
    } catch (error) {
      console.error('Error replaying audio:', error);
      if (error instanceof Error) {
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
      }
    }
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <Button title="Loading asset..." disabled />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Button
        title={isPlaying ? 'Pause Sound' : 'Play Sound'}
        onPress={handlePlay}
        disabled={!soundRef.current}
      />
      <Button title="Replay Sound" onPress={handleReplay} disabled={!soundRef.current} />
      {soundRef.current && (
        <View style={{ marginTop: 20, padding: 10, backgroundColor: '#f0f0f0' }}>
          <Button
            title={`Duration: ${duration > 0 ? duration.toFixed(1) : 'N/A'}s | Current: ${currentTime.toFixed(1)}s`}
            onPress={() => console.log('Sound state:', { duration, currentTime, isPlaying })}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: '#ecf0f1',
    padding: 10,
  },
});
