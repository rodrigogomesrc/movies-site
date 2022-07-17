<script>

    import Movie from "./Movie.svelte";
    import MoviesHeader from "./MoviesHeader.svelte";

    let movie = {
        title: "The Shawshank Redemption",
        genre: "Drama",
        channel: "Netflix",
        date: "14/10/1994"
    };

</script>

<main>
    <h1 class="title">Lista de Filmes</h1>
    <MoviesHeader />
    <Movie movie={movie} />
    <Movie movie={movie} />
    <Movie movie={movie} />
    <Movie movie={movie} />
    <Movie movie={movie} />
    <Movie movie={movie} />
</main>


<style>

  
</style>