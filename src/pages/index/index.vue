<template>
  <view class="content">
    <view class="dice-wrap">
      <view
        class="dice"
        v-for="(item, index) in diceList"
        :key="index"
        :class="[diceClass[item.figure - 1]]"
        :style="{
          left: `${item.x}Px`,
          top: `${item.y}Px`,
          '--figure': item.figure,
        }"
      >
        <view v-for="num in item.figure" :key="num" class="dot"> </view>
      </view>
    </view>
    <view class="control">
      <view class="icon" @click="disableSound = !disableSound">
        <img v-show="!disableSound" src="@/static/icon-lingdang.svg" />
        <img v-show="disableSound" src="@/static/icon-lingdang_.svg" />
      </view>
      <view class="counter">
        <view @click="reduceHandler" class="reduce">
          <img src="@/static/icon-jian.svg" />
        </view>
        <text class="count">
          {{ count }}
        </text>
        <view @click="addHandler" class="add">
          <img src="@/static/icon-jia.svg" />
        </view>
      </view>
      <view @click="resetHandler" class="touzi">
        <img src="@/static/icon-touzi.svg" />
      </view>
    </view>
  </view>
</template>
<script lang="ts">
type dice = {
  x: number
  y: number
  figure: number
}
type diceClass = {
  readonly [index: number]: string
}
interface stateTs {
  width: number
  height: number
  w: number
  h: number
  count: number
  diceList: Array<dice>
  offset: number
  maxCount: number
  diceClass: diceClass
  audio: null | UniApp.InnerAudioContext
  isAudioPlay: boolean
  timer: null | number
  disableSound: boolean
}
import { defineComponent, onMounted, reactive, toRefs, watch } from 'vue'
export default defineComponent({
  setup() {
    const state: stateTs = reactive({
      width: 50, // 骰子宽度
      height: 50, // 骰子高度
      offset: 10, // 骰子之间的间距
      count: 5, // 骰子数量
      maxCount: 6,
      w: 0,
      h: 0,
      diceList: [],
      diceClass: ['one', 'two', 'three', 'four', 'five', 'six'],
      audio: null,
      isAudioPlay: false,
      timer: null,
      disableSound: false,
    })
    onMounted(() => {
      methods.initAudio()
      uni.getSystemInfo({
        success(info) {
          state.w = info.windowWidth
          state.h = info.windowHeight - 300
          methods.initDice()
        },
      })
    })
    watch(
      () => state.count,
      () => {
        methods.handlerClear()
      }
    )
    const methods = {
      // 初始化
      initDice() {
        const count = state.count
        for (let i = 0; i < count; i++) {
          this.overlayHandler()
        }
      },
      initAudio() {
        const audio = uni.createInnerAudioContext()
        audio.src = '/static/touzisheng.mp3'
        audio.onPlay(this.handlerAudioPlay)
        audio.onPause(this.handlerAudioPause)
        state.audio = audio
      },
      handlerAudioPlay() {
        state.isAudioPlay = true
      },
      handlerAudioPause() {
        state.isAudioPlay = false
      },
      audioPlay() {
        const audio = state.audio
        if (audio) {
          if (!state.isAudioPlay) audio.play()
          else {
            audio.stop()
            audio.play()
          }
        }
      },
      // 随机函数
      randomNumber(min: number, max: number): number {
        return Math.round(Math.random() * (max - min) + min)
      },
      // 触碰/叠加判断
      overlayHandler() {
        const x = this.randomNumber(10, state.w - 60)
        const y = this.randomNumber(10, state.h - 60)
        const figure = this.randomNumber(1, 6)
        const r = state.offset + state.width
        const result = state.diceList.some(({ x: Dx, y: Dy }) => {
          const yTouch = (y <= Dy && y >= Dy - r) || (y >= Dy && y <= Dy + r) // 上下是否触碰
          const xTouchLeft = x <= Dx && x >= Dx - r // 左侧是否触碰
          const xTouchRight = x >= Dx && x <= Dx + r // 右侧是否触碰
          // if ((xTouchLeft && yTouch) || (xTouchRight && yTouch)) {
          // }
          return (xTouchLeft && yTouch) || (xTouchRight && yTouch)
        })
        if (!result) {
          state.diceList.push({
            x,
            y,
            figure,
          })
        } else {
          this.overlayHandler()
        }
      },
      // 重置
      resetHandler() {
        this.handlerClear()
        if (!state.disableSound) {
          this.audioPlay()
        }
        if (state.timer) clearTimeout(state.timer)
        state.timer = setTimeout(() => {
          methods.initDice()
        }, 500)
      },
      handlerClear() {
        state.diceList.length = 0
      },
      resetList() {
        const pos = {
          x: -100,
          y: -100,
          figure: 1,
        }
        for (let i = 0; i < 5; i++) {
          state.diceList.push(pos)
        }
      },
      addHandler() {
        const count = state.count
        if (count + 1 <= state.maxCount) {
          state.count += 1
        }
      },
      reduceHandler() {
        const count = state.count
        if (count - 1 >= 1) {
          state.count -= 1
        }
      },
    }
    return {
      ...toRefs(state),
      ...methods,
    }
  },
})
</script>

