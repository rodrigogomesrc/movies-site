let api = 'https://jsonplaceholder.typicode.com/todos/1';


//create arrow function to return data from api
export const getData = () => {
    return fetch(api)
        .then(response => response.json())
        .then(data => {
            return data;
        })
}
