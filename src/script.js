// Data Storage
let students = [];
let homework = [];
let tests = [];
let scores = {};
let activities = [];
let charts = {};

// API Configuration
const API_BASE_URL = '/api';

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    loadData();
    initializeEventListeners();
    initializeCharts();
    updateDashboard();
    renderStudents();
    renderHomework();
    renderTests();
    renderAnalytics();
});

// API Helper Functions
async function apiRequest(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const config = {
        headers: {
            'Content-Type': 'application/json',
            ...options.headers
        },
        ...options
    };

    try {
        const response = await fetch(url, config);
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message || `HTTP error! status: ${response.status}`);
        }
        
        return data;
    } catch (error) {
        console.error('API Request Error:', error);
        throw error;
    }
}

// Student API Functions
async function fetchStudents(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = `/students${queryString ? '?' + queryString : ''}`;
    
    try {
        const response = await apiRequest(endpoint);
        return response.data;
    } catch (error) {
        console.error('Failed to fetch students:', error);
        throw error;
    }
}

async function createStudent(studentData) {
    try {
        const response = await apiRequest('/students', {
            method: 'POST',
            body: JSON.stringify(studentData)
        });
        return response.data;
    } catch (error) {
        console.error('Failed to create student:', error);
        throw error;
    }
}

// Homework API Functions
async function fetchHomework(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = `/homework${queryString ? '?' + queryString : ''}`;
    
    try {
        const response = await apiRequest(endpoint);
        return response.data;
    } catch (error) {
        console.error('Failed to fetch homework:', error);
        throw error;
    }
}

async function createHomework(homeworkData) {
    try {
        const response = await apiRequest('/homework', {
            method: 'POST',
            body: JSON.stringify(homeworkData)
        });
        return response.data;
    } catch (error) {
        console.error('Failed to create homework:', error);
        throw error;
    }
}

// Sample API Usage Functions
async function demonstrateApiUsage() {
    try {
        // Example: Fetch all students
        console.log('Fetching students...');
        const allStudents = await fetchStudents();
        console.log('Students:', allStudents);

        // Example: Fetch students with filters
        console.log('Fetching Class A students...');
        const classAStudents = await fetchStudents({ class: 'A', limit: 5 });
        console.log('Class A Students:', classAStudents);

        // Example: Create a new student
        console.log('Creating new student...');
        const newStudent = await createStudent({
            name: 'John Doe',
            email: 'john.doe@example.com',
            class: 'A',
            student_id: 'STU001',
            phone: '+1234567890',
            address: '123 Main St, City, State'
        });
        console.log('Created student:', newStudent);

        // Example: Fetch homework
        console.log('Fetching homework...');
        const allHomework = await fetchHomework();
        console.log('Homework:', allHomework);

        // Example: Create new homework
        console.log('Creating new homework...');
        const newHomework = await createHomework({
            title: 'Math Assignment 1',
            description: 'Complete exercises 1-20 from Chapter 3',
            class: 'A',
            subject: 'math',
            due_date: '2024-12-25',
            priority: 'high'
        });
        console.log('Created homework:', newHomework);

    } catch (error) {
        console.error('API demonstration failed:', error);
    }
}

// Load data from API or localStorage
async function loadData() {
    try {
        // Try to load from API first
        students = await fetchStudents() || [];
        homework = await fetchHomework() || [];
        
        // If API fails, fallback to localStorage
        if (students.length === 0) {
            const savedStudents = localStorage.getItem('students');
            const savedHomework = localStorage.getItem('homework');
            const savedTests = localStorage.getItem('tests');
            const savedScores = localStorage.getItem('scores');
            const savedActivities = localStorage.getItem('activities');
            
            if (savedStudents) students = JSON.parse(savedStudents);
            if (savedHomework) homework = JSON.parse(savedHomework);
            if (savedTests) tests = JSON.parse(savedTests);
            if (savedScores) scores = JSON.parse(savedScores);
            if (savedActivities) activities = JSON.parse(savedActivities);
        }
        
        // Add sample data if no data exists
        if (students.length === 0) {
            addSampleData();
        }
        
        // Demonstrate API usage (remove in production)
        // demonstrateApiUsage();
        
    } catch (error) {
        console.error('Failed to load data from API, using localStorage:', error);
        // Fallback to localStorage
        const savedStudents = localStorage.getItem('students');
        const savedHomework = localStorage.getItem('homework');
        const savedTests = localStorage.getItem('tests');
        const savedScores = localStorage.getItem('scores');
        const savedActivities = localStorage.getItem('activities');
        
        if (savedStudents) students = JSON.parse(savedStudents);
        if (savedHomework) homework = JSON.parse(savedHomework);
        if (savedTests) tests = JSON.parse(savedTests);
        if (savedScores) scores = JSON.parse(savedScores);
        if (savedActivities) activities = JSON.parse(savedActivities);
        
        if (students.length === 0) {
            addSampleData();
        }
    }
}

// Save data to localStorage
function saveData() {
    localStorage.setItem('students', JSON.stringify(students));
    localStorage.setItem('homework', JSON.stringify(homework));
    localStorage.setItem('tests', JSON.stringify(tests));
    localStorage.setItem('scores', JSON.stringify(scores));
    localStorage.setItem('activities', JSON.stringify(activities));
}

