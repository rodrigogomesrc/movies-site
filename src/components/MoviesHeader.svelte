<script>


</script>

<main>
    <div class="movies-header">
        <div class="movies-header-description">
            <div class="movie-title">Título</div>
            <div class="movie-genre">Gênero</div>
            <div class="movie-channel">Canal</div>
            <div class="movie-date">Exibição</div>
        </div>
    </div>
</main>

<style>

    .movies-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 10px;
        border-bottom: 1px solid #ccc;
        border-top: 1px solid #ccc;
        padding-top: 20px;
        font-weight: bold;
    }

    .movies-header-description {
        display: flex;
        justify-content: space-between;
        align-items: center;
        width: 100%;
        padding: 5px;
        padding-right: 15px;
    }

    .movie-title {
        flex: 5;
    }

    .movie-genre {
        flex: 2;
    }

    .movie-channel {
        flex: 2;
    }

    .movie-date {
        flex: 2;
        text-align: right;
    }

</style>