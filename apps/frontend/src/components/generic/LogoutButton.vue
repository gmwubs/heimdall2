<template>
  <LinkItem
    id="logout_button"
    key="user"
    text="Logout"
    icon="mdi-logout"
    @click="logOut"
    >Logout</LinkItem
  >
</template>

<script lang="ts">
import LinkItem from '@/components/global/sidebaritems/IconLinkItem.vue';
import ServerMixin from '@/mixins/ServerMixin';
import {ServerModule} from '@/store/server';
import Component, {mixins} from 'vue-class-component';

@Component({
  components: {
    LinkItem
  }
})
export default class LogoutButton extends mixins(ServerMixin) {
  logOut() {
    ServerModule.Logout();
  }
}
</script>
