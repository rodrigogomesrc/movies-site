<script>

    import Movie from "./Movie.svelte";
    import MoviesHeader from "./MoviesHeader.svelte";
    import { onMount } from 'svelte';
    import { getMovies } from '../services/api';

    export let user;
    let movies = [];

    onMount(async () => {
        movies = await getMovies(user);
    });

</script>

<main>
    <h1 class="title">Lista de Filmes</h1>
    <MoviesHeader />
    {#each movies as movie, index}
    <Movie movie={movie} />
    {/each}
   
</main>


<style>

  
</style>