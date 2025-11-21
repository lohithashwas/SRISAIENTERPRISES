document.addEventListener('DOMContentLoaded', () => {

    // Register GSAP ScrollTrigger
    gsap.registerPlugin(ScrollTrigger);

    // Inquiry Cart System
    let inquiryCart = [];

    // Loader Animation
    const loader = document.querySelector('.loader-wrapper');
    setTimeout(() => {
        loader.style.opacity = '0';
        setTimeout(() => {
            loader.style.display = 'none';
            initAnimations();
        }, 500);
    }, 1500);

    // Mobile Navigation
    const navToggle = document.getElementById('navToggle');
    const navLinks = document.getElementById('navLinks');

    if (navToggle) {
        navToggle.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            const icon = navToggle.querySelector('i');
            if (navLinks.classList.contains('active')) {
                icon.classList.remove('fa-bars');
                icon.classList.add('fa-times');
            } else {
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
            }
        });
    }

    // Sticky Navbar
    const navbar = document.querySelector('.navbar');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.style.boxShadow = '0 10px 30px rgba(0,0,0,0.1)';
            navbar.style.padding = '10px 0';
        } else {
            navbar.style.boxShadow = 'none';
            navbar.style.padding = '20px 0';
            navbar.style.borderBottom = '1px solid rgba(0,0,0,0.05)';
        }
    });

    // Inquiry Cart Functions
    function addToInquiry(product) {
        const exists = inquiryCart.find(item => item.id === product.id);
        if (!exists) {
            inquiryCart.push(product);
            updateCartUI();
            showNotification(`${product.name} added to inquiry!`);
        } else {
            showNotification('Already in inquiry cart!', 'warning');
        }
    }

    function removeFromInquiry(productId) {
        inquiryCart = inquiryCart.filter(item => item.id !== productId);
        updateCartUI();
        showNotification('Removed from inquiry');
    }

    function updateCartUI() {
        const cartCount = document.getElementById('cartCount');
        const cartItems = document.getElementById('cartItems');
        const emptyCart = document.getElementById('emptyCart');

        cartCount.textContent = inquiryCart.length;
        cartCount.style.display = inquiryCart.length > 0 ? 'flex' : 'none';

        if (inquiryCart.length === 0) {
            cartItems.style.display = 'none';
            emptyCart.style.display = 'block';
        } else {
            cartItems.style.display = 'block';
            emptyCart.style.display = 'none';
            cartItems.innerHTML = inquiryCart.map(item => `
                <div class="cart-item">
                    <img src="${item.image}" alt="${item.name}">
                    <div class="cart-item-info">
                        <h4>${item.name}</h4>
                        <p>${item.brand}</p>
                    </div>
                    <button class="remove-btn" onclick="removeFromInquiry('${item.id}')">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            `).join('');
        }
    }

    function showNotification(message, type = 'success') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
            <span>${message}</span>
        `;
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.classList.add('show');
        }, 100);

        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 2000);
    }

    // Make functions global
    window.addToInquiry = addToInquiry;
    window.removeFromInquiry = removeFromInquiry;
    window.sendInquiry = function () {
        if (inquiryCart.length === 0) {
            showNotification('Please add products to inquiry first!', 'warning');
            return;
        }

        const productList = inquiryCart.map(item => `- ${item.brand} ${item.name}`).join('\n');
        const message = `Hello! I'm interested in the following tiles:\n\n${productList}\n\nPlease contact me with more details.`;
        const whatsappNumber = '917550078321'; // Updated business number
        const whatsappURL = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;

        window.open(whatsappURL, '_blank');
    };

    // Toggle Cart Panel
    window.toggleCart = function () {
        const cartPanel = document.getElementById('cartPanel');
        cartPanel.classList.toggle('open');
    };

    // Dynamic Product Loading
    let allProducts = [];
    let displayedProducts = [];
    const itemsPerPage = 12;
    let currentPage = 1;
    let currentCategory = 'all';

    const productGrid = document.getElementById('productGrid');
    const loadMoreBtn = document.getElementById('loadMoreBtn');

    // Fetch Products
    fetch('products.json')
        .then(response => response.json())
        .then(data => {
            allProducts = data;
            filterProducts('all');
        })
        .catch(error => {
            console.error('Error loading products:', error);
            productGrid.innerHTML = '<p class="text-center">Failed to load products. Please try again later.</p>';
        });

    // Filter Function
    function filterProducts(category) {
        currentCategory = category;
        currentPage = 1;
        productGrid.innerHTML = '';

        if (category === 'all') {
            displayedProducts = allProducts;
        } else if (category === 'tiles') {
            displayedProducts = allProducts.filter(p => p.category === 'floor' || p.category === 'wall');
        } else {
            displayedProducts = allProducts.filter(p => p.category === category);
        }

        loadProducts();
    }

    // Load Products to Grid
    function loadProducts() {
        const start = (currentPage - 1) * itemsPerPage;
        const end = start + itemsPerPage;
        const productsToLoad = displayedProducts.slice(start, end);

        productsToLoad.forEach((product, index) => {
            const card = document.createElement('div');
            card.className = 'product-card';
            card.style.opacity = '0';
            card.style.transform = 'translateY(20px)';

            const dimensions = product.category === 'sanitary' ? 'Standard Size' : '600 x 600 mm';

            card.innerHTML = `
                <div class="product-img">
                    <span class="stock-badge">IN STOCK</span>
                    <img src="${product.image}" alt="${product.name}" loading="lazy" onerror="this.parentElement.classList.add('error'); this.style.display='none';">
                </div>
                <div class="product-info">
                    <span class="product-brand">${product.brand}</span>
                    <h3>${product.name}</h3>
                    <p class="product-dimensions">${dimensions}</p>
                    <div class="product-stock">
                        <i class="fas fa-check-circle"></i> In Stock
                    </div>
                    <button class="add-to-inquiry-btn" onclick='addToInquiry(${JSON.stringify(product).replace(/'/g, "&apos;")})'>
                        <i class="fas fa-plus-circle"></i> Add to Inquiry
                    </button>
                </div>
            `;
            productGrid.appendChild(card);

            gsap.to(card, {
                opacity: 1,
                y: 0,
                duration: 0.5,
                delay: index * 0.05,
                ease: "power2.out"
            });
        });

        if (end >= displayedProducts.length) {
            loadMoreBtn.style.display = 'none';
        } else {
            loadMoreBtn.style.display = 'inline-block';
        }
    }

    // Load More Event
    if (loadMoreBtn) {
        loadMoreBtn.addEventListener('click', () => {
            currentPage++;
            loadProducts();
        });
    }

    // Tab Click Events
    const tabBtns = document.querySelectorAll('.tab-btn');
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            tabBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const target = btn.getAttribute('data-target');
            filterProducts(target);
        });
    });

    // GSAP Animations
    function initAnimations() {
        gsap.to('.gsap-hero-text', {
            opacity: 1,
            y: 0,
            duration: 1,
            stagger: 0.2,
            ease: "power3.out"
        });

        gsap.to('.gsap-hero-btn', {
            opacity: 1,
            y: 0,
            duration: 1,
            delay: 0.6,
            ease: "power3.out"
        });

        gsap.utils.toArray('.gsap-fade-up').forEach(element => {
            gsap.from(element, {
                scrollTrigger: {
                    trigger: element,
                    start: "top 85%",
                    toggleActions: "play none none reverse"
                },
                opacity: 0,
                y: 50,
                duration: 0.8,
                ease: "power2.out"
            });
        });

        gsap.from('.gsap-fade-right', {
            scrollTrigger: {
                trigger: '.about',
                start: "top 80%"
            },
            opacity: 0,
            x: -50,
            duration: 1,
            ease: "power2.out"
        });

        gsap.from('.gsap-fade-left', {
            scrollTrigger: {
                trigger: '.about',
                start: "top 80%"
            },
            opacity: 0,
            x: 50,
            duration: 1,
            delay: 0.2,
            ease: "power2.out"
        });
    }
});
