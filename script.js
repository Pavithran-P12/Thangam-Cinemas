// Movie Slider Management - Updated for Multiple Movies v2.0
class MovieSlider {
    constructor() {
        this.currentSlide = 0;
        this.slides = [];
        this.autoPlayInterval = null;
        this.isPlaying = true;
        this.movies = [];
        this.init();
    }

    async init() {
        try {
            // Load available movies
            await this.loadMovies();
            this.setupSlider();
        } catch (error) {
            console.error('Error initializing movie slider:', error);
            this.showFallbackContent();
        }
    }

    async loadMovies() {
        // Check for movie subfolders and load all available movies
        const movieFolders = ['Movie1', 'Movie2', 'Movie3', 'Movie4'];
        const imageFormats = ['jpg', 'jpeg', 'png', 'webp', 'gif'];
        this.movies = [];

        // Load all movies with posters
        for (const folder of movieFolders) {
            try {
                const posterImage = await this.findPosterImage(folder, imageFormats);
                if (posterImage) {
                    const movieData = await this.loadMovieData(folder, posterImage);
                    if (movieData) {
                        this.movies.push(movieData); // Add all movies to the array
                    }
                }
            } catch (error) {
                console.log(`No movie data for ${folder}`);
            }
        }

        // Fallback data if no movies loaded
        if (this.movies.length === 0) {
            this.movies = [
                {
                    folder: 'fallback',
                    title: 'Welcome to Thangam Cinemas',
                    details: 'Experience the latest blockbuster in our premium theater with state-of-the-art sound and projection.',
                    poster: 'assets/images/Banner (1).jpeg',
                    showTime: 'Call for show timings'
                }
            ];
        }
    }

    async findPosterImage(folder, formats) {
        // Try to find poster image in various formats
        for (const format of formats) {
            try {
                const imagePath = `assets/movies/${folder}/poster.${format}`;
                // Check if image exists by trying to load it
                if (await this.imageExists(imagePath)) {
                    return imagePath;
                }
            } catch (error) {
                // Continue to next format
            }
        }

        // Also check for any image file in the folder (like "Idly Kadai.jpg")
        try {
            // For now, we'll use a known image pattern
            // In a real implementation, this would scan the folder
            const knownImages = [
                `assets/movies/${folder}/Idly Kadai.jpg`,
                `assets/movies/${folder}/jn.jpg`,
                `assets/movies/${folder}/poster.jpg`,
                `assets/movies/${folder}/poster.jpeg`,
                `assets/movies/${folder}/poster.png`,
                `assets/movies/${folder}/movie.jpg`
            ];
            
            for (const imagePath of knownImages) {
                if (await this.imageExists(imagePath)) {
                    return imagePath;
                }
            }
        } catch (error) {
            // No image found
        }
        
        return null;
    }

    async imageExists(imagePath) {
        return new Promise((resolve) => {
            const img = new Image();
            img.onload = () => resolve(true);
            img.onerror = () => resolve(false);
            img.src = imagePath;
        });
    }

    async loadMovieData(folder, posterPath) {
        try {
            // Load movie title and info
            const title = await this.loadTextFile(`assets/movies/${folder}/title.txt`);
            const info = await this.loadTextFile(`assets/movies/${folder}/info.txt`);
            
            // Extract just the movie description without show times
            const movieDescription = this.extractMovieDescription(info);
            
            return {
                folder: folder,
                title: title || `Movie ${folder.slice(-1)}`,
                details: movieDescription || 'Now showing - Premium movie experience with Dolby Digital sound',
                poster: posterPath,
                showTime: this.extractShowTime(info)
            };
        } catch (error) {
            console.error(`Error loading movie data for ${folder}:`, error);
            return null;
        }
    }

    extractMovieDescription(info) {
        if (!info) return null;
        
        // Remove show times from the description
        // Split by | and keep only the non-timing parts
        const parts = info.split('|');
        const descriptionParts = [];
        
        for (const part of parts) {
            const trimmedPart = part.trim();
            // Skip parts that contain time patterns
            if (!this.containsTimePattern(trimmedPart)) {
                descriptionParts.push(trimmedPart);
            }
        }
        
        return descriptionParts.join(' | ') || 'Premium movie experience';
    }

    containsTimePattern(text) {
        // Check if text contains time patterns like "9:00AM", "2:00 PM", etc.
        const timePattern = /\d{1,2}:\d{2}\s*(AM|PM|am|pm)/;
        return timePattern.test(text);
    }

