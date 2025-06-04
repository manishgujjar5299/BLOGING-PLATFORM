// Shared variables and functions for all pages
document.addEventListener('DOMContentLoaded', () => {
  // Check which page we're on
  const currentPage = window.location.pathname.split('/').pop();
  
  // Get current user if logged in
  const currentUser = JSON.parse(localStorage.getItem('currentUser'));
  
  // REGISTRATION FUNCTIONALITY
  const registerForm = document.getElementById('register-form');
  if (registerForm) {
    registerForm.addEventListener('submit', function(e) {
      e.preventDefault();
      const username = document.getElementById('username').value.trim();
      const password = document.getElementById('password').value;
      const role = document.getElementById('isAdmin') && document.getElementById('isAdmin').checked ? "admin" : "client";

      let users = JSON.parse(localStorage.getItem('users')) || [];
      // Check if username already exists
      const existingUser = users.find(user => user.username === username);
      if (existingUser) {
        alert('Username already exists. Please choose another.');
        return;
      }

      // Create new user
      const newUser = {
        username,
        password,
        role,
        createdAt: new Date().toISOString()
      };

      // Add to users array
      users.push(newUser);
      localStorage.setItem('users', JSON.stringify(users));

      // Redirect to login
      alert('Registration successful! Please login.');
      window.location.href = "login.html";
    });
  }

  // LOGIN FUNCTIONALITY
  const loginForm = document.getElementById('login-form');
  if (loginForm) {
    loginForm.addEventListener('submit', function(e) {
      e.preventDefault();
      const username = document.getElementById('username').value.trim();
      const password = document.getElementById('password').value;

      // Get users from localStorage
      let users = JSON.parse(localStorage.getItem('users')) || [];
      const user = users.find(u => u.username === username && u.password === password);

      if (user) {
        // Save current user
        localStorage.setItem('currentUser', JSON.stringify(user));
        
        // Redirect based on role
        if (user.role === "admin") {
          window.location.href = "admin-dashboard.html";
        } else {
          window.location.href = "client-dashboard.html";
        }
      } else {
        alert("Invalid username or password");
      }
    });
  }

  // LOGOUT FUNCTIONALITY
  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      localStorage.removeItem('currentUser');
      window.location.href = 'login.html';
    });
  }

  // CLIENT DASHBOARD FUNCTIONALITY
  if (currentPage === 'client-dashboard.html') {
    // Redirect if not logged in
    if (!currentUser) {
      window.location.href = 'login.html';
      return;
    }
    
    // Update welcome message
    const welcomeMessage = document.getElementById('welcome-message');
    if (welcomeMessage) {
      welcomeMessage.textContent = `Welcome, ${currentUser.username}!`;
    }
    
    // Handle blog creation
    const createForm = document.getElementById('create-blog-form');
    if (createForm) {
      createForm.addEventListener('submit', function(event) {
        event.preventDefault();
        
        const title = document.getElementById('title').value;
        const content = document.getElementById('content').value;
        
        if (!title || !content) {
          alert('Please fill in all fields');
          return;
        }
        
        const newBlog = {
          id: Date.now().toString(),
          author: currentUser.username,
          title,
          content,
          status: 'pending',
          date: new Date().toISOString(),
          createdAt: new Date().toISOString(),
          approvedAt: null,
          rejectionReason: null
        };
        
        // Get existing blogs
        let blogs = JSON.parse(localStorage.getItem('blogs')) || [];
        console.log('Existing blogs:', blogs);
        
        // Add new blog
        blogs.push(newBlog);
        
        // Save to localStorage
        localStorage.setItem('blogs', JSON.stringify(blogs));
        
        console.log('New blog saved:', newBlog);
        console.log('Updated blogs list:', blogs);
        
        alert('Blog submitted for approval!');
        
        // Clear form
        document.getElementById('title').value = '';
        document.getElementById('content').value = '';
        
        // Update display
        renderBlogs();
      });
    }
    
    // Initialize client dashboard
    renderBlogs();
    
    // Add event listeners for client dashboard controls
    const sortOrder = document.getElementById('sort-order');
    const searchBar = document.getElementById('search-bar');
    const statusFilter = document.getElementById('status-filter');
    
    if (sortOrder) sortOrder.addEventListener('change', renderBlogs);
    if (searchBar) searchBar.addEventListener('input', renderBlogs);
    if (statusFilter) statusFilter.addEventListener('change', renderBlogs);
  }
  
  // ADMIN DASHBOARD FUNCTIONALITY
  if (currentPage === 'admin-dashboard.html') {
    // Redirect if not logged in or not admin
    if (!currentUser) {
      window.location.href = 'login.html';
      return;
    }
    
    // YEH LINE BADLO:
    // if (!currentUser.isAdmin) {
    if (currentUser.role !== "admin") {
      alert('You do not have admin privileges');
      window.location.href = 'login.html';
      return;
    }
    
    // Initialize admin dashboard
    renderPendingBlogs();
  }
  
  // HOME PAGE FUNCTIONALITY
  if (currentPage === 'index.html' || currentPage === '') {
    const publicBlogList = document.getElementById('public-blog-list');
    if (publicBlogList) {
      // Get blogs
      const blogs = JSON.parse(localStorage.getItem('blogs')) || [];
      
      // Filter approved blogs (only from last 7 days)
      const now = new Date();
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const approvedBlogs = blogs
        .filter(blog => blog.status === 'approved' && new Date(blog.createdAt) >= sevenDaysAgo)
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 6); // latest 6 blogs

      // Display message if no approved blogs
      if (approvedBlogs.length === 0) {
        publicBlogList.innerHTML = '<p style="text-align:center;color:#aaa;">No blogs available yet. Be the first to share your thoughts!</p>';
        return;
      }

      // Clear previous blogs
      publicBlogList.innerHTML = '';

      // Display approved blogs with card style
      approvedBlogs.forEach(blog => {
        const excerpt = blog.content.length > 120 
          ? blog.content.substring(0, 120) + '...' 
          : blog.content;
        const blogDate = new Date(blog.createdAt).toLocaleDateString('en-US', {
          year: 'numeric', month: 'short', day: 'numeric'
        });
        const li = document.createElement('li');
        li.className = 'blog-card';
        li.innerHTML = `
          <div class="blog-content">
            <h3 class="blog-title">${blog.title}</h3>
            <p class="blog-excerpt">${excerpt}</p>
            <div class="blog-meta">
              <span>By ${blog.author}</span>
              <span>${blogDate}</span>
            </div>
          </div>
        `;
        publicBlogList.appendChild(li);
      });
    }
  }

  // RESET PASSWORD FUNCTIONALITY
  const resetForm = document.getElementById('reset-form');
  if (resetForm) {
    resetForm.addEventListener('submit', function(e) {
      e.preventDefault();
      const email = document.getElementById('email').value.trim();
      const newPassword = document.getElementById('new-password').value;
      const confirmPassword = document.getElementById('confirm-password').value;
      const messageDiv = document.getElementById('reset-message');

      // Check if passwords match
      if (newPassword !== confirmPassword) {
        messageDiv.textContent = 'Passwords do not match!';
        messageDiv.className = 'reset-message error';
        return;
      }

      // Get users from localStorage
      let users = JSON.parse(localStorage.getItem('users')) || [];
      const userIndex = users.findIndex(user => user.username === email);

      if (userIndex === -1) {
        messageDiv.textContent = 'User not found!';
        messageDiv.className = 'reset-message error';
        return;
      }

      // Update password
      users[userIndex].password = newPassword;
      localStorage.setItem('users', JSON.stringify(users));

      // Show success message
      messageDiv.textContent = 'Password has been reset successfully!';
      messageDiv.className = 'reset-message success';
      
      // Redirect to login page after 2 seconds
      setTimeout(() => {
        window.location.href = 'login.html';
      }, 2000);
    });
  }
});