// Add sample data for demonstration
function addSampleData() {
    students = [
        { id: 'STU001', name: 'Alice Johnson', email: 'alice@example.com', class: 'A', phone: '555-0101', address: '123 Main St', status: 'active' },
        { id: 'STU002', name: 'Bob Smith', email: 'bob@example.com', class: 'B', phone: '555-0102', address: '456 Oak Ave', status: 'active' },
        { id: 'STU003', name: 'Carol Williams', email: 'carol@example.com', class: 'A', phone: '555-0103', address: '789 Pine Rd', status: 'active' },
        { id: 'STU004', name: 'David Brown', email: 'david@example.com', class: 'C', phone: '555-0104', address: '321 Elm St', status: 'inactive' },
        { id: 'STU005', name: 'Emma Davis', email: 'emma@example.com', class: 'B', phone: '555-0105', address: '654 Maple Dr', status: 'active' },
        { id: 'STU006', name: 'Frank Miller', email: 'frank@example.com', class: 'C', phone: '555-0106', address: '987 Cedar Ln', status: 'active' },
        { id: 'STU007', name: 'Grace Wilson', email: 'grace@example.com', class: 'A', phone: '555-0107', address: '147 Birch Way', status: 'active' },
        { id: 'STU008', name: 'Henry Moore', email: 'henry@example.com', class: 'B', phone: '555-0108', address: '258 Spruce St', status: 'active' }
    ];
    
    homework = [
        {
            id: 'HW001',
            title: 'Math Assignment - Chapter 5',
            description: 'Complete exercises 1-20 from Chapter 5, focusing on algebraic equations and graphing functions.',
            class: 'A',
            subject: 'math',
            dueDate: getDateAfterDays(3),
            status: 'pending',
            priority: 'high'
        },
        {
            id: 'HW002',
            title: 'Science Lab Report',
            description: 'Write a comprehensive 2-page report on the chemistry experiment conducted in class.',
            class: 'B',
            subject: 'science',
            dueDate: getDateAfterDays(5),
            status: 'pending',
            priority: 'medium'
        },
        {
            id: 'HW003',
            title: 'English Essay',
            description: 'Write a 500-word essay on the theme of courage in literature.',
            class: 'C',
            subject: 'english',
            dueDate: getDateAfterDays(2),
            status: 'completed',
            priority: 'low'
        }
    ];
    
    tests = [
        {
            id: 'TEST001',
            title: 'Midterm Mathematics Examination',
            subject: 'math',
            class: 'A',
            date: getDateAfterDays(10),
            maxScore: 100,
            description: 'Comprehensive midterm covering all topics from the first half of the semester.'
        },
        {
            id: 'TEST002',
            title: 'Science Quiz - Biology',
            subject: 'science',
            class: 'B',
            date: getDateAfterDays(7),
            maxScore: 50,
            description: 'Quiz covering cellular biology and ecosystems.'
        },
        {
            id: 'TEST003',
            title: 'English Literature Test',
            subject: 'english',
            class: 'C',
            date: getDateAfterDays(14),
            maxScore: 75,
            description: 'Test on classic literature and poetry analysis.'
        }
    ];
    
    // Sample scores with more realistic data
    scores = {
        'STU001': { math: 92, science: 88, english: 85, history: 90 },
        'STU002': { math: 78, science: 85, english: 92, history: 80 },
        'STU003': { math: 95, science: 89, english: 87, history: 93 },
        'STU004': { math: 72, science: 68, english: 75, history: 70 },
        'STU005': { math: 88, science: 91, english: 83, history: 86 },
        'STU006': { math: 85, science: 82, english: 89, history: 84 },
        'STU007': { math: 90, science: 87, english: 91, history: 88 },
        'STU008': { math: 83, science: 86, english: 80, history: 85 }
    };
    
    // Sample activities
    activities = [
        { text: 'New student Alice Johnson enrolled in Class A', time: '2 hours ago', timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000) },
        { text: 'Math midterm scheduled for next week', time: '5 hours ago', timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000) },
        { text: '3 homework assignments are due tomorrow', time: '1 day ago', timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000) }
    ];
    
    saveData();
}

// Helper function to get date after specified days
function getDateAfterDays(days) {
    const date = new Date();
    date.setDate(date.getDate() + days);
    return date.toISOString().split('T')[0];
}

