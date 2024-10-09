<script lang="ts">
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import { api } from '$lib/api';
  import { goto } from '$app/navigation';
  import MediaPopup from '$lib/components/MediaPopup.svelte';

  let crop: any = null;
  let error = '';
  let sections = ['overview', 'planting', 'care', 'harvest', 'economics'];
  let showVideoPopup = false;
  let showImagePopup = false;
  let currentSection = '';

  onMount(async () => {
    const cropId = $page.params.id;
    try {
      crop = await api.get(`/admin/crops/${cropId}`);
      // Initialize videos and images if they don't exist
      sections.forEach(section => {
        if (!crop.videos) crop.videos = {};
        if (!crop.images) crop.images = {};
        if (!crop.videos[section]) crop.videos[section] = [];
        if (!crop.images[section]) crop.images[section] = [];
      });
    } catch (err) {
      error = 'Failed to load crop';
    }
  });

  async function saveCrop() {
    try {
      const updatedCrop = await api.put(`/admin/crops/${crop._id}`, crop);
      crop = updatedCrop;
      goto('/admin');
    } catch (err) {
      error = 'Failed to update crop';
      console.error(err);
    }
  }

  function addMedia(event: CustomEvent) {
    const { type, data } = event.detail;
    if (type === 'video') {
      crop.videos[currentSection].push(data);
    } else {
      crop.images[currentSection].push(data);
    }
  }

  function deleteMedia(section: string, type: 'video' | 'image', index: number) {
    if (type === 'video') {
      crop.videos[section].splice(index, 1);
    } else {
      crop.images[section].splice(index, 1);
    }
  }
</script>

<div class="container-fluid mt-5">
  <h1>Edit Crop: {crop?.name}</h1>
  {#if error}
    <div class="alert alert-danger">{error}</div>
  {/if}

  {#if crop}
    <form on:submit|preventDefault={saveCrop}>
      <div class="row">
        <div class="col-md-6">
          <h2>Text Content</h2>
          <div class="mb-3">
            <label for="name" class="form-label">Name</label>
            <input type="text" class="form-control" id="name" bind:value={crop.name}>
          </div>
          {#each sections as section}
            <div class="mb-3">
              <label for={section} class="form-label">{section.charAt(0).toUpperCase() + section.slice(1)}</label>
              <textarea class="form-control" id={section} rows="5" bind:value={crop[section]}></textarea>
            </div>
          {/each}
        </div>
        <div class="col-md-6">
          <h2>Media</h2>
          <div class="mb-3">
            <label for="image" class="form-label">Main Image URL</label>
            <input type="text" class="form-control" id="image" bind:value={crop.image}>
          </div>
          {#each sections as section}
            <div class="mb-4">
              <h4>{section.charAt(0).toUpperCase() + section.slice(1)} Media</h4>
              <div class="mb-2">
                <h5>Videos</h5>
                {#each crop.videos[section] as video, index}
                  <div class="card mb-2">
                    <div class="card-body">
                      <h6>{video.title}</h6>
                      <p>{video.description}</p>
                      <a href={video.url} target="_blank" rel="noopener noreferrer">{video.url}</a>
                      <button type="button" class="btn btn-danger btn-sm mt-2" on:click={() => deleteMedia(section, 'video', index)}>Delete</button>
                    </div>
                  </div>
                {/each}
              </div>
              <div class="mb-2">
                <h5>Images</h5>
                {#each crop.images[section] as image, index}
                  <div class="card mb-2">
                    <div class="card-body">
                      <img src={image.url} alt={image.caption} class="img-fluid mb-2">
                      <p>{image.caption}</p>
                      <button type="button" class="btn btn-danger btn-sm" on:click={() => deleteMedia(section, 'image', index)}>Delete</button>
                    </div>
                  </div>
                {/each}
              </div>
              <button type="button" class="btn btn-secondary me-2" on:click={() => { currentSection = section; showVideoPopup = true; }}>Add Video</button>
              <button type="button" class="btn btn-secondary" on:click={() => { currentSection = section; showImagePopup = true; }}>Add Image</button>
            </div>
          {/each}
        </div>
      </div>
      <button type="submit" class="btn btn-primary mt-3">Save Changes</button>
    </form>
  {:else}
    <p>Loading...</p>
  {/if}
</div>

<MediaPopup type="video" bind:show={showVideoPopup} on:add={addMedia} />
<MediaPopup type="image" bind:show={showImagePopup} on:add={addMedia} />