type Customer = { id: number; name: string; email: string; phone: string };

const showMessage = (message: string, isSuccess: boolean) => {
    const messageDiv = document.getElementById("message") as HTMLDivElement;
    messageDiv.textContent = message;
    messageDiv.className = `toast ${isSuccess ? 'success' : 'error'} show`;

    setTimeout(() => {
        messageDiv.className = messageDiv.className.replace("show", "");
    }, 3000);
};

let currentCustomer: Customer | null = null;
let editId: number | null = null;

const form = document.getElementById("form-cliente") as HTMLFormElement;
form.addEventListener("submit", (event) => {
    event.preventDefault();
});

const createCustomerRow = (customer: Customer) => {
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
    btnDelete.addEventListener("click", async () => {
        try {
            await fetch(`http://localhost:3000/customers/${customer.id}`, { method: "DELETE" });
            updateList();
            showMessage("Cliente removido com sucesso!", true);
        } catch {
            showMessage("Erro ao remover cliente, tente novamente mais tarde.", false);
        }
    });
    actionsCell.appendChild(btnDelete);

    row.appendChild(actionsCell);

    return row;
};

const filterCustomers = (searchTerm: string, customers: Customer[]): Customer[] => {
    return customers.filter(customer => 
        customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.phone.includes(searchTerm)
    );
};

const updateList = async (searchTerm: string = "") => {
    const list = document.getElementById("customers-list")!;
    list.innerHTML = "";

    try {
        const response = await fetch("http://localhost:3000/customers");
        let data: Customer[] = await response.json();
        
        if (searchTerm) {
            data = filterCustomers(searchTerm, data);
        }

        data.forEach((customer) => {
            const row = createCustomerRow(customer);
            list.appendChild(row);
        });
    } catch {
        showMessage("Erro ao carregar a lista de clientes.", false);
    }
};

const saveCustomer = async (customer: Omit<Customer, "id">) => {
    const url = editId ? `http://localhost:3000/customers/${editId}` : "http://localhost:3000/customers";
    const method = editId ? "PUT" : "POST";

    try {
        const response = await fetch(url, {
            method,
            body: JSON.stringify(customer),
            headers: { "Content-type": "application/json; charset=UTF-8" },
        });

        if (!response.ok) throw new Error("Erro na requisição");

        updateList();
        showMessage(editId ? "Cliente atualizado com sucesso!" : "Cliente cadastrado com sucesso!", true);

        editId = null;
        clearForm();
    } catch {
        showMessage("Erro ao processar cliente, tente novamente mais tarde.", false);
    }
};

const loadCustomerToEdit = (customer: Customer) => {
    editId = customer.id;
    (document.getElementById("edit-name") as HTMLInputElement).value = customer.name;
    (document.getElementById("edit-phone") as HTMLInputElement).value = customer.phone;
    (document.getElementById("edit-email") as HTMLInputElement).value = customer.email;

    const modal = document.getElementById("editModal") as HTMLDivElement;
    modal.style.display = "block";
};

const clearForm = () => {
    (document.getElementById("name") as HTMLInputElement).value = "";
    (document.getElementById("phone") as HTMLInputElement).value = "";
    (document.getElementById("email") as HTMLInputElement).value = "";
};

const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

const isValidPhone = (phone: string): boolean => {
    const phoneRegex = /^\(?\d{2}\)?[\s-]?\d{4,5}-?\d{4}$/;
    return phoneRegex.test(phone);
};

const isUniqueEmailAndPhone = async (email: string, phone: string, currentId: number | null): Promise<boolean> => {
    try {
        const response = await fetch("http://localhost:3000/customers");
        const customers: Customer[] = await response.json();
        return !customers.some(customer => 
            (customer.id !== currentId) && 
            (customer.email === email || customer.phone === phone)
        );
    } catch {
        showMessage("Erro ao verificar duplicidade de e-mail ou telefone.", false);
        return false;
    }
};

document.addEventListener("DOMContentLoaded", () => {
    updateList();

    const searchInput = document.getElementById("search-input") as HTMLInputElement;
    searchInput.addEventListener("input", () => {
        const searchTerm = searchInput.value;
        updateList(searchTerm);
    });

    const btnSave = document.getElementById("btn-save") as HTMLButtonElement;
    btnSave.addEventListener("click", async () => {
        const name = (document.getElementById("name") as HTMLInputElement).value;
        const email = (document.getElementById("email") as HTMLInputElement).value;
        const phone = (document.getElementById("phone") as HTMLInputElement).value;

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

        if (!(await isUniqueEmailAndPhone(email, phone, null))) {
            showMessage("E-mail ou telefone já cadastrado.", false);
            return;
        }

        try {
            await saveCustomer({ name, email, phone });
        } catch {
            showMessage("Erro ao processar cliente, tente novamente mais tarde.", false);
        }
    });

    const modal = document.getElementById("editModal") as HTMLDivElement;
    const span = modal.getElementsByClassName("close")[0] as HTMLSpanElement;
    const btnSaveEdit = document.getElementById("btn-save-edit") as HTMLButtonElement;

    span.onclick = () => {
        modal.style.display = "none";
    };

    window.onclick = (event) => {
        if (event.target === modal) {
            modal.style.display = "none";
        }
    };

    btnSaveEdit.addEventListener("click", async () => {
        const name = (document.getElementById("edit-name") as HTMLInputElement).value;
        const email = (document.getElementById("edit-email") as HTMLInputElement).value;
        const phone = (document.getElementById("edit-phone") as HTMLInputElement).value;

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

        if (!(await isUniqueEmailAndPhone(email, phone, editId))) {
            showMessage("E-mail ou telefone já cadastrado.", false);
            return;
        }

        try {
            await saveCustomer({ name, email, phone });
            modal.style.display = "none";
        } catch {
            showMessage("Erro ao processar cliente, tente novamente mais tarde.", false);
        }
    });
});
