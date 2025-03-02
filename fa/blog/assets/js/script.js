/**
 * Persian Blog Theme Scripts
 * Author: mmaleki92
 * Version: 1.0
 */

document.addEventListener('DOMContentLoaded', function() {
    
    // Variables
    const searchToggle = document.querySelector('.search-toggle');
    const searchOverlay = document.querySelector('.search-overlay');
    const searchClose = document.querySelector('.search-close');
    const themeToggle = document.querySelector('.theme-toggle');
    const menuToggle = document.querySelector('.menu-toggle');
    const menu = document.querySelector('.menu');
    const scrollTopBtn = document.getElementById('scrollTop');
    const hasChildrenMenuItems = document.querySelectorAll('.has-children');
    
    // Toggle search overlay
    if (searchToggle && searchOverlay && searchClose) {
        searchToggle.addEventListener('click', function() {
            searchOverlay.classList.add('active');
            setTimeout(() => {
                document.querySelector('.search-field').focus();
            }, 300);
            document.body.style.overflow = 'hidden';
        });
        
        searchClose.addEventListener('click', function() {
            searchOverlay.classList.remove('active');
            document.body.style.overflow = '';
        });
        
        // Close search overlay with Escape key
        document.addEventListener('keydown', function(event) {
            if (event.key === 'Escape' && searchOverlay.classList.contains('active')) {
                searchOverlay.classList.remove('active');
                document.body.style.overflow = '';
            }
        });
    }
    
    // Dark mode toggle
    if (themeToggle) {
        // Check for saved theme preference or default to light
        if (localStorage.getItem('theme') === 'dark') {
            document.body.classList.add('dark-mode');
            themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
        }
        
        themeToggle.addEventListener('click', function() {
            document.body.classList.toggle('dark-mode');
            
            if (document.body.classList.contains('dark-mode')) {
                localStorage.setItem('theme', 'dark');
                themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
            } else {
                localStorage.setItem('theme', 'light');
                themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
            }
        });
    }
    
    // Mobile menu toggle
    if (menuToggle && menu) {
        menuToggle.addEventListener('click', function() {
            menu.classList.toggle('active');
            menuToggle.setAttribute('aria-expanded', menu.classList.contains('active'));
        });
    }
    
    // Mobile submenu toggles
    if (hasChildrenMenuItems.length > 0) {
        for (const item of hasChildrenMenuItems) {
            const link = item.querySelector('a');
            
            // Add toggle button for mobile
            const toggleBtn = document.createElement('button');
            toggleBtn.className = 'submenu-toggle';
            toggleBtn.innerHTML = '<i class="fas fa-chevron-down"></i>';
            toggleBtn.setAttribute('aria-expanded', 'false');
            
            link.appendChild(toggleBtn);
            
            toggleBtn.addEventListener('click', function(event) {
                event.preventDefault();
                event.stopPropagation();
                
                const parent = item;
                const submenu = parent.querySelector('.sub-menu');
                const expanded = toggleBtn.getAttribute('aria-expanded') === 'true';
                
                parent.classList.toggle('active');
                toggleBtn.setAttribute('aria-expanded', !expanded);
                
                if (expanded) {
                    toggleBtn.innerHTML = '<i class="fas fa-chevron-down"></i>';
                } else {
                    toggleBtn.innerHTML = '<i class="fas fa-chevron-up"></i>';
                }
            });
        }
    }
    
    // Scroll to top button
    if (scrollTopBtn) {
        // Show/hide scroll-to-top button
        window.addEventListener('scroll', function() {
            if (window.pageYOffset > 500) {
                scrollTopBtn.classList.add('visible');
            } else {
                scrollTopBtn.classList.remove('visible');
            }
        });
        
        // Scroll to top when button is clicked
        scrollTopBtn.addEventListener('click', function() {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }
    
    // Smooth scroll for anchor links
    const anchorLinks = document.querySelectorAll('a[href^="#"]:not([href="#"])');
    
    for (const link of anchorLinks) {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                const offsetTop = targetElement.getBoundingClientRect().top + window.pageYOffset;
                
                window.scrollTo({
                    top: offsetTop - 100, // Offset to account for fixed header
                    behavior: 'smooth'
                });
                
                // Update URL without page jump
                history.pushState(null, null, targetId);
            }
        });
    }
    
    // Add Persian date format to blog posts if necessary
    const formatPersianDate = (date) => {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(date).toLocaleDateString('fa-IR', options);
    };
    
    // If there are date elements that need Persian formatting
    const persianDates = document.querySelectorAll('.persian-date');
    if (persianDates.length > 0) {
        for (const dateEl of persianDates) {
            const originalDate = dateEl.getAttribute('data-date');
            if (originalDate) {
                dateEl.textContent = formatPersianDate(originalDate);
            }
        }
    }
    
    // Code syntax highlighting if a library like Prism.js is included
    if (typeof Prism !== 'undefined') {
        Prism.highlightAll();
    }
    
    // Handle comment form submissions
    const commentForm = document.querySelector('.comment-form');
    if (commentForm) {
        commentForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // In a real implementation, you would send the form data via AJAX
            // Here we'll just show a success message for demonstration
            
            const formData = new FormData(commentForm);
            console.log('Comment submitted:', Object.fromEntries(formData));
            
            // Show success message
            const successMessage = document.createElement('div');
            successMessage.className = 'alert info-box';
            successMessage.innerHTML = '<p><strong>موفقیت!</strong> دیدگاه شما با موفقیت ارسال شد و پس از تایید نمایش داده خواهد شد.</p>';
            
            commentForm.parentNode.insertBefore(successMessage, commentForm);
            commentForm.reset();
            
            // Remove success message after 5 seconds
            setTimeout(() => {
                successMessage.remove();
            }, 5000);
        });
    }
    
    // Handle newsletter subscription form
    const subscriptionForm = document.querySelector('.subscription-form');
    if (subscriptionForm) {
        subscriptionForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const email = subscriptionForm.querySelector('input[type="email"]').value;
            console.log('Newsletter subscription:', email);
            
            // Show success message
            const successMessage = document.createElement('div');
            successMessage.className = 'alert info-box';
            successMessage.innerHTML = '<p><strong>موفقیت!</strong> ایمیل شما با موفقیت در خبرنامه ثبت شد.</p>';
            
            subscriptionForm.parentNode.insertBefore(successMessage, subscriptionForm.nextSibling);
            subscriptionForm.reset();
            
            // Remove success message after 5 seconds
            setTimeout(() => {
                successMessage.remove();
            }, 5000);
        });
    }
    
    // Add active state to current page in navigation
    const currentPage = window.location.pathname;
    const menuLinks = document.querySelectorAll('.menu a');
    
    for (const link of menuLinks) {
        if (link.getAttribute('href') === currentPage) {
            link.parentElement.classList.add('active');
        }
    }
    
    // Handle read more links
    const readMoreLinks = document.querySelectorAll('.read-more');
    for (const link of readMoreLinks) {
        link.addEventListener('mouseover', function() {
            const icon = this.querySelector('i');
            if (icon) {
                icon.classList.add('animated');
                
                // Remove the class after animation completes
                setTimeout(() => {
                    icon.classList.remove('animated');
                }, 300);
            }
        });
    }
    
    // Update copyright year automatically
    const copyrightYear = document.querySelector('.copyright-year');
    if (copyrightYear) {
        copyrightYear.textContent = new Date().toLocaleDateString('fa-IR', { year: 'numeric' });
    }
    
    // Initialize any tooltips
    const tooltips = document.querySelectorAll('[data-tooltip]');
    if (tooltips.length > 0) {
        for (const tooltip of tooltips) {
            tooltip.addEventListener('mouseover', function() {
                const text = this.getAttribute('data-tooltip');
                const tooltipEl = document.createElement('div');
                tooltipEl.className = 'tooltip';
                tooltipEl.textContent = text;
                
                document.body.appendChild(tooltipEl);
                
                const rect = this.getBoundingClientRect();
                tooltipEl.style.top = rect.top - tooltipEl.offsetHeight - 10 + 'px';
                tooltipEl.style.left = rect.left + (rect.width / 2) - (tooltipEl.offsetWidth / 2) + 'px';
                tooltipEl.style.opacity = '1';
                
                this.addEventListener('mouseleave', function() {
                    tooltipEl.remove();
                });
            });
        }
    }
    
    // Initialize any lazy loading images
    const lazyImages = document.querySelectorAll('img[data-src]');
    if (lazyImages.length > 0) {
        const lazyLoad = function() {
            for (const img of lazyImages) {
                if (img.getBoundingClientRect().top <= window.innerHeight && img.getBoundingClientRect().bottom >= 0) {
                    img.src = img.getAttribute('data-src');
                    img.removeAttribute('data-src');
                }
            }
        };
        
        // Initial load
        lazyLoad();
        
        // Listen for scroll events
        window.addEventListener('scroll', lazyLoad);
        window.addEventListener('resize', lazyLoad);
    }
    
    // Set current date in Persian format if needed
    const currentDateElement = document.getElementById('current-date');
    if (currentDateElement) {
        const now = new Date();
        currentDateElement.textContent = formatPersianDate(now);
    }
    
    console.log('Persian blog scripts initialized.');
});