CREATE TABLE reminders (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    reminder_description TEXT NOT NULL,
    reminder_date DATE
);

CREATE TABLE users (
    username TEXT PRIMARY KEY
);

CREATE TABLE variables (
    variable_name TEXT PRIMARY KEY,
    variable_value TEXT NOT NULL
);

CREATE TABLE projects (
    id SERIAL PRIMARY KEY,
    project_name TEXT UNIQUE NOT NULL,
    active BOOLEAN NOT NULL
);

CREATE TABLE transactions (
    id SERIAL PRIMARY KEY,
    transaction_date DATE NOT NULL,
    transaction_description TEXT NOT NULL,
    amount NUMERIC NOT NULL CHECK (amount >= 0),
    file_path TEXT UNIQUE,
    has_nif BOOLEAN NOT NULL
);

CREATE TABLE transaction_project (
    transaction_id INTEGER NOT NULL,
    project_id INTEGER NOT NULL,
    PRIMARY KEY (transaction_id, project_id),
    FOREIGN KEY (transaction_id) REFERENCES transactions (id) ON DELETE CASCADE,
    FOREIGN KEY (project_id) REFERENCES projects (id) ON DELETE CASCADE
);