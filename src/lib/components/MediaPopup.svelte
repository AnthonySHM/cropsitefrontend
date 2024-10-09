<script lang="ts">
  import { createEventDispatcher } from 'svelte';

  export let type: 'video' | 'image';
  export let show = false;

  let title = '';
  let description = '';
  let url = '';
  let caption = '';

  const dispatch = createEventDispatcher();

  function handleSubmit() {
    if (type === 'video') {
      dispatch('add', { type, data: { title, description, url } });
    } else {
      dispatch('add', { type, data: { url, caption } });
    }
    resetForm();
    show = false;
  }

  function resetForm() {
    title = '';
    description = '';
    url = '';
    caption = '';
  }

  function handleClose() {
    resetForm();
    show = false;
  }
</script>

{#if show}
  <div class="modal" style="display: block;">
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">Add {type.charAt(0).toUpperCase() + type.slice(1)}</h5>
          <button type="button" class="btn-close" aria-label="Close" on:click={handleClose}></button>
        </div>
        <div class="modal-body">
          <form on:submit|preventDefault={handleSubmit}>
            {#if type === 'video'}
              <div class="mb-3">
                <label for="title" class="form-label">Title</label>
                <input type="text" class="form-control" id="title" bind:value={title} required>
              </div>
              <div class="mb-3">
                <label for="description" class="form-label">Description</label>
                <textarea class="form-control" id="description" rows="3" bind:value={description} required></textarea>
              </div>
              <div class="mb-3">
                <label for="url" class="form-label">YouTube URL</label>
                <input type="url" class="form-control" id="url" bind:value={url} required>
              </div>
            {:else}
              <div class="mb-3">
                <label for="url" class="form-label">Image URL</label>
                <input type="url" class="form-control" id="url" bind:value={url} required>
              </div>
              <div class="mb-3">
                <label for="caption" class="form-label">Caption</label>
                <input type="text" class="form-control" id="caption" bind:value={caption} required>
              </div>
            {/if}
            <button type="submit" class="btn btn-primary">Add {type}</button>
          </form>
        </div>
      </div>
    </div>
  </div>
{/if}