// CLIENT DASHBOARD FUNCTIONS
function renderBlogs() {
  const list = document.getElementById('my-blog-list');
  if (!list) return;
  
  list.innerHTML = '';
  
  // Get current user
  const currentUser = JSON.parse(localStorage.getItem('currentUser'));
  if (!currentUser) return;
  
  // Get filters
  const searchBar = document.getElementById('search-bar');
  const sortOrder = document.getElementById('sort-order');
  const statusFilter = document.getElementById('status-filter');
  
  const searchQuery = searchBar ? searchBar.value.toLowerCase() : '';
  const sortBy = sortOrder ? sortOrder.value : 'newest';
  const status = statusFilter ? statusFilter.value : 'all';
  
  // Get blogs
  let blogs = JSON.parse(localStorage.getItem('blogs')) || [];
  
  // Filter blogs
  let filteredBlogs = blogs.filter(blog => blog.author === currentUser.username);
  
  // Apply status filter
  if (status !== 'all') {
    filteredBlogs = filteredBlogs.filter(blog => blog.status === status);
  }
  
  // Apply search filter
  if (searchQuery) {
    filteredBlogs = filteredBlogs.filter(blog => 
      blog.title.toLowerCase().includes(searchQuery)
    );
  }
  
  // Sort blogs
  filteredBlogs.sort((a, b) => {
    return sortBy === 'newest' 
      ? new Date(b.createdAt) - new Date(a.createdAt)
      : new Date(a.createdAt) - new Date(b.createdAt);
  });
  
  // Display message if no blogs
  if (filteredBlogs.length === 0) {
    list.innerHTML = '<p>No blogs found.</p>';
    return;
  }
  
  // Display blogs
  filteredBlogs.forEach(blog => {
    const li = document.createElement('li');
    li.innerHTML = `
      <h3>${blog.title}</h3>
      <p>${blog.content}</p>
      <p>Status: ${blog.status}</p>
      ${blog.status === 'approved' ? `<p>Approved On: ${new Date(blog.approvedAt).toLocaleDateString()}</p>` : ''}
      ${blog.status === 'rejected' ? `<p>Rejection Reason: ${blog.rejectionReason}</p>` : ''}
      <button onclick="editBlog(${blog.id})">Edit</button>
      <button onclick="deleteBlog(${blog.id})">Delete</button>
    `;
    list.appendChild(li);
  });
}