// Initialize event listeners
function initializeEventListeners() {
    // Sidebar navigation
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const section = this.dataset.section;
            switchSection(section);
        });
    });
    
    // Sidebar toggle
    document.getElementById('sidebar-toggle').addEventListener('click', function() {
        document.querySelector('.sidebar').classList.toggle('collapsed');
    });
    
    // Forms
    document.getElementById('student-form').addEventListener('submit', handleStudentSubmit);
    document.getElementById('homework-form').addEventListener('submit', handleHomeworkSubmit);
    document.getElementById('test-form').addEventListener('submit', handleTestSubmit);
    
    // Search and filters
    document.getElementById('student-search').addEventListener('input', filterStudents);
    document.getElementById('class-filter').addEventListener('change', filterStudents);
    document.getElementById('status-filter').addEventListener('change', filterStudents);
    document.getElementById('homework-class').addEventListener('change', filterHomework);
    document.getElementById('homework-status').addEventListener('change', filterHomework);
    document.getElementById('test-month').addEventListener('change', filterTests);
    document.getElementById('test-subject').addEventListener('change', filterTests);
    
    // Header actions
    document.getElementById('notification-btn').addEventListener('click', toggleNotificationPanel);
    document.getElementById('settings-btn').addEventListener('click', openSettingsModal);
    document.getElementById('export-btn').addEventListener('click', exportData);
    
    // Modal overlay
    document.getElementById('modal-overlay').addEventListener('click', function(e) {
        if (e.target === this) {
            closeAllModals();
        }
    });
    
    // Mobile sidebar
    if (window.innerWidth <= 768) {
        document.addEventListener('click', function(e) {
            const sidebar = document.querySelector('.sidebar');
            if (sidebar.classList.contains('mobile-open') && 
                !sidebar.contains(e.target) && 
                !e.target.closest('.sidebar-toggle')) {
                sidebar.classList.remove('mobile-open');
            }
        });
    }
}

