<script>    
    import Header from "./Header.svelte";
    import Main from "./Main.svelte";

    let openedScreen = "subscriptions";

    const openMovieScreen = () => {
        openedScreen = "movies";
    };

    const openSubscriptionScreen = () => {
        openedScreen = "subscriptions";
    };

    const toggleScreen = () => {
        console.log("screen being toggled");
        if (openedScreen === "movies") {
            openSubscriptionScreen();
        } else {
            openMovieScreen();
        }
    };
    

</script>

<main>
    <Header toggleScreen={toggleScreen} />
    <Main screen={openedScreen}/>
</main>

<style>



</style>