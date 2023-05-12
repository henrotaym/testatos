<template>
  <div class="text-gray-800">
    <div
      class="flex items-end gap-3"
      :class="isActiveUserMessageDiscussion() ? 'flex-row-reverse' : ''"
    >
      <div>
        <img
          v-if="message.user_id != nextMessageUserId"
          :src="user?.avatar"
          class="rounded-full"
          alt="avatarlogo"
          width="32"
        />
        <div v-else class="w-[32px]"></div>
      </div>
      <div
        class="flex items-center group gap-3"
        :class="isActiveUserMessageDiscussion() ? 'flex-row-reverse' : ''"
      >
        <div
          v-if="!message.deleted_at && message.type === 'text'"
          class="rounded-lg px-4 py-2"
          :class="
            isActiveUserMessageDiscussion()
              ? 'bg-blue-500 text-white'
              : 'bg-gray-100'
          "
        >
          {{ message.text }}
        </div>
        <div
          v-else-if="!message.deleted_at && message.type.includes('image')"
          class="bg-gray-100 rounded-lg"
        >
          <a :href="message.media_url" target="_blank"
            ><img
              :src="message.media_url"
              :alt="message.media_name"
              class="md:max-w-xs max-w-[200px]"
          /></a>
        </div>
        <div
          v-else-if="
            !message.deleted_at &&
            (message.type.includes('application') ||
              message.type.includes('text'))
          "
          class="bg-gray-100 rounded-lg px-4 py-2"
        >
          <a :href="message.media_url" target="_blank">{{
            message.media_name
          }}</a>
        </div>
        <div v-else class="bg-gray-100 rounded-lg px-4 py-2">
          <i class="fa-solid fa-ban"></i> Ce message a été supprimé par son
          propriétaire
        </div>
        <i
          v-if="!message.deleted_at && message.user_id == Number(activUserId)"
          class="fa-solid fa-trash text-gray-300 text-xs cursor-pointer hover:text-red-400 hidden group-hover:block"
          @click="emit('deleteMessage', message.id)"
        ></i>
      </div>
    </div>
    <div
      class="ml-12 mt-1 text-xs text-gray-400"
      :class="isActiveUserMessageDiscussion() ? 'text-end mr-12' : ''"
    >
      {{ message.create_at_formated }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { MessageI, UserI } from "./types";

interface Props {
  message: MessageI;
  user?: UserI;
  nextMessageUserId: number;
  activUserId: string;
  isDiscussion: boolean;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  (e: "deleteMessage", id: number): void;
}>();

const isActiveUserMessageDiscussion = () => {
  return (
    props.isDiscussion && props.message.user_id == Number(props.activUserId)
  );
};
</script>
