<script lang="ts">
  import { onMount } from 'svelte';
  import { api } from '$lib/api';

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

  function getSortedCrops(crops: Crop[]): Crop[] {
    return [...crops].sort((a, b) => a.name.localeCompare(b.name));
  }

  async function fetchCrops(search: string = '', rating: string = '0') {
    try {
      console.log('Fetching crops with params:', { search, rating });
      const crops = await api.get(`api/crops?search=${encodeURIComponent(search)}&minRating=${rating}`);
      console.log('Fetched crops:', crops);
      console.log('Crops length:', crops.length);
      featuredCrops = [...crops]; // Create a new array to force re-render
      console.log('featuredCrops after assignment:', featuredCrops);
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

  function handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      handleSearch();
    }
  }

  $: {
    if (searchQuery.length > 0) {
      searchSuggestions = featuredCrops
        .filter(crop => crop.name.toLowerCase().includes(searchQuery.toLowerCase()))
        .map(crop => crop.name);
    } else {
      searchSuggestions = [];
    }
  }

  function selectSuggestion(suggestion: string) {
    searchQuery = suggestion;
    searchSuggestions = [];
    handleSearch();
  }

  function handleSuggestionKeydown(event: KeyboardEvent, suggestion: string) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      selectSuggestion(suggestion);
    }
  }
</script>

<svelte:head>
  <title>{siteName}</title>
</svelte:head>

<div class="container mt-5">
  <h1 class="text-center mb-4">{siteName}</h1>

  <div class="row justify-content-center mb-4">
    <div class="col-md-6">
      <div class="input-group">
        <input
          type="text"
          class="form-control"
          placeholder="Search crops..."
          bind:value={searchQuery}
          on:keydown={handleKeydown}
        >
        <select class="form-select" style="max-width: 200px;" bind:value={minRating}>
          <option value="0">All Ratings</option>
          <option value="1">1+ Stars</option>
          <option value="2">2+ Stars</option>
          <option value="3">3+ Stars</option>
          <option value="4">4+ Stars</option>
          <option value="5">5 Stars</option>
        </select>
        <button class="btn btn-primary" on:click={handleSearch}>Search</button>
      </div>
      {#if searchSuggestions.length > 0}
        <ul class="list-group mt-2">
          {#each searchSuggestions as suggestion}
            <li class="list-group-item">
              <button 
                type="button" 
                class="btn btn-link p-0 text-start w-100"
                on:click={() => selectSuggestion(suggestion)}
                on:keydown={(event) => handleSuggestionKeydown(event, suggestion)}
              >
                {suggestion}
              </button>
            </li>
          {/each}
        </ul>
      {/if}
    </div>
  </div>

  <div class="row">
    {#each getSortedCrops(featuredCrops) as crop (crop._id)}
      <div class="col-md-4 mb-4">
        <div class="card h-100">
          <img src={crop.image} class="card-img-top" alt={crop.name} style="height: 200px; object-fit: cover;">
          <div class="card-body">
            <h5 class="card-title">{@html crop.name}</h5>
            <p class="card-text">Rating: {crop.rating} / 5</p>
            <a href="/crops/{crop._id}" class="btn btn-primary">Learn More</a>
          </div>
        </div>
      </div>
    {/each}
  </div>
</div>
