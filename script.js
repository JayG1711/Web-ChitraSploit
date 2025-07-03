const APILINK ='https://api.themoviedb.org/3/discover/movie?sort_by=popularity.desc&api_key=ac1c5de1a4e8b6c06a13046034fc68dc&page=';
const CATEGORYAPI = 'https://api.themoviedb.org/3/discover/movie?sort_by=popularity.desc&api_key=ac1c5de1a4e8b6c06a13046034fc68dc&with_genres=';
const IMG_PATH = 'https://image.tmdb.org/t/p/w1280';
const SEARCHAPI = "https://api.themoviedb.org/3/search/movie?&api_key=ac1c5de1a4e8b6c06a13046034fc68dc&query=";
const MOVIEDETAILSAPI = 'https://api.themoviedb.org/3/movie/';
const MOVIEREVIEWSAPI = 'https://api.themoviedb.org/3/movie/';
const APIKEY = 'ac1c5de1a4e8b6c06a13046034fc68dc';

const main = document.getElementById("section");
const form = document.getElementById("form");
const search = document.getElementById("query");
const backButton = document.getElementById("back-button");
const categoryButtons = document.querySelectorAll('.category-btn');

// Suggestions elements
const suggestionsSection = document.getElementById("suggestions-section");
const suggestionsBtn = document.getElementById("suggestions-btn");
const addSuggestionBtn = document.getElementById("add-suggestion-btn");
const suggestionModal = document.getElementById("suggestion-modal");
const closeSuggestion = document.querySelector(".close-suggestion");
const suggestionForm = document.getElementById("suggestion-form");
const suggestionsContainer = document.getElementById("suggestions-container");

// Movie suggestions array - stored in localStorage
let movieSuggestions = JSON.parse(localStorage.getItem('movieSuggestions')) || [];

let currentPage = 1;
let isLoading = false;
let currentSearchTerm = '';
let currentCategory = 'popular';
let totalPages = 500; // TMDB has a maximum of 500 pages

returnMovies(getApiUrl())

function getApiUrl() {
  if (currentCategory === 'popular') {
    return APILINK + currentPage;
  } else {
    return CATEGORYAPI + currentCategory + '&page=' + currentPage;
  }
}

function returnMovies(url, append = false){
  if (isLoading) return;
  isLoading = true;

  fetch(url).then(res => res.json())
  .then(function(data) {
    console.log(data.results);
    totalPages = data.total_pages;

    if (!append) {
      main.innerHTML = ''; // Clear existing content for new searches
    }

    // Calculate starting index for rows
    const existingMovies = main.querySelectorAll('.column').length;

    data.results.forEach((element, index) => {
      const totalIndex = existingMovies + index;

      // Create new row every 4 movies
      if (totalIndex % 4 === 0) {
        const div_row = document.createElement('div');
        div_row.setAttribute('class', 'row');
        div_row.setAttribute('id', `row-${Math.floor(totalIndex / 4)}`);
        main.appendChild(div_row);
      }

      const currentRow = document.getElementById(`row-${Math.floor(totalIndex / 4)}`);
      const div_column = document.createElement('div');
      div_column.setAttribute('class', 'column');

      const div_card = document.createElement('div');
      div_card.setAttribute('class', 'card');

      const image = document.createElement('img');
      image.setAttribute('class', 'thumbnail');
      image.src = IMG_PATH + element.poster_path;
      image.addEventListener('click', () => showMovieDetails(element.id));

      const title = document.createElement('h3');
      title.innerHTML = `${element.title}`;

      const centre = document.createElement('div');
      centre.style.textAlign = 'center';
      centre.appendChild(image);

      div_card.appendChild(centre);
      div_card.appendChild(title);
      div_column.appendChild(div_card);
      currentRow.appendChild(div_column);
    });

    isLoading = false;
  })
  .catch(error => {
    console.error('Error fetching movies:', error);
    isLoading = false;
  });
}
form.addEventListener("submit",(e)=>{
  e.preventDefault();
  const searchItem = search.value;
  if(searchItem){
    currentSearchTerm = searchItem;
    currentPage = 1;
    backButton.style.display = 'inline-block'; // Show back button when searching
    returnMovies(SEARCHAPI + searchItem + "&page=" + currentPage, false);
    search.value = "";
  }
});

