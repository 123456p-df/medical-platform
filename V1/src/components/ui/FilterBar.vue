<template>
  <div class="filter-bar">
    <slot />
  </div>
</template>

<style scoped>
.filter-bar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px;
}

.filter-bar :deep(.select),
.filter-bar :deep(.btn) {
  width: auto;
}
</style>
