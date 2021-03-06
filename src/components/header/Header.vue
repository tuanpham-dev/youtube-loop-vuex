<template>
  <header class="header">
    <div class="container">
      <a href="#" class="header__logo">YouTube Loop</a>
      <div v-if="videosCount > 0" class="header__controls">
        <Button v-if="!isPlaying" @click="playVideo(0)">Play</Button>
        <Button v-if="isPlaying" @click="stopPlaying">Stop</Button>
        <Button v-if="isPlaying && videosCount > 1" @click="playPreviousVideo">Previous</Button>
        <Button v-if="isPlaying && videosCount > 1" @click="playNextVideo">Next</Button>
      </div>
      <div class="header__input-group">
        <input v-model="input" type="text" class="header__input" placeholder="Enter YouTube URL or Video ID" />
        <div class="header__input-group-append">
          <Button color="blue" @click="addVideo()">Go Loop!</Button>
        </div>
      </div>
    </div>
  </header>
</template>

<script>
import { mapActions } from 'vuex'
import Button from '../button/Button'
import getYouTubeVideoId from '../../lib/getYouTubeVideoId'

export default {
  components: {
    Button
  },
  data () {
    return {
      input: ''
    }
  },
  computed: {
    videosCount () {
      return this.$store.state.videos.length
    },

    isPlaying () {
      return this.$store.state.playingVideo.id !== -1
    }
  },
  methods: {
    addVideo () {
      const youtubeId = getYouTubeVideoId(this.input)

      if (youtubeId) {
        this.$store.dispatch('addVideo', { youtubeId })
      }
    },
    ...mapActions([
      'playVideo',
      'stopPlaying',
      'playNextVideo',
      'playPreviousVideo'
    ])
  }
}
</script>

<style lang="scss">
  .header {
    background-color: $color-dark;
    padding-top: 0.5rem;
    padding-bottom: 0.5rem;
    position: sticky;
    top: 0;
    z-index: 10;

    .container {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: space-between;

      @media #{$phone-screen} {
        flex-wrap: nowrap;
      }
    }
  }

  .header__logo {
    font-size: 1.25rem;
    font-weight: 700;
    text-align: center;
    text-transform: uppercase;
    text-decoration:  none;
    display: inline-block;
    color: $color-white;
    margin-right: 1rem;
    flex: 0;

    @media (min-width: 375px) {
      text-align: left;
      white-space: nowrap;
    }
  }

  .header__controls {
    display: flex;
    align-items: center;

    @media #{$tablet-screen} {
      margin-left: 1rem;
    }

    .button {
      margin-right: 0.25rem;
    }
  }

  .header__input-group {
    position: relative;
    display: flex;
    align-items: stretch;
    width: 100%;
    margin-top: 0.75rem;

    @media #{$phone-screen} {
      margin-top: 0;
      margin-left: 1rem;
    }

    @media #{$tablet-screen} {
      margin-left: 3rem;
    }
  }

  .header__input {
    font-size: 1rem;
    color: $color-dark;
    position: relative;
    flex: 1 1;
    width: 100%;
    padding: 0.375rem 0.75rem;
    background-color: $color-white;
    background-clip: padding-box;
    border: 1px solid $color-light-gray;
    border-radius: 0.25rem 0 0 0.25rem;
    transition: border-color $transition-duration $transition-animation, box-shadow $transition-duration $transition-animation;
    z-index: 3;

    &:focus {
      outline: 0;
      border-color: $color-light-blue;
      box-shadow: 0 0 0 0.2rem rgba($color-blue, 0.25);
    }
  }

  .header__input-group-append {
    margin-left: -1px;
    display: flex;

    .button {
      position: relative;
      z-index: 2;
      border-top-left-radius: 0;
      border-bottom-left-radius: 0;
    }
  }
</style>
