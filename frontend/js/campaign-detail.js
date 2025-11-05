// Campaign Detail JavaScript
// Handles video management and analytics display

let currentCampaignId = null;
let refreshInterval = null;

// ============================================
// Initialization
// ============================================

/**
 * Initialize campaign detail page
 */
async function initCampaignDetail() {
  try {
    // Get campaign ID from URL
    const urlParams = new URLSearchParams(window.location.search);
    currentCampaignId = parseInt(urlParams.get('id'));
    
    if (!currentCampaignId) {
      alert('Invalid campaign ID');
      window.location.href = 'dashboard.html';
      return;
    }
    
    // Load user info
    await loadUserInfo();
    
    // Load campaign details
    await loadCampaignInfo();
    
    // Load analytics
    await loadAnalytics();
    
    // Load videos
    await loadVideos();
    
    // Set up auto-refresh for pending videos
    startAutoRefresh();
    
  } catch (error) {
    console.error('Campaign detail initialization error:', error);
    alert('Failed to load campaign details');
    window.location.href = 'dashboard.html';
  }
}

/**
 * Load user info
 */
async function loadUserInfo() {
  try {
    const user = await getCurrentUser();
    document.getElementById('user-email').textContent = user.email;
  } catch (error) {
    console.error('Failed to load user info:', error);
  }
}

/**
 * Load campaign information
 */
async function loadCampaignInfo() {
  try {
    const campaign = await getCampaign(currentCampaignId);
    
    const headerHtml = `
      <div class="flex justify-between items-start">
        <div class="flex-1">
          <h1 class="text-3xl font-bold text-gray-900 mb-2">${campaign.name}</h1>
          <p class="text-gray-600 mb-4">${campaign.description || 'No description'}</p>
          <div class="flex items-center space-x-6 text-sm">
            <div>
              <span class="text-gray-600">Budget:</span>
              <span class="font-semibold text-gray-900 ml-1">${formatCurrency(campaign.total_budget)}</span>
            </div>
            <div>
              <span class="text-gray-600">Created:</span>
              <span class="text-gray-900 ml-1">${formatDate(campaign.created_at)}</span>
            </div>
          </div>
        </div>
        <button 
          onclick="editCampaign()" 
          class="text-purple-600 hover:text-purple-700 transition"
          title="Edit campaign"
        >
          <i class="fas fa-edit text-xl"></i>
        </button>
      </div>
    `;
    
    document.getElementById('campaign-header').innerHTML = headerHtml;
    
  } catch (error) {
    console.error('Failed to load campaign info:', error);
    throw error;
  }
}

/**
 * Load campaign analytics
 */
async function loadAnalytics() {
  try {
    const analytics = await getCampaignAnalytics(currentCampaignId);
    
    const analyticsHtml = `
      <div class="bg-white rounded-lg shadow p-6">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-600 mb-1">Total Videos</p>
            <p class="text-3xl font-bold text-gray-900">${analytics.total_videos}</p>
            <p class="text-xs text-gray-500 mt-1">
              ${analytics.completed_videos} completed, ${analytics.pending_videos} pending
            </p>
          </div>
          <div class="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
            <i class="fas fa-video text-purple-600 text-xl"></i>
          </div>
        </div>
      </div>
      
      <div class="bg-white rounded-lg shadow p-6">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-600 mb-1">Total Views</p>
            <p class="text-3xl font-bold text-gray-900">${formatNumber(analytics.total_views)}</p>
          </div>
          <div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
            <i class="fas fa-eye text-blue-600 text-xl"></i>
          </div>
        </div>
      </div>
      
      <div class="bg-white rounded-lg shadow p-6">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-600 mb-1">Total Likes</p>
            <p class="text-3xl font-bold text-gray-900">${formatNumber(analytics.total_likes)}</p>
          </div>
          <div class="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
            <i class="fas fa-heart text-red-600 text-xl"></i>
          </div>
        </div>
      </div>
      
      <div class="bg-white rounded-lg shadow p-6">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-600 mb-1">Total Comments</p>
            <p class="text-3xl font-bold text-gray-900">${formatNumber(analytics.total_comments)}</p>
          </div>
          <div class="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
            <i class="fas fa-comment text-yellow-600 text-xl"></i>
          </div>
        </div>
      </div>
      
      <div class="bg-white rounded-lg shadow p-6">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-600 mb-1">Engagement Rate</p>
            <p class="text-3xl font-bold text-gray-900">${formatPercentage(analytics.engagement_rate)}</p>
          </div>
          <div class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
            <i class="fas fa-chart-line text-green-600 text-xl"></i>
          </div>
        </div>
      </div>
    `;
    
    document.getElementById('analytics-cards').innerHTML = analyticsHtml;
    
  } catch (error) {
    console.error('Failed to load analytics:', error);
  }
}

