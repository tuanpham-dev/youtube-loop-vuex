<template>
  <div :class="containerClass" @click="onBarClick" ref="container">
    <span class="slider__range" :style="rangeStyle"></span>
    <span v-if="!range" class="slider__handle" :style="handleStyle" @mousedown="onHandleMouseDown($event)"
      @keydown="onHandleKeyDown($event)" tabindex="0" role="slider" :aria-valuemin="min" aria-valuenow="value"
      aria-valuemax="max" :aria-labelledby="ariaLabelledBy">
    </span>
    <span v-if="range" class="slider__handle" :style="rangeStartHandleStyle" @mousedown="onHandleMouseDown($event, 0)"
      @keydown="onHandleKeyDown($event, 0)" tabindex="0" role="slider" :aria-valuemin="min" aria-valuenow="value ? value[0] : null"
      aria-valuemax="max" :aria-labelledby="ariaLabelledBy">
    </span>
    <span v-if="range" class="slider__handle" :style="rangeEndHandleStyle" @mousedown="onHandleMouseDown($event, 1)"
      @keydown="onHandleKeyDown($event, 1)" tabindex="0" role="slider" :aria-valuemin="min" aria-valuenow="value = value[1] : null"
      aria-valuemax="max" :aria-labelledby="ariaLabelledBy">
    </span>
  </div>
</template>

