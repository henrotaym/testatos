<template>
  <div
    class="h-screen w-screen flex items-center justify-center bg-gradient-to-br to-cyan-600 from-blue-500"
  >
    <TrustupIoMessaging
      btn-text="Envoyer"
      :count="true"
      :is-discussion="true"
      app-key="test-axel"
      model-type="model"
      model-id="1"
      user-id="38933"
    />
  </div>
</template>

<script setup lang="ts">
import { TrustupIoMessaging } from "../dist/client";

// import lib from "./lib";
</script>
