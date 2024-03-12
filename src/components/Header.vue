<script setup lang="ts">
import HeaderButtons from "@/components/HeaderButtons.vue";
const commitHash = __COMMIT_HASH__;
</script>
<template>
  <header class="navbar border-b border-base-300">
    <div class="navbar-start gap-2">
      <RouterLink to="/" class="text-3xl font-bold tracking-tight">
        AutoCut
      </RouterLink>
      <a
        href="https://github.com/kacperwyczawski/autocut/commits/main/"
        class="badge"
        >{{ commitHash }}</a
      >
    </div>
    <div class="navbar-end hidden md:flex gap-2">
      <HeaderButtons :extended-themes="true" />
    </div>
    <div class="navbar-end box md:hidden">
      <div class="dropdown dropdown-end">
        <div tabindex="0" role="button" class="btn btn-ghost lg:hidden">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            class="lucide lucide-menu"
          >
            <line x1="4" x2="20" y1="12" y2="12" />
            <line x1="4" x2="20" y1="6" y2="6" />
            <line x1="4" x2="20" y1="18" y2="18" />
          </svg>
        </div>
        <ul
          tabindex="0"
          class="dropdown-content mt-3 z-[1] p-2 shadow bg-base-100 rounded-box w-52 flex flex-col gap-2 items-stretch"
        >
          <HeaderButtons :extended-themes="false" />
        </ul>
      </div>
    </div>
  </header>
</template>
