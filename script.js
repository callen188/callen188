let accessToken;

function handleCredentialResponse(response) {
    const responsePayload = decodeJwtResponse(response.credential);
    $('#user-info').html(`Hello, ${responsePayload.name}`);
    accessToken = response.credential;
    displayBookshelf();
}

function decodeJwtResponse(token) {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));

    return JSON.parse(jsonPayload);
}

$(document).ready(function () {
    let currentPage = 1;
    let itemsPerPage = 10;

    google.accounts.id.initialize({
        client_id: '1013035748829-bsfjoee6sondoh1gbct8nasl0oqan2v9.apps.googleusercontent.com',
        callback: handleCredentialResponse
    });

    google.accounts.id.renderButton(
        document.getElementById('signin-btn'),
        { theme: 'outline', size: 'large' }
    );

    $('#search-btn').click(function () {
        searchBooks(1);
    });

    function searchBooks(page) {
        const query = $('#search').val();
        $.ajax({
            url: `https://www.googleapis.com/books/v1/volumes?q=${query}&startIndex=${(page - 1) * itemsPerPage}&maxResults=${itemsPerPage}`,
            dataType: 'json',
            success: function (data) {
                displayResults(data, page);
                setupPagination(data.totalItems);
            }
        });
    }

    function displayResults(data, page) {
        $('#results').empty();
        data.items.forEach(item => {
            $('#results').append(`<div class="book" data-id="${item.id}">${item.volumeInfo.title} <img src="${item.volumeInfo.imageLinks?.thumbnail}" alt="${item.volumeInfo.title}"></div>`);
        });

        $('.book').click(function () {
            const bookId = $(this).data('id');
            $.get(`https://www.googleapis.com/books/v1/volumes/${bookId}`, function (bookData) {
                displayBookDetails(bookData);
            });
        });

        $('#pagination a').removeClass('active');
        $(`#pagination a[data-page="${page}"]`).addClass('active');
    }

    function setupPagination(totalItems) {
        $('#pagination').empty();
        const totalPages = Math.ceil(totalItems / itemsPerPage);
        for (let i = 1; i <= totalPages; i++) {
            $('#pagination').append(`<a data-page="${i}">${i}</a>`);
        }

        $('#pagination a').click(function () {
            const page = $(this).data('page');
            searchBooks(page);
        });
    }

    function displayBookDetails(bookData) {
        $('#details').html(`
            <h2>${bookData.volumeInfo.title}</h2>
            <p>${bookData.volumeInfo.description}</p>
            <img src="${bookData.volumeInfo.imageLinks?.thumbnail}" alt="${bookData.volumeInfo.title}">
        `);
    }

    function displayBookshelf() {
        $.ajax({
            url: 'https://www.googleapis.com/books/v1/mylibrary/bookshelves/0/volumes',
            headers: {
                'Authorization': `Bearer ${accessToken}`
            },
            dataType: 'json',
            success: function (data) {
                data.items.forEach(item => {
                    $('#bookshelf').append(`<div class="book" data-id="${item.id}">${item.volumeInfo.title} <img src="${item.volumeInfo.imageLinks?.thumbnail}" alt="${item.volumeInfo.title}"></div>`);
                });

                $('.book').click(function () {
                    const bookId = $(this).data('id');
                    $.get(`https://www.googleapis.com/books/v1/volumes/${bookId}`, function (bookData) {
                        displayBookDetails(bookData);
                    });
                });
            }
        });
    }
});


