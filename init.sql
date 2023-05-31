CREATE TABLE reminders (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "date" DATE
);

CREATE TABLE users (
    username TEXT PRIMARY KEY CHECK (username LIKE 'ist%')
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
    balance NUMERIC NOT NULL,
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

CREATE FUNCTION update_balance()
RETURNS TRIGGER AS $$
BEGIN
    NEW.balance := COALESCE(
        (
        SELECT 
            SUM(value) 
        FROM 
            transactions 
        WHERE 
            "date" < NEW."date"
            OR ("date" = NEW."date" AND id < NEW.id)
        ), 
        0
    ) + NEW.value;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_balance_trigger
BEFORE INSERT OR UPDATE OR DELETE ON transactions
FOR EACH ROW
EXECUTE PROCEDURE update_balance();