// Initialize charts
function initializeCharts() {
    // Performance Overview Chart
    const performanceCtx = document.getElementById('performance-chart');
    if (performanceCtx) {
        charts.performance = new Chart(performanceCtx, {
            type: 'line',
            data: {
                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                datasets: [{
                    label: 'Average Score',
                    data: [75, 78, 82, 79, 85, 88],
                    borderColor: '#6B46C1',
                    backgroundColor: 'rgba(107, 70, 193, 0.1)',
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100
                    }
                }
            }
        });
    }
    
    // Subject Distribution Chart
    const subjectCtx = document.getElementById('subject-chart');
    if (subjectCtx) {
        charts.subject = new Chart(subjectCtx, {
            type: 'doughnut',
            data: {
                labels: ['Math', 'Science', 'English', 'History'],
                datasets: [{
                    data: [30, 25, 25, 20],
                    backgroundColor: [
                        '#6B46C1',
                        '#3B82F6',
                        '#10B981',
                        '#F59E0B'
                    ]
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        });
    }
    
    // Analytics Charts
    initializeAnalyticsCharts();
}

function initializeAnalyticsCharts() {
    // Trends Chart
    const trendsCtx = document.getElementById('trends-chart');
    if (trendsCtx) {
        charts.trends = new Chart(trendsCtx, {
            type: 'bar',
            data: {
                labels: ['Class A', 'Class B', 'Class C'],
                datasets: [
                    {
                        label: 'Math',
                        data: [85, 78, 82],
                        backgroundColor: '#6B46C1'
                    },
                    {
                        label: 'Science',
                        data: [88, 85, 79],
                        backgroundColor: '#3B82F6'
                    },
                    {
                        label: 'English',
                        data: [82, 89, 84],
                        backgroundColor: '#10B981'
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100
                    }
                }
            }
        });
    }
    
    // Class Comparison Chart
    const comparisonCtx = document.getElementById('class-comparison-chart');
    if (comparisonCtx) {
        charts.comparison = new Chart(comparisonCtx, {
            type: 'radar',
            data: {
                labels: ['Math', 'Science', 'English', 'History'],
                datasets: [
                    {
                        label: 'Class A',
                        data: [85, 88, 82, 90],
                        borderColor: '#6B46C1',
                        backgroundColor: 'rgba(107, 70, 193, 0.2)'
                    },
                    {
                        label: 'Class B',
                        data: [78, 85, 89, 80],
                        borderColor: '#3B82F6',
                        backgroundColor: 'rgba(59, 130, 246, 0.2)'
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    r: {
                        beginAtZero: true,
                        max: 100
                    }
                }
            }
        });
    }
    
    // Subject Performance Chart
    const subjectPerfCtx = document.getElementById('subject-performance-chart');
    if (subjectPerfCtx) {
        charts.subjectPerformance = new Chart(subjectPerfCtx, {
            type: 'polarArea',
            data: {
                labels: ['Math', 'Science', 'English', 'History'],
                datasets: [{
                    data: [82, 84, 85, 86],
                    backgroundColor: [
                        'rgba(107, 70, 193, 0.8)',
                        'rgba(59, 130, 246, 0.8)',
                        'rgba(16, 185, 129, 0.8)',
                        'rgba(245, 158, 11, 0.8)'
                    ]
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    r: {
                        beginAtZero: true,
                        max: 100
                    }
                }
            }
        });
    }
}

// Switch between sections
function switchSection(sectionName) {
    // Update navigation
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
    });
    document.querySelector(`[data-section="${sectionName}"]`).classList.add('active');
    
    // Update sections
    document.querySelectorAll('.content-section').forEach(section => {
        section.classList.remove('active');
    });
    document.getElementById(sectionName).classList.add('active');
    
    // Update content based on section
    if (sectionName === 'dashboard') {
        updateDashboard();
        updateCharts();
    } else if (sectionName === 'analytics') {
        renderAnalytics();
        updateAnalyticsCharts();
    }
}

// Update charts with current data
function updateCharts() {
    if (charts.performance) {
        const monthlyData = calculateMonthlyAverages();
        charts.performance.data.datasets[0].data = monthlyData;
        charts.performance.update();
    }
    
    if (charts.subject) {
        const subjectData = calculateSubjectAverages();
        charts.subject.data.datasets[0].data = subjectData;
        charts.subject.update();
    }
}

function updateAnalyticsCharts() {
    if (charts.trends) {
        const classData = calculateClassAverages();
        charts.trends.data.datasets[0].data = classData.math;
        charts.trends.data.datasets[1].data = classData.science;
        charts.trends.data.datasets[2].data = classData.english;
        charts.trends.update();
    }
    
    if (charts.comparison) {
        const classData = calculateClassAverages();
        charts.comparison.data.datasets[0].data = [
            classData.math[0],
            classData.science[0],
            classData.english[0],
            classData.history[0]
        ];
        charts.comparison.data.datasets[1].data = [
            classData.math[1],
            classData.science[1],
            classData.english[1],
            classData.history[1]
        ];
        charts.comparison.update();
    }
}

// Dashboard functions
function updateDashboard() {
    // Update statistics
    document.getElementById('total-students').textContent = students.filter(s => s.status === 'active').length;
    document.getElementById('pending-homework').textContent = homework.filter(h => h.status === 'pending').length;
    document.getElementById('upcoming-tests').textContent = tests.filter(t => new Date(t.date) > new Date()).length;
    
    // Calculate average score
    let totalScore = 0;
    let scoreCount = 0;
    Object.values(scores).forEach(studentScores => {
        Object.values(studentScores).forEach(score => {
            if (score > 0) {
                totalScore += score;
                scoreCount++;
            }
        });
    });
    const avgScore = scoreCount > 0 ? Math.round(totalScore / scoreCount) : 0;
    document.getElementById('avg-score').textContent = avgScore + '%';
    
    // Update activity and top performers
    renderActivity();
    renderTopPerformers();
}

function renderActivity() {
    const activityList = document.getElementById('activity-list');
    const recentActivities = getRecentActivities();
    
    if (recentActivities.length === 0) {
        activityList.innerHTML = '<div class="empty-state">No recent activity</div>';
        return;
    }
    
    activityList.innerHTML = recentActivities.map(activity => `
        <div class="activity-item">
            <p>${activity.text}</p>
            <span class="time">${activity.time}</span>
        </div>
    `).join('');
}

function renderTopPerformers() {
    const topStudentsList = document.getElementById('top-students');
    
    // Calculate average scores for each student
    const studentAverages = students.map(student => {
        const studentScores = scores[student.id] || {};
        const scoreValues = Object.values(studentScores).filter(score => score > 0);
        const average = scoreValues.length > 0 ? scoreValues.reduce((a, b) => a + b, 0) / scoreValues.length : 0;
        return { ...student, average };
    });
    
    // Sort by average score and take top 5
    const topStudents = studentAverages.sort((a, b) => b.average - a.average).slice(0, 5);
    
    if (topStudents.length === 0) {
        topStudentsList.innerHTML = '<div class="empty-state">No students available</div>';
        return;
    }
    
    topStudentsList.innerHTML = topStudents.map(student => `
        <div class="student-item">
            <div class="student-avatar">${student.name.charAt(0)}</div>
            <div class="student-info">
                <div class="student-name">${student.name}</div>
                <div class="student-class">Class ${student.class}</div>
            </div>
            <div class="student-score">${Math.round(student.average)}%</div>
        </div>
    `).join('');
}

// Students section
function renderStudents() {
    const studentsTableBody = document.getElementById('students-table-body');
    const filteredStudents = getFilteredStudents();
    
    if (filteredStudents.length === 0) {
        studentsTableBody.innerHTML = '<tr><td colspan="7" class="empty-state">No students found</td></tr>';
        return;
    }
    
    studentsTableBody.innerHTML = filteredStudents.map(student => {
        const studentScores = scores[student.id] || {};
        const average = calculateAverage(studentScores);
        const statusClass = student.status === 'active' ? 'status-active' : 'status-inactive';
        
        return `
            <tr>
                <td>${student.id}</td>
                <td>
                    <div style="display: flex; align-items: center; gap: 0.5rem;">
                        <div class="student-avatar" style="width: 32px; height: 32px; font-size: 0.75rem;">${student.name.charAt(0)}</div>
                        ${student.name}
                    </div>
                </td>
                <td>${student.email}</td>
                <td><span class="class-badge class-${student.class}">Class ${student.class}</span></td>
                <td><strong>${Math.round(average)}%</strong></td>
                <td><span class="status-badge ${statusClass}">${student.status}</span></td>
                <td>
                    <div style="display: flex; gap: 0.5rem;">
                        <button class="btn-action" onclick="viewStudent('${student.id}')" title="View">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn-action" onclick="editStudent('${student.id}')" title="Edit">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn-action" onclick="deleteStudent('${student.id}')" title="Delete">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
}

function getFilteredStudents() {
    const searchTerm = document.getElementById('student-search')?.value.toLowerCase() || '';
    const classFilter = document.getElementById('class-filter')?.value || '';
    const statusFilter = document.getElementById('status-filter')?.value || '';
    
    return students.filter(student => {
        const matchesSearch = !searchTerm || 
            student.name.toLowerCase().includes(searchTerm) || 
            student.email.toLowerCase().includes(searchTerm) ||
            student.id.toLowerCase().includes(searchTerm);
        const matchesClass = !classFilter || student.class === classFilter;
        const matchesStatus = !statusFilter || student.status === statusFilter;
        return matchesSearch && matchesClass && matchesStatus;
    });
}

function filterStudents() {
    renderStudents();
}

// Homework section
function renderHomework() {
    const homeworkGrid = document.getElementById('homework-grid');
    const filteredHomework = getFilteredHomework();
    
    if (filteredHomework.length === 0) {
        homeworkGrid.innerHTML = '<div class="empty-state">No homework found</div>';
        return;
    }
    
    homeworkGrid.innerHTML = filteredHomework.map(item => {
        const statusClass = getStatusClass(item.status);
        const priorityClass = getPriorityClass(item.priority);
        const isOverdue = new Date(item.dueDate) < new Date() && item.status !== 'completed';
        const displayStatus = isOverdue ? 'overdue' : item.status;
        
        return `
            <div class="homework-item">
                <div class="homework-header">
                    <h3 class="homework-title">${item.title}</h3>
                    <div style="display: flex; gap: 0.5rem;">
                        <span class="homework-status ${getStatusClass(displayStatus)}">${displayStatus}</span>
                        <span class="priority-badge ${priorityClass}">${item.priority}</span>
                    </div>
                </div>
                <div class="homework-meta">
                    <span><i class="fas fa-users"></i> Class ${item.class}</span>
                    <span><i class="fas fa-book"></i> ${item.subject}</span>
                    <span><i class="fas fa-calendar"></i> Due: ${formatDate(item.dueDate)}</span>
                </div>
                <p class="homework-description">${item.description}</p>
                <div class="homework-actions" style="margin-top: 1rem; display: flex; gap: 0.5rem;">
                    <button class="btn-action" onclick="editHomework('${item.id}')" title="Edit">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-action" onclick="deleteHomework('${item.id}')" title="Delete">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

function getFilteredHomework() {
    const classFilter = document.getElementById('homework-class')?.value || '';
    const statusFilter = document.getElementById('homework-status')?.value || '';
    
    return homework.filter(item => {
        const matchesClass = !classFilter || item.class === classFilter;
        const matchesStatus = !statusFilter || item.status === statusFilter;
        return matchesClass && matchesStatus;
    });
}

function filterHomework() {
    renderHomework();
}

// Tests section
function renderTests() {
    const testsTimeline = document.getElementById('tests-timeline');
    const filteredTests = getFilteredTests();
    
    if (filteredTests.length === 0) {
        testsTimeline.innerHTML = '<div class="empty-state">No tests found</div>';
        return;
    }
    
    // Sort tests by date
    const sortedTests = filteredTests.sort((a, b) => new Date(a.date) - new Date(b.date));
    
    testsTimeline.innerHTML = sortedTests.map(test => {
        const testScores = getTestScores(test);
        const average = testScores.length > 0 ? testScores.reduce((a, b) => a + b, 0) / testScores.length : 0;
        const isUpcoming = new Date(test.date) > new Date();
        const statusClass = isUpcoming ? 'status-upcoming' : 'status-completed';
        
        return `
            <div class="test-timeline-item">
                <div class="test-timeline-header">
                    <h3 class="test-timeline-title">${test.title}</h3>
                    <span class="test-timeline-date">${formatDate(test.date)}</span>
                </div>
                <div class="test-timeline-meta">
                    <span><i class="fas fa-users"></i> Class ${test.class}</span>
                    <span><i class="fas fa-book"></i> ${test.subject}</span>
                    <span><i class="fas fa-star"></i> Max Score: ${test.maxScore}</span>
                    <span><i class="fas fa-chart-line"></i> Average: ${Math.round(average)}%</span>
                </div>
                ${test.description ? `<p style="color: var(--gray-600); font-size: 0.875rem; margin-top: 0.5rem;">${test.description}</p>` : ''}
                <div class="test-actions" style="margin-top: 1rem; display: flex; gap: 0.5rem;">
                    <button class="btn-action" onclick="viewTestResults('${test.id}')" title="View Results">
                        <i class="fas fa-chart-bar"></i>
                    </button>
                    <button class="btn-action" onclick="editTest('${test.id}')" title="Edit">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-action" onclick="deleteTest('${test.id}')" title="Delete">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

function getFilteredTests() {
    const monthFilter = document.getElementById('test-month')?.value || '';
    const subjectFilter = document.getElementById('test-subject')?.value || '';
    
    return tests.filter(test => {
        const matchesMonth = !monthFilter || new Date(test.date).getMonth() + 1 == monthFilter;
        const matchesSubject = !subjectFilter || test.subject === subjectFilter;
        return matchesMonth && matchesSubject;
    });
}

function filterTests() {
    renderTests();
}

// Analytics section
function renderAnalytics() {
    // Update grade distribution with real data
    updateGradeDistribution();
}

function updateGradeDistribution() {
    const gradeDistribution = calculateGradeDistribution();
    const gradeContainer = document.querySelector('.grade-distribution');
    
    if (gradeContainer) {
        gradeContainer.innerHTML = Object.entries(gradeDistribution).map(([grade, data]) => `
            <div class="grade-item">
                <div class="grade-label">${grade}</div>
                <div class="grade-bar">
                    <div class="grade-fill" style="width: ${data.percentage}%"></div>
                </div>
                <div class="grade-count">${data.count} (${data.percentage}%)</div>
            </div>
        `).join('');
    }
}

// Modal functions
function openStudentModal() {
    document.getElementById('modal-overlay').classList.add('active');
    document.getElementById('student-modal').style.display = 'block';
}

function openHomeworkModal() {
    document.getElementById('modal-overlay').classList.add('active');
    document.getElementById('homework-modal').style.display = 'block';
}

function openTestModal() {
    document.getElementById('modal-overlay').classList.add('active');
    document.getElementById('test-modal').style.display = 'block';
}

function openSettingsModal() {
    document.getElementById('modal-overlay').classList.add('active');
    document.getElementById('settings-modal').style.display = 'block';
}

function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
    document.getElementById('modal-overlay').classList.remove('active');
}

function closeAllModals() {
    document.querySelectorAll('.modal').forEach(modal => {
        modal.style.display = 'none';
    });
    document.getElementById('modal-overlay').classList.remove('active');
    document.getElementById('notification-panel').classList.remove('active');
}

// Notification panel
function toggleNotificationPanel() {
    const panel = document.getElementById('notification-panel');
    panel.classList.toggle('active');
}

function closeNotificationPanel() {
    document.getElementById('notification-panel').classList.remove('active');
}

// Form handlers
function handleStudentSubmit(e) {
    e.preventDefault();
    
    const student = {
        id: document.getElementById('student-id').value,
        name: document.getElementById('student-name').value,
        email: document.getElementById('student-email').value,
        class: document.getElementById('student-class').value,
        phone: document.getElementById('student-phone').value,
        address: document.getElementById('student-address').value,
        status: 'active'
    };
    
    // Check if student already exists
    if (!students.find(s => s.id === student.id)) {
        students.push(student);
        scores[student.id] = { math: 0, science: 0, english: 0, history: 0 };
        saveData();
        renderStudents();
        updateDashboard();
        addActivity(`New student ${student.name} added to Class ${student.class}`);
        showNotification('Student added successfully!', 'success');
    } else {
        showNotification('Student with this ID already exists!', 'error');
    }
    
    closeModal('student-modal');
    document.getElementById('student-form').reset();
}

function handleHomeworkSubmit(e) {
    e.preventDefault();
    
    const homeworkItem = {
        id: 'HW' + Date.now(),
        title: document.getElementById('homework-title').value,
        description: document.getElementById('homework-description').value,
        class: document.getElementById('homework-class-select').value,
        subject: document.getElementById('homework-subject').value,
        dueDate: document.getElementById('homework-due-date').value,
        priority: document.getElementById('homework-priority').value,
        status: 'pending'
    };
    
    homework.push(homeworkItem);
    saveData();
    renderHomework();
    updateDashboard();
    addActivity(`New homework assigned: ${homeworkItem.title} for Class ${homeworkItem.class}`);
    showNotification('Homework added successfully!', 'success');
    
    closeModal('homework-modal');
    document.getElementById('homework-form').reset();
}

function handleTestSubmit(e) {
    e.preventDefault();
    
    const testItem = {
        id: 'TEST' + Date.now(),
        title: document.getElementById('test-title').value,
        subject: document.getElementById('test-subject-select').value,
        class: document.getElementById('test-class-select').value,
        date: document.getElementById('test-date').value,
        maxScore: parseInt(document.getElementById('test-max-score').value),
        description: document.getElementById('test-description').value
    };
    
    tests.push(testItem);
    saveData();
    renderTests();
    updateDashboard();
    addActivity(`New test scheduled: ${testItem.title} for Class ${testItem.class}`);
    showNotification('Test scheduled successfully!', 'success');
    
    closeModal('test-modal');
    document.getElementById('test-form').reset();
}

// Action functions
function viewStudent(studentId) {
    const student = students.find(s => s.id === studentId);
    if (student) {
        // Create a detailed view modal or navigate to student details
        alert(`Viewing details for ${student.name}\n\nThis would open a detailed student profile with tabs for personal info, scores, attendance, etc.`);
    }
}

function editStudent(studentId) {
    const student = students.find(s => s.id === studentId);
    if (student) {
        // Populate the form with student data
        document.getElementById('student-name').value = student.name;
        document.getElementById('student-email').value = student.email;
        document.getElementById('student-class').value = student.class;
        document.getElementById('student-id').value = student.id;
        document.getElementById('student-phone').value = student.phone || '';
        document.getElementById('student-address').value = student.address || '';
        
        openStudentModal();
    }
}

function deleteStudent(studentId) {
    if (confirm('Are you sure you want to delete this student?')) {
        students = students.filter(s => s.id !== studentId);
        delete scores[studentId];
        saveData();
        renderStudents();
        updateDashboard();
        showNotification('Student deleted successfully!', 'success');
    }
}

function editHomework(homeworkId) {
    const homeworkItem = homework.find(h => h.id === homeworkId);
    if (homeworkItem) {
        // Populate the form with homework data
        document.getElementById('homework-title').value = homeworkItem.title;
        document.getElementById('homework-description').value = homeworkItem.description;
        document.getElementById('homework-class-select').value = homeworkItem.class;
        document.getElementById('homework-subject').value = homeworkItem.subject;
        document.getElementById('homework-due-date').value = homeworkItem.dueDate;
        document.getElementById('homework-priority').value = homeworkItem.priority || 'medium';
        
        openHomeworkModal();
    }
}

function deleteHomework(homeworkId) {
    if (confirm('Are you sure you want to delete this homework?')) {
        homework = homework.filter(h => h.id !== homeworkId);
        saveData();
        renderHomework();
        updateDashboard();
        showNotification('Homework deleted successfully!', 'success');
    }
}

function viewTestResults(testId) {
    const test = tests.find(t => t.id === testId);
    if (test) {
        alert(`Viewing results for ${test.title}\n\nThis would show detailed test results with student scores, analytics, and comparison charts.`);
    }
}

function editTest(testId) {
    const test = tests.find(t => t.id === testId);
    if (test) {
        // Populate the form with test data
        document.getElementById('test-title').value = test.title;
        document.getElementById('test-subject-select').value = test.subject;
        document.getElementById('test-class-select').value = test.class;
        document.getElementById('test-date').value = test.date;
        document.getElementById('test-max-score').value = test.maxScore;
        document.getElementById('test-description').value = test.description || '';
        
        openTestModal();
    }
}

function deleteTest(testId) {
    if (confirm('Are you sure you want to delete this test?')) {
        tests = tests.filter(t => t.id !== testId);
        saveData();
        renderTests();
        updateDashboard();
        showNotification('Test deleted successfully!', 'success');
    }
}

// Settings functions
function saveSettings() {
    const adminName = document.getElementById('admin-name').value;
    const adminEmail = document.getElementById('admin-email').value;
    
    // Save settings to localStorage
    localStorage.setItem('adminSettings', JSON.stringify({
        name: adminName,
        email: adminEmail
    }));
    
    closeModal('settings-modal');
    showNotification('Settings saved successfully!', 'success');
}

function exportData() {
    const data = {
        students,
        homework,
        tests,
        scores,
        activities,
        exportDate: new Date().toISOString()
    };
    
    const dataStr = JSON.stringify(data, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `student-management-data-${formatDateForFile(new Date())}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    
    showNotification('Data exported successfully!', 'success');
}

function clearAllData() {
    if (confirm('Are you sure you want to clear all data? This action cannot be undone!')) {
        localStorage.clear();
        students = [];
        homework = [];
        tests = [];
        scores = {};
        activities = [];
        
        // Reload page to reset everything
        location.reload();
    }
}

function generateReport() {
    showNotification('Report generation feature coming soon!', 'info');
}

// Helper functions
function calculateAverage(studentScores) {
    const scoreValues = Object.values(studentScores).filter(score => score > 0);
    return scoreValues.length > 0 ? scoreValues.reduce((a, b) => a + b, 0) / scoreValues.length : 0;
}

function getStatusClass(status) {
    switch(status) {
        case 'pending': return 'status-pending';
        case 'completed': return 'status-completed';
        case 'overdue': return 'status-overdue';
        case 'active': return 'status-active';
        case 'inactive': return 'status-inactive';
        default: return 'status-pending';
    }
}

function getPriorityClass(priority) {
    switch(priority) {
        case 'high': return 'priority-high';
        case 'medium': return 'priority-medium';
        case 'low': return 'priority-low';
        default: return 'priority-medium';
    }
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function formatDateForFile(date) {
    return date.toISOString().split('T')[0];
}

function getTestScores(test) {
    // This would normally fetch actual test scores
    // For demo purposes, we'll return mock data
    return students
        .filter(student => student.class === test.class)
        .map(student => {
            const studentScores = scores[student.id] || {};
            return studentScores[test.subject] || Math.floor(Math.random() * 30) + 70;
        });
}

function getRecentActivities() {
    return activities.slice(0, 5);
}

// Activity tracking
function addActivity(text) {
    activities.unshift({
        text,
        time: 'Just now',
        timestamp: new Date()
    });
    
    // Keep only last 10 activities
    if (activities.length > 10) {
        activities = activities.slice(0, 10);
    }
    
    saveActivities();
}

function saveActivities() {
    localStorage.setItem('activities', JSON.stringify(activities));
}

// Notification system
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <i class="fas fa-${getNotificationIcon(type)}"></i>
        <span>${message}</span>
    `;
    
    // Add to notification panel
    const notificationList = document.getElementById('notification-list');
    if (notificationList) {
        notificationList.insertBefore(notification, notificationList.firstChild);
        
        // Remove old notifications if too many
        while (notificationList.children.length > 10) {
            notificationList.removeChild(notificationList.lastChild);
        }
        
        // Update badge
        updateNotificationBadge();
    }
    
    // Also show as toast
    showToast(message, type);
}

function getNotificationIcon(type) {
    switch(type) {
        case 'success': return 'check-circle';
        case 'error': return 'exclamation-circle';
        case 'warning': return 'exclamation-triangle';
        default: return 'info-circle';
    }
}

function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    
    document.body.appendChild(toast);
    
    // Animate in
    setTimeout(() => toast.classList.add('show'), 100);
    
    // Remove after 3 seconds
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => document.body.removeChild(toast), 300);
    }, 3000);
}

function updateNotificationBadge() {
    const badge = document.querySelector('.notification-badge');
    const unreadCount = document.querySelectorAll('.notification-item.unread').length;
    
    if (badge) {
        if (unreadCount > 0) {
            badge.textContent = unreadCount;
            badge.style.display = 'block';
        } else {
            badge.style.display = 'none';
        }
    }
}

// Data calculation functions
function calculateMonthlyAverages() {
    // Generate sample monthly data
    return [75, 78, 82, 79, 85, 88];
}

function calculateSubjectAverages() {
    const subjects = ['math', 'science', 'english', 'history'];
    return subjects.map(subject => {
        const subjectScores = Object.values(scores).map(studentScores => studentScores[subject] || 0);
        const validScores = subjectScores.filter(score => score > 0);
        return validScores.length > 0 ? Math.round(validScores.reduce((a, b) => a + b, 0) / validScores.length) : 0;
    });
}

function calculateClassAverages() {
    const classes = ['A', 'B', 'C'];
    const subjects = ['math', 'science', 'english', 'history'];
    
    const result = {};
    subjects.forEach(subject => {
        result[subject] = classes.map(classLetter => {
            const classStudents = students.filter(s => s.class === classLetter);
            const classScores = classStudents.map(student => scores[student.id]?.[subject] || 0);
            const validScores = classScores.filter(score => score > 0);
            return validScores.length > 0 ? Math.round(validScores.reduce((a, b) => a + b, 0) / validScores.length) : 0;
        });
    });
    
    return result;
}

function calculateGradeDistribution() {
    const allScores = Object.values(scores).flatMap(studentScores => 
        Object.values(studentScores).filter(score => score > 0)
    );
    
    const grades = {
        'A (90-100%)': { count: 0, percentage: 0 },
        'B (80-89%)': { count: 0, percentage: 0 },
        'C (70-79%)': { count: 0, percentage: 0 },
        'D (60-69%)': { count: 0, percentage: 0 },
        'F (Below 60%)': { count: 0, percentage: 0 }
    };
    
    allScores.forEach(score => {
        if (score >= 90) grades['A (90-100%)'].count++;
        else if (score >= 80) grades['B (80-89%)'].count++;
        else if (score >= 70) grades['C (70-79%)'].count++;
        else if (score >= 60) grades['D (60-69%)'].count++;
        else grades['F (Below 60%)'].count++;
    });
    
    // Calculate percentages
    Object.keys(grades).forEach(grade => {
        grades[grade].percentage = Math.round((grades[grade].count / allScores.length) * 100);
    });
    
    return grades;
}

// Add CSS for new elements
const additionalCSS = `
.class-badge {
    padding: 0.25rem 0.5rem;
    border-radius: 0.25rem;
    font-size: 0.75rem;
    font-weight: 500;
}

.class-A { background: #E9D5FF; color: #6B46C1; }
.class-B { background: #DBEAFE; color: #3B82F6; }
.class-C { background: #D1FAE5; color: #10B981; }

.status-badge {
    padding: 0.25rem 0.5rem;
    border-radius: 0.25rem;
    font-size: 0.75rem;
    font-weight: 500;
}

.status-active { background: #D1FAE5; color: #10B981; }
.status-inactive { background: #FEE2E2; color: #EF4444; }

.priority-badge {
    padding: 0.25rem 0.5rem;
    border-radius: 0.25rem;
    font-size: 0.75rem;
    font-weight: 500;
}

.priority-high { background: #FEE2E2; color: #EF4444; }
.priority-medium { background: #FEF3C7; color: #F59E0B; }
.priority-low { background: #E0E7FF; color: #6366F1; }

.btn-action {
    background: none;
    border: 1px solid var(--gray-300);
    color: var(--gray-600);
    padding: 0.375rem;
    border-radius: 0.375rem;
    cursor: pointer;
    transition: var(--transition-base);
    font-size: 0.75rem;
}

.btn-action:hover {
    background: var(--gray-100);
    border-color: var(--gray-400);
    color: var(--gray-900);
}

.toast {
    position: fixed;
    bottom: 2rem;
    right: 2rem;
    background: var(--white);
    padding: 1rem 1.5rem;
    border-radius: 0.5rem;
    box-shadow: var(--shadow-lg);
    display: flex;
    align-items: center;
    gap: 0.75rem;
    transform: translateX(400px);
    transition: transform 0.3s ease;
    z-index: 3000;
}

.toast.show {
    transform: translateX(0);
}

.toast-success { border-left: 4px solid var(--primary-green); }
.toast-error { border-left: 4px solid var(--primary-red); }
.toast-warning { border-left: 4px solid var(--primary-orange); }
.toast-info { border-left: 4px solid var(--primary-blue); }

.notification {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 1rem;
    border-radius: 0.5rem;
    margin-bottom: 0.5rem;
}

.notification-success { background: var(--green-lighter); color: var(--primary-green); }
.notification-error { background: var(--red-lighter); color: var(--primary-red); }
.notification-warning { background: var(--orange-lighter); color: var(--primary-orange); }
.notification-info { background: var(--blue-lighter); color: var(--primary-blue); }
`;

// Add the additional CSS to the page
const styleSheet = document.createElement('style');
styleSheet.textContent = additionalCSS;
document.head.appendChild(styleSheet);
