<script>

    export let removeNotification;
    export let movie;

</script>

<main>
    <div class="notification">
        <div class="movie-notification">
            <div class="movie-title"><strong>{movie.title}</strong></div>
            <div class="movie-genre">{movie.genre}</div>
            <div class="movie-channel">{movie.channel}</div>
            <div class="movie-date">{movie.date}</div>
        </div>
        <div class="notification-close">
            <button on:click={() => removeNotification()}>
                Remover
            </button>
        </div>

    </div>
</main>

<style>

    .notification {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 10px;
        border-bottom: 1px solid #ccc;
    }

    .movie-notification {
        display: flex;
        justify-content: space-between;
        align-items: center;
        width: 100%;
        padding: 5px;
        padding-right: 15px;
    }

    .movie-date {
        font-size: 0.8em;
        flex: 2;
        text-align: right;
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

</style>