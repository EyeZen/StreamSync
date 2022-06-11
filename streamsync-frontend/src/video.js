import React, { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import videojs from 'video.js';

// eslint-disable-next-line import/prefer-default-export
const usePlayer = ({ src, controls, autoplay, file }) => {
  const options = {
    fill: true,
    fluid: true,
    preload: 'auto',
    html5: {
      hls: {
          enableLowInitialPlaylist: true,
          smoothQualityChange: true,
          overrideNative: true,
      },
    },
  };

  let source = null;
  if(src.lastIndexOf('.') !== -1) {
    let type = 'video/' + src.substring(src.lastIndexOf('.')+1)
    source = {src, type}
  } else if(src.startsWith('data:video/')) {
    let type = src.substring(src.indexOf(':')+1, src.indexOf(';'));
    source = {src, type}
  } else {
    source = {src, type: 'video/mp4'}
  }

  const videoRef = useRef(null);
  const [player, setPlayer] = useState(null);

  useEffect(() => {
    let vjsPlayer = videojs(videoRef.current, {
      ...options,
      controls,
      autoplay,
      sources: [source]
    });
    setPlayer(vjsPlayer);

    return () => {
      if (player !== null) {
        player.dispose();
      }
    };
  }, []);

  useEffect(() => { console.log('effect-3')
    if (player !== null) {
      player.src(source);
    }
  }, [src]);

  return videoRef;
};

const VideoPlayer = ({ src, controls, autoplay }) => {
  const playerRef = usePlayer({ src, controls, autoplay });

  return (
    <div data-vjs-player>
      <video ref={playerRef} width="100px" className='video-js vjs-theme-city vjs-big-play-centered' />
    </div>
  );
};

VideoPlayer.propTypes = {
  src: PropTypes.string.isRequired,
  controls: PropTypes.bool,
  autoplay: PropTypes.bool,
};

VideoPlayer.defaultProps = {
  controls: true,
  autoplay: false,
};

export default VideoPlayer;