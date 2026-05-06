// Shared Script for MS Enterprise

document.addEventListener('DOMContentLoaded', () => {
    // Mobile Menu Toggle
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');

    if (hamburger && navLinks) {
        hamburger.addEventListener('click', () => {
            navLinks.classList.toggle('nav-active');
            // Toggle hamburger icon (optional: change to 'X')
            if (navLinks.classList.contains('nav-active')) {
                hamburger.innerHTML = '<i class="fas fa-times"></i>';
            } else {
                hamburger.innerHTML = '<i class="fas fa-bars"></i>';
            }
        });
    }

    // Set Active Nav Link
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    const navItems = document.querySelectorAll('.nav-links a');
    navItems.forEach(link => {
        if (link.getAttribute('href') === currentPage) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });

    // Seed default products if none exist (called once on main pages)
    if (typeof seedDefaultProducts === 'function' && !window.location.pathname.includes('admin.html')) {
         seedDefaultProducts().then(() => {
             console.log("Check for seeding done.");
         });
    }

    // --- CRAZYYY UI INTERACTIONS ---

    // 1. Navbar Scroll Effect
    const navbar = document.querySelector('.navbar');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // 2. Scroll Reveal Animations (Intersection Observer)
    const revealElements = document.querySelectorAll('.reveal, .reveal-left, .reveal-right');
    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                observer.unobserve(entry.target); // Reveal only once for performance
            }
        });
    }, {
        threshold: 0.15,
        rootMargin: "0px 0px -50px 0px"
    });

    revealElements.forEach(el => revealObserver.observe(el));

    // 3. Parallax Hover Effect for Hero elements
    const hero = document.querySelector('.hero');
    if (hero) {
        hero.addEventListener('mousemove', (e) => {
            const x = (e.clientX / window.innerWidth - 0.5) * 20;
            const y = (e.clientY / window.innerHeight - 0.5) * 20;
            
            const heroContent = document.querySelector('.hero-content');
            if (heroContent) {
                heroContent.style.transform = `translate(${x}px, ${y}px)`;
            }
        });
        
        hero.addEventListener('mouseleave', () => {
            const heroContent = document.querySelector('.hero-content');
            if (heroContent) {
                heroContent.style.transform = `translate(0px, 0px)`;
                heroContent.style.transition = `transform 0.5s ease`;
                setTimeout(() => { heroContent.style.transition = ''; }, 500);
            }
        });
    }
});

// Utility: Format Currency
function formatCurrency(priceStr) {
    if (!priceStr) return '';
    if (priceStr.includes('₹')) return priceStr;
    const num = parseFloat(priceStr.replace(/,/g, ''));
    if (isNaN(num)) return priceStr;
    return '₹' + num.toLocaleString('en-IN');
}

// Contact Options Modal
function openEnquiryOptions(productNameOrService) {
    // Create modal if it doesn't exist
    if (!document.getElementById('enquiryOptionsModal')) {
        const modalHtml = `
            <div class="modal" id="enquiryOptionsModal" style="display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.8); z-index: 4000; align-items: center; justify-content: center; backdrop-filter: blur(5px);">
                <div class="modal-content glass-card" style="width: 90%; max-width: 400px; padding: 2rem; text-align: center; border-radius: 12px; position: relative; background: var(--dark-bg); border: 1px solid var(--glass-border);">
                    <i class="fas fa-times" onclick="closeEnquiryOptions()" style="position: absolute; top: 1rem; right: 1rem; font-size: 1.5rem; color: #fff; cursor: pointer;"></i>
                    <h3 style="margin-bottom: 1.5rem; font-family: 'Outfit', sans-serif;">How would you like to enquire?</h3>
                    <p id="enquiryContext" style="color: var(--text-muted); margin-bottom: 2rem; font-size: 0.9rem;"></p>
                    
                    <div style="display: flex; flex-direction: column; gap: 1rem;">
                        <button onclick="executeEnquiry('whatsapp')" class="btn" style="background: #25D366; color: white; width: 100%; display: flex; align-items: center; justify-content: center; gap: 0.5rem;">
                            <i class="fab fa-whatsapp" style="font-size: 1.2rem;"></i> WhatsApp
                        </button>
                        <button onclick="executeEnquiry('call')" class="btn" style="background: var(--primary); color: white; width: 100%; display: flex; align-items: center; justify-content: center; gap: 0.5rem;">
                            <i class="fas fa-phone-alt" style="font-size: 1.2rem;"></i> Call Us
                        </button>
                        <button onclick="executeEnquiry('email')" class="btn" style="background: var(--secondary); color: white; width: 100%; display: flex; align-items: center; justify-content: center; gap: 0.5rem;">
                            <i class="fas fa-envelope" style="font-size: 1.2rem;"></i> Email
                        </button>
                    </div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHtml);
        
        // Close on outside click
        document.getElementById('enquiryOptionsModal').addEventListener('click', (e) => {
            if (e.target.id === 'enquiryOptionsModal') closeEnquiryOptions();
        });
    }

    // Set context and show
    window.currentEnquiryContext = productNameOrService;
    document.getElementById('enquiryContext').textContent = `Regarding: ${productNameOrService}`;
    document.getElementById('enquiryOptionsModal').style.display = 'flex';
}

function closeEnquiryOptions() {
    const modal = document.getElementById('enquiryOptionsModal');
    if (modal) modal.style.display = 'none';
}

function executeEnquiry(method) {
    const context = window.currentEnquiryContext || 'General Enquiry';
    const phone = "919574757153";
    const localPhone = "9574757153";
    const email = "msenterprisedahod@gmail.com";
    
    if (method === 'whatsapp') {
        const message = `Hi MS Enterprise, I am interested in: ${context}. Please provide more details.`;
        window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, '_blank');
    } else if (method === 'call') {
        window.open(`tel:${localPhone}`, '_self');
    } else if (method === 'email') {
        const subject = `Enquiry regarding ${context}`;
        const body = `Hi MS Enterprise,\n\I would like to know more about ${context}.\n\nRegards,`;
        window.open(`mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`, '_blank');
    }
    closeEnquiryOptions();
}

// Keep old function for backwards compatibility, redirect to new modal
function sendWhatsAppMessage(message) {
    // Extract context from old message format if possible, or just use the message
    let context = "Your Services";
    if (message.includes("about ")) {
        context = message.split("about ")[1].replace(".", "");
    } else if (message.includes("in the ")) {
        context = message.split("in the ")[1].replace(".", "");
    }
    openEnquiryOptions(context);
}
