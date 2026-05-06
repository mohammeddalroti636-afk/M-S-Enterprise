// Supabase Configuration for MS Enterprise
const SUPABASE_URL = 'https://jgknswtrvsxmrvsmewoj.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impna25zd3RydnN4bXJ2c21ld29qIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgwMzU3OTEsImV4cCI6MjA5MzYxMTc5MX0.SFoIdTp0q6lhB0j9kaAxWmbTx7OYoGuN0NnvGt379DY';

// Initialize Supabase client
const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Admin password (stored in site_settings table)
const ADMIN_PASSWORD = 'Musa@8081';

// Product categories
const CATEGORIES = [
    'All',
    'CCTV Cameras',
    'Access Control',
    'Alarm Systems',
    'Video Door Phones',
    'Networking',
    'Other'
];

// Default product images (local fallbacks)
const DEFAULT_IMAGES = {
    'CCTV Cameras': 'images/cctv_camera.png',
    'Access Control': 'images/access_control.png',
    'Alarm Systems': 'images/alarm_system.png',
    'Video Door Phones': 'images/video_door_phone.png',
    'Networking': 'images/cctv_camera.png',
    'Other': 'images/cctv_camera.png'
};

// ========== PRODUCT CRUD FUNCTIONS ==========

async function fetchProducts(category = 'All') {
    let query = supabaseClient.from('products').select('*').order('created_at', { ascending: false });
    if (category && category !== 'All') {
        query = query.eq('category', category);
    }
    const { data, error } = await query;
    if (error) {
        console.error('Error fetching products:', error);
        return [];
    }
    return data || [];
}

async function fetchFeaturedProducts() {
    const { data, error } = await supabaseClient
        .from('products')
        .select('*')
        .eq('is_featured', true)
        .order('created_at', { ascending: false })
        .limit(6);
    if (error) {
        console.error('Error fetching featured products:', error);
        return [];
    }
    return data || [];
}

async function fetchProductById(id) {
    const { data, error } = await supabaseClient
        .from('products')
        .select('*')
        .eq('id', id)
        .single();
    if (error) {
        console.error('Error fetching product:', error);
        return null;
    }
    return data;
}

async function addProduct(product) {
    const { data, error } = await supabaseClient
        .from('products')
        .insert([product])
        .select();
    if (error) {
        console.error('Error adding product:', error);
        return null;
    }
    return data[0];
}

async function updateProduct(id, updates) {
    const { data, error } = await supabaseClient
        .from('products')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select();
    if (error) {
        console.error('Error updating product:', error);
        return null;
    }
    return data[0];
}

async function deleteProduct(id) {
    const { error } = await supabaseClient
        .from('products')
        .delete()
        .eq('id', id);
    if (error) {
        console.error('Error deleting product:', error);
        return false;
    }
    return true;
}

async function searchProducts(query) {
    const { data, error } = await supabaseClient
        .from('products')
        .select('*')
        .or(`name.ilike.%${query}%,description.ilike.%${query}%,category.ilike.%${query}%`)
        .order('created_at', { ascending: false });
    if (error) {
        console.error('Error searching products:', error);
        return [];
    }
    return data || [];
}

async function getProductCount() {
    const { count, error } = await supabaseClient
        .from('products')
        .select('*', { count: 'exact', head: true });
    if (error) return 0;
    return count || 0;
}

// ========== IMAGE UPLOAD ==========

async function uploadProductImage(file) {
    const fileExt = file.name.split('.').pop();
    const fileName = `product_${Date.now()}.${fileExt}`;
    const filePath = `products/${fileName}`;

    const { data, error } = await supabaseClient.storage
        .from('product-images')
        .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false
        });

    if (error) {
        console.error('Error uploading image:', error);
        // Fallback: convert to base64
        return await fileToBase64(file);
    }

    const { data: urlData } = supabaseClient.storage
        .from('product-images')
        .getPublicUrl(filePath);

    return urlData.publicUrl;
}

// ========== REVIEWS & FEEDBACK FUNCTIONS ==========

