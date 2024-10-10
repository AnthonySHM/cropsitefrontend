<script lang="ts">
  import { onMount } from 'svelte';
  import { api } from '$lib/api';
  import { auth } from '$lib/stores/auth';
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';

  let activeTab = 'crops';

  let crops: any[] = [];
  let editingCrop: any = null;
  let error = '';
  let newCrop = { name: '', image: '', overview: '', planting: '', care: '', harvest: '', economics: '', videos: {}, images: {} };
  let searchQuery = '';
  let filteredCrops: any[] = [];

  let users: any[] = [];

  $: {
    if (searchQuery) {
      filteredCrops = crops.filter(crop => 
        crop.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    } else {
      filteredCrops = crops;
    }
  }

  $: {
    const tabParam = $page.url.searchParams.get('tab');
    if (tabParam && ['crops', 'users'].includes(tabParam)) {
      activeTab = tabParam;
    }
  }

  onMount(async () => {
    if (!$auth.user || !($auth.user as any).isAdmin) {
      goto('/');
      return;
    }
    await loadCrops();
    await loadUsers();
  });

  async function loadCrops() {
    try {
      crops = await api.get('/admin/crops');
    } catch (err) {
      error = 'Failed to load crops';
    }
  }

  async function loadUsers() {
    try {
      users = await api.get('/admin/users');
    } catch (err) {
      error = 'Failed to load users';
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
      console.log('Creating crop data:', newCrop);
      const cropData = {
        name: newCrop.name,
        image: newCrop.image || '',
        overview: newCrop.overview,
        planting: newCrop.planting,
        care: newCrop.care,
        harvest: newCrop.harvest,
        economics: newCrop.economics,
        videos: newCrop.videos || {},
        images: newCrop.images || {}
      };
      const createdCrop = await api.post('/admin/crops', cropData);
      console.log('Created crop data:', createdCrop);
      await loadCrops();
      goto('/admin');
    } catch (err) {
      error = 'Failed to create crop: ' + (err instanceof Error ? err.message : String(err));
      console.error('Error creating crop:', err);
    }
  }

  async function saveCrop() {
    try {
      console.log('Saving crop data:', editingCrop);
      const response = await api.put(`/admin/crops/${editingCrop._id}`, editingCrop);
      if (response.ok) {
        const updatedCrop = await response.json();
        editingCrop = updatedCrop;
        console.log('Updated crop data:', updatedCrop);
        await loadCrops();
        goto('/admin');
      } else {
        const errorText = await response.text();
        throw new Error(`Failed to update crop: ${response.status} ${response.statusText}\n${errorText}`);
      }
    } catch (err: unknown) {
      error = 'Failed to update crop: ' + (err instanceof Error ? err.message : String(err));
      console.error('Error updating crop:', err);
    }
  }

  function setActiveTab(tab: string) {
    activeTab = tab;
    if (tab === 'comments') {
      goto('/admin/comments');
    } else if (tab === 'users' || tab === 'crops') {
      goto('/admin?tab=' + tab);
    }
  }

  async function deleteUser(userId: string) {
    if (confirm('Are you sure you want to delete this user?')) {
      try {
        await api.delete(`/admin/users/${userId}`);
        await loadUsers();
      } catch (err) {
        error = 'Failed to delete user';
      }
    }
  }
</script>

<div class="container-fluid mt-5">
  <h1>Admin Dashboard</h1>

  <ul class="nav nav-tabs mb-3">
    <li class="nav-item">
      <button class="nav-link" class:active={activeTab === 'crops'} on:click={() => setActiveTab('crops')}>
        Manage Crops
      </button>
    </li>
    <li class="nav-item">
      <button class="nav-link" class:active={activeTab === 'comments'} on:click={() => setActiveTab('comments')}>
        Manage Comments
      </button>
    </li>
    <li class="nav-item">
      <button class="nav-link" class:active={activeTab === 'users'} on:click={() => setActiveTab('users')}>
        Manage Users
      </button>
    </li>
  </ul>

  {#if activeTab === 'crops'}
    <div class="container mt-5">
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
            <th>Rating</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {#each filteredCrops as crop}
            <tr>
              <td>{@html crop.name}</td>
              <td>{crop.rating || 'N/A'}</td>
              <td>
                <button class="btn btn-primary btn-sm me-2" on:click={() => editCrop(crop)}>Edit</button>
                <button class="btn btn-danger btn-sm" on:click={() => deleteCrop(crop._id)}>Delete</button>
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  {/if}

  {#if activeTab === 'users'}
    <div class="container mt-5">
      <h2>Manage Users</h2>
      <table class="table">
        <thead>
          <tr>
            <th>Username</th>
            <th>Email</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {#each users as user}
            <tr>
              <td>{user.username}</td>
              <td>{user.email}</td>
              <td>
                <button class="btn btn-danger btn-sm" on:click={() => deleteUser(user._id)}>Delete</button>
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  {/if}
</div>