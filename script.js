const amountInput = document.querySelector('input[label="amount"]');
const categoryInputs = document.querySelectorAll('input[name="category"]');
const descriptionInput = document.getElementById('description');
const dateInput = document.getElementById('exp-date');
const addExpenseButton = document.getElementById('add-exp');
const clearFormButton = document.getElementById('clear-form');
const expenseTableBody = document.querySelector('#expense-list table tbody');
const totalExpensesSpan = document.getElementById('total-expenses');
const commonCategorySpan = document.getElementById('common-category');
const highestExpenseSpan = document.getElementById('highest-expense');

let expenses = [];
let expenseChart = null;

addExpenseButton.addEventListener('click', addExpense);
clearFormButton.addEventListener('click', clearForm);

document.addEventListener('DOMContentLoaded', () => {
    const savedExpenses = JSON.parse(localStorage.getItem('expenses')) || [];
    expenses = savedExpenses;

    const dateInput = document.getElementById('exp-date');
    const today = new Date().toISOString().split('T')[0];
    dateInput.value = today;
    dateInput.max = today;
    

    const themeToggle = document.getElementById('theme-toggle');
    const savedTheme = localStorage.getItem('theme') || 'light';
    if(savedTheme === 'dark'){
        document.body.classList.add('dark-mode');
    }
    themeToggle.addEventListener('click', (e) => {
        e.preventDefault();
        document.body.classList.toggle('dark-mode');
        const theme = document.body.classList.contains('dark-mode') ? 'dark' : 'light';
        localStorage.setItem('theme', theme);
        updateThemeToggleIcon();
    });

    renderExpenses();
    updateSummary();
    renderChart();
    updateThemeToggleIcon();
});

function addExpense() {
    const selectedCategory = Array.from(categoryInputs)
        .find(input => input.checked)?.value;

    if (!amountInput.value || !selectedCategory || 
        !descriptionInput.value || !dateInput.value) {
        alert('Please fill in all fields');
        return;
    }

    const newExpense = {
        id: Date.now(),
        amount: parseFloat(amountInput.value),
        category: selectedCategory,
        description: descriptionInput.value,
        date: dateInput.value
    };

    expenses.push(newExpense);

    saveExpensesToLocalStorage();

    clearForm();
    renderExpenses();
    updateSummary();
    renderChart();
}

function renderExpenses() {
    expenseTableBody.innerHTML = '';

    expenses.forEach((expense, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${expense.date}</td>
            <td>${expense.category}</td>
            <td>Rs ${expense.amount.toFixed(2)}</td>
            <td>${expense.description}</td>
            <td>
                <button onclick="editExpense(${index})">Edit</button>
                <button onclick="deleteExpense(${index})">Delete</button>
            </td>
        `;
        expenseTableBody.appendChild(row);
    });
    renderChart();
}

function editExpense(index) {
    const expense = expenses[index];

    amountInput.value = expense.amount;
    dateInput.value = expense.date;
    descriptionInput.value = expense.description;

    categoryInputs.forEach(input => {
        if (input.value === expense.category) {
            input.checked = true;
        }
    });

    expenses.splice(index, 1);
    
    saveExpensesToLocalStorage();
    renderExpenses();
    updateSummary();
    renderChart();
}

function deleteExpense(index) {
    expenses.splice(index, 1);
    saveExpensesToLocalStorage();
    renderExpenses();
    updateSummary();
    renderChart();
}

function saveExpensesToLocalStorage() {
    localStorage.setItem('expenses', JSON.stringify(expenses));
}

function clearForm() {
    amountInput.value = '';
    descriptionInput.value = '';
    dateInput.value = '';
    categoryInputs.forEach(input => input.checked = false);
}

function updateSummary() {
    if (expenses.length === 0) {
        totalExpensesSpan.textContent = 'Rs 0.00';
        commonCategorySpan.textContent = 'None';
        highestExpenseSpan.textContent = 'Rs 0.00';
        return;
    }
    const total = expenses.reduce((sum, expense) => sum + expense.amount, 0);
    totalExpensesSpan.textContent = `Rs ${total.toFixed(2)}`;
    const categoryCount = expenses.reduce((acc, expense) => {
        acc[expense.category] = (acc[expense.category] || 0) + 1;
        return acc;
    }, {});
    const mostCommonCategory = Object.keys(categoryCount).reduce((a, b) => 
        categoryCount[a] > categoryCount[b] ? a : b
    );
    commonCategorySpan.textContent = mostCommonCategory;

    const highestExpense = expenses.length > 0 ? Math.max(...expenses.map(e => e.amount)) : 0;
    highestExpenseSpan.textContent = `Rs ${highestExpense.toFixed(2)}`;
}

function renderChart() {
    const ctx = document.getElementById('expenseChart').getContext('2d');
    
    // Destroy existing chart if it exists
    if (expenseChart) {
        expenseChart.destroy();
    }
    
    // Prepare category totals for chart
    const categoryTotals = expenses.reduce((acc, expense) => {
        acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
        return acc;
    }, {});

    if (expenses.length > 0) {
        expenseChart = new Chart(ctx, {
            type: 'pie',
            data: {
                labels: Object.keys(categoryTotals),
                datasets: [{
                    data: Object.values(categoryTotals),
                    backgroundColor: [
                        'rgb(0, 155, 251)',
                        'rgb(43, 218, 37)',
                        'rgb(132, 0, 255)',
                        'rgb(255, 55, 0)'
                    ]
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    title: {
                        display: true,
                        text: 'Expense Distribution'
                    }
                }
            }
        });
    }
}


function updateThemeToggleIcon(){
    const themeToggle = document.getElementById('theme-toggle');
    const isDarkMode = document.body.classList.contains('dark-mode');
    if(isDarkMode){
        themeToggle.innerHTML = '<i class = "fas fa-sun"></i> Light Mode';
    } else {
        themeToggle.innerHTML = '<i class = "fas fa-moon"></i> Dark Mode';
    }
}

// Initial render
renderExpenses();
updateSummary();
renderChart();