// Back button functionality
backButton.addEventListener('click', () => {
  if (suggestionsSection.style.display === 'block') {
    // Return from suggestions to movies
    suggestionsSection.style.display = 'none';
    main.style.display = 'block';
    backButton.style.display = 'none';

    // Reset to popular movies
    categoryButtons.forEach(btn => btn.classList.remove('active'));
    document.querySelector('[data-category="popular"]').classList.add('active');
    suggestionsBtn.classList.remove('active');
    currentCategory = 'popular';
    currentPage = 1;
    currentSearchTerm = '';
    returnMovies(getApiUrl(), false);
  } else {
    currentSearchTerm = '';
    currentPage = 1;
    backButton.style.display = 'none';
    returnMovies(getApiUrl(), false);
  }
});

// Category button functionality
categoryButtons.forEach(button => {
  button.addEventListener('click', () => {
    // If suggestions section is visible, hide it and show movies section
    if (suggestionsSection.style.display === 'block') {
      suggestionsSection.style.display = 'none';
      main.style.display = 'block';
    }

    // Remove active class from all buttons including suggestions
    categoryButtons.forEach(btn => btn.classList.remove('active'));
    suggestionsBtn.classList.remove('active');
    // Add active class to clicked button
    button.classList.add('active');

    // Reset search and page
    currentSearchTerm = '';
    currentPage = 1;
    currentCategory = button.dataset.category;
    backButton.style.display = 'none';

    // Load movies for selected category
    returnMovies(getApiUrl(), false);
  });
});

// Infinite scroll functionality
window.addEventListener('scroll', () => {
  if (isLoading || currentPage >= totalPages) return;

  // Check if user has scrolled near bottom of page
  if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 1000) {
    currentPage++;

    // Load next page based on whether we're searching or browsing
    if (currentSearchTerm) {
      returnMovies(SEARCHAPI + currentSearchTerm + "&page=" + currentPage, true);
    } else {
      returnMovies(getApiUrl(), true);
    }
  }
});

// Reset to browse mode when clicking on logo
document.querySelector('.topnav a').addEventListener('click', (e) => {
  e.preventDefault();
  currentSearchTerm = '';
  currentPage = 1;
  currentCategory = 'popular';
  backButton.style.display = 'none'; // Hide back button when returning home

  // Hide suggestions section, show movies section
  suggestionsSection.style.display = 'none';
  main.style.display = 'block';

  // Reset category buttons
  categoryButtons.forEach(btn => btn.classList.remove('active'));
  document.querySelector('[data-category="popular"]').classList.add('active');

  returnMovies(getApiUrl(), false);
});

// Function to show movie details
function showMovieDetails(movieId) {
  // Fetch movie details
  fetch(`${MOVIEDETAILSAPI}${movieId}?api_key=${APIKEY}`)
    .then(res => res.json())
    .then(movie => {
      // Fetch movie reviews
      fetch(`${MOVIEREVIEWSAPI}${movieId}/reviews?api_key=${APIKEY}`)
        .then(res => res.json())
        .then(reviews => {
          displayMovieModal(movie, reviews.results);
        });
    })
    .catch(error => {
      console.error('Error fetching movie details:', error);
    });
}

// Function to display movie details in modal
function displayMovieModal(movie, reviews) {
  // Create modal backdrop
  const modalBackdrop = document.createElement('div');
  modalBackdrop.className = 'modal-backdrop';

  // Create modal content
  const modalContent = document.createElement('div');
  modalContent.className = 'modal-content';

  // Create close button
  const closeBtn = document.createElement('span');
  closeBtn.className = 'close-btn';
  closeBtn.innerHTML = '&times;';
  closeBtn.onclick = () => {
    document.body.removeChild(modalBackdrop);
    document.body.style.overflow = 'auto';
  };

  // Create movie details HTML
  const movieHTML = `
    <div class="movie-details">
      <div class="movie-poster">
        <img src="${IMG_PATH + movie.poster_path}" alt="${movie.title}">
      </div>
      <div class="movie-info">
        <h1>${movie.title}</h1>
        <div class="movie-meta">
          <span class="rating">⭐ ${movie.vote_average.toFixed(1)}/10</span>
          <span class="release-date">${movie.release_date}</span>
          <span class="runtime">${movie.runtime} min</span>
        </div>
        <div class="genres">
          ${movie.genres.map(genre => `<span class="genre">${genre.name}</span>`).join('')}
        </div>
        <p class="overview">${movie.overview}</p>
        <div class="additional-info">
          <p><strong>Budget:</strong> $${movie.budget.toLocaleString()}</p>
          <p><strong>Revenue:</strong> $${movie.revenue.toLocaleString()}</p>
          <p><strong>Languages:</strong> ${movie.spoken_languages.map(lang => lang.name).join(', ')}</p>
        </div>
      </div>
    </div>
    <div class="reviews-section">
      <h2>Reviews</h2>
      <div class="reviews-container">
        ${reviews.length > 0 ? 
          reviews.slice(0, 3).map(review => `
            <div class="review">
              <div class="review-header">
                <strong>${review.author}</strong>
                ${review.author_details.rating ? `<span class="review-rating">⭐ ${review.author_details.rating}/10</span>` : ''}
              </div>
              <p class="review-content">${review.content.length > 300 ? review.content.substring(0, 300) + '...' : review.content}</p>
            </div>
          `).join('') : 
          '<p>No reviews available for this movie.</p>'
        }
      </div>
    </div>
  `;

  modalContent.innerHTML = movieHTML;
  modalContent.insertBefore(closeBtn, modalContent.firstChild);
  modalBackdrop.appendChild(modalContent);

  // Add to body and prevent scrolling
  document.body.appendChild(modalBackdrop);
  document.body.style.overflow = 'hidden';

  // Close modal when clicking outside
  modalBackdrop.addEventListener('click', (e) => {
    if (e.target === modalBackdrop) {
      document.body.removeChild(modalBackdrop);
      document.body.style.overflow = 'auto';
    }
  });
}

