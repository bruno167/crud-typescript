"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const showMessage = (message, isSuccess) => {
    const messageDiv = document.getElementById("message");
    messageDiv.textContent = message;
    messageDiv.className = `toast ${isSuccess ? 'success' : 'error'} show`;
    setTimeout(() => {
        messageDiv.className = messageDiv.className.replace("show", "");
    }, 3000);
};
let currentCustomer = null;
let editId = null;
const form = document.getElementById("form-cliente");
form.addEventListener("submit", (event) => {
    event.preventDefault();
});
const createCustomerRow = (customer) => {
    const row = document.createElement("tr");
    const nameCell = document.createElement("td");
    nameCell.textContent = customer.name;
    row.appendChild(nameCell);
    const emailCell = document.createElement("td");
    emailCell.textContent = customer.email;
    row.appendChild(emailCell);
    const phoneCell = document.createElement("td");
    phoneCell.textContent = customer.phone;
    row.appendChild(phoneCell);
    const actionsCell = document.createElement("td");
    const btnEdit = document.createElement("button");
    btnEdit.innerHTML = '<i class="fas fa-edit"></i>';
    btnEdit.className = "btn-edit";
    btnEdit.addEventListener("click", () => {
        loadCustomerToEdit(customer);
    });
    actionsCell.appendChild(btnEdit);
    const btnDelete = document.createElement("button");
    btnDelete.innerHTML = '<i class="fas fa-trash-alt"></i>';
    btnDelete.className = "btn-delete";
    btnDelete.addEventListener("click", () => __awaiter(void 0, void 0, void 0, function* () {
        try {
            yield fetch(`http://localhost:3000/customers/${customer.id}`, { method: "DELETE" });
            updateList();
            showMessage("Cliente removido com sucesso!", true);
        }
        catch (_a) {
            showMessage("Erro ao remover cliente, tente novamente mais tarde.", false);
        }
    }));
    actionsCell.appendChild(btnDelete);
    row.appendChild(actionsCell);
    return row;
};
const filterCustomers = (searchTerm, customers) => {
    return customers.filter(customer => customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.phone.includes(searchTerm));
};
const updateList = (...args_1) => __awaiter(void 0, [...args_1], void 0, function* (searchTerm = "") {
    const list = document.getElementById("customers-list");
    list.innerHTML = "";
    try {
        const response = yield fetch("http://localhost:3000/customers");
        let data = yield response.json();
        if (searchTerm) {
            data = filterCustomers(searchTerm, data);
        }
        data.forEach((customer) => {
            const row = createCustomerRow(customer);
            list.appendChild(row);
        });
    }
    catch (_a) {
        showMessage("Erro ao carregar a lista de clientes.", false);
    }
});
const saveCustomer = (customer) => __awaiter(void 0, void 0, void 0, function* () {
    const url = editId ? `http://localhost:3000/customers/${editId}` : "http://localhost:3000/customers";
    const method = editId ? "PUT" : "POST";
    try {
        const response = yield fetch(url, {
            method,
            body: JSON.stringify(customer),
            headers: { "Content-type": "application/json; charset=UTF-8" },
        });
        if (!response.ok)
            throw new Error("Erro na requisição");
        updateList();
        showMessage(editId ? "Cliente atualizado com sucesso!" : "Cliente cadastrado com sucesso!", true);
        editId = null;
        clearForm();
    }
    catch (_a) {
        showMessage("Erro ao processar cliente, tente novamente mais tarde.", false);
    }
});
const loadCustomerToEdit = (customer) => {
    editId = customer.id;
    document.getElementById("edit-name").value = customer.name;
    document.getElementById("edit-phone").value = customer.phone;
    document.getElementById("edit-email").value = customer.email;
    const modal = document.getElementById("editModal");
    modal.style.display = "block";
};
const clearForm = () => {
    document.getElementById("name").value = "";
    document.getElementById("phone").value = "";
    document.getElementById("email").value = "";
};
const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};
const isValidPhone = (phone) => {
    const phoneRegex = /^\(?\d{2}\)?[\s-]?\d{4,5}-?\d{4}$/;
    return phoneRegex.test(phone);
};
const isUniqueEmailAndPhone = (email, phone, currentId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const response = yield fetch("http://localhost:3000/customers");
        const customers = yield response.json();
        return !customers.some(customer => (customer.id !== currentId) &&
            (customer.email === email || customer.phone === phone));
    }
    catch (_a) {
        showMessage("Erro ao verificar duplicidade de e-mail ou telefone.", false);
        return false;
    }
});
document.addEventListener("DOMContentLoaded", () => {
    updateList();
    const searchInput = document.getElementById("search-input");
    searchInput.addEventListener("input", () => {
        const searchTerm = searchInput.value;
        updateList(searchTerm);
    });
    const btnSave = document.getElementById("btn-save");
    btnSave.addEventListener("click", () => __awaiter(void 0, void 0, void 0, function* () {
        const name = document.getElementById("name").value;
        const email = document.getElementById("email").value;
        const phone = document.getElementById("phone").value;
        if (!name || !email || !phone) {
            showMessage("Preencha todos os campos", false);
            return;
        }
        if (!isValidEmail(email)) {
            showMessage("E-mail inválido", false);
            return;
        }
        if (!isValidPhone(phone)) {
            showMessage("Telefone inválido", false);
            return;
        }
        if (!(yield isUniqueEmailAndPhone(email, phone, null))) {
            showMessage("E-mail ou telefone já cadastrado.", false);
            return;
        }
        try {
            yield saveCustomer({ name, email, phone });
        }
        catch (_a) {
            showMessage("Erro ao processar cliente, tente novamente mais tarde.", false);
        }
    }));
    const modal = document.getElementById("editModal");
    const span = modal.getElementsByClassName("close")[0];
    const btnSaveEdit = document.getElementById("btn-save-edit");
    span.onclick = () => {
        modal.style.display = "none";
    };
    window.onclick = (event) => {
        if (event.target === modal) {
            modal.style.display = "none";
        }
    };
    btnSaveEdit.addEventListener("click", () => __awaiter(void 0, void 0, void 0, function* () {
        const name = document.getElementById("edit-name").value;
        const email = document.getElementById("edit-email").value;
        const phone = document.getElementById("edit-phone").value;
        if (!name || !email || !phone) {
            showMessage("Preencha todos os campos", false);
            return;
        }
        if (!isValidEmail(email)) {
            showMessage("E-mail inválido", false);
            return;
        }
        if (!isValidPhone(phone)) {
            showMessage("Telefone inválido", false);
            return;
        }
        if (!(yield isUniqueEmailAndPhone(email, phone, editId))) {
            showMessage("E-mail ou telefone já cadastrado.", false);
            return;
        }
        try {
            yield saveCustomer({ name, email, phone });
            modal.style.display = "none";
        }
        catch (_a) {
            showMessage("Erro ao processar cliente, tente novamente mais tarde.", false);
        }
    }));
});