<style lang="scss">
@mixin four {
  .dot {
    position: absolute;
  }
  .dot:nth-child(1) {
    bottom: 15rpx;
    left: 15rpx;
  }
  .dot:nth-child(2) {
    bottom: 15rpx;
    right: 15rpx;
  }
  .dot:nth-child(3) {
    top: 15rpx;
    left: 15rpx;
  }
  .dot:nth-child(4) {
    top: 15rpx;
    right: 15rpx;
  }
}
.content {
  padding-bottom: constant(safe-area-inset-bottom); /*兼容 IOS<11.2*/
  padding-bottom: env(safe-area-inset-bottom); /*兼容 IOS>11.2*/
  box-sizing: border-box;
  text-align: center;
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: #3f3f3f;
  .dice-wrap {
    position: relative;
    flex: 1;
    transition: all 1s;
  }
  .dice {
    position: absolute;
    width: 100rpx;
    height: 100rpx;
    // border: 1rpx solid red;
    border-radius: 15rpx;
    box-shadow: 0 0 16rpx #888888 inset;
    display: flex;
    padding: 15rpx;
    box-sizing: border-box;
    background: #fff;
    .dot {
      width: 15rpx;
      height: 15rpx;
      border-radius: 50%;
      background: rgb(16, 50, 241);
    }
    &.one {
      justify-content: center;
      align-items: center;
      .dot {
        background: red;
      }
    }
    &.two {
      .dot:nth-child(1) {
        position: absolute;
        bottom: 15rpx;
      }
      .dot:nth-child(2) {
        position: absolute;
        right: 15rpx;
      }
    }
    &.three {
      justify-content: center;
      align-items: center;
      .dot:nth-child(1) {
        position: absolute;
        bottom: 15rpx;
        left: 15rpx;
      }
      .dot:nth-child(2) {
        position: absolute;
        right: 15rpx;
        top: 15rpx;
      }
    }
    &.four {
      @include four;
    }
    &.five {
      justify-content: center;
      align-items: center;
      @include four;
      .dot:nth-child(5) {
        position: static;
      }
    }
    &.six {
      justify-content: space-between;
      align-items: center;
      .dot:nth-child(5),
      .dot:nth-child(6) {
        position: static;
      }
      @include four;
    }
  }
  .control {
    height: 80rpx;
    line-height: 80rpx;
    display: flex;
    padding: 0 20rpx;
    justify-content: space-between;
    background: #fff;
    .counter {
      display: flex;
      justify-content: center;
      .count {
        text-align: center;
        line-height: 80rpx;
        width: 140rpx;
      }
      .add,
      .reduce {
        display: flex;
        justify-content: center;
        align-items: center;
        img {
          width: 30rpx;
          height: 30rpx;
        }
      }
    }
    .icon,
    .touzi {
      display: flex;
      align-items: center;
    }
    .touzi > img {
      height: 60rpx;
      width: 60rpx;
    }
    .icon > img {
      height: 50rpx;
      width: 50rpx;
    }
  }
}
</style>