function editBlog(blogId) {
  const blogs = JSON.parse(localStorage.getItem('blogs')) || [];
  const blog = blogs.find(b => b.id === blogId);
  
  if (blog) {
    // Only allow editing pending or rejected blogs
    if (blog.status === 'approved') {
      alert('Cannot edit approved blogs.');
      return;
    }
    
    const newTitle = prompt('Edit title:', blog.title);
    const newContent = prompt('Edit content:', blog.content);
    
    if (newTitle && newContent) {
      blog.title = newTitle;
      blog.content = newContent;
      blog.status = 'pending'; // Reset to pending when edited
      localStorage.setItem('blogs', JSON.stringify(blogs));
      renderBlogs();
    }
  }
}

function deleteBlog(blogId) {
  if (confirm('Are you sure you want to delete this blog?')) {
    const blogs = JSON.parse(localStorage.getItem('blogs')) || [];
    const updatedBlogs = blogs.filter(blog => blog.id !== blogId);
    localStorage.setItem('blogs', JSON.stringify(updatedBlogs));
    renderBlogs();
  }
}

// ADMIN DASHBOARD FUNCTIONS
function renderPendingBlogs() {
  console.log('Rendering pending blogs...');
  const blogList = document.getElementById('pending-blog-list');
  if (!blogList) {
    console.error('Pending blog list element not found');
    return;
  }
  
  // Get blogs from localStorage
  const blogs = JSON.parse(localStorage.getItem('blogs')) || [];
  console.log('All blogs:', blogs);
  
  // Filter pending blogs
  const pendingBlogs = blogs.filter(blog => blog.status === 'pending');
  console.log('Pending blogs:', pendingBlogs);
  
  // Display message if no pending blogs
  if (pendingBlogs.length === 0) {
    blogList.innerHTML = '<p class="no-blogs">No pending blogs.</p>';
    return;
  }
  
  // Display pending blogs
  const blogsHTML = pendingBlogs.map(blog => {
    console.log('Processing blog:', blog);
    return `
      <li class="blog-item">
        <div class="blog-info">
          <h3>${blog.title}</h3>
          <p>${blog.content}</p>
          <p>Author: ${blog.author}</p>
          <p>Date: ${new Date(blog.date || blog.createdAt).toLocaleDateString()}</p>
        </div>
        <div class="blog-actions">
          <button onclick="approveBlog('${blog.id}')" class="approve-btn">
            <i class="fas fa-check"></i> Approve
          </button>
          <button onclick="rejectBlog('${blog.id}')" class="reject-btn">
            <i class="fas fa-times"></i> Reject
          </button>
        </div>
      </li>
    `;
  }).join('');
  
  blogList.innerHTML = blogsHTML;
}

