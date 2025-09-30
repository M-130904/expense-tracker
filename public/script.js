document.addEventListener('DOMContentLoaded', () => {
    // -------------------------------------------------------------------
    // Configuration
    // -------------------------------------------------------------------
    const API_BASE_URL = 'http://localhost:3000/api/expenses';
    const AUTH_URL = 'http://localhost:3000/api/auth';
    const SUMMARY_URL = 'http://localhost:3000/api/expenses/summary';

    // -------------------------------------------------------------------
    // DOM Elements
    // -------------------------------------------------------------------
    const authView = document.getElementById('authView');
    const appView = document.getElementById('appView');
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const loginFormContainer = document.getElementById('loginFormContainer');
    const registerFormContainer = document.getElementById('registerFormContainer');
    const showRegisterLink = document.getElementById('showRegister');
    const showLoginLink = document.getElementById('showLogin');
    const authMessage = document.getElementById('authMessage');
    const logoutButton = document.getElementById('logoutButton');
    const welcomeMessage = document.getElementById('welcomeMessage');
    
    const expenseForm = document.getElementById('expenseForm');
    const expenseList = document.getElementById('expenseList');
    const filterCategory = document.getElementById('filterCategory');
    const sortBy = document.getElementById('sortBy');
    const applyFilterButton = document.getElementById('applyFilter');
    const resetButton = document.getElementById('resetFilter');
    const grandTotalElement = document.getElementById('grandTotal');
    const categoryChartCanvas = document.getElementById('categoryChart');
    let categoryChart = null; 

    // -------------------------------------------------------------------
    // Global State
    // -------------------------------------------------------------------
    let currentUser = JSON.parse(localStorage.getItem('user')) || null;
    let currentFilter = { category: '', sortBy: 'date_desc' };
    let editingId = null;

    // -------------------------------------------------------------------
    // AUTHENTICATION LOGIC
    // -------------------------------------------------------------------

    const updateUI = () => {
        if (currentUser) {
            authView.style.display = 'none';
            appView.style.display = 'block';
            logoutButton.style.display = 'block';
            welcomeMessage.textContent = `Hello, ${currentUser.name}! 💰`;
            fetchAndRenderExpenses();
        } else {
            authView.style.display = 'block';
            appView.style.display = 'none';
            logoutButton.style.display = 'none';
            welcomeMessage.textContent = '💸 Expense Tracker';
            authMessage.textContent = '';
        }
    };
    
    const setAuthMessage = (message, isError = true) => {
        authMessage.textContent = message;
        authMessage.style.color = isError ? '#f44336' : '#4CAF50';
    };

    const getAuthHeader = () => {
        return {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${currentUser.token}`
        };
    };

    // Toggle between login and register forms
    showRegisterLink.addEventListener('click', (e) => {
        e.preventDefault();
        loginFormContainer.style.display = 'none';
        registerFormContainer.style.display = 'block';
        authMessage.textContent = '';
    });

    showLoginLink.addEventListener('click', (e) => {
        e.preventDefault();
        loginFormContainer.style.display = 'block';
        registerFormContainer.style.display = 'none';
        authMessage.textContent = '';
    });

    // Register Handler
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = document.getElementById('registerName').value;
        const email = document.getElementById('registerEmail').value;
        const password = document.getElementById('registerPassword').value;

        try {
            const response = await fetch(`${AUTH_URL}/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, password })
            });

            const data = await response.json();

            if (response.ok) {
                setAuthMessage('Registration successful! Please login.', false);
                registerForm.reset();
                loginFormContainer.style.display = 'block';
                registerFormContainer.style.display = 'none';
            } else {
                setAuthMessage(data.message || 'Registration failed.');
            }
        } catch (error) {
            setAuthMessage('An error occurred during registration.');
        }
    });

    // Login Handler
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;

        try {
            const response = await fetch(`${AUTH_URL}/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (response.ok) {
                currentUser = data;
                localStorage.setItem('user', JSON.stringify(currentUser));
                updateUI();
                loginForm.reset();
            } else {
                setAuthMessage(data.message || 'Login failed.');
            }
        } catch (error) {
            setAuthMessage('An error occurred during login.');
        }
    });

    // Logout Handler
    logoutButton.addEventListener('click', () => {
        localStorage.removeItem('user');
        currentUser = null;
        updateUI();
        // Clear chart and list data on logout
        expenseList.innerHTML = '';
        if (categoryChart) {
            categoryChart.destroy();
            categoryChart = null;
        }
        grandTotalElement.textContent = 'Grand Total: $0.00';
    });


    // -------------------------------------------------------------------
    // CRUD & FILTERING LOGIC (Requires Authentication)
    // -------------------------------------------------------------------

    const createExpenseRow = (expense) => {
        const row = document.createElement('tr');
        row.dataset.id = expense._id;
        const date = new Date(expense.date).toLocaleDateString();
        const amount = expense.amount.toFixed(2);
        
        row.innerHTML = `
            <td data-field="date">${date}</td>
            <td data-field="description">${expense.description}</td>
            <td data-field="category">${expense.category}</td>
            <td data-field="amount">$${amount}</td>
            <td>
                <button class="action-btn edit-btn" data-id="${expense._id}">Edit</button>
                <button class="action-btn delete-btn" data-id="${expense._id}">Delete</button>
            </td>
        `;
        return row;
    };

    const renderExpenses = (expenses) => {
        expenseList.innerHTML = ''; 
        if (expenses.length === 0) {
            expenseList.innerHTML = '<tr><td colspan="5" style="text-align: center;">No expenses found for this user.</td></tr>';
            return;
        }
        expenses.forEach(expense => {
            expenseList.appendChild(createExpenseRow(expense));
        });
    };

    const fetchAndRenderExpenses = async () => {
        if (!currentUser) return; // Must be authenticated
        
        const url = `${API_BASE_URL}?category=${currentFilter.category}&sortBy=${currentFilter.sortBy}`;
        try {
            const response = await fetch(url, { headers: getAuthHeader() });
            
            if (response.status === 401) {
                // If token is invalid/expired, force logout
                logoutButton.click(); 
                setAuthMessage('Session expired. Please log in again.');
                return;
            }

            const expenses = await response.json();
            renderExpenses(expenses);
            fetchAndRenderSummary();
        } catch (error) {
            console.error('Error fetching expenses:', error);
        }
    };
    
    const fetchAndRenderSummary = async () => {
        if (!currentUser) return;
        try {
            const response = await fetch(SUMMARY_URL, { headers: getAuthHeader() });
            const data = await response.json();
            
            grandTotalElement.textContent = `Grand Total: $${data.grandTotal.toFixed(2)}`;
            updateCategoryChart(data.categoryBreakdown);
        } catch (error) {
            console.error('Error fetching summary:', error);
        }
    };

    // CREATE: Handle form submission
    expenseForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const expenseData = {
            description: document.getElementById('description').value,
            amount: parseFloat(document.getElementById('amount').value),
            category: document.getElementById('category').value,
            date: document.getElementById('date').value
        };

        try {
            const response = await fetch(API_BASE_URL, {
                method: 'POST',
                headers: getAuthHeader(),
                body: JSON.stringify(expenseData)
            });

            if (response.ok) {
                fetchAndRenderExpenses(); 
                expenseForm.reset(); 
            } else {
                alert('Error adding expense: ' + response.statusText);
            }
        } catch (error) {
            console.error('Fetch error:', error);
            alert('An error occurred while communicating with the server.');
        }
    });

    // READ, UPDATE, DELETE: Handle table actions (event delegation)
    expenseList.addEventListener('click', async (e) => {
        const target = e.target;
        const id = target.dataset.id;
        const row = target.closest('tr');

        // DELETE Operation
        if (target.classList.contains('delete-btn')) {
            if (confirm('Are you sure you want to delete this expense?')) {
                try {
                    const response = await fetch(`${API_BASE_URL}/${id}`, {
                        method: 'DELETE',
                        headers: getAuthHeader()
                    });

                    if (response.ok) {
                        row.remove(); 
                        fetchAndRenderSummary(); 
                    } else {
                        alert('Error deleting expense: ' + response.statusText);
                    }
                } catch (error) {
                    console.error('Delete error:', error);
                }
            }
        }

        // EDIT (Enter edit mode)
        else if (target.classList.contains('edit-btn')) {
            if (editingId) {
                alert('Please save or cancel the current edit before starting a new one.');
                return;
            }
            editingId = id;
            enterEditMode(row);
        }

        // UPDATE (Save edited expense)
        else if (target.classList.contains('save-btn')) {
            const updatedData = saveEdit(row);
            if (!updatedData) return;

            try {
                const response = await fetch(`${API_BASE_URL}/${id}`, {
                    method: 'PUT',
                    headers: getAuthHeader(),
                    body: JSON.stringify(updatedData)
                });

                if (response.ok) {
                    const updatedExpense = await response.json();
                    exitEditMode(row, updatedExpense);
                    fetchAndRenderExpenses();
                } else {
                    alert('Error updating expense: ' + response.statusText);
                }
            } catch (error) {
                console.error('Update error:', error);
            }
        }
        
        // CANCEL Edit
        else if (target.classList.contains('cancel-btn')) {
            cancelEdit(row);
        }
    });
    
    // Edit/Save/Cancel helper functions (Unchanged, but assume auth is handled upstream)
    const enterEditMode = (row) => {
        // ... (implementation same as previous response) ...
        const actionCell = row.querySelector('td:last-child');
        actionCell.innerHTML = `
            <button class="action-btn save-btn" data-id="${row.dataset.id}">Save</button>
            <button class="action-btn cancel-btn" data-id="${row.dataset.id}">Cancel</button>
        `;

        const fields = ['date', 'description', 'category', 'amount'];
        fields.forEach(field => {
            const cell = row.querySelector(`[data-field="${field}"]`);
            const currentValue = cell.textContent.trim().replace('$', '');
            let inputElement;

            if (field === 'date') {
                const dateObj = new Date(currentValue);
                const isoDate = dateObj.toISOString().split('T')[0];
                inputElement = document.createElement('input');
                inputElement.type = 'date';
                inputElement.value = isoDate;
            } else if (field === 'amount') {
                inputElement = document.createElement('input');
                inputElement.type = 'number';
                inputElement.step = '0.01';
                inputElement.value = parseFloat(currentValue).toFixed(2);
            } else if (field === 'category') {
                inputElement = document.createElement('select');
                const categories = ['Food', 'Rent', 'Transport', 'Groceries', 'Entertainment', 'Other'];
                categories.forEach(cat => {
                    const option = document.createElement('option');
                    option.value = cat;
                    option.textContent = cat;
                    if (cat === currentValue) {
                        option.selected = true;
                    }
                    inputElement.appendChild(option);
                });
            } else { // Description
                inputElement = document.createElement('input');
                inputElement.type = 'text';
                inputElement.value = currentValue;
            }

            inputElement.className = 'edit-input';
            cell.dataset.originalValue = currentValue;
            cell.innerHTML = '';
            cell.appendChild(inputElement);
        });
    };

    const saveEdit = (row) => {
        const data = {};
        let isValid = true;

        ['date', 'description', 'category', 'amount'].forEach(field => {
            const cell = row.querySelector(`[data-field="${field}"]`);
            const input = cell.querySelector('.edit-input');
            let value = input.value;

            if (!value) {
                alert(`The ${field} field cannot be empty.`);
                isValid = false;
                return;
            }

            if (field === 'amount') {
                value = parseFloat(value);
                if (isNaN(value) || value <= 0) {
                    alert('Amount must be a positive number.');
                    isValid = false;
                    return;
                }
            }
            data[field] = value;
        });

        if (!isValid) return null;
        return data;
    };

    const exitEditMode = (row, expense) => {
        const dateString = new Date(expense.date).toLocaleDateString();
        const amountString = `$${expense.amount.toFixed(2)}`;

        row.querySelector(`[data-field="date"]`).innerHTML = dateString;
        row.querySelector(`[data-field="description"]`).innerHTML = expense.description;
        row.querySelector(`[data-field="category"]`).innerHTML = expense.category;
        row.querySelector(`[data-field="amount"]`).innerHTML = amountString;
        
        const actionCell = row.querySelector('td:last-child');
        actionCell.innerHTML = `
            <button class="action-btn edit-btn" data-id="${expense._id}">Edit</button>
            <button class="action-btn delete-btn" data-id="${expense._id}">Delete</button>
        `;

        editingId = null;
    };

    const cancelEdit = (row) => {
        const fields = ['date', 'description', 'category', 'amount'];
        fields.forEach(field => {
            const cell = row.querySelector(`[data-field="${field}"]`);
            cell.innerHTML = cell.dataset.originalValue;
            delete cell.dataset.originalValue;
        });

        const actionCell = row.querySelector('td:last-child');
        actionCell.innerHTML = `
            <button class="action-btn edit-btn" data-id="${row.dataset.id}">Edit</button>
            <button class="action-btn delete-btn" data-id="${row.dataset.id}">Delete</button>
        `;

        editingId = null;
    };

    // Chart logic (Unchanged)
    const updateCategoryChart = (breakdown) => {
        const labels = breakdown.map(item => item._id);
        const data = breakdown.map(item => item.totalAmount);
        const colors = [
            '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40'
        ];

        if (categoryChart) {
            categoryChart.data.labels = labels;
            categoryChart.data.datasets[0].data = data;
            categoryChart.data.datasets[0].backgroundColor = colors.slice(0, labels.length);
            categoryChart.update();
        } else {
            categoryChart = new Chart(categoryChartCanvas, {
                type: 'pie',
                data: {
                    labels: labels,
                    datasets: [{
                        data: data,
                        backgroundColor: colors.slice(0, labels.length),
                        hoverOffset: 4
                    }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        legend: { position: 'top' },
                        title: { display: true, text: 'Expense Breakdown by Category' }
                    }
                }
            });
        }
    };
    
    // Filtering Handlers
    applyFilterButton.addEventListener('click', () => {
        currentFilter.category = filterCategory.value;
        currentFilter.sortBy = sortBy.value;
        fetchAndRenderExpenses();
    });

    resetButton.addEventListener('click', () => {
        filterCategory.value = '';
        sortBy.value = 'date_desc';
        currentFilter = { category: '', sortBy: 'date_desc' };
        fetchAndRenderExpenses();
    });

    // -------------------------------------------------------------------
    // Initialization
    // -------------------------------------------------------------------
    updateUI(); // Check local storage on load and render appropriate view
});