    async loadTextFile(filePath) {
        try {
            const response = await fetch(filePath);
            if (response.ok) {
                return await response.text();
            }
        } catch (error) {
            console.log(`Could not load ${filePath}`);
        }
        return null;
    }

    extractShowTime(info) {
        if (!info) return 'Call for show timings';
        
        // Extract show timings from info text
        const timePattern = /(\d{1,2}:\d{2}\s*(AM|PM|am|pm))/g;
        const times = info.match(timePattern);
        
        if (times && times.length > 0) {
            return `Show times: ${times.join(', ')}`;
        }
        
        return info.includes('timing') || info.includes('time') ? info : 'Call for show timings';
    }

    setupSlider() {
        const container = document.querySelector('.movies-container');
        if (!container) return;

        // Clear existing content
        container.innerHTML = '';

        // Create slides for all movies
        this.movies.forEach((movie, index) => {
            const slide = this.createMovieSlide(movie, index);
            container.appendChild(slide);
        });

        this.slides = document.querySelectorAll('.movie-slide');
        
        // Add navigation and indicators if more than one movie
        if (this.movies.length > 1) {
            this.createNavigation();
            this.createIndicators();
            this.bindEvents();
            this.autoPlay();
        }
        
        if (this.slides.length > 0) {
            this.showSlide(0);
        }
    }

    createMovieSlide(movie, index) {
        const slide = document.createElement('div');
        slide.className = 'movie-slide';
        slide.dataset.index = index;

        slide.innerHTML = `
            <div class="movie-poster">
                <img src="${this.sanitizeHtml(movie.poster)}" alt="${this.sanitizeHtml(movie.title)}" loading="lazy">
            </div>
            <div class="movie-info">
                <h2 class="movie-title">${this.sanitizeHtml(movie.title)}</h2>
                <p class="movie-details">${this.sanitizeHtml(movie.details)}</p>
                <p class="movie-timing">${this.sanitizeHtml(movie.showTime)}</p>
                <div class="movie-actions">
                    <a href="tel:04259 298 222" class="book-btn">
                        <i class="fas fa-ticket-alt"></i>
                        Book Tickets
                    </a>
                </div>
            </div>
        `;

        return slide;
    }

    createNavigation() {
        const slider = document.querySelector('.movies-slider');
        if (!slider) return;

        const nav = document.createElement('div');
        nav.className = 'movies-nav';
        nav.innerHTML = `
            <button class="movie-nav-btn prev-btn" aria-label="Previous movie">
                <i class="fas fa-chevron-left"></i>
            </button>
            <button class="movie-nav-btn next-btn" aria-label="Next movie">
                <i class="fas fa-chevron-right"></i>
            </button>
        `;

        slider.appendChild(nav);
    }

    createIndicators() {
        const slider = document.querySelector('.movies-slider');
        if (!slider) return;

        const indicators = document.createElement('div');
        indicators.className = 'movies-indicators';

        this.movies.forEach((movie, index) => {
            const indicator = document.createElement('button');
            indicator.className = 'movie-indicator';
            indicator.textContent = `Movie ${index + 1}`;
            indicator.dataset.index = index;
            indicator.setAttribute('aria-label', `Show ${movie.title}`);
            indicators.appendChild(indicator);
        });

        slider.appendChild(indicators);
    }

