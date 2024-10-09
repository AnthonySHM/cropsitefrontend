<script lang="ts">
  import { api } from '$lib/api';
  import { goto } from '$app/navigation';
  import MediaPopup from '$lib/components/MediaPopup.svelte';

  interface Video {
    title: string;
    description: string;
    url: string;
  }

  interface Image {
    url: string;
    caption: string;
  }

  interface Crop {
    name: string;
    image: string;
    overview: string;
    planting: string;
    care: string;
    harvest: string;
    economics: string;
    videos: { [key: string]: Video[] };
    images: { [key: string]: Image[] };
  }

  let crop: Crop = {
    name: '',
    image: '',
    overview: '',
    planting: '',
    care: '',
    harvest: '',
    economics: '',
    videos: { overview: [], planting: [], care: [], harvest: [], economics: [] },
    images: { overview: [], planting: [], care: [], harvest: [], economics: [] }
  };

  let error = '';
  let sections = ['overview', 'planting', 'care', 'harvest', 'economics'];
  let showVideoPopup = false;
  let showImagePopup = false;
  let currentSection = '';

  async function createCrop() {
    try {
      await api.post('/admin/crops', crop);
      goto('/admin');
    } catch (err) {
      error = 'Failed to create crop';
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
</script>

<div class="container-fluid mt-5">
  <h1>Create New Crop</h1>
  {#if error}
    <div class="alert alert-danger">{error}</div>
  {/if}

  <form on:submit|preventDefault={createCrop}>
    <div class="row">
      <div class="col-md-6">
        <h2>Text Content</h2>
        <div class="mb-3">
          <label for="name" class="form-label">Name</label>
          <input type="text" class="form-control" id="name" bind:value={crop.name} required>
        </div>
        {#each sections as section}
          <div class="mb-3">
            <label for={section} class="form-label">{section.charAt(0).toUpperCase() + section.slice(1)}</label>
            <textarea class="form-control" id={section} rows="5" bind:value={crop[section as keyof Crop]} required></textarea>
          </div>
        {/each}
      </div>
      <div class="col-md-6">
        <h2>Media</h2>
        <div class="mb-3">
          <label for="image" class="form-label">Main Image URL</label>
          <input type="text" class="form-control" id="image" bind:value={crop.image} required>
        </div>
        {#each sections as section}
          <div class="mb-4">
            <h4>{section.charAt(0).toUpperCase() + section.slice(1)} Media</h4>
            <div class="mb-2">
              <h5>Videos</h5>
              {#each crop.videos[section] as video}
                <div class="card mb-2">
                  <div class="card-body">
                    <h6>{video.title}</h6>
                    <p>{video.description}</p>
                    <a href={video.url} target="_blank" rel="noopener noreferrer">{video.url}</a>
                  </div>
                </div>
              {/each}
            </div>
            <div class="mb-2">
              <h5>Images</h5>
              {#each crop.images[section] as image}
                <div class="card mb-2">
                  <div class="card-body">
                    <img src={image.url} alt={image.caption} class="img-fluid mb-2">
                    <p>{image.caption}</p>
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
    <button type="submit" class="btn btn-primary mt-3">Create Crop</button>
  </form>
</div>

<MediaPopup type="video" bind:show={showVideoPopup} on:add={addMedia} />
<MediaPopup type="image" bind:show={showImagePopup} on:add={addMedia} />