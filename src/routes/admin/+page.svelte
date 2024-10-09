<script lang="ts">
  import { onMount } from 'svelte';
  import { api } from '$lib/api';
  import { auth } from '$lib/stores/auth';
  import { goto } from '$app/navigation';

  let crops: any[] = [];
  let editingCrop: any = null;
  let error = '';
  let newCrop = { name: '', overview: '', planting: '', care: '', harvest: '', economics: '' };
  let searchQuery = '';
  let filteredCrops: any[] = [];

  $: {
    if (searchQuery) {
      filteredCrops = crops.filter(crop => 
        crop.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    } else {
      filteredCrops = crops;
    }
  }

  onMount(async () => {
    if (!$auth.user || !($auth.user as any).isAdmin) {
      goto('/');
      return;
    }
    await loadCrops();
  });

  async function loadCrops() {
    try {
      crops = await api.get('/admin/crops');
    } catch (err) {
      error = 'Failed to load crops';
    }
  }

  function editCrop(crop: any) {
    editingCrop = { ...crop };
    goto('/admin/edit/' + crop._id);
  }

  async function deleteCrop(cropId: string) {
    if (confirm('Are you sure you want to delete this crop?')) {
      try {
        await api.delete(`/admin/crops/${cropId}`);
        await loadCrops();
      } catch (err) {
        error = 'Failed to delete crop';
      }
    }
  }

  async function createCrop() {
    try {
      await api.post('/admin/crops', newCrop);
      newCrop = { name: '', overview: '', planting: '', care: '', harvest: '', economics: '' };
      await loadCrops();
    } catch (err) {
      error = 'Failed to create crop';
    }
  }
</script>

<div class="container mt-5">
  <h1>Admin - Manage Crops</h1>
  {#if error}
    <div class="alert alert-danger">{error}</div>
  {/if}

  <h2>Create New Crop</h2>
  <a href="/admin/create" class="btn btn-success">Create New Crop</a>

  <h2 class="mt-4">Existing Crops</h2>
  <div class="mb-3">
    <input
      type="text"
      class="form-control"
      placeholder="Search crops..."
      bind:value={searchQuery}
    />
  </div>

  <table class="table">
    <thead>
      <tr>
        <th>Name</th>
        <th>Actions</th>
      </tr>
    </thead>
    <tbody>
      {#each filteredCrops as crop}
        <tr>
          <td>{crop.name}</td>
          <td>
            <button class="btn btn-primary btn-sm me-2" on:click={() => editCrop(crop)}>Edit</button>
            <button class="btn btn-danger btn-sm" on:click={() => deleteCrop(crop._id)}>Delete</button>
          </td>
        </tr>
      {/each}
    </tbody>
  </table>
</div>