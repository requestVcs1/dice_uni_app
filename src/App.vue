<script lang="ts">
import { defineComponent } from 'vue'
export default defineComponent({
  setup() {
    uni.showShareMenu({
      withShareTicket: true,
      menus: ['shareAppMessage', 'shareTimeline'],
    })
  },
})
</script>
<style lang="scss">
@import './static/iconfont.css';
/*每个页面公共css */
</style>
