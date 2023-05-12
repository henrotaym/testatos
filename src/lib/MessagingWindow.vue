<template>
  <div
    id="scrollable"
    class="bg-white text-black h-full w-full overflow-y-scroll"
  >
    <div
      v-if="count"
      class="flex my-4 sticky top-0 bg-white text-lg border-b pb-1"
    >
      Comments ({{ conversation?.messages_count }})
    </div>
    <div v-if="!isLoadingInitial" class="flex flex-col gap-3">
      <div class="flex justify-center">
        <button
          v-if="!isLoadingMoreMessages"
          class="rounded-full bg-gray-100 hover:bg-gray-200 py-1 px-3 shadow text-sm"
          @click="OlderMessages"
        >
          Load more
        </button>
        <button
          v-else
          disabled
          class="rounded-full bg-gray-100 hover:bg-gray-200 py-1 px-3 shadow text-sm"
        >
          <i class="fa-solid animate-pulse fa-ellipsis"></i>
        </button>
      </div>
      <TextMessage
        v-for="(message, index) in messages"
        :key="message.id"
        :is-discussion="isDiscussion"
        :activ-user-id="userId"
        :next-message-user-id="nextMessageUserId(index)"
        :message="message"
        :user="findUser(message.user_id)"
        @deleteMessage="deleteMessage"
      />
      <div class="flex mr-12" :class="isDiscussion ? 'justify-end' : ''">
        <LoaderBasic v-if="isLoading" />
      </div>
      <div class="flex mr-12 ml-12" :class="isDiscussion ? 'justify-end' : ''">
        <ImageLoader v-if="isImageLoading" :image-url="imagePlaceholder" />
      </div>

      <div class="bg-white sticky w-full bottom-0">
        <div class="bg-gray-50 rounded-full flex items-center justify-between">
          <input
            v-model="text"
            class="bg-gray-50 rounded-l-full p-4 w-5/6 outline-0"
            placeholder="Message.."
            type="text"
            @keyup.enter="sendText"
          />

          <button
            v-if="text"
            class="bg-blue-600 hover:bg-blue-700 py-1 px-5 text-white rounded-full mr-2 w-auto flex gap-2 items-center text-lg font-semibold"
            @click="sendText"
          >
            {{ btnText }} <i class="fa-solid fa-paper-plane"></i>
          </button>

          <div v-else class="flex gap-6 mr-8">
            <i
              class="fa-solid fa-microphone text-xl text-gray-400 hover:text-red-400"
            ></i>

            <label for="image">
              <i
                class="fa-solid fa-image text-xl text-gray-400 cursor-pointer hover:text-green-400"
              ></i>
              <input
                id="image"
                class="hidden"
                type="file"
                accept="image/*"
                @change="sendImage"
              />
            </label>

            <label for="file">
              <i
                class="fa-solid fa-file-lines text-xl text-gray-400 cursor-pointer hover:text-purple-400"
              ></i>
              <input
                id="file"
                class="hidden"
                type="file"
                accept="application/msword, application/vnd.ms-excel, application/vnd.ms-powerpoint,
                                text/plain, application/pdf"
                @change="sendFile"
              />
            </label>
          </div>
        </div>
      </div>
    </div>
    <div v-else class="flex justify-center">
      <LoaderBasic />
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import { Messaging } from "./api/endpoints";
import TextMessage from "./TextMessage.vue";
import LoaderBasic from "./LoaderBasic.vue";
import ImageLoader from "./ImageLoader.vue";
import { ImageUploader, FileUploader } from "@deegital/js-trustup-io-uploads";
import type { MessageI, UserI, ConversationI } from "./types/index";
import { trustupWebsocket } from "@deegital/js-trustup-io-websocket";

interface Props {
  appKey: string;
  modelType: string;
  modelId: string;
  userId: string;
  isDiscussion: boolean;
  count: boolean;
  btnText: string;
}

const props = defineProps<Props>();

const endpoint = new Messaging();
const conversation = ref<ConversationI | undefined>(undefined);
const messages = ref<MessageI[]>([]);
const isLoading = ref<boolean>(false);
const isImageLoading = ref<boolean>(false);
const isLoadingInitial = ref<boolean>(false);

