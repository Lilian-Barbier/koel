<template>
  <article
    class="space-y-3"
    :class="{ 'ring-2 ring-k-accent ring-opacity-50 rounded': isDragOver }"
    tabindex="0"
    @dragenter.prevent="onDragEnter"
    @dragover.prevent="onDragOver"
    @dragleave.prevent="onDragLeave"
    @drop.prevent="onDrop"
    @paste="onPaste"
    @focus="isFocused = true"
    @blur="isFocused = false"
  >
    <span v-if="model" class="block size-24 aspect-square relative">
      <img :src="model" alt="" class="w-24 h-24 rounded object-cover">
      <button
        class="absolute inset-0 opacity-0 hover:opacity-100 bg-black/70 active:bg-black/85 active:text-[.9rem] transition-opacity"
        type="button"
        @click.prevent="removeOrRevert"
      >
        {{ hasCustomArtwork ? 'Revert' : 'Remove' }}
      </button>
    </span>
    <FileInput accept="image/*" name="cover" @change="onImageInputChange">
      <slot>
        {{ isDragOver ? 'Drop image here…' : (isFocused ? 'Select a file or paste (Ctrl+V)…' : 'Select a file…') }}
      </slot>
    </FileInput>
    <div v-if="isDragOver" class="text-sm text-k-text-secondary text-center">
      Drop your image file here
    </div>
    <div v-if="isFocused && !isDragOver" class="text-sm text-k-text-secondary text-center">
      You can also drag & drop or paste (Ctrl+V) an image
    </div>
  </article>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useImageFileInput } from '@/composables/useImageFileInput'

import FileInput from '@/components/ui/form/FileInput.vue'

const model = defineModel<string | null | undefined>()
const defaultValue = model.value

const isDragOver = ref(false)
const isFocused = ref(false)

const hasCustomArtwork = computed(() => defaultValue && model.value !== defaultValue)

const removeOrRevert = () => (model.value = hasCustomArtwork.value ? defaultValue : '')

const { onImageInputChange } = useImageFileInput({
  onImageDataUrl: dataUrl => (model.value = dataUrl),
})

// Handle file processing from different sources
const processImageFile = (file: File) => {
  // Validate file type
  if (!file.type.startsWith('image/')) {
    return
  }

  const reader = new FileReader()
  reader.onload = e => {
    if (e.target?.result) {
      model.value = e.target.result as string
    }
  }
  reader.readAsDataURL(file)
}

// Drag and drop handlers
const onDragEnter = (e: DragEvent) => {
  e.preventDefault()
  if (e.dataTransfer?.types.includes('Files')) {
    isDragOver.value = true
  }
}

const onDragOver = (e: DragEvent) => {
  e.preventDefault()
}

const onDragLeave = (e: DragEvent) => {
  e.preventDefault()
  // Only hide drag state if we're leaving the component
  if (!e.currentTarget || !e.relatedTarget
    || !(e.currentTarget as Element).contains(e.relatedTarget as Node)) {
    isDragOver.value = false
  }
}

const onDrop = (e: DragEvent) => {
  e.preventDefault()
  isDragOver.value = false

  const files = e.dataTransfer?.files
  if (files && files.length > 0) {
    processImageFile(files[0])
  }
}

// Paste handler for Ctrl+V
const onPaste = (e: ClipboardEvent) => {
  const items = e.clipboardData?.items
  if (!items) {
    return
  }

  for (let i = 0; i < items.length; i++) {
    const item = items[i]
    if (item.type.startsWith('image/')) {
      const file = item.getAsFile()
      if (file) {
        e.preventDefault()
        processImageFile(file)
        break
      }
    }
  }
}
</script>
