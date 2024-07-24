import { database, ref, get, set, push, child } from './firebase_config.js';


async function signInOrSignUp(username, password) {
    const dbRef = ref(database);
    try {
        const snapshot = await get(child(dbRef, `exp_track/${username}/personal`));
        if (snapshot.exists()) {
            const userData = snapshot.val();
            if (userData.password === password) {
                alert('Login successful!');
                localStorage.setItem('username', username);
                localStorage.setItem('is_logedin', true);
                localStorage.setItem('db_root', `exp_track/${username}`);
                showSection('budget-planner');
            } else {
                localStorage.setItem('is_logedin', false);
                alert('Incorrect password!');
            }
        } else {
            await set(ref(database, `exp_track/${username}/personal`), { password: password });
            alert('Account created successfully!');
            localStorage.setItem('username', username);
            localStorage.setItem('is_logedin', true);
            localStorage.setItem('db_root', `exp_track/${username}`);
            showSection('budget-planner');
        }
    } catch (error) {
        alert('Error accessing Firebase:');
        console.error('Error accessing Firebase:', error);
    }
}

async function calculateAndSaveBudget() {
    const budget = document.getElementById('budget').value;
    const income = document.getElementById('income').value;
    const expenses = document.getElementById('expenses').value;
    if (localStorage.getItem('is_logedin') != "true") {
        alert('plese login first.');
        return 0;
    }

    if (budget && income && expenses) {
        const needs = budget * 0.5;
        const wants = budget * 0.3;
        const invest = budget * 0.2;
        const remaining = income - expenses;

        const budgetData = {
            budget: budget,
            income: income,
            expenses: expenses,
            needs: needs,
            wants: wants,
            invest: invest,
            remaining: remaining
        };
        let db_root = localStorage.getItem('db_root');
        const dbfRef = ref(database, `${db_root}/calculate_history`);

        push(dbfRef, budgetData)
            .then(() => {
                console.log("Data pushed to Firebase successfully!");
                const resultDiv = document.getElementById('result');
                resultDiv.innerHTML = `
                    <p>Needs: $${needs.toFixed(2)}</p>
                    <p>Wants: $${wants.toFixed(2)}</p>
                    <p>Invest: $${invest.toFixed(2)}</p>
                    <p>Remaining Budget: $${remaining.toFixed(2)}</p>`;
                alert('Budget calculated and saved successfully!');
                localStorage.setItem('budgetData', JSON.stringify(budgetData));
                showSection('budget-dashboard');
            })
            .catch((error) => {
                console.error("Error pushing data to Firebase: ", error);
            });
    } else {
        alert('Please fill out all fields.');
    }
}

async function addExpense() {
    if (localStorage.getItem('is_logedin') != "true") {
        alert('plese login first.');
        return 0;
    }
    const amount = document.getElementById('amount').value;
    const category = document.getElementById('category').value;
    const date = document.getElementById('date').value;
    const time = document.getElementById('time').value;

    if (amount && category && date && time) {
        const expense = { amount, category, date, time };
        const username = localStorage.getItem('username');

        if (username) {
            try {
                await push(ref(database, `exp_track/${username}/history`), expense);
                alert('Expense added successfully!');
                document.getElementById('amount').value = '';
                document.getElementById('category').value = '';
                document.getElementById('date').value = '';
                document.getElementById('time').value = '';
            } catch (error) {
                console.error('Error adding expense to Firebase:', error);
                alert('Failed to add expense. Please try again.');
            }
        } else {
            alert('Please log in.');
        }
    } else {
        alert('Please fill out all fields.');
    }
}

async function loadExpenses() {
    const is_logedin = localStorage.getItem('is_logedin');
    const username = localStorage.getItem('username');
    if (username && is_logedin) {
        const dbRef = ref(database);
        try {
            const snapshot = await get(child(dbRef, `exp_track/${username}/history`));
            if (snapshot.exists()) {
                const expenses = snapshot.val();
                const expenseTableBody = document.getElementById('expenseTableBody');
                expenseTableBody.innerHTML = '';

                for (const key in expenses) {
                    if (expenses.hasOwnProperty(key)) {
                        const expense = expenses[key];
                        const row = document.createElement('tr');
                        row.innerHTML = `
                            <td>${expense.amount}</td>
                            <td>${expense.category}</td>
                            <td>${expense.date}</td>
                            <td>${expense.time}</td>`;
                        expenseTableBody.appendChild(row);
                    }
                }
            } else {
                console.log('No expense data available.');
            }
        } catch (error) {
            console.error('Error retrieving expenses from Firebase:', error);
        }
    } else {
        alert("login first...");
    }
}

function goBack() {
    showSection('budget-planner');
}

function chart_handler() {
    if (!localStorage.getItem('budgetData')) {
        alert("no data available to show.");
        return;
    }
    const budgetData = JSON.parse(localStorage.getItem('budgetData'))
    const ctx = document.getElementById('budgetChart').getContext('2d');
    const budgetChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Needs', 'Wants', 'Invest', 'Remaining Budget'],
            datasets: [{
                label: 'Amount in $',
                data: [
                    budgetData.needs,
                    budgetData.wants,
                    budgetData.invest,
                    budgetData.remaining
                ],
                backgroundColor: [
                    '#FF6384',
                    '#36A2EB',
                    '#FFCE56',
                    '#4BC0C0'
                ],
                borderColor: [
                    '#FF6384',
                    '#36A2EB',
                    '#FFCE56',
                    '#4BC0C0'
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true
                }
            },
            plugins: {
                legend: {
                    display: false,
                },
                tooltip: {
                    callbacks: {
                        label: function (tooltipItem) {
                            return tooltipItem.label + ': $' + tooltipItem.raw;
                        }
                    }
                }
            }
        }
    });
}

async function loadPlanningHistory() {
    const is_logedin = localStorage.getItem('is_logedin');
    const username = localStorage.getItem('username');
    if (username && is_logedin) {
        const dbRef = ref(database);
        try {
            const snapshot = await get(child(dbRef, `exp_track/${username}/calculate_history`));
            if (snapshot.exists()) {
                const expenses = snapshot.val();
                const expenseTableBody = document.getElementById('planningTableBody');
                expenseTableBody.innerHTML = '';

                for (const key in expenses) {
                    if (expenses.hasOwnProperty(key)) {
                        const expense = expenses[key];
                        const row = document.createElement('tr');
                        row.innerHTML = `
                            <td>${expense.budget}</td>
                            <td>${expense.income}</td>
                            <td>${expense.expenses}</td>
                            <td>${expense.needs}</td>
                            <td>${expense.wants}</td>
                            <td>${expense.invest}</td>`;
                        expenseTableBody.appendChild(row);
                    }
                }
            } else {
                console.log('No expense data available.');
            }
        } catch (error) {
            console.error('Error retrieving expenses from Firebase:', error);
        }
    } else {
        alert("login first...");
    }
}

function showSection(sectionId) {
    const sections = document.querySelectorAll('section');
    if (sectionId == "expense-history") {
        loadExpenses();
    } else if (sectionId == "budget-dashboard") {
        chart_handler();
    } else if (sectionId == "planning-history") {
        loadPlanningHistory();
    }
    sections.forEach(section => section.classList.add('hidden'));
    document.getElementById(sectionId).classList.remove('hidden');
}


window.showSection = showSection;
window.calculateAndSaveBudget = calculateAndSaveBudget;
window.goBack = goBack;
window.loadExpenses = loadExpenses;
window.addExpense = addExpense;
window.signInOrSignUp = signInOrSignUp;
window.chart_handler = chart_handler;
window.loadPlanningHistory = loadPlanningHistory;