function approveBlog(blogId) {
  console.log('Approving blog:', blogId);
  const blogs = JSON.parse(localStorage.getItem('blogs')) || [];
  const blogIndex = blogs.findIndex(b => b.id === blogId);
  
  if (blogIndex !== -1) {
    blogs[blogIndex].status = 'approved';
    blogs[blogIndex].approvedAt = new Date().toISOString();
    blogs[blogIndex].rejectionReason = null;
    localStorage.setItem('blogs', JSON.stringify(blogs));
    showNotification('Blog approved successfully!');
    renderPendingBlogs();
    loadDashboardStats();
  } else {
    showNotification('Error: Blog not found', 'error');
  }
}

function rejectBlog(blogId) {
  console.log('Rejecting blog:', blogId);
  const blogs = JSON.parse(localStorage.getItem('blogs')) || [];
  const blogIndex = blogs.findIndex(b => b.id === blogId);
  
  if (blogIndex !== -1) {
    const reason = prompt('Enter rejection reason:');
    if (reason) {
      blogs[blogIndex].status = 'rejected';
      blogs[blogIndex].rejectionReason = reason;
      blogs[blogIndex].approvedAt = null;
      localStorage.setItem('blogs', JSON.stringify(blogs));
      showNotification('Blog rejected successfully!');
      renderPendingBlogs();
      loadDashboardStats();
    } else {
      showNotification('Rejection reason is required', 'error');
    }
  } else {
    showNotification('Error: Blog not found', 'error');
  }
}

// Check if user is logged in for protected pages
function checkAuth() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const currentPage = window.location.pathname.split('/').pop();
    
    // Protected pages
    const protectedPages = ['admin-dashboard.html', 'client-dashboard.html'];
    
    if (protectedPages.includes(currentPage) && !currentUser) {
        window.location.href = 'login.html';
        return;
    }
    
    // Admin-only pages
    if (currentPage === 'admin-dashboard.html' && currentUser && currentUser.role !== "admin") {
        alert('You do not have admin privileges!');
        window.location.href = 'login.html';
        return;
    }
}

// Run auth check when page loads
document.addEventListener('DOMContentLoaded', checkAuth);

