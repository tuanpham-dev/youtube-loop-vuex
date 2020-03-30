<template>
  <div></div>
</template>

<script>
import loadYouTubeAPI from '../../lib/loadYouTubeAPI'

export default {
  props: {
    videoId: String
  },
  mounted () {
    this.player = loadYouTubeAPI().then(YT => {
      this.playerInstance = new YT.Player(this.$el, {
        videoId: this.videoId,
        events: {
          onReady: () => this.$emit('ready', this.playerInstance),
          onStateChange: (event) => {
            if (event.data === YT.PlayerState.PLAYING) {
              this.$emit('playing')
            } else if (event.data === YT.PlayerState.PAUSED) {
              this.$emit('paused')
            } else if (event.data === YT.PlayerState.ENDED) {
              this.$emit('ended')
            }
          },
          onError: () => {
            this.$emit('error')
          }
        }
      })
    })
  }
}
</script>
