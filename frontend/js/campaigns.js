// Campaigns JavaScript (Styled Version)
// Handles campaign CRUD operations matching landing.html template

// Initialize dashboard
async function initDashboard() {
  try {
    await loadUserInfo();
    await loadCampaigns();
  } catch (error) {
    console.error('Dashboard initialization error:', error);
    showErrorInContainer('campaigns-container', 'Failed to load dashboard data');
  }
}

// Load user info
async function loadUserInfo() {
  try {
    const user = await getCurrentUser();
    document.getElementById('user-email').textContent = user.email;
  } catch (error) {
    console.error('Failed to load user info:', error);
  }
}

// Load campaigns
async function loadCampaigns() {
  const container = document.getElementById('campaigns-container');
  const statsContainer = document.getElementById('stats-cards');
  
  showLoading('campaigns-container');
  
  try {
    const campaigns = await getCampaigns();
    
    // Update stats
    updateStatsCards(campaigns, statsContainer);
    
    // Update count badge
    document.getElementById('campaign-count').textContent = campaigns.length;
    
    // Display campaigns
    if (campaigns.length === 0) {
      showEmptyState('campaigns-container', 'No campaigns yet. Create your first campaign!', 'folder-open');
    } else {
      displayCampaigns(campaigns, container);
    }
    
  } catch (error) {
    console.error('Failed to load campaigns:', error);
    showErrorInContainer('campaigns-container', 'Failed to load campaigns');
  }
}

// Update stats cards
function updateStatsCards(campaigns, container) {
  const totalCampaigns = campaigns.length;
  let totalBudget = 0;
  
  campaigns.forEach(campaign => {
    totalBudget += campaign.total_budget || 0;
  });
  
  container.innerHTML = `
    <div class="border border-gray-200 rounded-lg p-4">
      <div class="flex items-center gap-2 mb-3">
        <i class="fa-solid fa-arrow-up text-teal-500"></i>
        <span class="text-xs text-gray-600">Total Campaigns</span>
      </div>
      <div class="text-2xl font-bold">${totalCampaigns}</div>
    </div>
    
    <div class="border border-gray-200 rounded-lg p-4">
      <div class="flex items-center gap-2 mb-3">
        <i class="fa-solid fa-arrow-up text-gray-400"></i>
        <span class="text-xs text-gray-600">Total Budget</span>
      </div>
      <div class="text-2xl font-bold">${formatCurrency(totalBudget)}</div>
    </div>
    
    <div class="border border-gray-200 rounded-lg p-4">
      <div class="flex items-center gap-2 mb-3">
        <i class="fa-solid fa-arrow-up text-blue-500"></i>
        <span class="text-xs text-gray-600">Active Videos</span>
      </div>
      <div class="text-2xl font-bold">-</div>
    </div>
    
    <div class="border border-gray-200 rounded-lg p-4">
      <div class="flex items-center gap-2 mb-3">
        <i class="fa-solid fa-arrow-up text-gray-400"></i>
        <span class="text-xs text-gray-600">Total Views</span>
      </div>
      <div class="text-2xl font-bold">-</div>
    </div>
    
    <div class="border border-gray-200 rounded-lg p-4">
      <div class="flex items-center gap-2 mb-3">
        <i class="fa-solid fa-arrow-up text-purple-500"></i>
        <span class="text-xs text-gray-600">Total Likes</span>
      </div>
      <div class="text-2xl font-bold">-</div>
    </div>
    
    <div class="border border-gray-200 rounded-lg p-4">
      <div class="flex items-center gap-2 mb-3">
        <i class="fa-solid fa-arrow-up text-yellow-500"></i>
        <span class="text-xs text-gray-600">Engagement Rate</span>
      </div>
      <div class="text-2xl font-bold">-</div>
    </div>
  `;
}

// Display campaigns in grid
function displayCampaigns(campaigns, container) {
  container.innerHTML = campaigns.map(campaign => `
    <div class="border border-gray-200 rounded-lg p-6 hover:border-orange-300 transition cursor-pointer" onclick="goToCampaign(${campaign.id})">
      <div class="flex justify-between items-start mb-4">
        <div class="flex-1">
          <h3 class="text-lg font-bold text-gray-900 mb-2">${campaign.name}</h3>
          <p class="text-sm text-gray-600 line-clamp-2">${campaign.description || 'No description'}</p>
        </div>
        <button 
          onclick="event.stopPropagation(); deleteCampaignConfirm(${campaign.id}, '${campaign.name.replace(/'/g, "\\'")}')" 
          class="text-gray-400 hover:text-red-600 transition ml-2"
          title="Delete campaign"
        >
          <i class="fas fa-trash"></i>
        </button>
      </div>
      
      <div class="border-t border-gray-200 pt-4 mt-4 space-y-2 text-sm">
        <div class="flex items-center justify-between">
          <span class="text-gray-600">Budget:</span>
          <span class="font-semibold text-gray-900">${formatCurrency(campaign.total_budget)}</span>
        </div>
        <div class="flex items-center justify-between">
          <span class="text-gray-600">Created:</span>
          <span class="text-gray-900">${formatDate(campaign.created_at)}</span>
        </div>
      </div>
      
      <div class="mt-4">
        <button class="w-full bg-orange-500 text-white py-2 rounded font-medium hover:bg-orange-600 transition text-sm">
          <i class="fas fa-chart-line mr-2"></i> View Analytics
        </button>
      </div>
    </div>
  `).join('');
}

// Show/hide modal
function showCreateCampaignModal() {
  document.getElementById('create-campaign-modal').classList.remove('hidden');
  document.getElementById('create-campaign-form').reset();
  hideModalError();
}

function hideCreateCampaignModal() {
  document.getElementById('create-campaign-modal').classList.add('hidden');
  document.getElementById('create-campaign-form').reset();
  hideModalError();
}

// Modal error handling
function showModalError(message) {
  const errorDiv = document.getElementById('modal-error');
  errorDiv.textContent = message;
  errorDiv.classList.remove('hidden');
}

function hideModalError() {
  const errorDiv = document.getElementById('modal-error');
  if (errorDiv) {
    errorDiv.classList.add('hidden');
  }
}

// Handle create campaign form
document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('create-campaign-form');
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      hideModalError();
      
      const name = document.getElementById('campaign-name').value;
      const description = document.getElementById('campaign-description').value;
      const budget = parseFloat(document.getElementById('campaign-budget').value) || 0;
      
      const btn = document.getElementById('create-campaign-btn');
      const btnText = document.getElementById('create-campaign-btn-text');
      const btnSpinner = document.getElementById('create-campaign-btn-spinner');
      
      btn.disabled = true;
      btnSpinner.classList.remove('hidden');
      
      try {
        await createCampaign({
          name,
          description,
          total_budget: budget
        });
        
        hideCreateCampaignModal();
        await loadCampaigns();
        
      } catch (error) {
        showModalError(error.message || 'Failed to create campaign');
      } finally {
        btn.disabled = false;
        btnSpinner.classList.add('hidden');
      }
    });
  }
});

// Navigate to campaign
function goToCampaign(campaignId) {
  window.location.href = `campaign-detail.html?id=${campaignId}`;
}

// Delete campaign
async function deleteCampaignConfirm(campaignId, campaignName) {
  if (confirm(`Are you sure you want to delete "${campaignName}"?\n\nThis will also delete all videos in this campaign.`)) {
    try {
      await deleteCampaign(campaignId);
      await loadCampaigns();
    } catch (error) {
      alert('Failed to delete campaign: ' + error.message);
    }
  }
}