<script>
export default {
  props: {
    value: [Number, Array],
    min: {
      type: Number,
      default: 0
    },
    max: {
      type: Number,
      default: 100
    },
    orientation: {
      type: String,
      default: 'horizontal'
    },
    step: {
      type: Number,
      default: null
    },
    range: {
      type: Boolean,
      default: false
    },
    disabled: {
      type: Boolean,
      default: false
    },
    ariaLabelledBy: {
      type: String,
      default: null
    }
  },
  dragging: false,
  handleIndex: null,
  initX: null,
  initY: null,
  barWidth: null,
  barHeight: null,
  dragListener: null,
  mouseupListener: null,
  beforeDestroy () {
    this.unbindDragListeners()
  },
  methods: {
    updateDomData () {
      const rect = this.$refs.container.getBoundingClientRect()
      const doc = document.documentElement
      this.initX = rect.left + (window.pageXOffset || doc.scrollLeft) - (doc.clientLeft || 0)
      this.initY = rect.top + (window.pageYOffset || doc.scrollTop) - (doc.clientTop || 0)
      this.barWidth = this.$refs.container.offsetWidth
      this.barHeight = this.$refs.container.offsetHeight
    },
    setValueFromHandlePosition (event, handlePosition) {
      const newValue = (this.max - this.min) * (handlePosition / 100) + this.min

      if (this.range) {
        if (this.step) {
          this.handleStepChange(event, newValue, this.value[this.handleIndex])
        } else {
          this.updateModel(event, newValue)
        }
      } else {
        if (this.step) {
          this.handleStepChange(event, newValue, this.value)
        } else {
          this.updateModel(event, newValue)
        }
      }
    },
    onSlide (event) {
      const handlePosition = this.horizontal ? ((event.pageX - this.initX) * 100) / (this.barWidth) : (((this.initY + this.barHeight) - event.pageY) * 100) / (this.barHeight)
      this.setValueFromHandlePosition(event, handlePosition)
    },
    handleStepChange (event, newValue, oldValue) {
      const diff = (newValue - oldValue)
      let val = oldValue

      if (diff < 0) { val = oldValue + Math.ceil(newValue / this.step - oldValue / this.step) * this.step } else if (diff > 0) { val = oldValue + Math.floor(newValue / this.step - oldValue / this.step) * this.step }

      this.updateModel(event, val)
    },
    updateModel (event, value) {
      let newValue = value
      let modelValue

      if (this.range) {
        if (this.handleIndex === 0) {
          if (newValue < this.min) { newValue = this.min } else if (newValue >= this.value[1]) { newValue = this.value[1] }
        } else {
          if (newValue > this.max) { newValue = this.max } else if (newValue <= this.value[0]) { newValue = this.value[0] }
        }

        modelValue = [...this.value]
        modelValue[this.handleIndex] = Math.floor(newValue)
      } else {
        if (newValue < this.min) {
          newValue = this.min
        } else if (newValue > this.max) {
          newValue = this.max
        }

        modelValue = Math.floor(newValue)
      }

      this.$emit('input', modelValue)
      this.$emit('change', modelValue)
    },
    onBarClick (event) {
      if (this.disabled) {
        return
      }

      if (!event.target.classList.contains('slider__handle')) {
        this.updateDomData()
        this.onSlide(event)
      }
    },
    onHandleMouseDown (event, index) {
      if (this.disabled) {
        return
      }

      this.dragging = true
      this.updateDomData()
      this.handleIndex = index
      this.bindDragListeners()
      event.preventDefault()
    },
    onHandleKeyDown (event, index) {
      this.handleIndex = index

      switch (event.which) {
        // down
        case 40:
          if (this.vertical) {
            this.decrementValue(event, index)
            event.preventDefault()
          }
          break

          // up
        case 38:
          if (this.vertical) {
            this.incrementValue(event, index)
            event.preventDefault()
          }
          break

          // left
        case 37:
          if (this.horizontal) {
            this.decrementValue(event, index)
            event.preventDefault()
          }
          break

          // right
        case 39:
          if (this.horizontal) {
            this.incrementValue(event, index)
            event.preventDefault()
          }
          break

        default:
          break
      }
    },
    decrementValue (event, index) {
      let newValue

      if (this.range) {
        if (this.step) {
          newValue = this.value[index] - this.step
        } else {
          newValue = this.value[index] - 1
        }
      } else {
        if (this.step) {
          newValue = this.value - this.step
        } else {
          newValue = this.value - 1
        }
      }

      this.updateModel(event, newValue)

      event.preventDefault()
    },
    incrementValue (event, index) {
      let newValue

      if (this.range) {
        if (this.step) {
          newValue = this.value[index] + this.step
        } else {
          newValue = this.value[index] + 1
        }
      } else {
        if (this.step) {
          newValue = this.value + this.step
        } else {
          newValue = this.value + 1
        }
      }

      this.updateModel(event, newValue)

      event.preventDefault()
    },
    bindDragListeners () {
      if (!this.dragListener) {
        this.dragListener = (event) => {
          if (this.dragging) {
            this.onSlide(event)
          }
        }

        document.addEventListener('mousemove', this.dragListener)
      }

      if (!this.mouseupListener) {
        this.mouseupListener = (event) => {
          if (this.dragging) {
            this.dragging = false
            this.$emit('slideend', { originalEvent: event, values: this.value })
          }
        }

        document.addEventListener('mouseup', this.mouseupListener)
      }
    },
    unbindDragListeners () {
      if (this.dragListener) {
        document.removeEventListener('mousemove', this.dragListener)
        this.dragListener = null
      }

      if (this.mouseupListener) {
        document.removeEventListener('mouseup', this.mouseupListener)
        this.mouseupListener = null
      }
    }
  },
  computed: {
    containerClass () {
      return ['slider', {
        'slider--disabled': this.disabled,
        'slider--horizontal': (this.orientation === 'horizontal'),
        'slider--vertical': (this.orientation === 'vertical')
      }]
    },
    horizontal () {
      return this.orientation === 'horizontal'
    },
    vertical () {
      return this.orientation === 'vertical'
    },
    rangeStyle () {
      if (this.range) {
        if (this.horizontal) {
          return { left: this.rangeStartPosition + '%', width: (this.rangeEndPosition - this.rangeStartPosition + '%') }
        } else {
          return { bottom: this.rangeStartPosition + '%', height: (this.rangeEndPosition - this.rangeStartHandlePosition + '%') }
        }
      } else {
        if (this.horizontal) {
          return { width: this.handlePosition + '%' }
        } else {
          return { height: this.handlePosition + '%' }
        }
      }
    },
    handleStyle () {
      if (this.horizontal) {
        return { left: this.handlePosition + '%' }
      } else {
        return { bottom: this.handlePosition + '%' }
      }
    },
    handlePosition () {
      if (this.value === 0) {
        return 0
      } else if (this.value < this.min) {
        return 0
      } else if (this.value > this.max) {
        return 100
      } else {
        return (this.value - this.min) * 100 / (this.max - this.min)
      }
    },
    rangeStartPosition () {
      if (this.value) {
        return (this.value[0] < this.min ? 0 : this.value[0] - this.min) * 100 / (this.max - this.min)
      } else {
        return 0
      }
    },
    rangeEndPosition () {
      if (this.value) {
        return (this.value[1] > this.max ? 100 : this.value[1] - this.min) * 100 / (this.max - this.min)
      } else {
        return 0
      }
    },
    rangeStartHandleStyle () {
      if (this.horizontal) {
        return { left: this.rangeStartPosition + '%' }
      } else {
        return { bottom: this.rangeStartPosition + '%' }
      }
    },
    rangeEndHandleStyle () {
      if (this.horizontal) {
        return { left: this.rangeEndPosition + '%' }
      } else {
        return { bottom: this.rangeEndPosition + '%' }
      }
    }
  }
}
</script>

<style lang="scss">
  .slider {
    position: relative;
    text-align: left;
    background-color: $color-light-gray;
    border-radius: 0.125rem;
  }

  .slider__handle {
    position: absolute;
    width: 1rem;
    height: 1rem;
    cursor: default;
    -ms-touch-action: none;
    touch-action: none;
    background-color: $color-white;
    border: 2px solid $color-gray;
    border-radius: 100%;
    margin-left: -0.5rem;
  }

  .slider__range {
    position: absolute;
    display: block;
    border: 0;
    background-position: 0 0;
    background-color: $color-gray;
    border-radius: 0.125rem;
  }

  .slider--horizontal {
    height: 0.375rem;

    .slider__handle {
      top: 50%;
      margin-top: -0.5rem;
    }

    .slider__range {
      top: 0;
      height: 100%;
    }
  }

  .slider--vertical {
    width: 0.375rem;
    height: 100px;

    .slider__handle {
      left: 50%;
      margin-bottom: -0.5rem;
    }

    .slider__range {
      left: 0;
      width: 100%;
      bottom: 0;
    }
  }
</style>
