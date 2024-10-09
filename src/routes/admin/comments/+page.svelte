<script lang="ts">
  import { onMount } from 'svelte';
  import { api } from '$lib/api';
  import { auth } from '$lib/stores/auth';
  import { goto } from '$app/navigation';

  let comments: any[] = [];
  let error = '';

  onMount(async () => {
    if (!$auth.user || !($auth.user as any).isAdmin) {
      goto('/');
      return;
    }
    await loadComments();
  });

  async function loadComments() {
    try {
      comments = await api.get('/admin/comments');
    } catch (err) {
      error = 'Failed to load comments';
    }
  }

  async function deleteComment(commentId: string) {
    try {
      await api.delete(`/admin/comments/${commentId}`);
      await loadComments();
    } catch (err) {
      error = 'Failed to delete comment';
    }
  }
</script>

<div class="container-fluid mt-5">
  <h1>Manage Comments</h1>

  <ul class="nav nav-tabs mb-3">
    <li class="nav-item">
      <button class="nav-link" on:click={() => goto('/admin')}>
        Manage Crops
      </button>
    </li>
    <li class="nav-item">
      <button class="nav-link active">
        Manage Comments
      </button>
    </li>
  </ul>

  {#if error}
    <div class="alert alert-danger">{error}</div>
  {/if}

  <table class="table">
    <thead>
      <tr>
        <th>Crop</th>
        <th>Section</th>
        <th>User</th>
        <th>Comment</th>
        <th>Actions</th>
      </tr>
    </thead>
    <tbody>
      {#each comments as comment}
        <tr>
          <td>{@html comment.cropName || 'Unknown Crop'}</td>
          <td>{comment.section || 'Unknown Section'}</td>
          <td>{comment.userName || 'Unknown User'}</td>
          <td>{comment.text}</td>
          <td>
            <button class="btn btn-danger btn-sm" on:click={() => deleteComment(comment._id)}>Delete</button>
          </td>
        </tr>
      {/each}
    </tbody>
  </table>
</div>
