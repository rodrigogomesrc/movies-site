let endpoint = 'http://127.0.0.1:9000';

export const getMovies = async () => {
    const response = await fetch(endpoint + '/movies');
    const data = await response.json();
    return data;
}

export const getNotifications = async () => {
    const response = await fetch(endpoint + '/notifications');
    const data = await response.json();
    return data;
}

export const removeNotification = async (id) => {
    const response = await fetch(endpoint + '/notification/' + id, {
        method: 'DELETE'
    });
    return await response.text();
}

export const subscribeToGenre = async (genre) => {
    const data = await fetch(endpoint + '/subscribe/' + genre, {
        method: 'POST'
    });
    return await data.text();
}


export const unsubscribeFromGenre = async (genre) => {
    const response = await fetch(endpoint + '/unsubscribe/' + genre, {
        method: 'GET'
    });
    return await response.text();
}

export const getSubscriptions = async () => {
    const response = await fetch(endpoint + '/subscriptions');
    const data = await response.json();
    return data;
}