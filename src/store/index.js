import Vue from 'vue'
import Vuex from 'vuex'
import createPersistedState from 'vuex-persistedstate'

Vue.use(Vuex)

export default new Vuex.Store({
  plugins: [
    createPersistedState()
  ],
  state: {
    videos: [],
    playingVideo: { id: -1 }
  },
  mutations: {
    addVideo (state, video) {
      state.videos.push(video)
    },
    removeVideo (state, index) {
      state.videos.splice(index, 1)
    },
    editVideo (state, { index, volume = 100, range = [-1, -1] }) {
      const video = state.videos[index]

      state.videos.splice(index, 1, { ...video, volume, range })
    },
    moveVideo (state, { index, moveUp = true }) {
      const video = state.videos[index]

      state.videos.splice(index, 1)
      state.videos.splice(index + (moveUp ? -1 : 1), 0, video)
    },
    playVideo (state, { index = -1, forceUpdate = false }) {
      if (index === -1) {
        if (state.playingVideo.id !== -1) {
          state.playingVideo = { id: -1 }
        }
      } else if (state.videos[index].id !== state.playingVideo.id || forceUpdate) {
        state.playingVideo = { id: state.videos[index].id }
      }
    }
  },
  actions: {
    addVideo ({ commit, state }, { youtubeId, volume = -1, range = [-1, -1] }) {
      const maxId = Math.max(...state.videos.map(video => video.id), 0)
      const video = {
        id: maxId + 1,
        youtubeId,
        volume,
        range
      }

      commit('addVideo', video)
    },
    removeVideo ({ commit }, index) {
      commit('removeVideo', index)
    },
    editVideo ({ commit }, { index, volume = 100, range = [-1, -1] }) {
      commit('editVideo', { index, volume, range })
    },
    moveVideoUp ({ commit }, index) {
      commit('moveVideo', { index, moveUp: true })
    },
    moveVideoDown ({ commit }, index) {
      commit('moveVideo', { index, moveUp: false })
    },
    playVideo ({ commit }, index) {
      commit('playVideo', { index })
    },
    stopPlaying ({ commit }) {
      commit('playVideo', { index: -1 })
    },
    playNextVideo ({ commit, state }) {
      let playingVideoIndex = -1
      const index = state.videos.findIndex(video => video.id === state.playingVideo.id)

      if (index === state.videos.length - 1) {
        playingVideoIndex = 0
      } else {
        playingVideoIndex = index + 1
      }

      commit('playVideo', { index: playingVideoIndex, forceUpdate: true })
    },
    playPreviousVideo ({ commit, state }) {
      let playingVideoIndex = -1
      const index = state.videos.findIndex(video => video.id === state.playingVideo.id)

      if (index === 0) {
        playingVideoIndex = state.videos.length - 1
      } else {
        playingVideoIndex = index - 1
      }

      commit('playVideo', { index: playingVideoIndex, forceUpdate: true })
    },
    setVideoVolume ({ commit, state }, { index, volume = 100 }) {
      const video = state.videos[index]

      commit('editVideo', { index, volume, range: video.range })
    },
    setVideoRange ({ commit, state }, { index, range = [-1, -1] }) {
      const video = state.videos[index]

      commit('editVideo', { index, volume: video.volume, range })
    }
  }
})
