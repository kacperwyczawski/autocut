<script setup lang="ts">
import { ref, watch } from "vue";

// please keep in sync with themes in tailwind.config.js (+ lime)
const themes = [
  "light",
  "dark",
  "cupcake",
  "bumblebee",
  "synthwave",
  "retro",
  "cyberpunk",
  "dracula",
  "night",
  "coffee",
  "dim",
  "nord",
  "lime",
];

const currentTheme = ref(localStorage.getItem("theme") || "coffee");
watch(currentTheme, (x) => {
  localStorage.setItem("theme", x);
});
</script>
<template>
  <header class="flex gap-2 p-2 border-b border-base-300">
    <h1 class="grow flex items-center">
      <RouterLink to="/" class="text-3xl font-bold tracking-tight">
        AutoCut
      </RouterLink>
    </h1>
    <a class="btn" href="https://github.com/kacperwyczawski/autocut">
      Source
    </a>
    <div class="dropdown">
      <div tabindex="0" role="button" class="btn">
        Theme
        <svg
          width="12px"
          height="12px"
          class="h-2 w-2 fill-current opacity-60 inline-block"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 2048 2048"
        >
          <path
            d="M1799 349l242 241-1017 1017L7 590l242-241 775 775 775-775z"
          ></path>
        </svg>
      </div>
      <ul
        tabindex="0"
        class="dropdown-content z-[1] p-2 shadow-2xl bg-base-300 rounded-box w-52"
      >
        <li v-for="theme in themes">
          <input
            v-model="currentTheme"
            type="radio"
            name="theme-dropdown"
            class="theme-controller btn btn-sm btn-block btn-ghost justify-start"
            :aria-label="theme"
            :value="theme"
          />
        </li>
      </ul>
    </div>
    <RouterLink to="/settings">
      <button class="btn">Settings</button>
    </RouterLink>
  </header>
</template>