async function fetchProductReviews(productId) {
    const { data, error } = await supabaseClient
        .from('product_reviews')
        .select('*')
        .eq('product_id', productId)
        .order('created_at', { ascending: false });
    if (error) {
        console.error('Error fetching reviews:', error);
        return [];
    }
    return data || [];
}

async function submitProductReview(productId, name, rating, comment) {
    const { data, error } = await supabaseClient
        .from('product_reviews')
        .insert([{ product_id: productId, name, rating, comment }]);
    if (error) console.error('Error submitting review:', error);
    return { data, error };
}

async function submitSiteFeedback(name, rating, message) {
    const { data, error } = await supabaseClient
        .from('site_feedback')
        .insert([{ name, rating, message }]);
    if (error) console.error('Error submitting feedback:', error);
    return { data, error };
}

function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
    });
}

// ========== SEED DEFAULT PRODUCTS ==========

async function seedDefaultProducts() {
    const count = await getProductCount();
    if (count > 0) return; // Already has products

    const defaultProducts = [
        {
            name: 'HD Dome CCTV Camera',
            description: 'High-definition 1080p dome camera with night vision, weatherproof design, and wide-angle lens. Perfect for indoor and outdoor surveillance. Features motion detection, remote viewing via mobile app, and 30-meter IR night vision range.',
            category: 'CCTV Cameras',
            price: '₹3,500',
            image_url: 'images/cctv_camera.png',
            features: 'Full HD 1080p,Night Vision 30m,Weatherproof IP67,Motion Detection,Mobile App Access,Wide Angle Lens',
            is_featured: true
        },
        {
            name: 'Biometric Access Control System',
            description: 'Advanced biometric access control with fingerprint scanner and RFID card reader. Supports up to 3000 fingerprints and 10000 card users. Features time attendance tracking, TCP/IP connectivity, and door relay control.',
            category: 'Access Control',
            price: '₹8,500',
            image_url: 'images/access_control.png',
            features: 'Fingerprint Scanner,RFID Card Reader,3000 Users,Time Attendance,TCP/IP Network,Door Relay Control',
            is_featured: true
        },
        {
            name: 'Smart Alarm System',
            description: 'Comprehensive security alarm system with wireless sensors, smoke detectors, and motion sensors. Includes GSM module for SMS alerts, siren output, and mobile app control. Protects homes and businesses from intrusion and fire.',
            category: 'Alarm Systems',
            price: '₹12,000',
            image_url: 'images/alarm_system.png',
            features: 'Wireless Sensors,Smoke Detection,Motion Sensors,GSM SMS Alerts,Mobile App Control,Siren Output',
            is_featured: true
        },
        {
            name: 'Video Door Phone System',
            description: 'Modern video door phone with 7-inch color touchscreen display and HD camera unit. Features night vision, two-way audio, unlock button, and multi-apartment support. Sleek design suitable for homes and offices.',
            category: 'Video Door Phones',
            price: '₹6,500',
            image_url: 'images/video_door_phone.png',
            features: '7-inch Touchscreen,HD Camera,Night Vision,Two-way Audio,Remote Unlock,Multi-apartment Support',
            is_featured: true
        },
        {
            name: '4-Channel DVR System',
            description: 'Digital Video Recorder supporting 4 cameras with H.265+ compression, remote playback, and motion detection recording. Supports up to 8TB HDD storage, HDMI and VGA output, and P2P cloud access.',
            category: 'CCTV Cameras',
            price: '₹5,200',
            image_url: 'images/cctv_camera.png',
            features: '4 Channels,H.265+ Compression,8TB Storage,HDMI Output,P2P Cloud Access,Motion Recording',
            is_featured: false
        },
        {
            name: 'Wireless PIR Motion Sensor',
            description: 'Passive infrared motion sensor for alarm system integration. 12-meter detection range with 110° wide angle. Pet-immune technology prevents false alarms. Battery powered with low battery alert.',
            category: 'Alarm Systems',
            price: '₹1,800',
            image_url: 'images/alarm_system.png',
            features: '12m Range,110° Wide Angle,Pet Immune,Battery Powered,Low Battery Alert,Wireless 433MHz',
            is_featured: false
        }
    ];

    for (const product of defaultProducts) {
        await addProduct(product);
    }
    console.log('Default products seeded successfully');
}
