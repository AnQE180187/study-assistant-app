const API_BASE = window.location.origin + '/api';
let currentPage = 'dashboard';

// Check authentication
function checkAuth() {
    const token = localStorage.getItem('adminToken');
    const user = JSON.parse(localStorage.getItem('adminUser') || '{}');
    
    if (!token || user.role !== 'ADMIN') {
        window.location.href = '/admin/login';
        return false;
    }
    
    // Set admin name
    document.getElementById('adminName').textContent = user.name || 'Admin';
    return true;
}

// API call helper
async function apiCall(endpoint, options = {}) {
    const token = localStorage.getItem('adminToken');
    const defaultOptions = {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        }
    };
    
    const response = await fetch(`${API_BASE}${endpoint}`, {
        ...defaultOptions,
        ...options,
        headers: { ...defaultOptions.headers, ...options.headers }
    });
    
    if (response.status === 401) {
        logout();
        return;
    }
    
    return response;
}

// Logout function
function logout() {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    window.location.href = '/admin/login';
}

// Load dashboard stats
async function loadDashboardStats() {
    try {
        const response = await apiCall('/users/admin/stats');
        if (response.ok) {
            const stats = await response.json();
            
            document.getElementById('totalUsers').textContent = stats.totalUsers;
            document.getElementById('totalDecks').textContent = stats.totalDecks;
            document.getElementById('totalFlashcards').textContent = stats.totalFlashcards;
            document.getElementById('totalAiLogs').textContent = stats.totalAiLogs;
            
            // Load recent users
            const recentUsersTable = document.getElementById('recentUsersTable');
            if (stats.recentUsers && stats.recentUsers.length > 0) {
                recentUsersTable.innerHTML = stats.recentUsers.map(user => `
                    <tr>
                        <td>${user.name}</td>
                        <td>${user.email}</td>
                        <td><span class="badge bg-${user.role === 'ADMIN' ? 'danger' : 'primary'}">${user.role}</span></td>
                        <td>${new Date(user.createdAt).toLocaleDateString()}</td>
                    </tr>
                `).join('');
            } else {
                recentUsersTable.innerHTML = '<tr><td colspan="4" class="text-center">No users found</td></tr>';
            }
        }
    } catch (error) {
        console.error('Error loading dashboard stats:', error);
    }
}

