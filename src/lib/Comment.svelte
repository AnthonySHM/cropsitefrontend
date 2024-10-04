<script lang="ts">
  import { auth } from '$lib/stores/auth';
  import { api } from '$lib/api';

  export let cropId: string;
  export let tab: string;

  let comments: Array<{ user: { username: string }, content: string }> = [];
  let newComment = '';
  let error = '';

  async function loadComments() {
    try {
      comments = await api.getComments(cropId, tab);
    } catch (err) {
      console.error('Error loading comments:', err);
      error = 'Failed to load comments. Please try again later.';
    }
  }

  async function addComment() {
    if (newComment.trim()) {
      try {
        await api.addComment(cropId, tab, newComment);
        newComment = '';
        await loadComments();
        error = '';
      } catch (err) {
        console.error('Error adding comment:', err);
        error = 'Failed to add comment. Please try again later.';
      }
    }
  }

  $: if (cropId && tab) {
    loadComments();
  }
</script>

<div class="comments-section mt-4">
  <h4>Comments</h4>
  {#if error}
    <div class="alert alert-danger">{error}</div>
  {/if}
  {#if $auth.user}
    <form on:submit|preventDefault={addComment} class="mb-3">
      <div class="input-group">
        <input type="text" class="form-control" placeholder="Add a comment..." bind:value={newComment}>
        <button type="submit" class="btn btn-primary">Post</button>
      </div>
    </form>
  {:else}
    <p>Please <a href="/login">login</a> or <a href="/register">register</a> to add comments.</p>
  {/if}
  
  <div class="comments-list">
    {#each comments as comment}
      <div class="comment mb-2">
        <strong>{comment.user.username}</strong>: {comment.content}
      </div>
    {/each}
  </div>
</div>