    bindEvents() {
        // Navigation buttons
        const prevBtn = document.querySelector('.prev-btn');
        const nextBtn = document.querySelector('.next-btn');

        if (prevBtn) {
            prevBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.previousSlide();
            });
        }

        if (nextBtn) {
            nextBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.nextSlide();
            });
        }

        // Indicators
        const indicators = document.querySelectorAll('.movie-indicator');
        indicators.forEach((indicator) => {
            indicator.addEventListener('click', (e) => {
                e.preventDefault();
                const index = parseInt(indicator.dataset.index);
                this.goToSlide(index);
            });
        });

        // Pause on hover
        const slider = document.querySelector('.movies-slider');
        if (slider) {
            slider.addEventListener('mouseenter', () => this.pauseAutoPlay());
            slider.addEventListener('mouseleave', () => this.resumeAutoPlay());
        }

        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft') {
                e.preventDefault();
                this.previousSlide();
            } else if (e.key === 'ArrowRight') {
                e.preventDefault();
                this.nextSlide();
            }
        });
    }

    showSlide(index) {
        if (!this.slides || this.slides.length === 0) return;

        // Remove active class from all slides
        this.slides.forEach(slide => slide.classList.remove('active'));

        // Update current slide index
        this.currentSlide = index;

        // Add active class to current slide
        if (this.slides[this.currentSlide]) {
            this.slides[this.currentSlide].classList.add('active');
        }

        // Update indicators
        this.updateIndicators();

        // Update ARIA labels
        this.updateAccessibility();
    }

    updateIndicators() {
        const indicators = document.querySelectorAll('.movie-indicator');
        indicators.forEach((indicator, index) => {
            indicator.classList.toggle('active', index === this.currentSlide);
        });
    }

    updateAccessibility() {
        this.slides.forEach((slide, index) => {
            slide.setAttribute('aria-hidden', index !== this.currentSlide);
        });
    }

    nextSlide() {
        if (this.slides.length === 0) return;
        const nextIndex = (this.currentSlide + 1) % this.slides.length;
        this.goToSlide(nextIndex);
    }

    previousSlide() {
        if (this.slides.length === 0) return;
        const prevIndex = this.currentSlide === 0 ? this.slides.length - 1 : this.currentSlide - 1;
        this.goToSlide(prevIndex);
    }

    goToSlide(index) {
        if (index >= 0 && index < this.slides.length) {
            this.showSlide(index);
        }
    }

    autoPlay() {
        if (this.slides.length <= 1) return;

        this.autoPlayInterval = setInterval(() => {
            if (this.isPlaying) {
                this.nextSlide();
            }
        }, 5000); // 5 seconds
    }

    pauseAutoPlay() {
        this.isPlaying = false;
    }

    resumeAutoPlay() {
        this.isPlaying = true;
    }

    showFallbackContent() {
        const container = document.querySelector('.movies-container');
        if (container) {
            container.innerHTML = `
                <div class="movie-slide active">
                    <div class="movie-poster">
                        <img src="assets/images/Banner (1).jpeg" alt="Cinema Experience" loading="lazy">
                    </div>
                    <div class="movie-info">
                        <h2 class="movie-title">Welcome to Thangam Cinemas</h2>
                        <p class="movie-details">Experience the magic of cinema with our state-of-the-art projection and sound systems.</p>
                        <p class="movie-timing">Call for current show timings and bookings</p>
                        <div class="movie-actions">
                            <a href="tel:04259 298 222" class="book-btn">
                                <i class="fas fa-phone"></i>
                                Call for Bookings
                            </a>
                        </div>
                    </div>
                </div>
            `;
        }
    }

    sanitizeHtml(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }
}

// Contact Form Handler (Secure Implementation)
class ContactForm {
    constructor() {
        this.form = document.getElementById('contact-form');
        this.init();
    }

    init() {
        if (this.form) {
            this.bindEvents();
            this.setupValidation();
        }
    }

    bindEvents() {
        this.form.addEventListener('submit', (e) => this.handleSubmit(e));

        // Real-time validation
        const inputs = this.form.querySelectorAll('input, textarea');
        inputs.forEach(input => {
            input.addEventListener('blur', (e) => this.validateField(e.target));
            input.addEventListener('input', (e) => this.clearError(e.target));
        });
    }

    setupValidation() {
        // Phone number formatting
        const phoneInput = this.form.querySelector('input[type="tel"]');
        if (phoneInput) {
            phoneInput.addEventListener('input', (e) => {
                e.target.value = this.formatPhoneNumber(e.target.value);
            });
        }
    }

    handleSubmit(e) {
        e.preventDefault();

        if (!this.validateForm()) {
            return;
        }

        // In a real application, you would send this data to a server
        this.showSuccess('Thank you for your message! We will contact you soon.');
        this.form.reset();
    }

    validateForm() {
        let isValid = true;
        const fields = this.form.querySelectorAll('input[required], textarea[required]');

        fields.forEach(field => {
            if (!this.validateField(field)) {
                isValid = false;
            }
        });

        return isValid;
    }