// Load users page
async function loadUsersPage() {
    try {
        const response = await apiCall('/users');
        if (response.ok) {
            const users = await response.json();
            
            const usersContent = document.getElementById('users-content');
            usersContent.innerHTML = `
                <h2 class="mb-4">User Management</h2>
                
                <div class="content-area">
                    <div class="d-flex justify-content-between align-items-center mb-3">
                        <div class="d-flex align-items-center">
                            <input type="text" class="form-control me-2" id="userSearch" placeholder="Search users..." style="width: 300px;">
                            <button class="btn btn-primary" onclick="searchUsers()">
                                <i class="fas fa-search"></i> Search
                            </button>
                        </div>
                        <div>
                            <span class="text-muted">Total: ${users.length} users</span>
                        </div>
                    </div>
                    
                    <div class="table-responsive">
                        <table class="table table-hover">
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Email</th>
                                    <th>Role</th>
                                    <th>Education</th>
                                    <th>Gender</th>
                                    <th>Date of Birth</th>
                                    <th>Joined</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody id="usersTable">
                                ${users.map(user => `
                                    <tr>
                                        <td>${user.name}</td>
                                        <td>${user.email}</td>
                                        <td><span class="badge bg-${user.role === 'ADMIN' ? 'danger' : 'primary'}">${user.role}</span></td>
                                        <td>${user.education || 'N/A'}</td>
                                        <td>${user.gender || 'N/A'}</td>
                                        <td>${user.dateOfBirth ? new Date(user.dateOfBirth).toLocaleDateString() : 'N/A'}</td>
                                        <td>${new Date(user.createdAt).toLocaleDateString()}</td>
                                        <td>
                                            ${user.role !== 'ADMIN' ? `
                                                <button class="btn btn-sm btn-success me-1" onclick="promoteUser('${user.id}')">
                                                    <i class="fas fa-user-shield"></i>
                                                </button>
                                            ` : ''}
                                            <button class="btn btn-sm btn-danger" onclick="deleteUser('${user.id}', '${user.name}')" ${user.role === 'ADMIN' ? 'disabled' : ''}>
                                                <i class="fas fa-trash"></i>
                                            </button>
                                        </td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
            `;
        }
    } catch (error) {
        console.error('Error loading users:', error);
    }
}

// Search users
async function searchUsers() {
    const searchTerm = document.getElementById('userSearch').value;
    try {
        const response = await apiCall(`/users?search=${encodeURIComponent(searchTerm)}`);
        if (response.ok) {
            const users = await response.json();
            // Update table with search results
            const usersTable = document.getElementById('usersTable');
            usersTable.innerHTML = users.map(user => `
                <tr>
                    <td>${user.name}</td>
                    <td>${user.email}</td>
                    <td><span class="badge bg-${user.role === 'ADMIN' ? 'danger' : 'primary'}">${user.role}</span></td>
                    <td>${user.education || 'N/A'}</td>
                    <td>${user.gender || 'N/A'}</td>
                    <td>${user.dateOfBirth ? new Date(user.dateOfBirth).toLocaleDateString() : 'N/A'}</td>
                    <td>${new Date(user.createdAt).toLocaleDateString()}</td>
                    <td>
                        ${user.role !== 'ADMIN' ? `
                            <button class="btn btn-sm btn-success me-1" onclick="promoteUser('${user.id}')">
                                <i class="fas fa-user-shield"></i>
                            </button>
                        ` : ''}
                        <button class="btn btn-sm btn-danger" onclick="deleteUser('${user.id}', '${user.name}')" ${user.role === 'ADMIN' ? 'disabled' : ''}>
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                </tr>
            `).join('');
        }
    } catch (error) {
        console.error('Error searching users:', error);
    }
}

// Promote user to admin
async function promoteUser(userId) {
    if (confirm('Are you sure you want to promote this user to admin?')) {
        try {
            const response = await apiCall(`/users/${userId}/role`, {
                method: 'PUT'
            });
            
            if (response.ok) {
                alert('User promoted successfully!');
                loadUsersPage();
            } else {
                const error = await response.json();
                alert('Error: ' + error.message);
            }
        } catch (error) {
            alert('Error promoting user');
        }
    }
}

// Delete user
async function deleteUser(userId, userName) {
    if (confirm(`Are you sure you want to delete user "${userName}"? This action cannot be undone.`)) {
        try {
            const response = await apiCall(`/users/${userId}`, {
                method: 'DELETE'
            });
            
            if (response.ok) {
                alert('User deleted successfully!');
                loadUsersPage();
            } else {
                const error = await response.json();
                alert('Error: ' + error.message);
            }
        } catch (error) {
            alert('Error deleting user');
        }
    }
}

// Navigation
function showPage(page) {
    // Hide all content areas
    document.querySelectorAll('[id$="-content"]').forEach(el => {
        el.classList.add('d-none');
    });
    
    // Show selected content area
    document.getElementById(`${page}-content`).classList.remove('d-none');
    
    // Update active nav link
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
    });
    document.querySelector(`[data-page="${page}"]`).classList.add('active');
    
    currentPage = page;
    
    // Load page content
    switch (page) {
        case 'dashboard':
            loadDashboardStats();
            break;
        case 'users':
            loadUsersPage();
            break;
        case 'flashcards':
            loadFlashcardsPage();
            break;
        case 'ai-logs':
            loadAiLogsPage();
            break;
    }
}

// Event listeners
document.addEventListener('DOMContentLoaded', function() {
    if (!checkAuth()) return;
    
    // Navigation event listeners
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const page = this.getAttribute('data-page');
            showPage(page);
        });
    });
    
    // Load initial dashboard
    loadDashboardStats();
});

// Placeholder functions for other pages
function loadFlashcardsPage() {
    document.getElementById('flashcards-content').innerHTML = `
        <h2 class="mb-4">Flashcard Management</h2>
        <div class="content-area">
            <p>Flashcard management functionality will be implemented here.</p>
        </div>
    `;
}

function loadAiLogsPage() {
    document.getElementById('ai-logs-content').innerHTML = `
        <h2 class="mb-4">AI Logs</h2>
        <div class="content-area">
            <p>AI logs functionality will be implemented here.</p>
        </div>
    `;
}
