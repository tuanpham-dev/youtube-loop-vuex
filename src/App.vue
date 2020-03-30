<template>
  <div id="app">
    <Header></Header>
    <div class="main">
      <div class="container">
        <ul v-if="hasVideo" class="video-list">
          <li v-for="(video, index) in videos" :key="video.id" class="video-item">
            <Video :video="video" :index="index"></Video>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script>
import Header from './components/header/Header'
import Video from './components/video/Video'

export default {
  name: 'App',
  components: {
    Header,
    Video
  },
  computed: {
    hasVideo () {
      return this.$store.state.videos.length > 0
    },
    videos () {
      return this.$store.state.videos
    }
  }
}
</script>

<style lang="scss">
  .video-list {
    list-style: none;
    padding: 0;
    margin: 3rem auto;
  }

  .video-item {
    text-align: center;
  }
</style>
