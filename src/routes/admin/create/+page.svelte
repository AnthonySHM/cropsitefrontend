<script lang="ts">
  import { api } from '$lib/api';
  import { goto } from '$app/navigation';
  import MediaPopup from '$lib/components/MediaPopup.svelte';
  import AdvancedEditingPopup from '$lib/components/AdvancedEditingPopup.svelte';
  import DOMPurify from 'dompurify';

  type Section = 'overview' | 'planting' | 'care' | 'harvest' | 'economics';
  type MediaItem = { url: string; title?: string; description?: string; caption?: string };

  let crop: {
    name: string;
    image: string;
    overview: string;
    planting: string;
    care: string;
    harvest: string;
    economics: string;
    videos: Record<Section, MediaItem[]>;
    images: Record<Section, MediaItem[]>;
  } = {
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
  let sections: Section[] = ['overview', 'planting', 'care', 'harvest', 'economics'];
  let showVideoPopup = false;
  let showImagePopup = false;
  let currentSection: Section;
  let showAdvancedEditing = false;
  let currentEditingTab: string;
  let editingContent = '';

  async function createCrop() {
    try {
      await api.post('/admin/crops', crop);
      goto('/admin');
    } catch (err) {
      error = 'Failed to create crop';
      console.error(err);
    }
  }

  function addMedia(event: CustomEvent<{ type: 'video' | 'image'; data: MediaItem }>) {
    const { type, data } = event.detail;
    if (type === 'video') {
      crop.videos[currentSection] = [...crop.videos[currentSection], data];
    } else {
      crop.images[currentSection] = [...crop.images[currentSection], data];
    }
  }

  function deleteMedia(section: Section, type: 'video' | 'image', index: number) {
    if (type === 'video') {
      crop.videos[section] = crop.videos[section].filter((_, i) => i !== index);
    } else {
      crop.images[section] = crop.images[section].filter((_, i) => i !== index);
    }
  }

  function openAdvancedEditing(section: string) {
    currentEditingTab = section;
    editingContent = section === 'name' ? crop.name : crop[section as Section];
    showAdvancedEditing = true;
  }

  function sanitizeHTML(dirty: string) {
    return DOMPurify.sanitize(dirty);
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
          <div class="input-group">
            <div class="form-control" id="name">{@html crop.name}</div>
            <button 
              type="button" 
              class="btn btn-secondary" 
              on:click={() => openAdvancedEditing('name')}
            >
              Edit
            </button>
          </div>
        </div>
        {#each sections as section}
          <div class="mb-3">
            <label for={section} class="form-label">{section.charAt(0).toUpperCase() + section.slice(1)}</label>
            <div class="input-group">
              <div class="form-control" style="height: auto; min-height: 100px; overflow-y: auto;">
                <div>{@html sanitizeHTML(crop[section])}</div>
              </div>
              <button 
                type="button" 
                class="btn btn-secondary" 
                on:click={() => openAdvancedEditing(section)}
              >
                Edit
              </button>
            </div>
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
            <div class="mb-3">
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
              <button type="button" class="btn btn-secondary btn-sm" on:click={() => { currentSection = section; showVideoPopup = true; }}>Add Video</button>
            </div>
            <div class="mb-3">
              <h5>Carousel Images</h5>
              {#each crop.images[section] as image, index}
                <div class="card mb-2">
                  <div class="card-body">
                    <input type="text" class="form-control mb-2" bind:value={image.url} placeholder="Image URL">
                    <input type="text" class="form-control mb-2" bind:value={image.caption} placeholder="Image Caption">
                    <img src={image.url} alt={image.caption} class="img-thumbnail mb-2" style="max-height: 100px;">
                    <button type="button" class="btn btn-danger btn-sm" on:click={() => deleteMedia(section, 'image', index)}>Delete</button>
                  </div>
                </div>
              {/each}
              <button type="button" class="btn btn-secondary btn-sm" on:click={() => { currentSection = section; showImagePopup = true; }}>Add Carousel Image</button>
            </div>
          </div>
        {/each}
      </div>
    </div>
    <button type="submit" class="btn btn-primary mt-3">Create Crop</button>
  </form>
</div>

<MediaPopup type="video" bind:show={showVideoPopup} on:add={addMedia} />
<MediaPopup type="image" bind:show={showImagePopup} on:add={addMedia} />

<AdvancedEditingPopup
  bind:show={showAdvancedEditing}
  tabName={currentEditingTab}
  bind:content={editingContent}
  fullscreen={true}
  on:close={() => showAdvancedEditing = false}
  on:save={({ detail }) => {
    if (currentEditingTab === 'name') {
      crop.name = detail;
    } else {
      crop[currentEditingTab as Section] = detail;
    }
    showAdvancedEditing = false;
  }}
/>