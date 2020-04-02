<template>
  <div class="video">
    <div class="video__player">
      <YouTube :videoId="video.youtubeId" @ready="onVideoLoaded" @error="onError" @playing="onPlaying" @paused="onPaused" @ended="onEnded"></YouTube>
    </div>
    <Slider v-show="videoLoaded" v-model="volume" class="video__volume-slider" orientation="vertical"></Slider>
    <Slider v-show="videoLoaded" v-model="range" :range="true" :max="duration" class="video__range-slider"></Slider>
    <div v-show="videoLoaded" v-html="`Volume: ${volume} — Range: ${rangeStart} → ${rangeEnd}`" class="video__info"></div>
    <div class="video__buttons">
      <Button v-if="canMoveUp" @click="moveVideoUp(index)">Move Up</Button>
      <Button v-if="canMoveDown" @click="moveVideoDown(index)">Move Down</Button>
      <Button color="red" @click="removeVideo(index)">Remove Video</Button>
    </div>
  </div>
</template>

<script>
import { mapActions } from 'vuex'
import YouTube from '../youtube/YouTube'
import Slider from '../slider/Slider'
import Button from '../button/Button'
import timeFormat from '../../lib/timeFormat'

export default {
  components: {
    YouTube,
    Slider,
    Button
  },
  props: {
    index: Number,
    video: Object
  },
  data () {
    return {
      player: null,
      videoLoaded: false,
      duration: 0,
      title: ''
    }
  },
  computed: {
    playingVideo () {
      return this.$store.state.playingVideo
    },
    isPlaying () {
      return this.playingVideo.id === this.video.id
    },
    volume: {
      get () {
        return this.video.volume
      },
      set (value) {
        if (this.player) {
          this.player.setVolume(this.video.volume)
        }

        this.setVideoVolume({ index: this.index, volume: value })
      }
    },
    range: {
      get () {
        return this.video.range
      },
      set (value) {
        if (this.isPlaying) {
          const currentTime = this.player.getCurrentTime()

          if (this.range[0] > currentTime) {
            this.player.seekTo(this.range[0])
          }
        }

        this.setVideoRange({ index: this.index, range: value })
      }
    },
    canMoveUp () {
      return this.index > 0
    },
    canMoveDown () {
      return this.index < this.$store.state.videos.length - 1
    },
    rangeStart () {
      return timeFormat(this.range[0])
    },
    rangeEnd () {
      return timeFormat(this.range[1])
    }
  },
  methods: {
    onVideoLoaded (player) {
      const duration = player.getDuration()
      this.videoLoaded = false

      if (!duration) {
        this.removeVideo(this.index)
      } else {
        this.player = player
        this.duration = duration
        this.title = this.player.getVideoData().title

        if (this.video.volume === -1 || this.video.range[0] === -1 || this.video.range[1] === -1) {
          this.editVideo({ index: this.index, volume: this.player.getVolume(), range: [0, duration] })
        }

        if (this.isPlaying) {
          this.play()
        }

        this.videoLoaded = true
      }
    },
    ...mapActions([
      'editVideo',
      'playVideo',
      'removeVideo',
      'playNextVideo',
      'moveVideoUp',
      'moveVideoDown',
      'setVideoVolume',
      'setVideoRange'
    ]),
    play () {
      this.player.setVolume(this.video.volume)
      this.player.seekTo(this.video.range[0], true)
      this.player.playVideo()

      document.title = this.title + ' - YouTube Loop in Vuex'
    },
    onPlaying () {
      clearInterval(this.interval)
      this.interval = setInterval(this.trackStatus, 100)

      if (!this.isPlaying) {
        this.playVideo(this.index)
      }
    },
    onPaused () {
      clearInterval(this.interval)
    },
    onEnded () {
      clearInterval(this.interval)
      this.playNextVideo()
    },
    onError () {
      clearInterval(this.interval)
      this.removeVideo(this.index)
    },
    trackStatus () {
      if (this.player) {
        const currentTime = this.player.getCurrentTime()

        if (currentTime > this.video.range[1]) {
          this.onEnded()
        }
      }
    }
  },
  watch: {
    playingVideo (value) {
      if (this.player) {
        if (this.isPlaying) {
          this.play()
        } else {
          this.player.pauseVideo()
          document.title = 'YouTube Loop in Vuex'
        }
      }
    }
  },
  created () {
    this.interval = null
  }
}
</script>

<style lang="scss">
  .video {
    display: inline-grid;
    grid-template-columns: auto min-content;
    margin-bottom: 3rem;
    width: 100%;
    max-width: 660px;
  }

  .video__player {
    position: relative;

    &::before {
      content: '';
      display: block;
      padding-bottom: 56.25%;
    }

    iframe {
      position: absolute;
      top: 0;
      left: 0;
      max-width: 100%;
      height: 100%;
      width: 640px;
    }
  }

  .video__volume-slider {
    margin-left: 1rem;
    height: 100%;
  }

  .video__range-slider {
    margin-top: 1rem;
  }

  .video__info {
    color: $color-light-gray;
    grid-column: 1 / 2;
    margin-top: 0.25rem;
  }

  .video__buttons {
    grid-column: 1 / 2;
    justify-self: center;
    margin-top: 1rem;

    .button {
      margin-right: 0.25rem;

      &:last-child {
        margin-right: 0;
      }
    }
  }
</style>