    validateField(field) {
        const value = field.value.trim();
        const type = field.type;
        const name = field.name || field.id;

        this.clearError(field);

        // Required field validation
        if (field.hasAttribute('required') && !value) {
            this.showError(field, 'This field is required');
            return false;
        }

        // Email validation
        if (type === 'email' && value) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(value)) {
                this.showError(field, 'Please enter a valid email address');
                return false;
            }
        }

        // Phone validation
        if (type === 'tel' && value) {
            const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
            const cleanPhone = value.replace(/[\s\-\(\)]/g, '');
            if (!phoneRegex.test(cleanPhone)) {
                this.showError(field, 'Please enter a valid phone number');
                return false;
            }
        }

        // Name validation
        if (name === 'name' && value) {
            if (value.length < 2) {
                this.showError(field, 'Name must be at least 2 characters long');
                return false;
            }
        }

        // Message validation
        if (name === 'message' && value) {
            if (value.length < 10) {
                this.showError(field, 'Message must be at least 10 characters long');
                return false;
            }
        }

        return true;
    }

    showError(field, message) {
        this.clearError(field);

        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = message;
        errorDiv.style.color = '#dc3545';
        errorDiv.style.fontSize = '0.875rem';
        errorDiv.style.marginTop = '0.25rem';

        field.parentNode.appendChild(errorDiv);
        field.classList.add('error');
        field.setAttribute('aria-invalid', 'true');
        field.setAttribute('aria-describedby', 'error-' + (field.name || field.id));
        errorDiv.id = 'error-' + (field.name || field.id);
    }

    clearError(field) {
        const errorMessage = field.parentNode.querySelector('.error-message');
        if (errorMessage) {
            errorMessage.remove();
        }
        field.classList.remove('error');
        field.removeAttribute('aria-invalid');
        field.removeAttribute('aria-describedby');
    }

    showSuccess(message) {
        // Remove any existing messages
        const existingMessage = document.querySelector('.success-message');
        if (existingMessage) {
            existingMessage.remove();
        }

        const successDiv = document.createElement('div');
        successDiv.className = 'success-message';
        successDiv.textContent = message;
        successDiv.style.cssText = `
            background-color: #d4edda;
            color: #155724;
            padding: 1rem;
            border-radius: 8px;
            margin-top: 1rem;
            border: 1px solid #c3e6cb;
        `;

        this.form.appendChild(successDiv);

        // Remove success message after 5 seconds
        setTimeout(() => {
            if (successDiv.parentNode) {
                successDiv.remove();
            }
        }, 5000);
    }

    formatPhoneNumber(value) {
        // Remove all non-numeric characters except +
        const cleaned = value.replace(/[^\d\+]/g, '');

        // Limit length
        if (cleaned.length > 15) {
            return cleaned.substring(0, 15);
        }

        return cleaned;
    }
}

// Smooth Scrolling for Navigation Links
class SmoothScroll {
    constructor() {
        this.init();
    }

    init() {
        // Add smooth scrolling to all navigation links
        const navLinks = document.querySelectorAll('a[href^="#"]');
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => this.handleClick(e));
        });
    }

    handleClick(e) {
        e.preventDefault();

        const targetId = e.currentTarget.getAttribute('href');
        const targetSection = document.querySelector(targetId);

        if (targetSection) {
            const headerHeight = document.querySelector('nav')?.offsetHeight || 0;
            const targetPosition = targetSection.offsetTop - headerHeight - 20;

            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });

            // Update URL without triggering page reload
            history.pushState(null, null, targetId);
        }
    }
}

// Navigation Mobile Menu Handler
class MobileMenu {
    constructor() {
        this.menuToggle = document.querySelector('.menu-toggle');
        this.navMenu = document.querySelector('.nav-menu');
        this.init();
    }

    init() {
        if (this.menuToggle && this.navMenu) {
            this.bindEvents();
        }
    }

    bindEvents() {
        this.menuToggle.addEventListener('click', (e) => {
            e.preventDefault();
            this.toggleMenu();
        });

        // Close menu when clicking on a nav link
        const navLinks = this.navMenu.querySelectorAll('a');
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                this.closeMenu();
            });
        });

        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!this.menuToggle.contains(e.target) && !this.navMenu.contains(e.target)) {
                this.closeMenu();
            }
        });

        // Handle escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeMenu();
            }
        });
    }

    toggleMenu() {
        this.navMenu.classList.toggle('active');
        this.menuToggle.classList.toggle('active');
        
        // Update ARIA attributes
        const isOpen = this.navMenu.classList.contains('active');
        this.menuToggle.setAttribute('aria-expanded', isOpen);
    }

    closeMenu() {
        this.navMenu.classList.remove('active');
        this.menuToggle.classList.remove('active');
        this.menuToggle.setAttribute('aria-expanded', 'false');
    }
}