document.addEventListener('DOMContentLoaded', function() {
  const navToggle = document.getElementById('navToggle');
  const mainNav = document.getElementById('main-nav');
  if (navToggle && mainNav) {
    navToggle.addEventListener('click', function() {
      mainNav.classList.toggle('open');
    });
    // Optional: click outside to close
    document.addEventListener('click', function(e) {
      if (!mainNav.contains(e.target) && !navToggle.contains(e.target)) {
        mainNav.classList.remove('open');
      }
    });
  }

  // Show latest blogs in mobile mockup (home page only)
  if (document.getElementById('mobileBlogList')) {
    const blogs = JSON.parse(localStorage.getItem('blogs')) || [];
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const approvedBlogs = blogs
      .filter(blog => blog.status === 'approved' && new Date(blog.createdAt) >= sevenDaysAgo)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5);

    const mobileBlogList = document.getElementById('mobileBlogList');
    mobileBlogList.innerHTML = '';
    if (approvedBlogs.length === 0) {
      mobileBlogList.innerHTML = '<div style="color:#aaa;text-align:center;">No blogs yet!</div>';
    } else {
      approvedBlogs.forEach(blog => {
        const excerpt = blog.content.length > 60 ? blog.content.substring(0, 60) + '...' : blog.content;
        const blogDate = new Date(blog.createdAt).toLocaleDateString('en-US', {
          year: '2-digit', month: 'short', day: 'numeric'
        });
        mobileBlogList.innerHTML += `
          <div class="mobile-blog-card">
            <div class="mobile-blog-title">${blog.title}</div>
            <div class="mobile-blog-excerpt">${excerpt}</div>
            <div class="mobile-blog-meta">
              <span>${blog.author}</span>
              <span>${blogDate}</span>
            </div>
          </div>
        `;
      });
    }
  }

  // Mobile Feature Slider
  const featureSlides = [
    {
      title: "Hello User's",
      desc: "Welcome to our blogging platform! Share your thoughts and ideas with the world."
    },
    {
      title: "Easy Posting",
      desc: "Create and share your blogs in just a few clicks with our simple editor."
    },
    {
      title: "Admin Approval",
      desc: "All blogs are reviewed by admin for quality and safety before publishing."
    },
    {
      title: "Responsive Design",
      desc: "Enjoy a seamless experience on mobile, tablet, or desktop."
    },
    {
      title: "User Dashboard",
      desc: "Manage, edit, and track your blogs easily from your personal dashboard."
    },
    {
      title: "Secure Login",
      desc: "Your data is safe with secure authentication and privacy controls."
    }
  ];

  const slider = document.getElementById('mobileFeatureSlider');
  let currentSlide = 0;
  let autoSlideInterval;

  function renderSlides() {
    if (!slider) return;
    slider.innerHTML = '';
    const slide = featureSlides[currentSlide];
    const slideDiv = document.createElement('div');
    slideDiv.className = 'mobile-slide active';
    slideDiv.innerHTML = `
      <div class="mobile-slide-title">${slide.title}</div>
      <div class="mobile-slide-desc">${slide.desc}</div>
    `;
    slider.appendChild(slideDiv);
  }

  function showSlide(idx) {
    currentSlide = (idx + featureSlides.length) % featureSlides.length;
    renderSlides();
  }

  renderSlides();

  const prevBtn = document.getElementById('prevSlide');
  const nextBtn = document.getElementById('nextSlide');
  if (prevBtn && nextBtn) {
    prevBtn.onclick = () => {
      showSlide(currentSlide - 1);
      resetAutoSlide();
    };
    nextBtn.onclick = () => {
      showSlide(currentSlide + 1);
      resetAutoSlide();
    };
  }

  function autoSlide() {
    showSlide(currentSlide + 1);
  }
  function resetAutoSlide() {
    clearInterval(autoSlideInterval);
    autoSlideInterval = setInterval(autoSlide, 4000);
  }
  autoSlideInterval = setInterval(autoSlide, 4000);
});

document.querySelector('.register-form').addEventListener('submit', function(e) {
  e.preventDefault();
  const username = document.getElementById('reg-username').value.trim();
  const password = document.getElementById('reg-password').value;
  const email = document.getElementById('reg-email').value.trim();
  const role = "client"; // ya "admin" agar admin registration hai

  let users = JSON.parse(localStorage.getItem('users')) || [];
  users.push({ username, password, email, role });
  localStorage.setItem('users', JSON.stringify(users));

  // Redirect to login page
  window.location.href = "login.html";
});

// Sirf migration ke liye, login ke liye nahi
let users = JSON.parse(localStorage.getItem('users')) || [];
users = users.map(u => {
  if (u.isAdmin !== undefined) {
    u.role = u.isAdmin ? "admin" : "client";
    delete u.isAdmin;
  }
  return u;
});
localStorage.setItem('users', JSON.stringify(users));

// Social Login Functions
function signInWithGoogle() {
  // Initialize Google Sign-In
  const client = google.accounts.oauth2.initTokenClient({
    client_id: 'YOUR_GOOGLE_CLIENT_ID', // Replace with your Google Client ID
    scope: 'email profile',
    callback: (response) => {
      if (response.access_token) {
        // Get user info using the access token
        fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: {
            'Authorization': `Bearer ${response.access_token}`
          }
        })
        .then(res => res.json())
        .then(userData => {
          // Create user object
          const user = {
            username: userData.email,
            email: userData.email,
            name: userData.name,
            picture: userData.picture,
            role: "client"
          };
          
          // Save user data
          let users = JSON.parse(localStorage.getItem('users')) || [];
          const existingUser = users.find(u => u.email === userData.email);
          
          if (existingUser) {
            // If user exists, log them in
            localStorage.setItem('currentUser', JSON.stringify(existingUser));
            window.location.href = "client-dashboard.html";
          } else {
            // If new user, create account
            users.push(user);
            localStorage.setItem('users', JSON.stringify(users));
            localStorage.setItem('currentUser', JSON.stringify(user));
            window.location.href = "client-dashboard.html";
          }
        });
      }
    }
  });
  client.requestAccessToken();
}

