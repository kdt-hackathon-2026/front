<script setup lang="ts">
import BaseButton from '@/components/common/BaseButton.vue';
import { useAppStore } from '@/stores/app';

const appStore = useAppStore();
</script>

<template>
  <section class="w-full space-y-8">
    <div class="space-y-4">
      <p class="text-sm font-semibold tracking-wide text-muted-foreground">VUE 3 FRONTEND</p>
      <h1 class="max-w-3xl text-4xl font-bold tracking-tight sm:text-5xl">
        개발 기본 구조가 준비되었습니다.
      </h1>
      <p class="max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
        프로젝트명과 서비스 설명은 기획 문서 확인 후 반영하세요. 현재 화면은 Router, Pinia, Tailwind
        CSS 연결 상태를 확인하는 도메인 중립적인 시작점입니다.
      </p>
    </div>

    <div class="grid gap-3 sm:grid-cols-3">
      <div class="rounded-xl border bg-background p-4">
        <p class="text-sm text-muted-foreground">Router</p>
        <p class="mt-1 font-semibold">이름 기반 라우트 연결</p>
      </div>
      <div class="rounded-xl border bg-background p-4">
        <p class="text-sm text-muted-foreground">Pinia</p>
        <p class="mt-1 font-semibold">
          {{ appStore.isInitialized ? '초기화 완료' : '초기화 중' }}
        </p>
      </div>
      <div class="rounded-xl border bg-background p-4">
        <p class="text-sm text-muted-foreground">API</p>
        <p class="mt-1 font-semibold">환경변수 기반 인스턴스</p>
      </div>
    </div>

    <BaseButton disabled>도메인 기능 연결 전</BaseButton>
  </section>
</template>
