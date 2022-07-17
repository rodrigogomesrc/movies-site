<script>
    import Subscription from "./Subscription.svelte";
    import Subscribe from "./Subscribe.svelte";
    import Notification from "./Notification.svelte";
    import MoviesHeader from "./MoviesHeader.svelte";

    import { onMount } from 'svelte';
    import { getNotifications, 
        removeNotification, 
        subscribeToGenre, 
        unsubscribeFromGenre, 
        getSubscriptions } from '../services/api';

    let notifications = [];
    let subscriptions = [];

    onMount(async () => {
        notifications = await getNotifications();
        subscriptions = await getSubscriptions();
    });

    const delNotification = async (id) => {
        let response = await removeNotification(id);
        notifications = await getNotifications();
       
    };

    const delSubscription = async (id) => {
        let response = await unsubscribeFromGenre(id);
        subscriptions = await getSubscriptions();
    };

    const subscribe = async (genre) => {
        let response = await subscribeToGenre(genre);
        subscriptions = await getSubscriptions();
    };

</script>

<main>
    <h1 class="title">Inscrições</h1>
    <div id="sides-holder">
        <div id="left-side" class="side">
            <h2>Adicionar Inscrição</h2>
            <Subscribe subscribe={subscribe}/>
            <h2>Subscrições</h2>
            {#each subscriptions as genre, index}
            <Subscription genre={genre} unsubscribe={delSubscription} />
            {/each}

        </div>
        <div id="right-side" class="side">
            <h2>Notificações</h2>
            <MoviesHeader />
            {#each notifications as notification, index}
            <Notification movie={notification} delNotification={delNotification}/>
            {/each}
            
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