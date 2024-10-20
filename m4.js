$(document).ready(function() {
    let currentPage = 1;
    let itemsPerPage = 10;
    let searchHistory = [];

    // Google Sign-In Initialization
    function handleCredentialResponse(response) {
        const responsePayload = decodeJwtResponse(response.credential);
        $('#user-info').html(`Hello, ${responsePayload.name}`);
    }

    function decodeJwtResponse(token) {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        return JSON.parse(jsonPayload);
    }

    google.accounts.id.initialize({
        client_id: '1013035748829-bsfjoee6sondoh1gbct8nasl0oqan2v9.apps.googleusercontent.com',
        callback: handleCredentialResponse
    });

    google.accounts.id.renderButton(
        document.getElementById('signin-btn'),
        { theme: 'outline', size: 'large' }
    );

    // Search Books Function
    $('#search-btn').click(function() {
        const query = $('#search').val();
        if (query) {
            searchHistory.push(query);
            displaySearchHistory();
            searchBooks(query, 1);
        }
    });

    // Display Search History
    function displaySearchHistory() {
        $('#search-history').empty();
        searchHistory.forEach(term => {
            $('#search-history').append(`<div class="history-item">${term}</div>`);
        });
        $('.history-item').click(function() {
            const term = $(this).text();
            searchBooks(term, 1);
        });
    }

    // Search Books
    function searchBooks(query, page) {
        const startIndex = (page - 1) * itemsPerPage;
        $.ajax({
            url: `https://www.googleapis.com/books/v1/volumes?q=${query}&startIndex=${startIndex}&maxResults=${itemsPerPage}`,
            dataType: 'json',
            success: function(data) {
                renderSearchResults(data.items);
                setupPagination(data.totalItems, query);
                currentPage = page;
            }
        });
    }

    // Render Search Results
    function renderSearchResults(items) {
        $('#results').empty();
        items.forEach(item => {
            $('#results').append(Mustache.render($('#search-results-template').html(), item));
        });
        $('.book').click(function() {
            const bookId = $(this).data('id');
            getBookDetails(bookId);
        });
    }

    // Setup Pagination
    function setupPagination(totalItems, query) {
        $('#pagination').empty();
        const totalPages = Math.ceil(totalItems / itemsPerPage);
        for (let i = 1; i <= totalPages; i++) {
            $('#pagination').append(`<a data-page="${i}">${i}</a>`);
        }
        $('#pagination a').click(function() {
            const page = $(this).data('page');
            searchBooks(query, page);
        });
        $(`#pagination a[data-page="${currentPage}"]`).addClass('active');
    }

    // Get Book Details
    function getBookDetails(bookId) {
        $.get(`https://www.googleapis.com/books/v1/volumes/${bookId}`, function(data) {
            $('#details').html(Mustache.render($('#book-details-template').html(), data));
        });
    }

    // Display Bookshelf
    function displayBookshelf() {
        $.ajax({
            url: 'https://www.googleapis.com/books/v1/mylibrary/bookshelves/0/volumes',
            headers: {
                'Authorization': `Bearer ${accessToken}`
            },
            dataType: 'json',
            success: function(data) {
                data.items.forEach(item => {
                    $('#bookshelf').append(Mustache.render($('#bookshelf-item-template').html(), item));
                });
                $('.book').click(function() {
                    const bookId = $(this).data('id');
                    getBookDetails(bookId);
                });
            }
        });
    }

    $('#grid-view').click(function() {
        $('#results').removeClass('list-view').addClass('grid-view');
    });

    $('#list-view').click(function() {
        $('#results').removeClass('grid-view').addClass('list-view');
    });

    displayBookshelf();
});
