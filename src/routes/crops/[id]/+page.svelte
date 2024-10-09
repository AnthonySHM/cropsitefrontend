<script lang="ts">
  import { page } from '$app/stores';
  import { onMount } from 'svelte';
  import { browser } from '$app/environment';
  import { api } from '$lib/api';
  import Comment from '$lib/Comment.svelte';
  import { auth } from '$lib/stores/auth';

  let crop: any = null;
  let error: string | null = null;
  let activeTab = 'overview';
  let carousels: { [key: string]: any } = {};
  let bootstrapLoaded = false;
  let bootstrap: any;

  onMount(async () => {
    const cropId = $page.params.id;
    try {
      crop = await api.get(`/crops/${cropId}`);
      console.log('Fetched crop data:', crop);
      console.log('Videos:', {
        overviewVideos: crop.overviewVideos,
        plantingVideos: crop.plantingVideos,
        careVideos: crop.careVideos,
        harvestVideos: crop.harvestVideos,
        economicsVideos: crop.economicsVideos
      });
      if (browser) {
        bootstrap = await import('bootstrap');
        bootstrapLoaded = true;
        initCarousels();
      }
    } catch (err) {
      console.error('Error fetching crop details:', err);
      error = 'Failed to load crop details. Please try again later.';
    }
  });

  function setActiveTab(tab: string) {
    activeTab = tab;
    setTimeout(() => {
      if (carousels[tab]) {
        carousels[tab].dispose();
      }
      initCarousel(tab);
    }, 0);
  }

  function initCarousels() {
    if (typeof document !== 'undefined') {
      ['overview', 'planting', 'care', 'harvest', 'economics'].forEach(initCarousel);
    }
  }

  function initCarousel(tab: string) {
    const carouselEl = document.querySelector(`#${tab}Carousel`);
    if (carouselEl && bootstrap) {
      carousels[tab] = new bootstrap.Carousel(carouselEl, {
        interval: 5000,
        wrap: true
      });
    }
  }

  interface Video {
    title: string;
    url: string;
    description?: string;
  }

  function getYoutubeId(url: string | undefined): string | null {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  }

  $: youtubeId = crop && activeTab && crop[activeTab + 'Videos'] && crop[activeTab + 'Videos'][0] ? getYoutubeId(crop[activeTab + 'Videos'][0].url) : null;
</script>

{#if crop && bootstrapLoaded}
  <div class="container mt-5 pt-4">
    {#if crop}
      <h1 class="mb-4">{crop.name}</h1>
      <div class="row">
        <div class="col-md-8">
          <ul class="nav nav-tabs mb-3">
            <li class="nav-item">
              <button class="nav-link" class:active={activeTab === 'overview'} on:click={() => setActiveTab('overview')}>Overview</button>
            </li>
            <li class="nav-item">
              <button class="nav-link" class:active={activeTab === 'planting'} on:click={() => setActiveTab('planting')}>Planting</button>
            </li>
            <li class="nav-item">
              <button class="nav-link" class:active={activeTab === 'care'} on:click={() => setActiveTab('care')}>Care</button>
            </li>
            <li class="nav-item">
              <button class="nav-link" class:active={activeTab === 'harvest'} on:click={() => setActiveTab('harvest')}>Harvest</button>
            </li>
            <li class="nav-item">
              <button class="nav-link" class:active={activeTab === 'economics'} on:click={() => setActiveTab('economics')}>Economics</button>
            </li>
          </ul>

          <div class="tab-content">
            {#each ['overview', 'planting', 'care', 'harvest', 'economics'] as tab}
              <div class="tab-pane fade" class:show={activeTab === tab} class:active={activeTab === tab}>
                <div id="{tab}Carousel" class="carousel slide mb-4" data-bs-ride="carousel">
                  <div class="carousel-inner">
                    {#if crop[tab + 'Images'] && crop[tab + 'Images'].length > 0}
                      {#each crop[tab + 'Images'] as image, index}
                        <div class="carousel-item" class:active={index === 0}>
                          <img src={image.url} class="d-block w-100" alt={image.caption} style="max-height: 400px; object-fit: cover;">
                          <div class="carousel-caption d-none d-md-block">
                            <p>{image.caption}</p>
                          </div>
                        </div>
                      {/each}
                    {:else}
                      <div class="carousel-item active">
                        <img src={crop.image} class="d-block w-100" alt={crop.name} style="max-height: 400px; object-fit: cover;">
                      </div>
                    {/if}
                  </div>
                  <button class="carousel-control-prev" type="button" data-bs-target="#{tab}Carousel" data-bs-slide="prev">
                    <span class="carousel-control-prev-icon" aria-hidden="true"></span>
                    <span class="visually-hidden">Previous</span>
                  </button>
                  <button class="carousel-control-next" type="button" data-bs-target="#{tab}Carousel" data-bs-slide="next">
                    <span class="carousel-control-next-icon" aria-hidden="true"></span>
                    <span class="visually-hidden">Next</span>
                  </button>
                </div>
                <p>{crop[tab]}</p>
              </div>
            {/each}
          </div>
        </div>
        <div class="col-md-4">
          <div class="mt-4">
            <h3>Video</h3>
            {#if crop[activeTab + 'Videos'] && crop[activeTab + 'Videos'].length > 0 && youtubeId}
              <div class="ratio ratio-16x9">
                <iframe
                  src="https://www.youtube.com/embed/{youtubeId}"
                  title="YouTube video player"
                  frameborder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowfullscreen
                ></iframe>
              </div>
              <h4>{crop[activeTab + 'Videos'][0].title}</h4>
              {#if crop[activeTab + 'Videos'][0].description}
                <p>{crop[activeTab + 'Videos'][0].description}</p>
              {/if}
            {:else}
              <p>No videos available for this section.</p>
            {/if}
          </div>
        </div>
      </div>
      <Comment cropId={crop._id} tab={activeTab} />
    {:else}
      <div class="alert alert-info">Loading crop details...</div>
    {/if}
  </div>
{:else if error}
  <div class="alert alert-danger">{error}</div>
{:else}
  <div class="alert alert-info">Loading crop details...</div>
{/if}