// Suggestions functionality
suggestionsBtn.addEventListener('click', () => {
  // Hide movie section, show suggestions section
  main.style.display = 'none';
  suggestionsSection.style.display = 'block';

  // Update navigation
  categoryButtons.forEach(btn => btn.classList.remove('active'));
  suggestionsBtn.classList.add('active');
  backButton.style.display = 'inline-block';

  // Display suggestions
  displaySuggestions();
});

// Add suggestion modal functionality
addSuggestionBtn.addEventListener('click', () => {
  suggestionModal.style.display = 'flex';
  document.body.style.overflow = 'hidden';
});

closeSuggestion.addEventListener('click', () => {
  suggestionModal.style.display = 'none';
  document.body.style.overflow = 'auto';
});

// Close modal when clicking outside
suggestionModal.addEventListener('click', (e) => {
  if (e.target === suggestionModal) {
    suggestionModal.style.display = 'none';
    document.body.style.overflow = 'auto';
  }
});

// Handle suggestion form submission
suggestionForm.addEventListener('submit', (e) => {
  e.preventDefault();

  const suggestion = {
    title: document.getElementById('movie-title').value,
    year: parseInt(document.getElementById('movie-year').value),
    genre: document.getElementById('movie-genre').value,
    description: document.getElementById('movie-description').value,
    review: document.getElementById('your-review').value,
    reviewer_name: document.getElementById('reviewer-name').value,
    rating: parseInt(document.getElementById('movie-rating').value),
    date_added: new Date().toISOString()
  };

  // Add to suggestions array
  movieSuggestions.unshift(suggestion);

  // Save to localStorage
  localStorage.setItem('movieSuggestions', JSON.stringify(movieSuggestions));

  // Close modal and reset form
  suggestionModal.style.display = 'none';
  document.body.style.overflow = 'auto';
  suggestionForm.reset();

  // Refresh suggestions display
  displaySuggestions();

  // Show success message
  alert('Movie suggestion saved successfully!');
});

// Function to display suggestions
function displaySuggestions() {
  if (movieSuggestions.length === 0) {
    suggestionsContainer.innerHTML = `
      <div style="text-align: center; padding: 50px; color: #ccc;">
        <h3>No movie suggestions yet!</h3>
        <p>Be the first to suggest a movie and share your review.</p>
      </div>
    `;
    return;
  }

  suggestionsContainer.innerHTML = movieSuggestions.map(suggestion => `
    <div class="suggestion-card">
      <h3>${suggestion.title} (${suggestion.year})</h3>
      <div class="suggestion-meta">
        <span><strong>Genre:</strong> ${suggestion.genre}</span>
        <span class="suggestion-rating">⭐ ${suggestion.rating}/10</span>
        <span><strong>Added:</strong> ${new Date(suggestion.date_added).toLocaleDateString()}</span>
      </div>
      <p class="suggestion-description">${suggestion.description}</p>
      <div class="suggestion-review">
        <div class="review-header">
          <span class="reviewer-name">${suggestion.reviewer_name}</span>
          <span class="suggestion-rating">⭐ ${suggestion.rating}/10</span>
        </div>
        <p class="review-text">${suggestion.review}</p>
      </div>
    </div>
  `).join('');
}