function signInWithFacebook() {
  FB.init({
    appId: 'YOUR_FACEBOOK_APP_ID', // Replace with your Facebook App ID
    cookie: true,
    xfbml: true,
    version: 'v18.0'
  });

  FB.login(function(response) {
    if (response.authResponse) {
      FB.api('/me', { fields: 'name,email,picture' }, function(userData) {
        const user = {
          username: userData.email,
          email: userData.email,
          name: userData.name,
          picture: userData.picture.data.url,
          role: "client"
        };
        
        // Save user data
        let users = JSON.parse(localStorage.getItem('users')) || [];
        const existingUser = users.find(u => u.email === userData.email);
        
        if (existingUser) {
          // If user exists, log them in
          localStorage.setItem('currentUser', JSON.stringify(existingUser));
          window.location.href = "client-dashboard.html";
        } else {
          // If new user, create account
          users.push(user);
          localStorage.setItem('users', JSON.stringify(users));
          localStorage.setItem('currentUser', JSON.stringify(user));
          window.location.href = "client-dashboard.html";
        }
      });
    }
  }, { scope: 'email,public_profile' });
}

function signInWithTwitter() {
  // Initialize Twitter Sign-In
  window.twttr.widgets.createLoginButton(
    document.getElementById('twitter-login'),
    {
      text: 'Sign in with Twitter',
      callback: function(auth) {
        // Get user data
        fetch('https://api.twitter.com/2/users/me', {
          headers: {
            'Authorization': `Bearer ${auth.accessToken}`
          }
        })
        .then(response => response.json())
        .then(userData => {
          const user = {
            username: userData.data.username,
            email: userData.data.email,
            name: userData.data.name,
            picture: userData.data.profile_image_url,
            role: "client"
          };
          
          // Save user data
          let users = JSON.parse(localStorage.getItem('users')) || [];
          const existingUser = users.find(u => u.username === userData.data.username);
          
          if (existingUser) {
            // If user exists, log them in
            localStorage.setItem('currentUser', JSON.stringify(existingUser));
            window.location.href = "client-dashboard.html";
          } else {
            // If new user, create account
            users.push(user);
            localStorage.setItem('users', JSON.stringify(users));
            localStorage.setItem('currentUser', JSON.stringify(user));
            window.location.href = "client-dashboard.html";
          }
        });
      }
    }
  );
}

// Social Signup Functions
function handleGoogleSignUp() {
  // Initialize Google Sign-In
  google.accounts.id.initialize({
    client_id: 'YOUR_GOOGLE_CLIENT_ID', // Replace with your Google Client ID
    callback: handleGoogleSignUpResponse
  });
  google.accounts.id.prompt();
}

function handleGoogleSignUpResponse(response) {
  // Handle Google Sign-Up response
  const userData = {
    username: response.email,
    email: response.email,
    name: response.name,
    picture: response.picture,
    role: "client" // Default role for social signup
  };
  
  // Save user data
  let users = JSON.parse(localStorage.getItem('users')) || [];
  const existingUser = users.find(user => user.email === response.email);
  
  if (existingUser) {
    alert('This email is already registered. Please login instead.');
    window.location.href = 'login.html';
    return;
  }
  
  users.push(userData);
  localStorage.setItem('users', JSON.stringify(users));
  
  // Set current user and redirect
  localStorage.setItem('currentUser', JSON.stringify(userData));
  window.location.href = "client-dashboard.html";
}

