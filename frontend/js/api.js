// API Helper Functions
// Centralized API communication with authentication

const API_BASE_URL = 'http://127.0.0.1:8000';

/**
 * Get auth token from localStorage
 */
function getAuthToken() {
  return localStorage.getItem('auth_token');
}

/**
 * Make authenticated API request
 */
async function apiRequest(endpoint, options = {}) {
  const token = getAuthToken();
  
  const defaultHeaders = {
    'Content-Type': 'application/json',
  };
  
  // Add auth token if available
  if (token) {
    defaultHeaders['Authorization'] = `Bearer ${token}`;
  }
  
  const config = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  };
  
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    
    // Handle 401 Unauthorized
    if (response.status === 401) {
      localStorage.removeItem('auth_token');
      window.location.href = 'login.html';
      throw new Error('Unauthorized - Please login again');
    }
    
    // Handle other errors
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || `HTTP Error: ${response.status}`);
    }
    
    // Handle 204 No Content
    if (response.status === 204) {
      return null;
    }
    
    return await response.json();
    
  } catch (error) {
    console.error('API Request Error:', error);
    throw error;
  }
}

// ============================================
// Campaign API Functions
// ============================================

/**
 * Get all campaigns
 */
async function getCampaigns() {
  return await apiRequest('/campaigns/');
}

/**
 * Get single campaign
 */
async function getCampaign(campaignId) {
  return await apiRequest(`/campaigns/${campaignId}`);
}

/**
 * Create new campaign
 */
async function createCampaign(data) {
  return await apiRequest('/campaigns/', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

/**
 * Update campaign
 */
async function updateCampaign(campaignId, data) {
  return await apiRequest(`/campaigns/${campaignId}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

/**
 * Delete campaign
 */
async function deleteCampaign(campaignId) {
  return await apiRequest(`/campaigns/${campaignId}`, {
    method: 'DELETE',
  });
}

/**
 * Get campaign analytics
 */
async function getCampaignAnalytics(campaignId) {
  return await apiRequest(`/campaigns/${campaignId}/analytics`);
}

// ============================================
// Video API Functions
// ============================================

/**
 * Get videos for a campaign
 */
async function getCampaignVideos(campaignId) {
  return await apiRequest(`/videos/campaigns/${campaignId}/videos`);
}

/**
 * Add video to campaign
 */
async function addVideoToCampaign(campaignId, tiktokUrl) {
  return await apiRequest(`/videos/campaigns/${campaignId}/videos`, {
    method: 'POST',
    body: JSON.stringify({ tiktok_url: tiktokUrl }),
  });
}

/**
 * Get single video
 */
async function getVideo(videoId) {
  return await apiRequest(`/videos/videos/${videoId}`);
}

/**
 * Re-scrape video
 */
async function rescrapeVideo(videoId) {
  return await apiRequest(`/videos/videos/${videoId}/rescrape`, {
    method: 'POST',
  });
}

/**
 * Delete video
 */
async function deleteVideo(videoId) {
  return await apiRequest(`/videos/videos/${videoId}`, {
    method: 'DELETE',
  });
}

// ============================================
// Utility Functions
// ============================================

/**
 * Format number with commas
 */
function formatNumber(num) {
  if (num === null || num === undefined) return '0';
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

/**
 * Format date
 */
function formatDate(dateString) {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

/**
 * Format currency
 */
function formatCurrency(amount) {
  if (amount === null || amount === undefined) return '$0.00';
  return `$${parseFloat(amount).toFixed(2)}`;
}

/**
 * Format percentage
 */
function formatPercentage(num) {
  if (num === null || num === undefined) return '0%';
  return `${parseFloat(num).toFixed(2)}%`;
}

/**
 * Get status badge color
 */
function getStatusColor(status) {
  switch (status) {
    case 'completed':
      return 'bg-green-100 text-green-800';
    case 'pending':
      return 'bg-yellow-100 text-yellow-800';
    case 'failed':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}

/**
 * Show loading spinner
 */
function showLoading(elementId) {
  const element = document.getElementById(elementId);
  if (element) {
    element.innerHTML = `
      <div class="flex items-center justify-center py-12">
        <i class="fas fa-spinner fa-spin text-4xl text-purple-600"></i>
      </div>
    `;
  }
}

/**
 * Show error message in container
 */
function showErrorInContainer(elementId, message) {
  const element = document.getElementById(elementId);
  if (element) {
    element.innerHTML = `
      <div class="flex flex-col items-center justify-center py-12">
        <i class="fas fa-exclamation-circle text-5xl text-red-500 mb-4"></i>
        <p class="text-gray-600">${message}</p>
      </div>
    `;
  }
}

/**
 * Show empty state
 */
function showEmptyState(elementId, message, icon = 'inbox') {
  const element = document.getElementById(elementId);
  if (element) {
    element.innerHTML = `
      <div class="flex flex-col items-center justify-center py-12">
        <i class="fas fa-${icon} text-5xl text-gray-300 mb-4"></i>
        <p class="text-gray-600">${message}</p>
      </div>
    `;
  }
}