/**
 * Load videos list
 */
async function loadVideos() {
  const container = document.getElementById('videos-container');
  showLoading('videos-container');
  
  try {
    const videos = await getCampaignVideos(currentCampaignId);
    
    if (videos.length === 0) {
      showEmptyState('videos-container', 'No videos yet. Add your first TikTok video above!', 'video');
    } else {
      displayVideos(videos, container);
    }
    
    // Reload analytics after loading videos
    await loadAnalytics();
    
  } catch (error) {
    console.error('Failed to load videos:', error);
    showErrorInContainer('videos-container', 'Failed to load videos');
  }
}

/**
 * Display videos in list
 */
function displayVideos(videos, container) {
  container.innerHTML = `
    <div class="space-y-4">
      ${videos.map(video => createVideoCard(video)).join('')}
    </div>
  `;
}

/**
 * Create video card HTML
 */
function createVideoCard(video) {
  const statusColor = getStatusColor(video.scrape_status);
  const metadata = video.video_metadata;
  
  return `
    <div class="border border-gray-200 rounded-lg p-4 hover:border-purple-300 transition">
      <div class="flex items-start justify-between mb-3">
        <div class="flex-1">
          <a href="${video.tiktok_url}" target="_blank" class="text-purple-600 hover:text-purple-700 font-medium text-sm break-all">
            ${video.tiktok_url}
          </a>
        </div>
        <div class="flex items-center space-x-2 ml-4">
          <span class="px-3 py-1 rounded-full text-xs font-medium ${statusColor}">
            ${video.scrape_status}
          </span>
          ${video.scrape_status === 'failed' ? `
            <button 
              onclick="rescrape(${video.id})" 
              class="text-gray-500 hover:text-purple-600 transition"
              title="Retry scraping"
            >
              <i class="fas fa-redo"></i>
            </button>
          ` : ''}
          <button 
            onclick="deleteVideoConfirm(${video.id})" 
            class="text-gray-500 hover:text-red-600 transition"
            title="Delete video"
          >
            <i class="fas fa-trash"></i>
          </button>
        </div>
      </div>
      
      ${metadata ? `
        <div class="grid grid-cols-2 md:grid-cols-5 gap-4 mt-4 pt-4 border-t border-gray-200">
          <div>
            <p class="text-xs text-gray-500 mb-1">Views</p>
            <p class="font-semibold text-gray-900">${formatNumber(metadata.play_count)}</p>
          </div>
          <div>
            <p class="text-xs text-gray-500 mb-1">Likes</p>
            <p class="font-semibold text-gray-900">${formatNumber(metadata.digg_count)}</p>
          </div>
          <div>
            <p class="text-xs text-gray-500 mb-1">Comments</p>
            <p class="font-semibold text-gray-900">${formatNumber(metadata.comment_count)}</p>
          </div>
          <div>
            <p class="text-xs text-gray-500 mb-1">Shares</p>
            <p class="font-semibold text-gray-900">${formatNumber(metadata.share_count)}</p>
          </div>
          <div>
            <p class="text-xs text-gray-500 mb-1">Saves</p>
            <p class="font-semibold text-gray-900">${formatNumber(metadata.collect_count)}</p>
          </div>
        </div>
        
        ${metadata.author_name ? `
          <div class="mt-3 pt-3 border-t border-gray-200 flex items-center text-sm">
            <i class="fas fa-user-circle text-gray-400 mr-2"></i>
            <span class="text-gray-600">@${metadata.author_name}</span>
            ${metadata.author_verified ? '<i class="fas fa-check-circle text-blue-500 ml-1" title="Verified"></i>' : ''}
            <span class="text-gray-400 mx-2">•</span>
            <span class="text-gray-600">${formatNumber(metadata.author_fans)} followers</span>
          </div>
        ` : ''}
        
        ${metadata.text ? `
          <div class="mt-3 pt-3 border-t border-gray-200">
            <p class="text-sm text-gray-700">${metadata.text}</p>
          </div>
        ` : ''}
      ` : `
        <div class="mt-4 pt-4 border-t border-gray-200 text-center text-gray-500 text-sm">
          ${video.scrape_status === 'pending' ? '<i class="fas fa-spinner fa-spin mr-2"></i> Scraping in progress...' : 'No data available'}
        </div>
      `}
    </div>
  `;
}