const page = ref<number>(2);
const limit = ref<number>(20);
const isLoadingMoreMessages = ref<boolean>(false);

const OlderMessages = async () => {
  isLoadingMoreMessages.value = true;
  const olderConversation = await endpoint.index(
    props.appKey,
    props.modelType,
    props.modelId,
    props.userId,
    page.value,
    limit.value,
    "desc"
  );
  olderConversation.messages = olderConversation.messages.reverse();
  messages.value.unshift(...olderConversation.messages);
  page.value = page.value + 1;
  isLoadingMoreMessages.value = false;
};

const fetchMessages = async () => {
  isLoadingInitial.value = true;
  conversation.value = await endpoint.index(
    props.appKey,
    props.modelType,
    props.modelId,
    props.userId,
    1,
    limit.value,
    "desc"
  );
  messages.value = conversation.value?.messages ?? [];
  messages.value.reverse();
  seeConversation();
  connectToChannel();
  isLoadingInitial.value = false;
};

const findUser = (id: number): UserI | undefined => {
  return conversation.value?.users.find((user) => user.id === id);
};

const scrollAfterFetch = async () => {
  await fetchMessages();
  scrollToEnd();
};

onMounted(scrollAfterFetch);

const text = ref<string>("");

const sendText = async () => {
  if (text.value == "") {
    return;
  } else {
    scrollToEnd();
    isLoading.value = true;

    const textCopy = text.value;
    text.value = "";
    if (conversation.value) {
      const response = await endpoint.storeMessage(
        conversation.value?.id,
        props.userId,
        textCopy
      );
      if (!messages.value.find((message) => message.id === response.id)) {
        messages.value.push(response);
      }

      isLoading.value = false;
      scrollToEnd();
    }
  }
};

const imageUploader = new ImageUploader({
  dimensions: {
    width: 2400,
    height: 2400,
  },
});

const fileUploader = new FileUploader();
const imagePlaceholder = ref<string>("");

const sendImage = async (e: any) => {
  scrollToEnd();
  const image = e.target.files[0];
  const fileResponse = await imageUploader.get(image);
  imagePlaceholder.value = fileResponse.source;
  isImageLoading.value = true;
  if (conversation.value) {
    const response = await endpoint.storeImage(
      conversation.value.id,
      props.userId,
      fileResponse.source
    );
    isImageLoading.value = false;
    if (!messages.value.find((message) => message.id === response.id)) {
      messages.value.push(response);
    }
    scrollToEnd();
  }
};

const sendFile = async (e: any) => {
  scrollToEnd();
  isLoading.value = true;
  const file = e.target.files[0];
  const fileResponse = await fileUploader.get(file);
  if (conversation.value) {
    const response = await endpoint.storeFile(
      conversation.value?.id,
      props.userId,
      fileResponse.file,
      fileResponse.name
    );

    if (!messages.value.find((message) => message.id === response.id)) {
      messages.value.push(response);
    }
    isLoading.value = false;
    scrollToEnd();
  }
};

const deleteMessage = async (messageId: number) => {
  const response = await endpoint.deleteMessage(messageId);
  console.log(response);
  const index = messages.value.findIndex((message) => message.id === messageId);
  const todayDate = new Date().toDateString();
  messages.value[index].deleted_at = todayDate;
};

const nextMessageUserId = (index: number) => {
  return messages.value[index + 1]?.user_id;
};

const seeConversation = async () => {
  if (conversation.value) {
    const response = await endpoint.seeConversation(
      conversation.value?.id,
      props.userId
    );
    console.log(response);
  }
};

const scrollToEnd = () => {
  let scrollable = document.getElementById("scrollable");
  scrollable?.scrollTo({
    top: scrollable?.scrollHeight,
    left: 0,
    behavior: "smooth",
  });
};

const connectToChannel = () => {
  trustupWebsocket
    .echo()
    .channel(`conversation.${conversation.value?.id}`)
    .listen("MessageSentEvent", (e: any) => {
      console.log("Channel received message", e.message);
      if (messages.value.find((message) => message.id === e.message.id)) {
        return console.log("Message already exist");
      }
      messages.value.push(e.message);
    })
    .listen("MessageDeletedEvent", (e: any) => {
      console.log("Channel deleted message", e.message);
      deleteMessage(e.message.id);
    });
};
</script>
