<script lang="ts">
  import { auth } from '$lib/stores/auth';
  import { api } from '$lib/api';

  export let cropId: string;
  export let tab: string;

  let comments: any[] = [];
  let newComment = '';
  let error = '';

  $: loadComments(cropId, tab);

  async function loadComments(cropId: string, tab: string) {
    try {
      comments = await api.get(`/comments/${cropId}/${tab}`);
    } catch (err) {
      error = 'Failed to load comments';
    }
  }

  async function addComment() {
    if (!$auth.user) {
      error = 'You need to register or log in to comment.';
      return;
    }

    try {
      const response = await api.post('/comments', { cropId, tab, content: newComment });
      comments = [...comments, response];
      newComment = '';
    } catch (err) {
      error = 'Failed to add comment';
    }
  }
</script>

<div class="mt-4">
  <h3>Comments</h3>
  {#if error}
    <div class="alert alert-danger">{error}</div>
  {/if}
  <div class="mb-3">
    <textarea
      class="form-control"
      rows="3"
      placeholder={$auth.user ? "Add a comment..." : "Register or log in to comment"}
      bind:value={newComment}
      disabled={!$auth.user}
    ></textarea>
  </div>
  <button class="btn btn-primary mb-3" on:click={addComment} disabled={!$auth.user}>
    {$auth.user ? "Post Comment" : "Register to Comment"}
  </button>
  <div class="comment-list">
    {#each comments as comment}
      <div class="card mb-2">
        <div class="card-body">
          <h5 class="card-title">{comment.user.username}</h5>
          <p class="card-text">{comment.content}</p>
        </div>
      </div>
    {/each}
  </div>
</div>