function handleFacebookSignUp() {
  FB.init({
    appId: 'YOUR_FACEBOOK_APP_ID', // Replace with your Facebook App ID
    cookie: true,
    xfbml: true,
    version: 'v18.0'
  });

  FB.login(function(response) {
    if (response.authResponse) {
      FB.api('/me', { fields: 'name,email,picture' }, function(userData) {
        const user = {
          username: userData.email,
          email: userData.email,
          name: userData.name,
          picture: userData.picture.data.url,
          role: "client" // Default role for social signup
        };
        
        // Save user data
        let users = JSON.parse(localStorage.getItem('users')) || [];
        const existingUser = users.find(u => u.email === userData.email);
        
        if (existingUser) {
          alert('This email is already registered. Please login instead.');
          window.location.href = 'login.html';
          return;
        }
        
        users.push(user);
        localStorage.setItem('users', JSON.stringify(users));
        
        // Set current user and redirect
        localStorage.setItem('currentUser', JSON.stringify(user));
        window.location.href = "client-dashboard.html";
      });
    }
  }, { scope: 'email,public_profile' });
}

function handleTwitterSignUp() {
  // Initialize Twitter Sign-In
  window.twttr.widgets.createLoginButton(
    document.getElementById('twitter-login'),
    {
      text: 'Sign up with Twitter',
      callback: function(auth) {
        // Get user data
        fetch('https://api.twitter.com/2/users/me', {
          headers: {
            'Authorization': `Bearer ${auth.accessToken}`
          }
        })
        .then(response => response.json())
        .then(userData => {
          const user = {
            username: userData.data.username,
            email: userData.data.email,
            name: userData.data.name,
            picture: userData.data.profile_image_url,
            role: "client" // Default role for social signup
          };
          
          // Save user data
          let users = JSON.parse(localStorage.getItem('users')) || [];
          const existingUser = users.find(u => u.username === userData.data.username);
          
          if (existingUser) {
            alert('This account is already registered. Please login instead.');
            window.location.href = 'login.html';
            return;
          }
          
          users.push(user);
          localStorage.setItem('users', JSON.stringify(users));
          
          // Set current user and redirect
          localStorage.setItem('currentUser', JSON.stringify(user));
          window.location.href = "client-dashboard.html";
        });
      }
    }
  );
}

// Admin Dashboard Navigation
document.addEventListener('DOMContentLoaded', function() {
    console.log('Admin dashboard initializing...');
    // Check if user is logged in and is admin
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    console.log('Current user:', currentUser);
    
    if (!currentUser || currentUser.role !== 'admin') {
        console.log('User not logged in or not admin, redirecting...');
        window.location.href = 'login.html';
        return;
    }

    // Update admin name in sidebar
    const adminName = document.getElementById('admin-name');
    if (adminName) {
        adminName.textContent = currentUser.username;
    }

    // Initialize page specific functionality
    const currentPage = window.location.pathname.split('/').pop();
    console.log('Current page:', currentPage);
    
    switch(currentPage) {
        case 'admin-dashboard.html':
            console.log('Loading dashboard stats and activity...');
            loadDashboardStats();
            loadRecentActivity();
            break;
        case 'admin-pending-blogs.html':
            console.log('Loading pending blogs...');
            renderPendingBlogs();
            break;
        case 'admin-users.html':
            console.log('Loading users...');
            loadUsers();
            break;
        case 'admin-categories.html':
            console.log('Loading categories...');
            loadCategories();
            break;
        case 'admin-settings.html':
            console.log('Loading admin settings...');
            loadAdminSettings();
            break;
    }

    // Logout functionality
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function() {
            localStorage.removeItem('currentUser');
            window.location.href = 'login.html';
        });
    }
});

// Load Dashboard Statistics
function loadDashboardStats() {
    console.log('Loading dashboard stats...');
    const blogs = JSON.parse(localStorage.getItem('blogs')) || [];
    const users = JSON.parse(localStorage.getItem('users')) || [];

    console.log('Total blogs:', blogs.length);
    console.log('Total users:', users.length);
    console.log('Pending blogs:', blogs.filter(blog => blog.status === 'pending').length);
    console.log('Approved blogs:', blogs.filter(blog => blog.status === 'approved').length);

    document.getElementById('total-blogs').textContent = blogs.length;
    document.getElementById('total-users').textContent = users.length;
    document.getElementById('pending-count').textContent = blogs.filter(blog => blog.status === 'pending').length;
    document.getElementById('approved-count').textContent = blogs.filter(blog => blog.status === 'approved').length;
}