// ============================================
// Video Operations
// ============================================

/**
 * Handle add video form submission
 */
document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('add-video-form');
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const urlInput = document.getElementById('tiktok-url');
      const tiktokUrl = urlInput.value.trim();
      
      // Hide previous messages
      document.getElementById('add-video-error').classList.add('hidden');
      document.getElementById('add-video-success').classList.add('hidden');
      
      // Disable button
      const btn = document.getElementById('add-video-btn');
      const btnText = document.getElementById('add-video-btn-text');
      const btnSpinner = document.getElementById('add-video-btn-spinner');
      btn.disabled = true;
      btnText.classList.add('hidden');
      btnSpinner.classList.remove('hidden');
      
      try {
        await addVideoToCampaign(currentCampaignId, tiktokUrl);
        
        // Show success
        document.getElementById('add-video-success').classList.remove('hidden');
        
        // Clear input
        urlInput.value = '';
        
        // Reload videos
        setTimeout(() => {
          loadVideos();
        }, 500);
        
      } catch (error) {
        const errorDiv = document.getElementById('add-video-error');
        const errorText = document.getElementById('add-video-error-text');
        errorText.textContent = error.message || 'Failed to add video';
        errorDiv.classList.remove('hidden');
      } finally {
        btn.disabled = false;
        btnText.classList.remove('hidden');
        btnSpinner.classList.add('hidden');
      }
    });
  }
});

/**
 * Re-scrape a video
 */
async function rescrape(videoId) {
  try {
    await rescrapeVideo(videoId);
    alert('Video re-scraping initiated. This may take a few moments.');
    setTimeout(() => loadVideos(), 2000);
  } catch (error) {
    alert('Failed to re-scrape video: ' + error.message);
  }
}

/**
 * Confirm and delete video
 */
async function deleteVideoConfirm(videoId) {
  if (confirm('Are you sure you want to delete this video?')) {
    try {
      await deleteVideo(videoId);
      await loadVideos();
    } catch (error) {
      alert('Failed to delete video: ' + error.message);
    }
  }
}

/**
 * Edit campaign (placeholder)
 */
function editCampaign() {
  alert('Edit campaign functionality coming soon!');
}

// ============================================
// Auto-Refresh for Pending Videos
// ============================================

/**
 * Start auto-refresh interval for pending videos
 */
function startAutoRefresh() {
  // Check every 10 seconds for pending videos
  refreshInterval = setInterval(async () => {
    try {
      const videos = await getCampaignVideos(currentCampaignId);
      const hasPending = videos.some(v => v.scrape_status === 'pending');
      
      if (hasPending) {
        await loadVideos();
      } else {
        // No pending videos, can stop refreshing
        stopAutoRefresh();
      }
    } catch (error) {
      console.error('Auto-refresh error:', error);
    }
  }, 10000);
}

/**
 * Stop auto-refresh interval
 */
function stopAutoRefresh() {
  if (refreshInterval) {
    clearInterval(refreshInterval);
    refreshInterval = null;
  }
}

// Clean up interval when leaving page
window.addEventListener('beforeunload', () => {
  stopAutoRefresh();
});