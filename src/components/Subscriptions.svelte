<script>
    import Subscription from "./Subscription.svelte";
    import Subscribe from "./Subscribe.svelte";
    import Notification from "./Notification.svelte";
    import MoviesHeader from "./MoviesNotificationHeader.svelte";

    let movie = {
        title: "The Shawshank Redemption",
        genre: "Drama",
        channel: "Netflix",
        date: "14/10/1994"
    };

</script>

<main>
    <h1 class="title">Inscrições</h1>
    <div id="sides-holder">
        <div id="left-side" class="side">
            <h2>Adicionar Inscrição</h2>
            <Subscribe />
            <h2>Subscrições</h2>
            <Subscription genre="Ação" />
            <Subscription genre="Aventura" />
            <Subscription genre="Comédia" />

        </div>
        <div id="right-side" class="side">
            <h2>Notificações</h2>
            <MoviesHeader />
            <Notification movie={movie} />
            <Notification movie={movie} />
            <Notification movie={movie} />
            
        </div>
    </div>

</main>


<style>

    #sides-holder {
        display: flex;
        justify-content: space-around;
        width: 100%;
        padding: 10px;
    }

    .side {
        width: 100%;
        padding: 15px;
    }

    #left-side {
        margin-right: 10px;
    } 

    #right-side {
        margin-left: 10px;
    }

</style>