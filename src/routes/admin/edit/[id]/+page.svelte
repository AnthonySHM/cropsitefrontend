<script lang="ts">
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import { api } from '$lib/api';
  import { goto } from '$app/navigation';
  import MediaPopup from '$lib/components/MediaPopup.svelte';
  import AdvancedEditingPopup from '$lib/components/AdvancedEditingPopup.svelte';
  import DOMPurify from 'dompurify';

  interface Crop {
    _id: string;
    name: string;
    image: string;
    rating: number;
    overview: string;
    planting: string;
    care: string;
    harvest: string;
    economics: string;
    videos: Record<string, { url: string; title: string }[]>;
    images: Record<string, { url: string; alt: string }[]>;
  }

  let crop: Crop = {
    _id: '',
    name: '',
    image: '',
    rating: 0,
    overview: '',
    planting: '',
    care: '',
    harvest: '',
    economics: '',
    videos: { overview: [], planting: [], care: [], harvest: [], economics: [] },
    images: { overview: [], planting: [], care: [], harvest: [], economics: [] }
  };
  let loading = true;
  let error = '';
  let sections = ['overview', 'planting', 'care', 'harvest', 'economics'];
  let showVideoPopup = false;
  let showImagePopup = false;
  let currentSection = '';
  let showAdvancedEditing = false;
  let currentEditingTab = '';
  let editingContent = '';

  function sanitizeHTML(dirty: string) {
    return DOMPurify.sanitize(dirty);
  }

  onMount(async () => {
    try {
      const cropId = $page.params.id;
      crop = await api.get(`/crops/${cropId}`);
      loading = false;
    } catch (err) {
      console.error('Failed to load crop:', err);
      error = 'Failed to load crop data. Please try again.';
      loading = false;
    }
  });

  async function saveCrop() {
    try {
      console.log('Saving crop data:', crop);
      const updatedCrop = await api.put(`/admin/crops/${crop._id}`, crop);
      crop = updatedCrop;
      console.log('Updated crop data:', updatedCrop);
      goto('/admin');
    } catch (err) {
      error = 'Failed to update crop: ' + (err instanceof Error ? err.message : String(err));
      console.error('Error updating crop:', err);
    }
  }

  function addMedia(event: CustomEvent) {
    const { type, data } = event.detail;
    if (type === 'video') {
      if (!crop.videos[currentSection]) crop.videos[currentSection] = [];
      crop.videos[currentSection].push(data);
    } else if (type === 'image') {
      if (!crop.images[currentSection]) crop.images[currentSection] = [];
      crop.images[currentSection].push(data);
    }
    crop = { ...crop }; // Force Svelte to update the view
  }

  function deleteMedia(section: string, type: 'video' | 'image', index: number) {
    if (type === 'video') {
      crop.videos[section].splice(index, 1);
    } else {
      crop.images[section].splice(index, 1);
    }
    crop = { ...crop }; // Force Svelte to update the view
  }

  function addCarouselImage(section: string) {
    if (!crop.images[section]) crop.images[section] = [];
    crop.images[section].push({ url: '', alt: '' });
  }

  function deleteCarouselImage(section: string, index: number) {
    if (crop.images[section]) {
      crop.images[section].splice(index, 1);
    }
  }

  function openAdvancedEditing(section: string) {
    if (crop && (section in crop || section === 'name')) {
      currentEditingTab = section;
      editingContent = section === 'name' ? crop.name : (crop[section as keyof typeof crop] as string) || '';
      showAdvancedEditing = true;
    } else {
      console.error(`Cannot edit ${section}: crop or section is undefined`);
      // Optionally, show an error message to the user
    }
  }

  function saveAdvancedEditing(editedContent: string) {
    if (currentEditingTab) {
      if (currentEditingTab === 'name') {
        crop.name = editedContent;
      } else {
        (crop[currentEditingTab as keyof typeof crop] as string) = editedContent;
      }
      crop = { ...crop }; // Force Svelte to update the view
    }
    showAdvancedEditing = false;
  }
</script>

<div class="container-fluid mt-5">
  <h1>Edit Crop: {@html crop?.name}</h1>
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
          <div class="mb-3">
            <label for="rating" class="form-label">Rating</label>
            <input type="number" class="form-control" id="rating" bind:value={crop.rating} min="0" max="5" step="0.1">
          </div>
          {#each sections as section}
            <div class="mb-3">
              <label for={section} class="form-label">{section.charAt(0).toUpperCase() + section.slice(1)}</label>
              <div class="input-group">
                <div class="form-control" style="height: auto; min-height: 100px; overflow-y: auto;">
                  <div>{@html sanitizeHTML(crop[section as keyof typeof crop] as string)}</div>
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
            <input type="text" class="form-control" id="image" bind:value={crop.image}>
          </div>
          {#each sections as section}
            <div class="mb-4">
              <h4>{section.charAt(0).toUpperCase() + section.slice(1)} Media</h4>
              <div class="mb-3">
                <h5>Videos</h5>
                {#if crop.videos[section]}
                  {#each crop.videos[section] as video, index}
                    <div class="card mb-2">
                      <div class="card-body">
                        <h6>{video.title}</h6>
                        <a href={video.url} target="_blank" rel="noopener noreferrer">{video.url}</a>
                        <button type="button" class="btn btn-danger btn-sm mt-2" on:click={() => deleteMedia(section, 'video', index)}>Delete</button>
                      </div>
                    </div>
                  {/each}
                {/if}
                <button type="button" class="btn btn-secondary btn-sm" on:click={() => { currentSection = section; showVideoPopup = true; }}>Add Video</button>
              </div>
              <div class="mb-3">
                <h5>Carousel Images</h5>
                {#if crop.images[section]}
                  {#each crop.images[section] as image, index}
                    <div class="card mb-2">
                      <div class="card-body">
                        <input type="text" class="form-control mb-2" bind:value={image.url} placeholder="Image URL">
                        <input type="text" class="form-control mb-2" bind:value={image.alt} placeholder="Image Alt Text">
                        <img src={image.url} alt={image.alt} class="img-thumbnail mb-2" style="max-height: 100px;">
                        <button type="button" class="btn btn-danger btn-sm" on:click={() => deleteCarouselImage(section, index)}>Delete</button>
                      </div>
                    </div>
                  {/each}
                {/if}
                <button type="button" class="btn btn-secondary btn-sm" on:click={() => { currentSection = section; showImagePopup = true; }}>Add Carousel Image</button>
              </div>
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

<AdvancedEditingPopup
  bind:show={showAdvancedEditing}
  tabName={currentEditingTab}
  bind:content={editingContent}
  fullscreen={true}
  on:close={() => showAdvancedEditing = false}
  on:save={({ detail }) => {
    if (currentEditingTab === 'name') {
      crop.name = detail.content;
    } else if (currentEditingTab === 'description' || currentEditingTab === 'history') {
      (crop as any)[currentEditingTab] = sanitizeHTML(detail.content);
    } else {
      // Handle other properties if needed
      (crop as any)[currentEditingTab] = detail.content;
    }
    showAdvancedEditing = false;
  }}
/>
