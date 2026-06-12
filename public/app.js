/* ==========================================================================
   GreenConnectX - Client-Side Mockups with Live PostgreSQL Waitlist API
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  console.log('[DEBUG] DOM Content Loaded');
  
  // Force show all animated sections immediately for better compatibility
  const animatedElements = document.querySelectorAll('.animate-on-scroll');
  animatedElements.forEach((element, index) => {
    element.classList.add('appear');
    console.log(`[DEBUG] Made animated element ${index} visible`);
  });

  // 1. Scroll-Driven Entry Animations (Intersection Observer)
  const animElements = document.querySelectorAll('.animate-on-scroll');
  const scrollObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('appear');
        scrollObserver.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.12,
    rootMargin: '0px 0px -50px 0px'
  });

  animElements.forEach(el => scrollObserver.observe(el));

  // 2. Mobile Navigation Toggle
  const menuToggle = document.getElementById('menu-toggle');
  const navLinks = document.getElementById('nav-links');

  if (menuToggle && navLinks) {
    menuToggle.addEventListener('click', () => {
      navLinks.classList.toggle('active');
      const spans = menuToggle.querySelectorAll('span');
      spans[0].style.transform = navLinks.classList.contains('active') ? 'rotate(45deg) translate(5px, 5px)' : 'none';
      spans[1].style.opacity = navLinks.classList.contains('active') ? '0' : '1';
      spans[2].style.transform = navLinks.classList.contains('active') ? 'rotate(-45deg) translate(5px, -5px)' : 'none';
    });

    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        navLinks.classList.remove('active');
        const spans = menuToggle.querySelectorAll('span');
        spans[0].style.transform = 'none';
        spans[1].style.opacity = '1';
        spans[2].style.transform = 'none';
      });
    });
  }

  // 3. Before/After Comparison Slider (Why GreenConnectX)
  const comparisonBox = document.getElementById('why-comparison');
  const comparisonToggle = document.getElementById('comparison-toggle');

  if (comparisonBox && comparisonToggle) {
    comparisonToggle.addEventListener('click', () => {
      comparisonBox.classList.toggle('show-after');
      if (comparisonBox.classList.contains('show-after')) {
        comparisonToggle.textContent = 'Show Without GreenConnectX';
      } else {
        comparisonToggle.textContent = 'Show With GreenConnectX';
      }
    });
  }

  // 4. Showcase Viewport Tab Switching Logic
  const tabButtons = document.querySelectorAll('.tab-btn');
  const mockupScreens = document.querySelectorAll('.mockup-screen');

  window.switchMockupTab = function(screenId) {
    tabButtons.forEach(btn => {
      if (btn.getAttribute('data-target') === screenId) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    mockupScreens.forEach(screen => {
      if (screen.id === screenId) {
        screen.classList.add('active');
      } else {
        screen.classList.remove('active');
      }
    });
  };

  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetId = btn.getAttribute('data-target');
      switchMockupTab(targetId);
    });
  });

  // 5. GPS Location Tagging (Simulated)
  const gpsBtn = document.getElementById('btn-mock-gps');
  const locationInput = document.getElementById('report-location');

  if (gpsBtn && locationInput) {
    gpsBtn.addEventListener('click', () => {
      gpsBtn.innerHTML = '⌛ Tagging...';
      gpsBtn.disabled = true;

      setTimeout(() => {
        const lat = (40.7300 + Math.random() * 0.01).toFixed(4);
        const lng = (-73.9350 - Math.random() * 0.01).toFixed(4);
        locationInput.value = `${lat}° N, ${lng}° W (Sector 4 - Tagged)`;
        gpsBtn.innerHTML = '✓ Tagged';
        gpsBtn.style.color = 'var(--primary)';
        gpsBtn.disabled = false;
      }, 1000);
    });
  }

  // 6. Interactive Map Pins (Simulated logic using LocalStorage)
  const pins = document.querySelectorAll('.map-pin');
  const popup = document.getElementById('map-popup');
  const popupTitle = document.getElementById('popup-title');
  const popupDesc = document.getElementById('popup-desc');
  const popupStatus = document.getElementById('popup-status');
  const popupVotes = document.getElementById('popup-votes');
  const popupVoteBtn = document.getElementById('btn-popup-vote');

  const pinData = {
    "1": {
      title: "Overflowing Garbage Pile",
      description: "Large dump of single-use plastics and packaging bags blocking the pathway near community center.",
      status: "Pending",
      statusColor: "rgba(245, 158, 11, 0.1)",
      statusTextColor: "var(--status-pending)",
      upvotes: 14,
      voted: false
    },
    "2": {
      title: "Active Main Water Leak",
      description: "Drinking water pooling onto main street road from cracked utility pipe. Needs emergency patch.",
      status: "In Progress",
      statusColor: "rgba(59, 130, 246, 0.1)",
      statusTextColor: "var(--status-progress)",
      upvotes: 38,
      voted: false
    },
    "3": {
      title: "Illegal Toxic Dump Remediation",
      description: "Discarded car battery boxes and metal scraps removed safely. Sector 4 team cleaned the zone.",
      status: "Resolved",
      statusColor: "rgba(16, 185, 129, 0.1)",
      statusTextColor: "var(--status-resolved)",
      upvotes: 84,
      voted: false
    },
    "4": {
      title: "Main Street Damaged Light",
      description: "Civic streetlight flickering continuously, causing safety hazards after sunset.",
      status: "Pending",
      statusColor: "rgba(245, 158, 11, 0.1)",
      statusTextColor: "var(--status-pending)",
      upvotes: 9,
      voted: false
    }
  };

  // Synchronize pinData upvote metrics from localStorage
  Object.keys(pinData).forEach(id => {
    const localVotes = localStorage.getItem(`mock-votes-pin-${id}`);
    if (localVotes) pinData[id].upvotes = parseInt(localVotes, 10);
    
    const localHasVoted = localStorage.getItem(`mock-hasvoted-pin-${id}`) === 'true';
    pinData[id].voted = localHasVoted;
  });

  let activePinId = null;

  pins.forEach(pin => {
    pin.addEventListener('click', (e) => {
      e.stopPropagation();
      const pinId = pin.getAttribute('data-id');
      const data = pinData[pinId];
      if (!data) return;

      activePinId = pinId;

      popupTitle.textContent = data.title;
      popupDesc.textContent = data.description;
      popupStatus.textContent = data.status;
      popupStatus.style.background = data.statusColor;
      popupStatus.style.color = data.statusTextColor;
      popupVotes.textContent = `${data.upvotes} Upvotes`;

      if (data.voted) {
        popupVoteBtn.textContent = 'Upvoted! ✓';
        popupVoteBtn.style.background = 'var(--primary)';
        popupVoteBtn.style.color = 'var(--bg-dark)';
      } else {
        popupVoteBtn.textContent = '👍 Upvote';
        popupVoteBtn.style.background = 'rgba(16, 185, 129, 0.1)';
        popupVoteBtn.style.color = 'var(--primary)';
      }

      popup.classList.add('active');
    });
  });

  if (popupVoteBtn) {
    popupVoteBtn.addEventListener('click', () => {
      if (!activePinId || !pinData[activePinId]) return;
      
      const data = pinData[activePinId];

      if (!data.voted) {
        data.upvotes += 1;
        data.voted = true;
        popupVoteBtn.textContent = 'Upvoted! ✓';
        popupVoteBtn.style.background = 'var(--primary)';
        popupVoteBtn.style.color = 'var(--bg-dark)';
      } else {
        data.upvotes -= 1;
        data.voted = false;
        popupVoteBtn.textContent = '👍 Upvote';
        popupVoteBtn.style.background = 'rgba(16, 185, 129, 0.1)';
        popupVoteBtn.style.color = 'var(--primary)';
      }

      popupVotes.textContent = `${data.upvotes} Upvotes`;
      
      // Save state to localStorage
      localStorage.setItem(`mock-votes-pin-${activePinId}`, data.upvotes);
      localStorage.setItem(`mock-hasvoted-pin-${activePinId}`, data.voted);
    });
  }

  const mapCanvas = document.querySelector('.map-canvas');
  if (mapCanvas) {
    mapCanvas.addEventListener('click', () => {
      popup.classList.remove('active');
      activePinId = null;
    });
  }

  // 7. Simulated Issue Form Submission (Integration with Map & Feed UI)
  const reportForm = document.getElementById('mock-report-form');
  const feedContainer = document.getElementById('feed-container');

  // Trigger hidden file input selector clicks
  window.handleFileSelect = function(input) {
    if (input.files && input.files[0]) {
      const file = input.files[0];
      const label = document.getElementById('upload-label');
      label.textContent = `Attached: ${file.name} (Preview Ready)`;
      label.style.color = 'var(--primary)';
    }
  };

  window.handleMockSubmit = function(event) {
    event.preventDefault();

    const title = document.getElementById('report-title').value;
    const category = document.getElementById('report-category').value;
    const location = document.getElementById('report-location').value || "Auto Coordinates Set";
    const desc = document.getElementById('report-desc').value;

    // Add mock card directly to feed UI
    const newPost = document.createElement('div');
    newPost.className = 'feed-post-card';
    newPost.style.border = '1px solid var(--primary)';
    newPost.style.animation = 'fade-in-up 0.5s ease forwards';
    newPost.innerHTML = `
      <div class="post-author">
        <div class="author-avatar" style="background:var(--primary); color:var(--bg-dark);">YT</div>
        <div class="author-info">
          <h6>You (Active Tester)</h6>
          <span>Just now • ${location.split('(')[0].trim() || 'Sector 4'}</span>
        </div>
      </div>
      <div class="post-content">
        <p><strong>[${category}] - ${title}</strong></p>
        <p>${desc}</p>
        <div style="font-size:0.75rem; background:rgba(245,158,11,0.06); border:1px solid rgba(245,158,11,0.2); border-radius:6px; padding:6px 12px; display:inline-block; color:#fbbf24; font-weight:700;">
          ⚠️ Concept Verification Pending
        </div>
      </div>
      <div class="post-actions" style="margin-top:12px;">
        <button class="post-action-btn">👍 Upvote (0)</button>
        <button class="post-action-btn">💬 Comment (0)</button>
      </div>
    `;

    feedContainer.insertBefore(newPost, feedContainer.firstChild);

    // Add glowing pin indicator to mock map
    const newPinId = Object.keys(pinData).length + 1;
    const newPin = document.createElement('div');
    newPin.className = `map-pin`;
    newPin.setAttribute('data-id', newPinId);
    
    const topVal = 40 + Math.random() * 40;
    const leftVal = 20 + Math.random() * 60;
    newPin.style.top = `${topVal}%`;
    newPin.style.left = `${leftVal}%`;
    newPin.style.background = 'var(--status-pending)';
    newPin.style.color = 'var(--status-pending)';

    mapCanvas.appendChild(newPin);

    pinData[newPinId] = {
      title: title,
      description: desc,
      status: "Pending",
      statusColor: "rgba(245, 158, 11, 0.1)",
      statusTextColor: "var(--status-pending)",
      upvotes: 0,
      voted: false
    };

    newPin.addEventListener('click', (e) => {
      e.stopPropagation();
      activePinId = newPinId;
      const data = pinData[newPinId];
      popupTitle.textContent = data.title;
      popupDesc.textContent = data.description;
      popupStatus.textContent = data.status;
      popupStatus.style.background = data.statusColor;
      popupStatus.style.color = data.statusTextColor;
      popupVotes.textContent = `${data.upvotes} Upvotes`;
      popupVoteBtn.textContent = '👍 Upvote';
      popupVoteBtn.style.background = 'rgba(16, 185, 129, 0.1)';
      popupVoteBtn.style.color = 'var(--primary)';
      popup.classList.add('active');
    });

    reportForm.reset();
    const uploadLabel = document.getElementById('upload-label');
    uploadLabel.textContent = 'Click to upload photos';
    uploadLabel.style.color = 'var(--text-muted)';
    
    if (gpsBtn) {
      gpsBtn.innerHTML = '📍 Auto Tag GPS';
      gpsBtn.style.color = 'var(--text-pure)';
    }

    alert(`Success! "${title}" has been filed.\n\nRedirecting you to the live Community Feed to see your mock post!`);
    switchMockupTab('screen-feed');
  };

  // 8. Cleanup Drives RSVP logic (Mocked with LocalStorage)
  const driveStates = {
    1: { count: 48, joined: false, elementCount: 'drive-1-count', elementProgress: 'drive-1-progress', btn: 'btn-drive-1', max: 60 },
    2: { count: 12, joined: false, elementCount: 'drive-2-count', elementProgress: 'drive-2-progress', btn: 'btn-drive-2', max: 30 }
  };

  // Load drives state from LocalStorage
  Object.keys(driveStates).forEach(id => {
    const localJoined = localStorage.getItem(`mock-joined-drive-${id}`) === 'true';
    if (localJoined) {
      driveStates[id].joined = true;
      driveStates[id].count += 1;
    }
  });

  // Render initial drives stats
  Object.keys(driveStates).forEach(id => {
    const drive = driveStates[id];
    const countEl = document.getElementById(drive.elementCount);
    const progressEl = document.getElementById(drive.elementProgress);
    const btnEl = document.getElementById(drive.btn);
    
    if (countEl && progressEl && btnEl) {
      countEl.textContent = drive.count;
      const percentage = (drive.count / drive.max) * 100;
      progressEl.style.width = `${percentage}%`;
      
      if (drive.joined) {
        btnEl.textContent = 'Joined! ✓';
        btnEl.classList.add('joined');
      }
    }
  });

  window.toggleJoinDrive = function(driveId) {
    const drive = driveStates[driveId];
    if (!drive) return;

    const countEl = document.getElementById(drive.elementCount);
    const progressEl = document.getElementById(drive.elementProgress);
    const btnEl = document.getElementById(drive.btn);

    if (!drive.joined) {
      drive.count += 1;
      drive.joined = true;
      btnEl.textContent = 'Joined! ✓';
      btnEl.classList.add('joined');
    } else {
      drive.count -= 1;
      drive.joined = false;
      btnEl.textContent = 'Join Cleanup Drive';
      btnEl.classList.remove('joined');
    }

    countEl.textContent = drive.count;
    const percentage = (drive.count / drive.max) * 100;
    progressEl.style.width = `${percentage}%`;
    
    localStorage.setItem(`mock-joined-drive-${driveId}`, drive.joined);
  };

  /* ==========================================================================
     API INTEGRATION - REAL POSTGRESQL WAITLIST SIGNUP
     ========================================================================== */
  const waitlistForm = document.getElementById('waitlist-form');
  const waitlistSuccess = document.getElementById('waitlist-success');

  window.submitWaitlist = function(event) {
    event.preventDefault();
    const email = document.getElementById('waitlist-email').value;

    // Client-side validation
    if (!email || !email.includes('@') || email.length < 5) {
      alert('❌ Please enter a valid email address.');
      return;
    }

    fetch('/api/waitlist', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email })
    })
    .then(async res => {
      const text = await res.text();
      console.log('Server response:', text);
      
      if (res.ok) {
        waitlistForm.style.display = 'none';
        waitlistSuccess.style.display = 'block';
      } else {
        try {
          const data = JSON.parse(text);
          // Show specific error messages
          if (data.error.includes('already registered')) {
            alert('✅ This email is already on our waitlist! You\'ll be notified when we launch.');
          } else if (data.error.includes('valid email')) {
            alert('❌ Please enter a valid email address.');
          } else if (data.error.includes('Database connection')) {
            alert('⚠️ Server is temporarily unavailable. Please try again in a moment.');
          } else {
            alert('❌ ' + data.error);
          }
        } catch (e) {
          console.error('Server returned non-JSON:', text);
          alert('⚠️ Server error occurred. Please try again or check your internet connection.');
        }
      }
    })
    .catch(err => {
      console.error('[API Error] Waitlist submit error:', err);
      alert('⚠️ Network error. Please check your internet connection and try again.');
    });
  };
  };

  // 10. Interactive Footer Modals Controller
  window.openModal = function(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.add('active');
      document.body.style.overflow = 'hidden'; // Lock background scrolling
    }
  };

  window.closeModal = function(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.remove('active');
      document.body.style.overflow = 'auto'; // Release background scrolling
      
      // If closing contact modal, reset its form views
      if (modalId === 'modal-contact') {
        setTimeout(() => {
          document.getElementById('contact-form').style.display = 'flex';
          document.getElementById('contact-success').style.display = 'none';
          document.getElementById('contact-form').reset();
        }, 400);
      }
    }
  };

  // 11. Contact Form Submit - Real API Integration
  window.submitContactForm = function(event) {
    event.preventDefault();
    const name = document.getElementById('contact-name').value;
    const email = document.getElementById('contact-email').value;
    const msg = document.getElementById('contact-msg').value;

    // Client-side validation with specific messages
    if (!name || name.trim().length < 2) {
      alert('❌ Name must be at least 2 characters long.');
      return;
    }
    
    if (!email || !email.includes('@')) {
      alert('❌ Please enter a valid email address.');
      return;
    }
    
    if (!msg || msg.trim().length < 10) {
      alert('❌ Message is too short. Please write at least 10 characters.');
      return;
    }

    // Show loading state
    const submitBtn = document.querySelector('#contact-form button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Sending...';
    submitBtn.disabled = true;

    // Send to real API
    fetch('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: name, email: email, message: msg })
    })
    .then(async res => {
      const text = await res.text();
      console.log('Contact server response:', text);
      
      if (res.ok) {
        try {
          const data = JSON.parse(text);
          // Hide contact form and show success
          document.getElementById('contact-form').style.display = 'none';
          document.getElementById('contact-success').style.display = 'block';
          console.log('[Contact] Message sent successfully:', data);
        } catch (e) {
          console.error('Contact response was not JSON:', text);
          // Still show success if status is ok
          document.getElementById('contact-form').style.display = 'none';
          document.getElementById('contact-success').style.display = 'block';
        }
      } else {
        try {
          const data = JSON.parse(text);
          // Show specific server error message
          if (data.error.includes('Name must be')) {
            alert('❌ ' + data.error);
          } else if (data.error.includes('email')) {
            alert('❌ ' + data.error);
          } else if (data.error.includes('Message must be')) {
            alert('❌ Message is too short. Please write at least 10 characters.');
          } else if (data.error.includes('Database connection')) {
            alert('⚠️ Server is temporarily unavailable. Please try again in a moment.');
          } else {
            alert('❌ ' + data.error);
          }
        } catch (e) {
          console.error('Server returned non-JSON error:', text);
          alert('⚠️ Server error occurred. Please try again or check your internet connection.');
        }
      }
      
      // Reset button state
      submitBtn.textContent = originalText;
      submitBtn.disabled = false;
    })
    .catch(err => {
      console.error('[Contact API Error]', err);
      alert('⚠️ Network error. Please check your internet connection and try again.');
      
      // Reset button state on error
      submitBtn.textContent = originalText;
      submitBtn.disabled = false;
    });
  };

  // 12. Interactive Background Mouse Parallax
  const bgGrid = document.querySelector('.background-grid');
  if (bgGrid) {
    document.addEventListener('mousemove', (e) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 15; // max 15px shift
      const y = (e.clientY / window.innerHeight - 0.5) * 15;
      bgGrid.style.transform = `translate(${x}px, ${y}px)`;
    });
  }

});