// Load Recent Activity
function loadRecentActivity() {
    console.log('Loading recent activity...');
    const activityList = document.getElementById('activity-list');
    const blogs = JSON.parse(localStorage.getItem('blogs')) || [];
    
    console.log('All blogs for activity:', blogs);
    
    // Sort blogs by date
    blogs.sort((a, b) => new Date(b.date || b.createdAt) - new Date(a.date || a.createdAt));
    
    // Get recent activities
    const recentActivities = blogs.slice(0, 5).map(blog => {
        return `
            <div class="activity-item">
                <div class="activity-icon">
                    <i class="fas fa-blog"></i>
                </div>
                <div class="activity-details">
                    <p>${blog.title}</p>
                    <small>${blog.status} by ${blog.author}</small>
                </div>
                <div class="activity-time">
                    ${new Date(blog.date || blog.createdAt).toLocaleDateString()}
                </div>
            </div>
        `;
    });

    activityList.innerHTML = recentActivities.join('');
}

// Load Users
function loadUsers() {
    const usersList = document.getElementById('users-list');
    const users = JSON.parse(localStorage.getItem('users')) || [];
    
    const usersHTML = users.map(user => {
        return `
            <tr>
                <td>${user.username}</td>
                <td>${user.role}</td>
                <td>
                    <span class="status-badge ${user.status}">${user.status}</span>
                </td>
                <td>
                    <button onclick="editUser('${user.id}')" class="edit-btn">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button onclick="deleteUser('${user.id}')" class="delete-btn">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `;
    });

    usersList.innerHTML = usersHTML.join('');
}

// Load Categories
function loadCategories() {
    const categoriesList = document.getElementById('categories-list');
    const categories = JSON.parse(localStorage.getItem('categories')) || [];
    
    const categoriesHTML = categories.map(category => {
        return `
            <div class="category-card">
                <h3>${category.name}</h3>
                <p>${category.description}</p>
                <div class="category-actions">
                    <button onclick="editCategory('${category.id}')" class="edit-btn">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button onclick="deleteCategory('${category.id}')" class="delete-btn">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `;
    });

    categoriesList.innerHTML = categoriesHTML.join('');
}

// Load Admin Settings
function loadAdminSettings() {
    const adminSettings = JSON.parse(localStorage.getItem('adminSettings')) || {};
    
    document.getElementById('admin-display-name').value = adminSettings.displayName || '';
    document.getElementById('admin-email').value = adminSettings.email || '';
    document.getElementById('email-notifications').checked = adminSettings.emailNotifications || false;
    document.getElementById('blog-notifications').checked = adminSettings.blogNotifications || false;
}

// Edit User
function editUser(userId) {
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const user = users.find(user => user.id === userId);
    
    if (user) {
        // Implement edit user functionality
        showNotification('Edit user functionality to be implemented');
    }
}

// Delete User
function deleteUser(userId) {
    if (confirm('Are you sure you want to delete this user?')) {
        const users = JSON.parse(localStorage.getItem('users')) || [];
        const updatedUsers = users.filter(user => user.id !== userId);
        localStorage.setItem('users', JSON.stringify(updatedUsers));
        loadUsers();
        loadDashboardStats();
        showNotification('User deleted successfully');
    }
}

// Edit Category
function editCategory(categoryId) {
    const categories = JSON.parse(localStorage.getItem('categories')) || [];
    const category = categories.find(category => category.id === categoryId);
    
    if (category) {
        // Implement edit category functionality
        showNotification('Edit category functionality to be implemented');
    }
}

// Delete Category
function deleteCategory(categoryId) {
    if (confirm('Are you sure you want to delete this category?')) {
        const categories = JSON.parse(localStorage.getItem('categories')) || [];
        const updatedCategories = categories.filter(category => category.id !== categoryId);
        localStorage.setItem('categories', JSON.stringify(updatedCategories));
        loadCategories();
        showNotification('Category deleted successfully');
    }
}

// Show Notification
function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}
