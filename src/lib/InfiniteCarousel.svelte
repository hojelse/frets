<script lang="ts">
  import { onMount } from 'svelte';

  let boxElement: HTMLDivElement | null = null;
  let replacedRight = false;
  let replacedLeft = false;

  function initCarousel() {
    if (!boxElement) return;

    boxElement.scrollLeft = boxElement.clientWidth;
  }

  function handleScroll() {
    if (!boxElement) return;

    const carouselWidth = boxElement.clientWidth;
    const fraction = boxElement.scrollLeft / carouselWidth;

    if (fraction >= 2.5 && !replacedRight) {
      const firstItem = boxElement.querySelector('.carousel-item');
      if (firstItem) {
        boxElement.appendChild(firstItem);
      }

      boxElement.scrollLeft -= carouselWidth;
      replacedRight = true;
    }

    if (fraction < 2.5) replacedRight = false;

    if (fraction <= 0.5 && !replacedLeft) {
      const allItems = boxElement.querySelectorAll('.carousel-item');
      const lastItem = allItems[allItems.length - 1];
      if (lastItem) {
        boxElement.prepend(lastItem);
      }

      boxElement.scrollLeft += carouselWidth;
      replacedLeft = true;
    }

    if (fraction > 0.5) replacedLeft = false;
  }

  onMount(() => {
    if (!boxElement) return;
    
    initCarousel();
    boxElement.addEventListener('scroll', handleScroll);

    return () => {
      if (boxElement) {
        boxElement.removeEventListener('scroll', handleScroll);
      }
    };
  });
</script>

<div id="carousel" bind:this={boxElement}>
  {#each [0, 1, 2, 3] as copyIndex}
    <div class="carousel-item" data-copy={copyIndex}>
      <slot />
    </div>
  {/each}
</div>

<style>
  :global(html), :global(body) {
    margin: 0;
    padding: 0;
  }

  #carousel {
    /* background-color: grey; */
    width: 100vw;
    display: grid;
    grid-auto-flow: column;
    grid-auto-columns: 100vw;
    overflow-x: scroll;
    scrollbar-width: none; /* Firefox */
  }

  #carousel :global(::-webkit-scrollbar) {
    display: none; /* Chrome, Safari, Opera */
  }

  .carousel-item {
    width: 100vw;
  }
</style>
