CREATE TABLE reminders (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    "description" TEXT,
    "date" DATE NOT NULL
);

CREATE TABLE users (
    username TEXT PRIMARY KEY CHECK (username LIKE 'ist%'),
    active BOOLEAN NOT NULL,
    "name" TEXT NOT NULL,
    photo TEXT
);

CREATE TABLE projects (
    id SERIAL PRIMARY KEY,
    "name" TEXT UNIQUE NOT NULL,
    active BOOLEAN NOT NULL
);

CREATE TABLE transactions (
    id SERIAL PRIMARY KEY,
    "date" DATE NOT NULL,
    "description" TEXT NOT NULL,
    "value" NUMERIC NOT NULL,
    has_file BOOLEAN NOT NULL,
    has_nif BOOLEAN NOT NULL
);

CREATE TABLE transaction_project (
    transaction_id INTEGER NOT NULL,
    project_id INTEGER NOT NULL,
    PRIMARY KEY (transaction_id, project_id),
    FOREIGN KEY (transaction_id) REFERENCES transactions (id) ON DELETE CASCADE,
    FOREIGN KEY (project_id) REFERENCES projects (id) ON DELETE CASCADE
);

CREATE PROCEDURE create_user(
   p_username TEXT,
   p_name TEXT
)
AS $$
BEGIN
   INSERT INTO users (username, active, "name")
   VALUES (p_username, false, p_name);
END;
$$ LANGUAGE plpgsql;