// Scroll-based Animations
class ScrollAnimations {
    constructor() {
        this.observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };
        this.init();
    }

    init() {
        if ('IntersectionObserver' in window) {
            this.observer = new IntersectionObserver(
                (entries) => this.handleIntersection(entries),
                this.observerOptions
            );
            this.observeElements();
        }
    }

    observeElements() {
        const animatedElements = document.querySelectorAll('.section, .feature-item, .contact-item');
        animatedElements.forEach(el => {
            el.style.opacity = '0';
            el.style.transform = 'translateY(30px)';
            el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
            this.observer.observe(el);
        });
    }

    handleIntersection(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
                this.observer.unobserve(entry.target);
            }
        });
    }
}

// Initialize all components when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    try {
        // Initialize all components
        new MovieSlider();
        new ContactForm();
        new SmoothScroll();
        new MobileMenu();
        new ScrollAnimations();

        // Initialize Google Maps if available
        if (typeof initMap === 'function') {
            initMap();
        }

        console.log('All components initialized successfully');
    } catch (error) {
        console.error('Error initializing components:', error);
    }
});

// Service Worker Registration for Better Performance (Optional)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').catch(() => {
            // Service worker not available, continue normally
        });
    });
}

// Google Maps Integration
function initMap() {
    try {
        const location = { lat: 10.653396, lng: 76.996784 }; // J2V5+P2 Pollachi coordinates
        
        const map = new google.maps.Map(document.getElementById('map'), {
            zoom: 15,
            center: location,
            styles: [
                {
                    featureType: 'all',
                    elementType: 'geometry.fill',
                    stylers: [{ color: '#f8f9fa' }]
                },
                {
                    featureType: 'water',
                    elementType: 'geometry',
                    stylers: [{ color: '#e9ecef' }]
                }
            ]
        });

        const marker = new google.maps.Marker({
            position: location,
            map: map,
            title: 'Thangam Cinemas',
            icon: {
                url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
                    <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="#ff6b35">
                        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
                        <circle cx="12" cy="9" r="2.5" fill="white"/>
                    </svg>
                `),
                scaledSize: new google.maps.Size(40, 40),
                anchor: new google.maps.Point(20, 40)
            }
        });

        const infoWindow = new google.maps.InfoWindow({
            content: `
                <div style="padding: 10px; max-width: 250px;">
                    <h3 style="margin: 0 0 10px 0; color: #ff6b35;">Thangam Cinemas</h3>
                    <p style="margin: 5px 0; color: #666;">J2V5+P2 Pollachi, Tamil Nadu</p>
                    <p style="margin: 5px 0; color: #666;">📞 04259 298 222</p>
                    <a href="https://maps.google.com/?q=10.653396,76.996784" target="_blank" 
                       style="color: #ff6b35; text-decoration: none; font-weight: 600;">
                        Get Directions →
                    </a>
                </div>
            `
        });

        marker.addListener('click', () => {
            infoWindow.open(map, marker);
        });

    } catch (error) {
        console.error('Error initializing Google Maps:', error);
        // Hide map container if there's an error
        const mapContainer = document.getElementById('map');
        if (mapContainer) {
            mapContainer.innerHTML = '<p style="text-align: center; padding: 2rem; color: #666;">Map temporarily unavailable</p>';
        }
    }
}

// Gallery Auto-Display Management
class GallerySlider {
    constructor() {
        this.currentSlide = 0;
        this.totalSlides = 0;
        this.track = null;
        this.autoPlayInterval = null;
        this.init();
    }

    init() {
        this.track = document.querySelector('.gallery-track');
        this.totalSlides = document.querySelectorAll('.gallery-slide').length;

        if (!this.track || this.totalSlides === 0) return;

        this.startAutoPlay();
    }

    nextSlide() {
        this.currentSlide = (this.currentSlide + 1) % this.totalSlides;
        this.updateSlider();
    }

    updateSlider() {
        const translateX = -this.currentSlide * 100;
        this.track.style.transform = `translateX(${translateX}%)`;
    }

    startAutoPlay() {
        this.autoPlayInterval = setInterval(() => {
            this.nextSlide();
        }, 3000); // Change slide every 3 seconds
    }
}

// Initialize Gallery Slider when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Initialize existing components
    new MovieSlider();
    
    // Initialize Gallery Slider
    new GallerySlider();
});

// Export functions for global access
window.initMap = initMap;