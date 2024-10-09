<script lang="ts">
  import { onMount } from 'svelte';
  import HomeButton from '$lib/HomeButton.svelte';
  import { api } from '$lib/api';
  import { auth } from '$lib/stores/auth';

  interface Crop {
    _id: string;
    name: string;
    image: string;
    rating: number;
  }

  let featuredCrops: Crop[] = [];
  let siteName = "CropSite";
  let searchQuery = '';
  let minRating = '0';
  let searchSuggestions: string[] = [];

  // Add this function to sort crops
  function getSortedCrops(crops: Crop[]): Crop[] {
    return [...crops].sort((a, b) => a.name.localeCompare(b.name));
  }

  async function fetchCrops(search: string = '', rating: string = '0') {
    try {
      console.log('Fetching crops with params:', { search, rating });
      const crops = await api.get(`/crops?search=${search}&minRating=${rating}`);
      console.log('Fetched crops:', crops);
      featuredCrops = crops;
    } catch (err) {
      console.error('Error fetching crops:', err);
      featuredCrops = [];
    }
  }

  onMount(async () => {
    await fetchCrops();
  });

  function handleSearch() {
    fetchCrops(searchQuery, minRating);
  }

  function updateSearchSuggestions() {
    if (searchQuery.length > 0) {
      searchSuggestions = featuredCrops
        .filter(crop => crop.name.toLowerCase().includes(searchQuery.toLowerCase()))
        .map(crop => crop.name)
        .slice(0, 5);
    } else {
      searchSuggestions = [];
    }
  }
</script>

<div class="container-fluid bg-light min-vh-100 py-5">
  <div class="container bg-white rounded shadow p-4">
    <h1 class="display-4 mb-4 text-primary fw-bold text-center">Welcome to <span class="text-success">{siteName}</span></h1>

    {#if $auth.user && ($auth.user as any).isAdmin}
      <div class="text-end mb-3">
        <a href="/admin" class="btn btn-primary">Admin Panel</a>
      </div>
    {/if}

    <form on:submit|preventDefault={handleSearch} class="mb-4">
      <div class="row g-3">
        <div class="col-md-6 position-relative">
          <input 
            type="text" 
            class="form-control form-control-lg" 
            placeholder="Search for crops..." 
            bind:value={searchQuery}
            on:input={updateSearchSuggestions}
            list="crop-suggestions"
          >
          <datalist id="crop-suggestions">
            {#each searchSuggestions as suggestion}
              <option value={suggestion}>{suggestion}</option>
            {/each}
          </datalist>
        </div>
        <div class="col-md-4">
          <select class="form-select form-select-lg text-muted" bind:value={minRating}>
            <option value="0" selected>All Ratings</option>
            <option value="1">1+ Stars</option>
            <option value="2">2+ Stars</option>
            <option value="3">3+ Stars</option>
            <option value="4">4+ Stars</option>
          </select>
        </div>
        <div class="col-md-2">
          <button class="btn btn-primary btn-lg w-100" type="submit">Search</button>
        </div>
      </div>
    </form>

    <section class="mb-5">
      <h2 class="h3 mb-3">Featured Crops</h2>
      <div class="row row-cols-1 row-cols-md-3 g-4">
        {#each getSortedCrops(featuredCrops) as crop}
          <div class="col">
            <div class="card h-100 shadow-sm">
              <img src={crop.image} class="card-img-top" alt={crop.name} style="height: 200px; object-fit: cover;" />
              <div class="card-body d-flex flex-column">
                <div class="d-flex justify-content-between align-items-start mb-2">
                  <h3 class="card-title h5 mb-0">{crop.name}</h3>
                  <span class="badge bg-primary">{(crop.rating ?? 0).toFixed(1)}</span>
                </div>
                <div class="mt-auto">
                  <a href="/crops/{crop._id}" class="btn btn-outline-primary btn-sm w-100">Learn More</a>
                </div>
              </div>
            </div>
          </div>
        {/each}
      </div>
    </section>
  </div>
</div>