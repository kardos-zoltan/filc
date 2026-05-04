<script setup lang="ts">
	const { post } = defineProps<{
		post: Omit<Omit<Post, "posted_at">, "completedAt">
	}>();

	const content: any = computed(() => JSON.parse(post.content, (key, value) => key === "date" ? Date.parse(value) : value))
</script>

<template>
	<div class="bg-secondary rounded-4 mb-0" style="min-height: 100px;">
		<div class="bg-secondary rounded-4 rounded-bottom-0">
			<p class="fs-5 text-center mb-0 py-2">Kvíz</p>
		</div>
		<div class="row h-100">
			<div class="col d-flex flex-column h-100 p-2">
				<p 
					class="mb-0" 
					:class="{ 'fs-7': !!content.date, 'fs-4': !content.date }"
				>
					{{ content.title }}
				</p>
				<p 
					class="mt-auto mb-1 fs-8" 
					v-if="content.date"
				>
					Határidő: {{ Intl.DateTimeFormat().format(content.date) }}
				</p>
			</div>
			<div class="col-4 p-2">
				<button class="btn btn-primary h-100 w-100 text-center p-0">Kinyit</button>
			</div>
		</div>
	</div>
</template>
