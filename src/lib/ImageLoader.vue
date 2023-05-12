<template>
  <div class="rounded-lg blur-sm">
    <img :src="imageUrl" class="md:max-w-xs max-w-[200px]" alt="imageLoader" />
  </div>
</template>

<script setup lang="ts">
interface Props {
  imageUrl: string;
}

defineProps<Props>();
</script>
