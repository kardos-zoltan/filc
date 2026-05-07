<script setup lang="ts">
	const { post } = defineProps<{
		post: Omit<Post, "posted_at">
	}>();

	console.log(post)
	const content: any = computed(() => JSON.parse(post.content, (key, value) => key === "date" ? Date.parse(value) : value))

	const route = useRoute();
</script>

<template>
	<div class="bg-secondary rounded-4 mb-0" style="min-height: 100px;">
		<div class="bg-secondary rounded-4 rounded-bottom-0">
			<p class="fs-5 text-center mb-0 py-2">Dolgozat</p>
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
			<div class="col-4 p-2" v-if="post.completed_at === null">
				<button 
					class="btn btn-primary h-100 w-100 text-center p-0"
					@click="navigateTo(`/course/${route.params.id}/quiz/${post.id}`)"
				>
					Kinyit
				</button>
			</div>
		</div>
	</div>
</template>
